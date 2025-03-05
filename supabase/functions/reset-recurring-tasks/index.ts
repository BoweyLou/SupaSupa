// Supabase Edge Function: reset-recurring-tasks
// This function resets the status of recurring tasks (daily/weekly) when it's midnight in the user's local timezone
// It's designed to be called hourly by a scheduled cron job

// @ts-ignore: Deno module import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'

// Define interface for task responses from the database
interface TaskResponse {
  id: string;
  title: string;
  description: string;
  reward_points: number;
  frequency: string;
  status: string;
  assigned_child_id?: string;
  created_by: string; // Parent who created the task
  updated_at: string;
  next_occurrence?: string;
  icon?: string;
  custom_colors?: {
    lowerGradientColor?: string;
    backgroundColor?: string;
    shadowColor?: string;
  };
}

// Interface for user data with timezone
interface UserWithTimezone {
  id: string;
  timezone: string;
  family_id: string;
  role: string;
}

// Interface for family data
interface Family {
  family_id: string;
  owner_id: string; // The parent who owns the family
}

// This is the entrypoint for the Edge Function
Deno.serve(async (req: Request) => {
  try {
    // Create a Supabase client with the project URL and service role key from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    // Ensure we have required environment variables
    if (!supabaseUrl || !supabaseKey) {
      return new Response(
        JSON.stringify({ error: 'Missing Supabase URL or service role key' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create authenticated Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get current UTC date for logging and calculations
    const utcNow = new Date();
    console.log('Reset recurring tasks function running at (UTC):', utcNow.toISOString());
    
    // Step 1: Fetch all users with their timezone information
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, timezone, family_id, role')
      .eq('role', 'parent'); // We only need parent users as they're the task owners
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return new Response(
        JSON.stringify({ error: 'Error fetching users', details: usersError }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Ensure users is an array, even if data is null
    const userArray: UserWithTimezone[] = users || [];
    
    if (userArray.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users found', count: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Found ${userArray.length} parent users`);
    
    // Step 2: Filter users where it's currently around midnight in their local timezone
    const usersAtMidnight = userArray.filter((user: UserWithTimezone) => {
      try {
        // Create Date object for current time in user's timezone
        const options: Intl.DateTimeFormatOptions = { 
          timeZone: user.timezone || 'America/New_York', // Default to ET if not specified
          hour: 'numeric',
          hour12: false // Use 24-hour format
        };
        
        // Get the current hour in the user's timezone
        const formatter = new Intl.DateTimeFormat('en-US', options);
        const localTime = formatter.format(utcNow);
        const localHour = parseInt(localTime, 10);
        
        // Check if it's midnight hour (0) in the user's timezone
        return localHour === 0;
      } catch (error) {
        console.error(`Error checking timezone for user ${user.id}:`, error);
        return false;
      }
    });
    
    console.log(`Found ${usersAtMidnight.length} parents where it's currently midnight in their timezone`);
    
    if (usersAtMidnight.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No users currently at midnight', count: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Step 3: Process tasks for each user at midnight
    const allResults = [];
    
    for (const user of usersAtMidnight) {
      console.log(`Processing tasks for user ${user.id} in timezone ${user.timezone}`);
      
      // Fetch all recurring tasks created by this parent
      const { data: dueTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('created_by', user.id)
        .in('frequency', ['daily', 'weekly']);
      
      if (tasksError) {
        console.error(`Error fetching tasks for user ${user.id}:`, tasksError);
        allResults.push({ 
          userId: user.id, 
          success: false, 
          error: tasksError 
        });
        continue;
      }
      
      if (!dueTasks || dueTasks.length === 0) {
        console.log(`No recurring tasks found for user ${user.id}`);
        allResults.push({ 
          userId: user.id, 
          success: true, 
          tasksProcessed: 0 
        });
        continue;
      }
      
      console.log(`Found ${dueTasks.length} recurring tasks for user ${user.id}`);
      
      // Process each task for this user
      const userTaskResults = await Promise.all(dueTasks.map(async (task: TaskResponse) => {
        try {
          // Calculate the next occurrence date based on frequency
          let newNextOccurrence: Date;
          
          if (task.frequency === 'daily') {
            newNextOccurrence = new Date(utcNow.getTime() + 24 * 60 * 60 * 1000); // 24 hours in the future
          } else if (task.frequency === 'weekly') {
            newNextOccurrence = new Date(utcNow.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days in the future
          } else {
            // Default fallback
            newNextOccurrence = new Date(utcNow.getTime() + 24 * 60 * 60 * 1000);
          }
          
          // Always reset to 'assigned' status so the task is actionable
          const newStatus = 'assigned';
          
          console.log(`Updating task ${task.id} for user ${user.id}: Setting status to '${newStatus}' and next_occurrence to ${newNextOccurrence.toISOString()}`);
          
          // Update the task status and next_occurrence date
          const response = await supabase
            .from('tasks')
            .update({
              status: newStatus,
              next_occurrence: newNextOccurrence.toISOString(),
              updated_at: utcNow.toISOString()
            })
            .eq('id', task.id);
          
          if (response.error) {
            console.error(`Error updating task ${task.id}:`, response.error);
            return { 
              taskId: task.id, 
              success: false, 
              error: response.error 
            };
          }
          
          return { 
            taskId: task.id, 
            success: true, 
            newNextOccurrence: newNextOccurrence.toISOString() 
          };
        } catch (error) {
          console.error(`Exception updating task ${task.id}:`, error);
          return { 
            taskId: task.id, 
            success: false, 
            error: String(error) 
          };
        }
      }));
      
      // Add the results for this user
      const successCount = userTaskResults.filter(r => r.success).length;
      allResults.push({
        userId: user.id,
        timezone: user.timezone,
        tasksProcessed: dueTasks.length,
        tasksSuccessful: successCount,
        taskResults: userTaskResults
      });
    }
    
    // Step 4: Return the aggregated results
    const totalTasksProcessed = allResults.reduce((sum, result) => 
      sum + (result.tasksProcessed || 0), 0);
    const totalTasksSuccessful = allResults.reduce((sum, result) => 
      sum + (result.tasksSuccessful || 0), 0);
    
    return new Response(
      JSON.stringify({
        message: `Reset ${totalTasksSuccessful} of ${totalTasksProcessed} recurring tasks for ${usersAtMidnight.length} users at local midnight`,
        usersProcessed: usersAtMidnight.length,
        totalTasksProcessed,
        totalTasksSuccessful,
        results: allResults
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    // Handle any unexpected errors
    console.error('Unexpected error in reset-recurring-tasks function:', error);
    return new Response(
      JSON.stringify({ error: 'Unexpected error', details: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});