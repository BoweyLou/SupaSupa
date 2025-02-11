'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import QuestCard, { Quest } from '@/components/QuestCard';
import AddTask from '@/components/AddTask';
import PointsDisplay from '@/components/PointsDisplay';
import { fetchParentTasks, fetchChildTasks as repoFetchChildTasks, updateTaskStatus, fetchTask } from '@/repositories/tasksRepository';
import AwardsSection from '@/components/AwardsSection';
import AddAward from '@/components/AddAward';
import DashboardSection from '@/components/DashboardSection';
import { Compass, Award as AwardIcon } from 'lucide-react';
import AddBonusAward from '@/components/AddBonusAward';
import BonusAwardCard, { AVAILABLE_ICONS, IconConfig } from '@/components/BonusAwardCard';
import { Star } from 'lucide-react';

// Define a Child interface for proper typing of child accounts
interface Child {
  id: string;
  name: string;
  points: number;
  family_id: string;
  role: 'child';
  created_at?: string;
  updated_at?: string;
}

// Define an interface for the user record from our database
interface DBUser {
  id: string;
  name: string;
  family_id: string;
  role: string;
  points: number;
  user_metadata?: { [key: string]: any };
}

// NEW: Define BonusAward interface
interface BonusAward {
  id: string;
  title: string;
  icon: string;
  points: number;
  status: 'available' | 'awarded';
  assigned_child_id?: string;
  created_at?: string;
  updated_at?: string;
  // New fields for awarded instances
  instance_id?: string;
  awarded_at?: string;
  instances?: BonusAwardInstance[];
}

// Add new interface for awarded bonus instances
interface BonusAwardInstance {
  id: string;
  bonus_award_id: string;
  assigned_child_id: string;
  awarded_at: string;
}

// ChildDashboardSection: A reusable component to display tasks for a child account
function ChildDashboardSection({ child, tasks, onComplete }: { child: Child; tasks: Quest[]; onComplete: (questId: string) => void; }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div>
      <div className="flex justify-end items-center w-full">
        <button onClick={() => setExpanded(!expanded)} className="text-blue-600">
          {expanded ? 'Hide Tasks' : `Show Tasks (${tasks.length})`}
        </button>
      </div>
      {expanded && tasks.length > 0 && (
        <ul className="mt-2">
          {tasks.map((task: Quest) => (
            <li key={task.id}>
              <QuestCard 
                quest={task} 
                userRole="child" 
                onComplete={onComplete}
              />
            </li>
          ))}
        </ul>
      )}
      {expanded && tasks.length === 0 && (
        <p className="mt-2 text-gray-500">No tasks available</p>
      )}
    </div>
  );
}

// Add ChildSelectorModal component
const ChildSelectorModal = ({ isOpen, onClose, onSelect, children }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelect: (childId: string) => void; 
  children: Child[]; 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded p-6 w-full max-w-md">
        <h2 className="text-2xl mb-4">Select Child</h2>
        <div className="space-y-2">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => onSelect(child.id)}
              className="w-full p-4 text-left hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors duration-200 flex items-center justify-between"
            >
              <span className="text-lg">{child.name}</span>
              <span className="text-sm text-gray-500">{child.points} pts</span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for child account management
    const [familyId, setFamilyId] = useState<string | null>(null);
    const [children, setChildren] = useState<Child[]>([]);
    const [childName, setChildName] = useState('');
    const [childLoading, setChildLoading] = useState(false);

    // New state for editing child accounts
    const [editingChildId, setEditingChildId] = useState<string | null>(null);
    const [editingChildName, setEditingChildName] = useState('');

    // New state for tasks/quests (parent's tasks)
    const [tasks, setTasks] = useState<Quest[]>([]);

    // New state for the current user's record from our users table
    const [dbUser, setDbUser] = useState<DBUser | null>(null);

    // New state for child tasks mapping child id to its tasks
    const [childTasks, setChildTasks] = useState<{ [key: string]: Quest[] }>({});

    const [totalPoints, setTotalPoints] = useState(0);

    // New state for parent's tasks collapse
    const [parentExpanded, setParentExpanded] = useState(false);

    // New state for active tab in the tabbed interface.
    // For a parent, 'parent' will refer to the parent's dashboard; other tabs will have child ids.
    const [activeTab, setActiveTab] = useState<string>('');

    // NEW: State for Bonus Awards
    const [bonusAwards, setBonusAwards] = useState<BonusAward[]>([]);

    // Add new state for child selector
    const [isChildSelectorOpen, setIsChildSelectorOpen] = useState(false);
    const [selectedBonusAwardId, setSelectedBonusAwardId] = useState<string | null>(null);

    // Helper function to convert task status from Supabase to QuestCard expected status
    const mapStatus = (status: string) => {
      if (status === 'pending approval') return 'pending';
      if (status === 'rejected') return 'failed';
      return status as Quest['status'];
    };

    // Helper function to check if a given date string represents a date that is today
    const isToday = (dateString: string | undefined) => {
      if (!dateString) return false;
      const date = new Date(dateString);
      const now = new Date();
      return date.getFullYear() === now.getFullYear() &&
             date.getMonth() === now.getMonth() &&
             date.getDate() === now.getDate();
    };

    console.log('DashboardPage rendering', { user, dbUser, tasks, childTasks });

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session?.user) {
                    window.location.href = '/login';
                    return;
                }

                setUser(session.user);
            } catch (error) {
                console.error('Error checking auth status:', error);
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!session) {
                window.location.href = '/login';
                return;
            }
            setUser(session.user);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Fetch the current user's record from our 'users' table using their name or id
    useEffect(() => {
        console.log('User metadata in DB fetch effect:', user?.user_metadata);
        if (user && (user.user_metadata?.name || user.id)) {
            const filterField = user.user_metadata?.name ? 'name' : 'id';
            const identifier = user.user_metadata?.name ? user.user_metadata.name : user.id;
            console.log(`Fetching DB user using ${filterField}:`, identifier);
            const fetchDBUser = async () => {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq(filterField, identifier)
                    .single();
                if (error) {
                    // If error indicates no rows, create a new DB user record
                    if (error.code === 'PGRST116') {
                        console.log('No DB user record found, creating one now...');
                        const newUserId = user.user_metadata?.sub || user.id;
                        const { data: newUser, error: insertError } = await supabase
                            .from('users')
                            .insert([
                                {
                                    id: newUserId,
                                    name: user.user_metadata?.name || 'User',
                                    family_id: null,
                                    role: 'parent',
                                    points: 0
                                }
                            ])
                            .single();
                        if (insertError) {
                            console.error('Error creating new DB user:', insertError);
                        } else {
                            console.log('Created new DB user:', newUser);
                            setDbUser(newUser);
                        }
                    } else {
                        console.error('Error fetching db user:', error);
                    }
                } else if (data) {
                    console.log('Fetched DB user:', data);
                    setDbUser(data);
                }
            };
            fetchDBUser();
        } else {
            console.log('User or user identifier is not available:', user);
        }
    }, [user]);

    // Function to fetch and update children data
    const fetchChildren = async (familyId: string) => {
        try {
            console.log('Starting fetchChildren for family:', familyId);
            const { data: childrenData, error: childrenError } = await supabase
                .from('users')
                .select('*')
                .eq('family_id', familyId)
                .eq('role', 'child');
            
            if (childrenError) {
                console.error('Error fetching children:', childrenError);
                setError('Failed to fetch children accounts');
                return;
            }
            
            console.log('Raw children data from database:', JSON.stringify(childrenData, null, 2));
            setChildren(childrenData as Child[]);
            console.log('Updated children data:', childrenData);
        } catch (err) {
            console.error('Error in fetchChildren:', err);
            setError('An unexpected error occurred while fetching children');
        }
    };

    // Set up real-time subscription for child updates
    useEffect(() => {
        if (!familyId) return;

        // Subscribe to changes in the users table for this family's children
        const subscription = supabase
            .channel('children-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'users',
                    filter: `family_id=eq.${familyId} AND role=eq.child`
                },
                async (payload) => {
                    console.log('Received real-time update:', payload);
                    // Refresh children data when there's any change
                    await fetchChildren(familyId);
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [familyId]);

    // Function to update a child's points in the local state
    const updateChildPoints = (childId: string, newPoints: number) => {
        setChildren(prevChildren => 
            prevChildren.map(child => 
                child.id === childId 
                    ? { ...child, points: newPoints }
                    : child
            )
        );
    };

    // Set up real-time subscription for points updates
    useEffect(() => {
        if (!familyId) return;

        // Subscribe to changes in the users table for points updates
        const pointsSubscription = supabase
            .channel('points-changes')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'users',
                    filter: `family_id=eq.${familyId} AND role=eq.child`
                },
                async (payload) => {
                    console.log('Received points update:', payload);
                    const { new: updatedUser } = payload;
                    if (updatedUser && updatedUser.points !== undefined) {
                        updateChildPoints(updatedUser.id, updatedUser.points);
                    }
                }
            )
            .subscribe();

        return () => {
            pointsSubscription.unsubscribe();
        };
    }, [familyId]);

    // Function to fetch parent's tasks (quests)
    const fetchTasks = async () => {
      if (!dbUser) return;
      try {
        const data = await fetchParentTasks(dbUser.id);
        console.log('Raw tasks data fetched:', data);
        if (!Array.isArray(data)) {
          console.error('Expected tasks data as an array, got:', data);
          setTasks([]);
          return;
        }
        const quests = data.map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          points: task.reward_points,
          frequency: task.frequency,
          status: mapStatus(task.status),
          assignedChildId: task.assigned_child_id,
          completedAt: task.updated_at
        }));
        console.log('Mapped tasks (quests):', quests);
        setTasks(quests);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    // Function to fetch tasks for each child
    const fetchChildTasks = async () => {
      let updatedChildTasks: { [key: string]: Quest[] } = {};
      for (const child of children) {
        try {
          const data = await repoFetchChildTasks(child.id);
          updatedChildTasks[child.id] = data.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            points: task.reward_points,
            frequency: task.frequency,
            status: mapStatus(task.status),
            completedAt: task.updated_at
          }));
        } catch (error) {
          console.error('Error fetching tasks for child', child.id, error);
        }
      }
      setChildTasks(updatedChildTasks);
    };

    // Fetch parent's tasks once the current dbUser is available
    useEffect(() => {
      if (dbUser) {
        console.log('dbUser available, fetching tasks...');
        fetchTasks();
      }
    }, [dbUser]);

    // Fetch child tasks whenever children list is updated
    useEffect(() => {
      if (children && children.length > 0) {
         fetchChildTasks();
      }
    }, [children]);

    // Add useEffect to calculate total points whenever children change
    useEffect(() => {
        if (children) {
            const total = children.reduce((sum, child) => sum + (child.points || 0), 0);
            setTotalPoints(total);
        }
    }, [children]);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            window.location.href = '/login';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Update handleAddChild to include proper error handling
    const handleAddChild = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!childName || !familyId) {
            console.log('Missing required data:', { childName, familyId });
            return;
        }
        
        setChildLoading(true);
        setError(null);
        
        try {
            const childData = {
                family_id: familyId,
                name: childName,
                role: 'child',
                points: 0
            };
            
            console.log('Adding child with data:', JSON.stringify(childData, null, 2));

            const { data, error } = await supabase
                .from('users')
                .insert([childData])
                .select();

            if (error) {
                console.error('Error adding child:', error);
                setError('Failed to add child account: ' + error.message);
                return;
            }

            console.log('Successfully added child, raw response:', JSON.stringify(data, null, 2));
            
            if (data && data.length > 0) {
                console.log('Setting new children state with added child');
                setChildren([...children, data[0] as Child]);
                setChildName('');
                
                // Double check the database state
                console.log('Verifying database state after add...');
                const { data: verifyData, error: verifyError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('family_id', familyId)
                    .eq('role', 'child');
                
                if (verifyError) {
                    console.error('Error verifying children:', verifyError);
                } else {
                    console.log('Current children in database:', JSON.stringify(verifyData, null, 2));
                }
                
                // Refresh children data to ensure we have the latest
                await fetchChildren(familyId);
            }
        } catch (err) {
            console.error('Error in handleAddChild:', err);
            setError('An unexpected error occurred while adding child');
        } finally {
            setChildLoading(false);
        }
    };

    const handleEditClick = (child: Child) => {
        setEditingChildId(child.id);
        setEditingChildName(child.name);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingChildName(e.target.value);
    };

    const handleSaveEdit = async (childId: string) => {
        if (!familyId) {
            setError('Family ID is missing.');
            return;
        }
        try {
            const { error } = await supabase
                .from('users')
                .update({ name: editingChildName })
                .eq('id', childId);
            if (error) {
                console.error('Error updating child:', error);
                setError('Failed to update child account.');
                return;
            }
            await fetchChildren(familyId);
            setEditingChildId(null);
            setEditingChildName('');
        } catch (err) {
            console.error('Error in handleSaveEdit:', err);
            setError('Failed to update child account.');
        }
    };

    const handleCancelEdit = () => {
        setEditingChildId(null);
        setEditingChildName('');
    };

    const handleDeleteChild = async (childId: string) => {
        if (!familyId) {
            setError('Family ID is missing.');
            return;
        }
        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', childId);
            if (error) {
                console.error('Error deleting child:', error);
                setError('Failed to delete child account.');
                return;
            }
            await fetchChildren(familyId);
        } catch (err) {
            console.error('Error in handleDeleteChild:', err);
            setError('Failed to delete child account.');
        }
    };

    // Updated handleTaskCompletion to use repository functions
    const handleTaskCompletion = async (questId: string, action?: 'approve' | 'assigned' | 'edit' | 'delete') => {
      if (action === 'edit' || action === 'delete') {
        await fetchTasks();
        if (children && children.length > 0) {
          await fetchChildTasks();
        }
        return;
      }

      try {
        // Fetch the task using repository function
        const task = await fetchTask(questId);

        // Determine the new status based on the action
        let newStatus: string;
        if (action === 'approve') {
          newStatus = 'completed';
        } else if (action === 'assigned') {
          newStatus = 'assigned';
        } else {
          // This is a child marking a task as done
          newStatus = 'pending approval';
        }

        // Update task status using repository function
        await updateTaskStatus(questId, newStatus);

        // Only update points if the task is being approved
        if (newStatus === 'completed' && task.assigned_child_id) {
          // Fetch current points
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('points')
            .eq('id', task.assigned_child_id)
            .single();
          if (userError) {
            console.error('Error fetching user points:', userError);
            return;
          }

          const newPoints = (userData.points || 0) + task.reward_points;

          // Update user points
          const { error: pointsError } = await supabase
            .from('users')
            .update({ points: newPoints })
            .eq('id', task.assigned_child_id);
          if (pointsError) {
            console.error('Error updating points:', pointsError);
            return;
          }

          // Update local state for child points
          updateChildPoints(task.assigned_child_id, newPoints);
        }

        // Refresh tasks
        fetchTasks();
        if (children && children.length > 0) {
          fetchChildTasks();
        }
      } catch (err) {
        console.error('Error in handleTaskCompletion:', err);
        setError('Failed to complete task');
      }
    };

    // Temporary manual reset for recurring tasks (for local development)
    const handleManualResetRecurringTasks = async () => {
      const now = new Date();
      // Set a threshold to allow resetting tasks up to 24 hours before they are due
      const resetThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      console.log('handleManualResetRecurringTasks initiated at:', now.toISOString());
      console.log('Fetching tasks due for reset with next_occurrence <=:', resetThreshold.toISOString());

      const { data: dueTasks, error: selectError } = await supabase
        .from('tasks')
        .select('*')
        .in('frequency', ['daily', 'weekly'])
        .lte('next_occurrence', resetThreshold.toISOString());

      if (selectError && Object.keys(selectError).length > 0) {
        console.error('Error fetching due tasks:', selectError);
        alert('Error fetching due tasks. Please check the console for details.');
        return;
      }

      console.log('Fetched due tasks:', dueTasks);
      if (!dueTasks || dueTasks.length === 0) {
        alert('No recurring tasks are due for a reset.');
        return;
      }

      const updates = dueTasks.map(async (task: any) => {
        let newNextOccurrence;
        if (task.frequency === 'daily') {
          newNextOccurrence = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        } else if (task.frequency === 'weekly') {
          newNextOccurrence = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        } else {
          newNextOccurrence = now;
        }

        // Always reset to 'assigned' so the task is actionable
        const newStatus = 'assigned';

        console.log(`Updating task ${task.id}: current next_occurrence ${task.next_occurrence} -> new next_occurrence:`, newNextOccurrence.toISOString());

        try {
          const response = await supabase
            .from('tasks')
            .update({
              status: newStatus,
              next_occurrence: newNextOccurrence.toISOString()
            })
            .eq('id', task.id);
          
          if (response.error) {
            console.error(`Response error for task ${task.id}:`, response.error);
            throw response.error;
          }

          console.log(`Updated task ${task.id} successfully:`, response);
          return response;
        } catch (error: any) {
          console.error(`Error updating task ${task.id}:`, error);
          throw error;
        }
      });

      try {
        await Promise.all(updates);
        alert('Recurring tasks have been reset.');
      } catch (updateError) {
        console.error('Error during task updates:', updateError);
        alert('An error occurred while updating tasks. Check console for details.');
      }
    };

    // Update the family fetch effect for parent users
    useEffect(() => {
      if (dbUser) {
        const fetchFamilyAndChildren = async () => {
          console.log('Fetching family for parent:', dbUser.id);
          // Fetch family record using maybeSingle() to avoid throwing if not found
          const { data: familyData, error: familyError } = await supabase
            .from('families')
            .select('*')
            .eq('owner_id', dbUser.id)
            .maybeSingle();
          if (familyError) {
            console.error('Error fetching family:', familyError);
            setError('Failed to fetch family data');
            return;
          }
          if (familyData) {
            console.log('Fetched family data:', familyData);
            setFamilyId(familyData.family_id);
            console.log('Fetching children for family:', familyData.family_id);
            const { data: childrenData, error: childrenError } = await supabase
              .from('users')
              .select('*')
              .eq('family_id', familyData.family_id)
              .eq('role', 'child');
            if (childrenError) {
              console.error('Error fetching children:', childrenError);
              setError('Failed to fetch children data');
            } else {
              console.log('Fetched children data:', childrenData);
              setChildren(childrenData);
            }
          } else {
            console.log('No family found, creating new family...');
            const { data: newFamily, error: createFamilyError } = await supabase
              .from('families')
              .insert([{ owner_id: dbUser.id, name: `${dbUser.name}'s Family` }])
              .select()
              .single();
            if (createFamilyError) {
              console.error('Error creating family:', createFamilyError);
              setError('Failed to create family');
            } else {
              console.log('Created new family:', newFamily);
              setFamilyId(newFamily.family_id);
              // Update parent's record with the new family_id
              const { error: updateUserError } = await supabase
                .from('users')
                .update({ family_id: newFamily.family_id })
                .eq('id', dbUser.id);
              if (updateUserError) {
                console.error('Error updating parent record with family_id:', updateUserError);
              }
            }
          }
        };
        fetchFamilyAndChildren();
      }
    }, [dbUser]);

    // Update activeTab initialization for parent users
    useEffect(() => {
      if (dbUser && !activeTab) {
         if (dbUser.role === 'parent') {
            if (children && children.length > 0) {
                setActiveTab(children[0].id);
            } else {
                setActiveTab('parent');
            }
         } else {
            setActiveTab(dbUser.id);
         }
      }
    }, [dbUser, activeTab, children]);

    // Update tabs computation for parent users to place the parent's tab last
    const tabs = useMemo(() => {
      if (!dbUser) return [];
      if (dbUser.role === 'parent') {
         const childTabs = children.map(child => ({ id: child.id, label: child.name }));
         return [...childTabs, { id: 'parent', label: 'Parent Dashboard' }];
      } else {
         return [{ id: dbUser.id, label: dbUser.user_metadata?.name || 'My Dashboard' }];
      }
    }, [dbUser, children]);

    // Determine the selected child for a child tab (for non-parent activeTab)
    let selectedChild: Child | null = null;
    if (dbUser) {
      if (dbUser.role === 'child') {
        // If logged in user is a child, use dbUser data as the child record
        // We assume dbUser shape is compatible with Child interface
        selectedChild = { id: dbUser.id, name: dbUser.name, points: dbUser.points, family_id: dbUser.family_id, role: 'child' };
      } else if (activeTab !== 'parent') {
        selectedChild = children.find(child => child.id === activeTab) || null;
      }
    }

    // Compute the child's completed tasks for today
    const completedTasksForChild = selectedChild ? (childTasks[selectedChild.id] || []).filter(task => task.status === 'completed' && isToday(task.completedAt)) : [];

    // Component to display a small completed task card
    const CompletedTaskCard = ({ task }: { task: Quest }) => {
      return (
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '8px', textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <AwardIcon size={20} color="#f9c74f" style={{ display: 'block', margin: '0 auto' }} />
          <div style={{ fontWeight: 'bold', marginTop: '4px', fontSize: '0.8rem' }}>{task.title}</div>
          <div style={{ fontSize: '0.75rem', color: 'green' }}>approved</div>
        </div>
      );
    };

    // Compute active and completed tasks for parent's task view
    const activeTasks = tasks.filter(task => task.status !== 'completed');
    const completedTasks = tasks.filter(task => task.status === 'completed');

    // NEW: Function to fetch bonus awards
    const fetchBonusAwards = async () => {
      try {
        // First, fetch just the bonus awards
        const { data: awards, error: awardsError } = await supabase
          .from('bonus_awards')
          .select('*')
          .order('created_at', { ascending: false });

        if (awardsError) {
          console.error('Error fetching bonus awards:', awardsError);
          setError('Failed to fetch bonus awards');
          return;
        }

        // Ensure we have an array even if data is null
        const safeAwards = awards || [];

        // Map the awards to include default values for instances
        const processedAwards = safeAwards.map(award => ({
          ...award,
          status: 'available' as const,
          instances: []
        }));

        // Try to fetch instances if there are any awards
        if (safeAwards.length > 0) {
          try {
            const { data: instances } = await supabase
              .from('bonus_award_instances')
              .select('*')
              .order('awarded_at', { ascending: false });

            // If we have instances, add them to the corresponding awards
            if (instances && instances.length > 0) {
              instances.forEach(instance => {
                const award = processedAwards.find(a => a.id === instance.bonus_award_id);
                if (award) {
                  if (!award.instances) award.instances = [];
                  award.instances.push(instance);
                }
              });
            }
          } catch (instanceError) {
            console.error('Error fetching bonus award instances:', instanceError);
            // Don't fail completely if instances fetch fails
          }
        }

        setBonusAwards(processedAwards);
      } catch (err) {
        console.error('Unexpected error fetching bonus awards:', err);
        setError('An unexpected error occurred while fetching bonus awards');
      }
    };

    // NEW: useEffect to fetch bonus awards for parent
    useEffect(() => {
      if (dbUser && dbUser.role === 'parent') {
         fetchBonusAwards();
      }
    }, [dbUser]);

    // NEW: Handler to award a bonus award
    const handleAwardBonus = async (bonusAwardId: string) => {
      try {
        const bonus = bonusAwards.find(b => b.id === bonusAwardId);
        if (!bonus) {
          setError('Bonus award not found');
          return;
        }
        
        if (!children || children.length === 0) {
          setError('No children accounts found to award bonus to');
          return;
        }
        
        if (children.length === 1) {
          // If there's only one child, award directly
          await awardBonusToChild(bonusAwardId, children[0].id);
        } else {
          // If multiple children, show selector
          setSelectedBonusAwardId(bonusAwardId);
          setIsChildSelectorOpen(true);
        }
      } catch (err) {
        console.error('Error in handleAwardBonus:', err);
        setError('Failed to process bonus award');
      }
    };

    // Update awardBonusToChild with better error handling
    const awardBonusToChild = async (bonusAwardId: string, childId: string) => {
      try {
        const bonus = bonusAwards.find(b => b.id === bonusAwardId);
        if (!bonus) {
          setError('Bonus award not found');
          return;
        }

        // Create a new record in bonus_award_instances
        const { data: instanceData, error: awardError } = await supabase
          .from('bonus_award_instances')
          .insert([{ 
            bonus_award_id: bonusAwardId,
            assigned_child_id: childId,
            awarded_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (awardError || !instanceData) {
          console.error('Error creating bonus award instance:', awardError);
          setError('Failed to award bonus');
          return;
        }

        // Update child's points
        const { data: childData, error: childError } = await supabase
          .from('users')
          .select('points')
          .eq('id', childId)
          .single();

        if (childError || !childData) {
          console.error('Error fetching child points:', childError);
          setError('Failed to fetch child points');
          return;
        }

        const newPoints = (childData.points || 0) + bonus.points;
        const { error: updateChildError } = await supabase
          .from('users')
          .update({ points: newPoints })
          .eq('id', childId);

        if (updateChildError) {
          console.error('Error updating child points:', updateChildError);
          setError('Failed to update child points');
          return;
        }

        // Update local state
        updateChildPoints(childId, newPoints);
        await fetchBonusAwards();
        setIsChildSelectorOpen(false);
        setSelectedBonusAwardId(null);
      } catch (err) {
        console.error('Error in awardBonusToChild:', err);
        setError('Failed to process bonus award');
      }
    };

    // Add handler for child selection
    const handleChildSelect = async (childId: string) => {
      if (selectedBonusAwardId) {
        await awardBonusToChild(selectedBonusAwardId, childId);
      }
    };

    // NEW: Handler to edit a bonus award
    const handleEditBonus = async (bonusAwardId: string) => {
      const bonus = bonusAwards.find(b => b.id === bonusAwardId);
      if (!bonus) return;
      const newTitle = window.prompt('Enter new title', bonus.title);
      if (newTitle === null) return;
      const newIcon = window.prompt('Enter new icon', bonus.icon);
      if (newIcon === null) return;
      const newPointsStr = window.prompt('Enter new points', bonus.points.toString());
      if (newPointsStr === null) return;
      const newPoints = parseInt(newPointsStr, 10);
      const { error } = await supabase
         .from('bonus_awards')
         .update({ title: newTitle, icon: newIcon, points: newPoints, updated_at: new Date().toISOString() })
         .eq('id', bonusAwardId);
      if (error) {
         console.error('Error updating bonus award:', error);
         return;
      }
      fetchBonusAwards();
    };

    // NEW: Handler to delete a bonus award
    const handleDeleteBonus = async (bonusAwardId: string) => {
      if (!window.confirm('Are you sure you want to delete this bonus award?')) return;
      const { error } = await supabase
         .from('bonus_awards')
         .delete()
         .eq('id', bonusAwardId);
      if (error) {
         console.error('Error deleting bonus award:', error);
         return;
      }
      fetchBonusAwards();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold">Family Dashboard</h1>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-4">Welcome, {user?.user_metadata?.name || 'User'}</span>
                            <button
                                onClick={handleSignOut}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {/* Display total family points at the top */}
                {children && (
                    <PointsDisplay 
                        children={children} 
                        totalPoints={totalPoints}
                    />
                )}

                {/* Tabbed Interface for Parent and Child Dashboards */}
                <div className="mt-4">
                  <div className="border-b border-gray-300 mb-0">
                    <div className="flex w-full">
                      {tabs.map(tab => (
                        <button 
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex-1 text-center py-3 px-6 text-xl ${activeTab === tab.id ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-md rounded-t' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-t'}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-white shadow">
                    {activeTab === 'parent' && (
                      <>
                        {/* Parent Dashboard Content */}
                        {/* Child Accounts Section for Parent (Child Management) */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Child Accounts</h2>
                            {children && children.length > 0 ? (
                                <ul className="mb-4">
                                    {children.map((child) => (
                                        <li key={child.id} className="p-2 border-b flex items-center justify-between">
                                            {editingChildId === child.id ? (
                                                <>
                                                    <input type="text" value={editingChildName} onChange={handleEditChange} className="border rounded p-1 mr-2" />
                                                    <button onClick={() => handleSaveEdit(child.id)} className="text-green-600 mr-2">Save</button>
                                                    <button onClick={handleCancelEdit} className="text-red-600">Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <span>{child.name}</span>
                                                    <div>
                                                        <button onClick={() => handleEditClick(child)} className="text-blue-600 mr-2">Edit</button>
                                                        <button onClick={() => handleDeleteChild(child.id)} className="text-red-600">Delete</button>
                                                    </div>
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="mb-4">No child accounts found.</p>
                            )}
                            <form onSubmit={handleAddChild} className="flex items-center">
                                <input
                                    type="text"
                                    value={childName}
                                    onChange={(e) => setChildName(e.target.value)}
                                    placeholder="Child Name"
                                    className="border border-gray-300 p-2 rounded mr-2"
                                />
                                <button
                                    type="submit"
                                    disabled={childLoading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded"
                                >
                                    {childLoading ? 'Adding...' : 'Add Child Account'}
                                </button>
                            </form>
                        </section>

                        {/* Manual Recurring Tasks Reset Button */}
                        <section className="mb-8">
                          <button 
                            onClick={handleManualResetRecurringTasks}
                            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                          >
                            Manual Reset Recurring Tasks
                          </button>
                        </section>

                        {/* Parent Tasks Section */}
                        <DashboardSection title="Tasks" toggleable={true} defaultExpanded={true}>
                            {dbUser && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <AddTask parentId={dbUser.id} children={children} onTaskAdded={() => {
                                        fetchTasks();
                                        fetchChildTasks();
                                    }} />
                                    <AddAward onAwardAdded={() => {
                                        // Optionally refresh awards if needed
                                    }} />
                                </div>
                            )}
                            {activeTasks.length > 0 ? (
                                activeTasks.map((task: Quest) => (
                                    <QuestCard key={task.id} quest={task} userRole={user?.user_metadata?.role || 'parent'} onComplete={handleTaskCompletion} />
                                ))
                            ) : (
                                <p className="mb-4">No tasks found.</p>
                            )}
                        </DashboardSection>

                        {/* NEW: Bonus Awards Section for Parent Dashboard */}
                        <DashboardSection title="Bonus Awards" toggleable={true} defaultExpanded={true}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <AddBonusAward onBonusAdded={() => { fetchBonusAwards(); }} />
                          </div>
                          { bonusAwards.filter(b => b.status === 'available').length > 0 ? (
                            bonusAwards.filter(b => b.status === 'available').map(bonus => (
                              <BonusAwardCard key={bonus.id} bonusAward={bonus}
                                 onAward={() => handleAwardBonus(bonus.id)}
                                 onEdit={() => handleEditBonus(bonus.id)}
                                 onDelete={() => handleDeleteBonus(bonus.id)} />
                            ))
                          ) : (
                              <p className="mb-4">No bonus awards available.</p>
                          )}
                        </DashboardSection>

                        {/* Quest History Section */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Quest History</h2>
                            {completedTasks.length > 0 ? (
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr>
                                            <th className="px-4 py-2 border">Task Name</th>
                                            <th className="px-4 py-2 border">Description</th>
                                            <th className="px-4 py-2 border">Completed At</th>
                                            <th className="px-4 py-2 border">Child</th>
                                            <th className="px-4 py-2 border">Points Awarded</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {completedTasks.map((task: any) => (
                                            <tr key={task.id}>
                                                <td className="px-4 py-2 border">{task.title}</td>
                                                <td className="px-4 py-2 border">{task.description}</td>
                                                <td className="px-4 py-2 border">{task.completedAt}</td>
                                                <td className="px-4 py-2 border">{children.find(child => child.id === task.assignedChildId)?.name || 'Unknown Child'}</td>
                                                <td className="px-4 py-2 border">{task.points}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No completed quests</p>
                            )}
                        </section>
                      </>
                    )}

                    {activeTab !== 'parent' && (
                      <>
                        {selectedChild && (
                          <PointsDisplay children={[selectedChild]} showFamilyPoints={false} />
                        )}
                        <DashboardSection title={<> <Compass className="inline-block mr-2" /> Quest</>}>{selectedChild ? (
                            <ChildDashboardSection
                              child={selectedChild}
                              tasks={(childTasks[selectedChild.id] || []).filter(task => task.status !== 'completed')}
                              onComplete={handleTaskCompletion}
                            />
                          ) : (
                            <p>No data available for the selected child.</p>
                          )}
                        </DashboardSection>

                        {selectedChild && completedTasksForChild.length > 0 && (
                          <DashboardSection title="Today's Completed Tasks">
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                              {completedTasksForChild.map(task => (
                                <CompletedTaskCard key={task.id} task={task} />
                              ))}
                            </div>
                          </DashboardSection>
                        )}

                        {/* NEW: Bonus Awards Sections for Child Dashboard */}
                        {selectedChild && (
                          <>
                            <DashboardSection title="Awarded Bonus Awards">
                              {bonusAwards
                                .filter(award => award.instances?.some(instance => 
                                  instance.assigned_child_id === selectedChild.id
                                ))
                                .map(bonus => {
                                  const matchingInstance = bonus.instances?.find(instance => 
                                    instance.assigned_child_id === selectedChild.id
                                  );
                                  const IconComponent = AVAILABLE_ICONS.find((i: IconConfig) => i.name === bonus.icon)?.icon || Star;
                                  const iconColor = AVAILABLE_ICONS.find((i: IconConfig) => i.name === bonus.icon)?.color || '#FFD700';
                                  
                                  return (
                                    <div key={matchingInstance?.id || bonus.id} className="p-2 border mb-2 flex items-center">
                                      <IconComponent size={24} color={iconColor} className="mr-2" />
                                      <span>{bonus.title} - {bonus.points} pts</span>
                                      {matchingInstance?.awarded_at && (
                                        <span className="ml-auto text-sm text-gray-500">
                                          {new Date(matchingInstance.awarded_at).toLocaleDateString()}
                                        </span>
                                      )}
                                    </div>
                                  );
                              })}
                            </DashboardSection>
                            <DashboardSection title="Available Bonus Awards">
                              {bonusAwards
                                .filter(award => !award.instances?.some(instance => 
                                  instance.assigned_child_id === selectedChild.id
                                ))
                                .map(bonus => {
                                  const IconComponent = AVAILABLE_ICONS.find((i: IconConfig) => i.name === bonus.icon)?.icon || Star;
                                  const iconColor = AVAILABLE_ICONS.find((i: IconConfig) => i.name === bonus.icon)?.color || '#FFD700';
                                  
                                  return (
                                    <div key={bonus.id} className="p-2 border mb-2 flex items-center">
                                      <IconComponent size={24} color={iconColor} className="mr-2" />
                                      <span>{bonus.title} - {bonus.points} pts</span>
                                    </div>
                                  );
                              })}
                            </DashboardSection>
                          </>
                        )}

                        <DashboardSection title={<> <AwardIcon className="inline-block mr-2" /> Reward</>}>
                          {selectedChild && (
                            <AwardsSection 
                              hideHeading={true}
                              childrenAccounts={[selectedChild]} 
                              onRedeemSuccess={(childId, newPoints) => updateChildPoints(childId, newPoints)} 
                            />
                          )}
                        </DashboardSection>
                      </>
                    )}
                  </div>
                </div>
            </main>

            {/* Add ChildSelectorModal before the closing div */}
            <ChildSelectorModal
              isOpen={isChildSelectorOpen}
              onClose={() => {
                setIsChildSelectorOpen(false);
                setSelectedBonusAwardId(null);
              }}
              onSelect={handleChildSelect}
              children={children}
            />
        </div>
    );
} 