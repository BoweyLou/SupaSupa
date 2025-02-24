# Recurring Tasks Scheduling Plan

This document outlines the steps to implement the recurring tasks feature in our application using Supabase Edge Functions. The recurrence logic will handle tasks with frequency 'daily' and 'weekly' to automatically reset or create new task instances as needed.

## Plan

- [ ] **Define Business Logic**
- [ ] **Daily Tasks:**
  - [ ] Determine that daily tasks are reset at midnight by updating the task status:
    - If completed within the day, update `last_completed_at`, set `next_occurrence` to the next day, and reset status to "assigned".
    - If not completed by midnight, mark the task as missed (or "failed") and then reset it for the next day.
  - [ ] Decide whether to update the existing task record or create a new instance for historical tracking.
  - [ ] Log actions for tracking and debugging purposes.
- [ ] **Weekly Tasks:**
  - [ ] Determine that weekly tasks should reset on a specific day (e.g., Monday at midnight):
    - If the task was completed during the week, update `last_completed_at`, set `next_occurrence` to the following week, and reset status to "assigned".
    - If not completed, mark the task as overdue (or "failed") then reset it.
  - [ ] Consider including a grace period or additional notifications for overdue weekly tasks.

- [x] **Update Database Schema**
  - [x] Add new columns to the `tasks` table:
    - `next_occurrence` (timestamp with time zone): Indicates when the task should recur next.
    - `last_completed_at` (timestamp with time zone): Records when the task was last completed.
  - [x] Example SQL queries:
    ```sql
    ALTER TABLE tasks
      ADD COLUMN next_occurrence TIMESTAMP WITH TIME ZONE;
    
    ALTER TABLE tasks
      ADD COLUMN last_completed_at TIMESTAMP WITH TIME ZONE;
    ```

- [x] **Refactor tasks fetching & updating logic in Dashboard**
  - Implemented repository pattern for all task-related database operations using Supabase. This updates the dashboard and task components to use a centralized tasks repository.

- [ ] **Develop the Supabase Edge Function**
  - [ ] Create a new Edge Function (e.g., `recurring-tasks-scheduler`).
  - [ ] Implement logic to:
    - Query for tasks with frequency 'daily' or 'weekly'.
    - Check if the current time is past the `next_occurrence`.
    - Update the task's status (reset to 'assigned' or create a new task instance) and set new `next_occurrence` and `last_completed_at` as needed.
  - [ ] Example pseudo-code:
    ```javascript
    // Pseudo-code for the edge function
    async function handleRecurringTasks() {
      // 1. Fetch tasks where current timestamp >= next_occurrence
      // 2. For daily tasks: update status, set last_completed_at, compute new next_occurrence (e.g., current_date + 1 day)
      // 3. For weekly tasks: similar logic with current_date + 7 days
    }
    ```

- [ ] **Configure Scheduled Execution**
  - [ ] Use Supabase CLI to deploy the edge function.
  - [ ] Set up the schedule using a cron expression:
    - For daily tasks, use a cron such as `0 0 * * *` (runs at midnight every day).
    - For weekly tasks, use a cron such as `0 0 * * 1` (runs at midnight on Monday).
  - [ ] Follow Supabase Edge Function scheduling documentation for how to set this up.

- [ ] **Update UI and Notifications (if applicable)**
  - [ ] Optionally, display information about recurring tasks in the UI (e.g., next occurrence date).
  - [ ] Inform users when their tasks are auto-reset or a new instance is created.

- [ ] **Testing and Rollout**
  - [ ] Write tests or simulate task completions to ensure the edge function works as expected.
  - [ ] Monitor logs and behavior after deployment.

## Setup Instructions for Supabase Edge Function

1. **Create the Function**
   - Run: `supabase functions new recurring-tasks-scheduler`
   - This creates a new directory for your function.

2. **Implement the Function Logic**
   - Edit the function code to include the business logic described above.

3. **Deploy the Function**
   - Run: `supabase functions deploy recurring-tasks-scheduler`

4. **Schedule the Function**
   - Set up the cron schedule for the function using the Supabase dashboard or through the CLI.

5. **Monitor and Log**
   - Use Supabase's logging capabilities to monitor the function's executions and debug if necessary.

## Deploying to Cloud

To move your local Supabase instance to the cloud and enable automatic scheduled execution, follow these steps:

1. **Log in to Supabase CLI:**
   - Run `supabase login` and authenticate with your Supabase account.

2. **Create or Use an Existing Supabase Project:**
   - Visit the [Supabase Dashboard](https://app.supabase.com) to create a new project or select an existing one. This cloud project will host your database and edge functions.

3. **Link Your Local Project to the Cloud Project:**
   - In your local project directory, run `supabase link` to link your project to the cloud. You will be prompted to enter your project reference.

4. **Deploy Your Database Schema:**
   - If you have local migrations or schema changes, use `supabase db push` to deploy these changes to your cloud database.

5. **Deploy Your Edge Functions:**
   - Deploy your edge functions (including the recurring-tasks-scheduler) by running:
     ```
     supabase functions deploy recurring-tasks-scheduler
     ```
   - Once deployed, the cloud infrastructure will automatically trigger these functions based on the cron schedule defined in the function's config.toml file (e.g., every day at midnight).

Following these steps will move your local Supabase development environment to the cloud, enabling full production capabilities including automatic scheduled execution of edge functions. 