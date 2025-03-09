'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import QuestCard, { Quest } from '@/components/QuestCard';
import AddTask from '@/components/AddTask';
import PointsDisplay from '@/components/PointsDisplay';
import { fetchParentTasks, fetchChildTasks as repoFetchChildTasks, updateTaskStatus, fetchTask } from '@/repositories/tasksRepository';
import AddAward from '@/components/AddAward';
import DashboardSection from '@/components/DashboardSection';
import AddBonusAward from '@/components/AddBonusAward';
import BonusAwardCard from '@/components/BonusAwardCard';
import ChildAccountCard from '@/components/ChildAccountCard';
import ChildSelectorModal from '@/components/ChildSelectorModal';
import DashboardTabs from '@/components/DashboardTabs';
import DashboardNav from '@/components/DashboardNav';
import AwardCard, { Award } from '@/components/AwardCard';
import { Session } from '@supabase/supabase-js';
import DashboardAccordion from '@/components/DashboardAccordion';
import ViewToggle, { ViewMode } from '@/components/ViewToggle';
import CardGrid from '@/components/CardGrid';
import TimezoneSelector from '@/components/TimezoneSelector';

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
  user_metadata?: Record<string, unknown>;
  timezone?: string;
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
  color?: string;
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

// NEW: Add TaskResponse interface
interface TaskResponse {
  id: string;
  title: string;
  description: string;
  reward_points: number;
  frequency: string;
  status: string;
  assigned_child_id?: string;
  updated_at: string;
  next_occurrence?: string;
  last_completed_at?: string;
  icon?: string;
  custom_colors?: {
    lowerGradientColor?: string;
    backgroundColor?: string;
    shadowColor?: string;
  };
}

// ChildDashboardSection: A reusable component to display tasks for a child account
function ChildDashboardSection({ child, tasks, onComplete, viewMode }: { 
  child: Child; 
  tasks: Quest[]; 
  onComplete: (questId: string) => void;
  viewMode: ViewMode;
}) {
  const [expanded, setExpanded] = useState(true);
  
  // Filter active tasks (assigned/pending) separately from completed tasks
  const activeTasks = tasks.filter(task => 
    task.status === 'assigned' || 
    task.status === 'pending' || 
    task.status === 'in-progress'
  );
  
  const completedTasks = tasks.filter(task => task.status === 'completed');
  
  return (
    <div>
      <h3 className="text-lg font-bold mb-2">Dashboard for {child.name}</h3>
      <div className="flex justify-end items-center w-full">
        <button onClick={() => setExpanded(!expanded)} className="text-blue-600">
          {expanded ? 'Hide Tasks' : `Show Tasks (${tasks.length})`}
        </button>
      </div>
      
      {expanded && (
        <>
          <div className="mb-6">
            <h4 className="text-md font-medium mb-2">Active Quests</h4>
            {activeTasks.length > 0 ? (
              <CardGrid className="mt-2" viewMode={viewMode}>
                {activeTasks.map((task: Quest) => (
                  <QuestCard 
                    key={task.id}
                    quest={task} 
                    userRole="child" 
                    onComplete={onComplete} 
                  />
                ))}
              </CardGrid>
            ) : (
              <p className="mt-2 text-gray-500">No active quests available</p>
            )}
          </div>
          
          <div>
            <h4 className="text-md font-medium mb-2">Completed Quests</h4>
            {completedTasks.length > 0 ? (
              <CardGrid className="mt-2" viewMode={viewMode}>
                {completedTasks.map((task: Quest) => (
                  <QuestCard 
                    key={task.id}
                    quest={task} 
                    userRole="child" 
                    onComplete={onComplete} 
                  />
                ))}
              </CardGrid>
            ) : (
              <p className="mt-2 text-gray-500">No completed quests</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

interface User {
  id: string;
  email: string;
  user_metadata?: Record<string, unknown>;
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [dbUser, setDBUser] = useState<DBUser | null>(null);
    const [children, setChildren] = useState<Child[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // State for child account management
    const [familyId, setFamilyId] = useState<string | null>(null);
    const [childName, setChildName] = useState('');
    const [childLoading, setChildLoading] = useState(false);

    // New state for editing child accounts
    const [editingChildId, setEditingChildId] = useState<string | null>(null);
    const [editingChildName, setEditingChildName] = useState('');

    // New state for tasks/quests (parent's tasks)
    const [tasks, setTasks] = useState<Quest[]>([]);

    // New state for child tasks mapping child id to its tasks
    const [childTasks, setChildTasks] = useState<{ [key: string]: Quest[] }>({});

    // New state for active tab in the tabbed interface.
    // For a parent, 'parent' will refer to the parent's dashboard; other tabs will have child ids.
    const [activeTab, setActiveTab] = useState<string>('parent');

    // NEW: State for view mode (tabs or accordion) - default to accordion for better reliability
    const [viewMode, setViewMode] = useState<ViewMode>('accordion');

    // NEW: State for bonus Awards
    const [bonusAwards, setBonusAwards] = useState<BonusAward[]>([]);

    // Add new state for child selector
    const [isChildSelectorOpen, setIsChildSelectorOpen] = useState(false);
    const [selectedBonusAwardId, setSelectedBonusAwardId] = useState<string | null>(null);

    // NEW: Add state for regular awards
    const [awards, setAwards] = useState<Award[]>([]);

    const mapStatus = useCallback((status: string): string => {
      if (status === 'pending approval') return 'pending';
      if (status === 'rejected') return 'failed';
      // Make sure 'assigned' status is properly passed through
      if (status === 'assigned') return 'assigned';
      if (status === 'completed') return 'completed';
      if (status === 'in-progress') return 'in-progress';
      return status as Quest['status'];
    }, []);

    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession() as { data: { session: Session | null } };
                
                if (!session?.user) {
                    window.location.href = '/login';
                    return;
                }

                setUser(session.user as User);
            } catch (error: unknown) {
                console.error('Error checking auth status:', error);
                window.location.href = '/login';
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(( _event: string, session: Session | null ) => {
            if (!session) {
                window.location.href = '/login';
                return;
            }
            setUser(session.user as User);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Fetch the current user's record from our 'users' table using their name or id
    useEffect(() => {
        if (user && (user.user_metadata?.name || user.id)) {
            const filterField = user.user_metadata?.name ? 'name' : 'id';
            const identifier = user.user_metadata?.name ? user.user_metadata.name : user.id;
            const fetchDBUser = async () => {
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq(filterField, identifier)
                    .single();
                if (error) {
                    // If error indicates no rows, create a new DB user record
                    if (error.code === 'PGRST116') {
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
                            setError('Error creating new user account');
                        } else {
                            setDBUser(newUser);
                        }
                    } else {
                        setError('Error fetching user account');
                    }
                } else if (data) {
                    setDBUser(data);
                }
            };
            fetchDBUser();
        } else {
            console.log('User or user identifier is not available:', user);
        }
    }, [user]);

    // Function to fetch and update children data
    const fetchChildren = useCallback(async (familyId: string) => {
        try {
            const { data: childrenData, error: childrenError } = await supabase
                .from('users')
                .select('*')
                .eq('family_id', familyId)
                .eq('role', 'child');
            
            if (childrenError) {
                setError('Failed to fetch children accounts');
                return;
            }
            
            setChildren(childrenData as Child[]);
        } catch (err: unknown) {
            setError('An unexpected error occurred while fetching children');
        }
    }, []);

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
    const updateChildPoints = useCallback((childId: string, newPoints: number) => {
        setChildren((prevChildren: Child[]) => 
            prevChildren.map((child: Child) => 
                child.id === childId 
                    ? { ...child, points: newPoints }
                    : child
            )
        );
    }, []);

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
    }, [familyId, updateChildPoints]);

    // Function to fetch parent's tasks (quests)
    const fetchTasks = useCallback(async () => {
      if (!dbUser) return;
      try {
        const data = await fetchParentTasks(dbUser.id);
        if (!Array.isArray(data)) {
          setTasks([]);
          return;
        }
        const quests = (data as TaskResponse[]).map((task: TaskResponse) => {
          return {
            id: task.id,
            title: task.title,
            description: task.description,
            points: task.reward_points,
            frequency: task.frequency,
            status: mapStatus(task.status) as Quest['status'],
            assignedChildId: task.assigned_child_id,
            completedAt: task.updated_at,
            next_occurrence: task.next_occurrence,
            last_completed_at: task.last_completed_at,
            icon: task.icon,
            customColors: task.custom_colors
          };
        });
        setTasks(quests);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    }, [dbUser, mapStatus]);

    // Function to fetch tasks for each child
    const fetchChildTasks = useCallback(async () => {
      const updatedChildTasks: { [key: string]: Quest[] } = {};
      for (const child of children) {
        try {
          const data = await repoFetchChildTasks(child.id);
          updatedChildTasks[child.id] = (data as TaskResponse[]).map((task: TaskResponse) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            points: task.reward_points,
            frequency: task.frequency,
            status: mapStatus(task.status) as Quest['status'],
            completedAt: task.updated_at,
            icon: task.icon,
            customColors: task.custom_colors
          }));
        } catch (error) {
          console.error('Error fetching tasks for child', child.id, error);
        }
      }
      setChildTasks(updatedChildTasks);
    }, [children, mapStatus]);

    // Fetch parent's tasks once the current dbUser is available
    useEffect(() => {
      if (dbUser) {
        fetchTasks();
      }
    }, [dbUser, fetchTasks]);

    // Fetch child tasks whenever children list is updated
    useEffect(() => {
      if (children && children.length > 0) {
         fetchChildTasks();
      }
    }, [children, fetchChildTasks]);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            window.location.href = '/login';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Update handleAddChild to use useCallback
    const handleAddChild = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!childName || !familyId) {
            setError('Child name and family ID are required');
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
            
            const { data, error } = await supabase
                .from('users')
                .insert([childData])
                .select();

            if (error) {
                setError('Failed to add child account');
                return;
            }

            if (data && data.length > 0) {
                setChildren([...children, data[0] as Child]);
                setChildName('');
                await fetchChildren(familyId);
            }
        } catch (err: unknown) {
            setError('An unexpected error occurred while adding child');
        } finally {
            setChildLoading(false);
        }
    }, [childName, familyId, children, fetchChildren]);

    const handleEditClick = useCallback((child: Child) => {
        setEditingChildId(child.id);
        setEditingChildName(child.name);
    }, []);

    const handleEditChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingChildName(e.target.value);
    }, []);

    const handleSaveEdit = useCallback(async (childId: string) => {
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
        } catch (err: unknown) {
            console.error('Error in handleSaveEdit:', err);
            setError('Failed to update child account.');
        }
    }, [familyId, editingChildName, fetchChildren]);

    const handleCancelEdit = useCallback(() => {
        setEditingChildId(null);
        setEditingChildName('');
    }, []);

    const handleDeleteChild = useCallback(async (childId: string) => {
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
        } catch (err: unknown) {
            console.error('Error in handleDeleteChild:', err);
            setError('Failed to delete child account.');
        }
    }, [familyId, fetchChildren]);

    // Updated handleTaskCompletion to use repository functions
    const handleTaskCompletion = useCallback(async (questId: string, action?: 'approve' | 'assigned' | 'edit' | 'delete') => {
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
            return;
          }

          const newPoints = (userData.points || 0) + task.reward_points;

          // Update user points
          const { error: pointsError } = await supabase
            .from('users')
            .update({ points: newPoints })
            .eq('id', task.assigned_child_id);
          if (pointsError) {
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
      } catch (err: unknown) {
        console.error('Error in handleTaskCompletion:', err);
        setError('Failed to complete task');
      }
    }, [children, fetchTasks, fetchChildTasks, updateChildPoints]);

    // Note: Manual reset for recurring tasks has been removed.
    // Recurring tasks are now automatically reset by a Supabase Edge Function
    // that runs hourly and resets tasks at the user's local midnight.

    // Update the family fetch effect for parent users
    useEffect(() => {
      if (dbUser) {
        const fetchFamilyAndChildren = async () => {
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
            setFamilyId(familyData.family_id);
            const { data: childrenData, error: childrenError } = await supabase
              .from('users')
              .select('*')
              .eq('family_id', familyData.family_id)
              .eq('role', 'child');
            if (childrenError) {
              console.error('Error fetching children:', childrenError);
              setError('Failed to fetch children data');
            } else {
              setChildren(childrenData);
            }
          } else {
            const { data: newFamily, error: createFamilyError } = await supabase
              .from('families')
              .insert([{ owner_id: dbUser.id, name: `${dbUser.name}'s Family` }])
              .select()
              .single();
            if (createFamilyError) {
              console.error('Error creating family:', createFamilyError);
              setError('Failed to create family');
            } else {
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
          };
          fetchFamilyAndChildren();
        };
        fetchFamilyAndChildren();
      }
    }, [dbUser]);

    // Update activeTab initialization for parent users
    useEffect(() => {
      if (dbUser) {
         if (dbUser.role === 'parent') {
            // Always make sure parent tab is selected for parents to ensure tasks display properly
            setActiveTab('parent');
         } else {
            setActiveTab(dbUser.id);
         }
      }
    }, [dbUser]);

    // Update tabs computation for parent users to place the parent's tab last
    const tabs = useMemo(() => {
      if (!dbUser) return [];
      if (dbUser.role === 'parent') {
         const childTabs = children.map((child: Child) => ({ id: child.id, label: child.name }));
         return [...childTabs, { id: 'parent', label: 'Parent Dashboard' }];
      } else {
         return [{ id: dbUser.id, label: typeof dbUser.user_metadata?.name === 'string' ? dbUser.user_metadata.name : 'My Dashboard' }];
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
        selectedChild = children.find((child: Child) => child.id === activeTab) || null;
      }
    }

    // Compute active and completed tasks for parent's task view
    const activeTasks = tasks.filter((task: Quest) => {
      // Show all tasks that are assigned, pending, in-progress, or failed
      const isActive = task.status === 'assigned' || task.status === 'pending' || 
                       task.status === 'in-progress' || task.status === 'failed';
      return isActive;
    });
    
    const completedTasks = tasks.filter((task: Quest) => {
      // Show only tasks that are fully completed
      const isCompleted = task.status === 'completed';
      return isCompleted;
    });

    // NEW: Function to fetch bonus awards
    const fetchBonusAwards = useCallback(async () => {
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
                    // Don't fail completely if instances fetch fails
                }
            }

            setBonusAwards(processedAwards);
        } catch (err: unknown) {
            console.error('Unexpected error fetching bonus awards:', err);
            setError('An unexpected error occurred while fetching bonus awards');
        }
    }, []);

    // NEW: useEffect to fetch bonus awards for parent
    useEffect(() => {
      if (dbUser && dbUser.role === 'parent') {
         fetchBonusAwards();
      }
    }, [dbUser]);

    // Update awardBonusToChild with better error handling
    const awardBonusToChild = useCallback(async (bonusAwardId: string, childId: string) => {
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
        } catch (err: unknown) {
            console.error('Error in awardBonusToChild:', err);
            setError('Failed to process bonus award');
        }
    }, [bonusAwards, updateChildPoints, fetchBonusAwards]);

    // NEW: Handler to award a bonus award
    const handleAwardBonus = useCallback(async (bonusAwardId: string) => {
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
      } catch (err: unknown) {
        console.error('Error in handleAwardBonus:', err);
        setError('Failed to process bonus award');
      }
    }, [bonusAwards, children, awardBonusToChild]);

    // Add handler for child selection
    const handleChildSelect = async (childId: string) => {
      if (selectedBonusAwardId) {
        await awardBonusToChild(selectedBonusAwardId, childId);
      }
    };

    // NEW: Handler to edit a bonus award
    const handleEditBonus = useCallback(async (bonusAwardId: string, updatedData: {
      title: string;
      icon: string;
      color: string | null;
      points: number;
    }) => {
      try {
        const { error } = await supabase
           .from('bonus_awards')
           .update({ 
             title: updatedData.title, 
             icon: updatedData.icon, 
             color: updatedData.color, 
             points: updatedData.points, 
             updated_at: new Date().toISOString() 
           })
           .eq('id', bonusAwardId);
        
        if (error) {
           return;
        }
        
        fetchBonusAwards();
      } catch (err: unknown) {
        console.error('Error in handleEditBonus:', err);
        setError('Failed to update bonus award');
      }
    }, [fetchBonusAwards]);

    // NEW: Handler to delete a bonus award
    const handleDeleteBonus = useCallback(async (bonusAwardId: string) => {
      if (!window.confirm('Are you sure you want to delete this bonus award?')) return;
      const { error } = await supabase
         .from('bonus_awards')
         .delete()
         .eq('id', bonusAwardId);
      if (error) {
         return;
      }
      fetchBonusAwards();
    }, [fetchBonusAwards]);

    // NEW: Function to fetch awards from the 'awards' table
    const fetchAwards = useCallback(async () => {
      try {
        let query = supabase.from('awards').select('*');
        if (dbUser?.family_id) {
          query = query.eq('family_id', dbUser.family_id);
        }
        query = query.order('created_at', { ascending: false });
        const { data: awardsData, error: awardsError } = await query;
      
        if (awardsError) {
          console.error('Error fetching awards:', awardsError);
          setError('Failed to fetch awards');
          return;
        }
        
        // Process awards to calculate availability
        const processedAwards = (awardsData || []).map(award => {
          // Calculate if award is in lockout period
          let isInLockout = false;
          let availableAfter = '';
          
          if (award.last_redeemed_at && award.lockout_period) {
            const lastRedeemed = new Date(award.last_redeemed_at);
            const now = new Date();
            
            // Calculate lockout end date
            const lockoutEnd = new Date(lastRedeemed);
            if (award.lockout_unit === 'weeks') {
              lockoutEnd.setDate(lockoutEnd.getDate() + (award.lockout_period * 7));
            } else {
              lockoutEnd.setDate(lockoutEnd.getDate() + award.lockout_period);
            }
            
            isInLockout = now < lockoutEnd;
            if (isInLockout) {
              // Format date for display
              availableAfter = lockoutEnd.toLocaleDateString();
            }
          }
          
          // Calculate remaining redemptions
          const remainingRedemptions = award.redemption_limit === null 
            ? null 
            : Math.max(0, award.redemption_limit - (award.redemption_count || 0));
          
          // Check if award is available for redemption
          const isAvailable = 
            // Not available if already fully redeemed
            !(remainingRedemptions !== null && remainingRedemptions <= 0) &&
            // Not available if in lockout period
            !isInLockout;
          
          return {
            ...award,
            // Map database column names to camelCase for the component
            allowedChildrenIds: award.allowed_children_ids,
            redemptionLimit: award.redemption_limit,
            redemptionCount: award.redemption_count,
            lockoutPeriod: award.lockout_period,
            lockoutUnit: award.lockout_unit,
            lastRedeemedAt: award.last_redeemed_at,
            // Add computed properties
            isAvailable,
            availableAfter,
            remainingRedemptions,
            // Map database column names to component props
            familyId: award.family_id,
            // Add icon and customColors mappings
            icon: award.icon,
            customColors: award.custom_colors
          };
        });
        
        setAwards(processedAwards);
      } catch (err: unknown) {
        console.error('Unexpected error fetching awards:', err);
        setError('An unexpected error occurred while fetching awards');
      }
    }, [dbUser?.family_id]);

    // NEW: useEffect to fetch regular awards for all users (parent and child)
    useEffect(() => {
      if (dbUser) {
        fetchAwards();
      }
    }, [dbUser, fetchAwards]);

    // Add handlers for editing and deleting awards
    const handleEditAward = useCallback(async (awardId: string, updatedAward: { 
      title: string, 
      description?: string, 
      points: number,
      allowedChildrenIds?: string[],
      redemptionLimit?: number | null,
      lockoutPeriod?: number,
      lockoutUnit?: 'days' | 'weeks',
      icon?: string,
      customColors?: {
        lowerGradientColor?: string;
        backgroundColor?: string;
        shadowColor?: string;
      }
    }) => {
      try {
        const { error } = await supabase
          .from('awards')
          .update({ 
            title: updatedAward.title, 
            description: updatedAward.description, 
            points: updatedAward.points,
            allowed_children_ids: updatedAward.allowedChildrenIds,
            redemption_limit: updatedAward.redemptionLimit,
            lockout_period: updatedAward.lockoutPeriod,
            lockout_unit: updatedAward.lockoutUnit,
            icon: updatedAward.icon,
            custom_colors: updatedAward.customColors,
            updated_at: new Date().toISOString()
          })
          .eq('id', awardId);

        if (error) throw error;
        fetchAwards();
      } catch (err: unknown) {
        console.error('Error updating award:', err);
        setError('Failed to update award');
      }
    }, [fetchAwards]);

    const handleDeleteAward = useCallback(async (awardId: string) => {
      if (!window.confirm('Are you sure you want to delete this award?')) return;
      
      try {
        const { error } = await supabase
          .from('awards')
          .delete()
          .eq('id', awardId);

        if (error) throw error;
        fetchAwards();
      } catch (err: unknown) {
        console.error('Error deleting award:', err);
        setError('Failed to delete award');
      }
    }, [fetchAwards]);

    // New function to revive a fully redeemed award
    const handleReviveAward = useCallback(async (awardId: string) => {
      if (!window.confirm('Do you want to revive this award? This will:\n\n- Reset the redemption count to 0\n- Allow it to be claimed again\n- Remove the "Awarded" status')) return;
      
      try {
        // Reset the redemption count to 0 and clear the last redeemed date
        const { error } = await supabase
          .from('awards')
          .update({ 
            redemption_count: 0,
            last_redeemed_at: null,
            awarded: false, // In case it was marked as awarded
            updated_at: new Date().toISOString()
          })
          .eq('id', awardId);

        if (error) throw error;
        
        // Show success message
        setSuccessMessage('Award has been revived and can now be claimed again!');
        
        // Refresh awards list
        fetchAwards();
      } catch (err: unknown) {
        console.error('Error reviving award:', err);
        setError('Failed to revive award');
      }
    }, [fetchAwards]);

    // NEW: Load view mode preference from localStorage on initial render
    useEffect(() => {
      if (typeof window !== 'undefined') {
        const savedViewMode = localStorage.getItem('dashboardViewMode');
        if (savedViewMode === 'tabs' || savedViewMode === 'accordion') {
          setViewMode(savedViewMode as ViewMode);
        }
      }
    }, []);

    // NEW: Save view mode preference to localStorage when it changes
    const handleViewModeChange = useCallback((newMode: ViewMode) => {
      setViewMode(newMode);
      if (typeof window !== 'undefined') {
        localStorage.setItem('dashboardViewMode', newMode);
      }
    }, []);
    
    // NEW: Handle timezone changes
    const handleTimezoneChange = useCallback(async (newTimezone: string) => {
      if (!dbUser?.id) return;
      
      try {
        const { error } = await supabase
          .from('users')
          .update({ timezone: newTimezone })
          .eq('id', dbUser.id);
          
        if (error) {
          console.error('Error updating timezone:', error);
          setError('Failed to update timezone setting');
          return;
        }
        
        // Update local state
        setDBUser(prev => prev ? { ...prev, timezone: newTimezone } : null);
        setSuccessMessage('Timezone updated successfully');
      } catch (err) {
        console.error('Error in handleTimezoneChange:', err);
        setError('An unexpected error occurred while updating timezone');
      }
    }, [dbUser?.id]);

    // NEW: Function to render parent content for accordion or tabs
    const renderParentContent = useCallback((): React.ReactElement => {
      // Create a mapping of child IDs to their names
      const childNameMapping = children.reduce((acc, child) => {
        acc[child.id] = child.name;
        return acc;
      }, {} as { [key: string]: string });
      
      return (
        <>
          {/* Parent Dashboard Content */}
          {/* Child Accounts Section for Parent (Child Management) */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Child Accounts</h2>
            {children && children.length > 0 ? (
              <ul className="mb-4">
                {children.map((child: Child) => (
                  <ChildAccountCard
                    key={child.id}
                    child={child}
                    isEditing={editingChildId === child.id}
                    editingChildName={editingChildName}
                    onEditChange={handleEditChange}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                    onEditClick={handleEditClick}
                    onDelete={handleDeleteChild}
                  />
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

          {/* Parent Tasks Section */}
          <DashboardSection title="Tasks" toggleable={true} defaultExpanded={true}>
            {dbUser && (
              <div className="w-full mb-4">
                <AddTask 
                  parentId={dbUser.id} 
                  availableChildren={children} 
                  onTaskAdded={() => {
                    fetchTasks();
                    fetchChildTasks();
                  }} 
                />
              </div>
            )}
            {activeTasks.length > 0 ? (
              <CardGrid>
                {activeTasks.map((task: Quest) => (
                  <QuestCard 
                    key={task.id} 
                    quest={task} 
                    userRole="parent"
                    onComplete={handleTaskCompletion}
                    childNameMapping={childNameMapping}
                  />
                ))}
              </CardGrid>
            ) : (
              <p className="mb-4">No active tasks found.</p>
            )}
          </DashboardSection>

          {/* NEW: Bonus Awards Section for Parent Dashboard */}
          <DashboardSection title="Bonus Awards" toggleable={true} defaultExpanded={true}>
            <div className="w-full mb-4">
                <AddBonusAward onBonusAdded={() => { fetchBonusAwards(); }} />
            </div>
            { bonusAwards.filter((b: BonusAward) => b.status === 'available').length > 0 ? (
              <CardGrid>
                { bonusAwards.filter((b: BonusAward) => b.status === 'available').map((bonus: BonusAward) => (
                  <BonusAwardCard 
                    key={bonus.id} 
                    bonusAward={bonus}
                    onAward={() => handleAwardBonus(bonus.id)}
                    onEdit={(bonusAwardId, updatedData) => handleEditBonus(bonusAwardId, updatedData)}
                    onDelete={() => handleDeleteBonus(bonus.id)}
                  />
                ))}
              </CardGrid>
            ) : (
                <p className="mb-4">No bonus awards available.</p>
            )}
          </DashboardSection>

          {/* NEW: Add a new section to display regular awards (rewards) added via AddAward */}
          {dbUser && dbUser.role === 'parent' && (
            <DashboardSection title="Awards" toggleable={true} defaultExpanded={true}>
              <div className="w-full mb-4">
                <AddAward 
                  onAwardAdded={fetchAwards} 
                  familyId={familyId ?? undefined} 
                  childAccounts={children}
                />
              </div>
              { awards && awards.length > 0 ? (
                <CardGrid>
                  { awards.map((award: Award) => (
                    <AwardCard 
                      key={award.id} 
                      award={award} 
                      isParentView={true}
                      onEdit={(awardId, data) => handleEditAward(awardId, data)}
                      onDelete={(awardId) => handleDeleteAward(awardId)}
                      onRevive={(awardId) => handleReviveAward(awardId)}
                    />
                  ))}
                </CardGrid>
              ) : (
                <p className="mb-4">No awards available. Add some above!</p>
              )}
            </DashboardSection>
          )}

          {/* NEW: Dashboard Settings Section with Timezone Selection and Manual Reset */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Dashboard Settings</h2>
            
            {/* Reset Tasks Button */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Task Management</h3>
              <p className="text-sm text-gray-600 mb-4">
                If recurring tasks don&apos;t reset automatically, you can reset them manually here.
              </p>
              <button
                onClick={async () => {
                  try {
                    // Mark any completed tasks as assigned again for all children
                    for (const task of tasks) {
                      if (task.status === 'completed' && (task.frequency === 'daily' || task.frequency === 'weekly')) {
                        await updateTaskStatus(task.id, 'assigned');
                      }
                    }
                    // Refresh the tasks list
                    await fetchTasks();
                    if (children && children.length > 0) {
                      await fetchChildTasks();
                    }
                    setSuccessMessage('Successfully reset recurring tasks to "assigned" status!');
                  } catch (error) {
                    console.error('Error resetting tasks:', error);
                    setError('Failed to reset tasks. Please try again.');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Manually Reset Recurring Tasks
              </button>
            </div>
            
            {/* View Mode Toggle */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Display Mode</h3>
              <ViewToggle viewMode={viewMode} onViewModeChange={handleViewModeChange} />
            </div>
            
            {/* Timezone Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Your Timezone</h3>
              <p className="text-sm text-gray-600 mb-2">
                Select your timezone to ensure recurring tasks reset at your local midnight.
              </p>
              <TimezoneSelector 
                currentTimezone={dbUser?.timezone || 'America/New_York'} 
                onTimezoneChange={handleTimezoneChange}
              />
            </div>
          </section>
        </>
      );
    }, [
      children,
      dbUser,
      childName,
      childLoading,
      editingChildId,
      editingChildName,
      handleEditChange,
      handleSaveEdit,
      handleCancelEdit,
      handleEditClick,
      handleDeleteChild,
      handleAddChild,
      activeTasks,
      familyId,
      fetchTasks,
      fetchChildTasks,
      fetchAwards,
      handleTaskCompletion,
      bonusAwards,
      handleAwardBonus,
      handleEditBonus,
      handleDeleteBonus,
      awards,
      handleEditAward,
      handleDeleteAward,
      handleReviveAward,
      completedTasks,
      viewMode,
      handleViewModeChange,
      handleTimezoneChange
    ]);

    // Update the accordionSections array to include child sections
    const accordionSections = useMemo(() => {
      const sections = [];
      
      // Add child sections
      children.forEach((child: Child) => {
        sections.push({
          id: child.id,
          title: child.name,
          content: (
            <ChildDashboardSection 
              key={child.id} 
              child={child} 
              tasks={childTasks[child.id] || []} 
              onComplete={handleTaskCompletion} 
              viewMode={viewMode}
            />
          ),
          isParent: false
        });
      });
      
      // Add parent section if needed
      if (dbUser?.role === 'parent') {
        sections.push({
          id: 'parent',
          title: 'Parent Dashboard',
          content: renderParentContent(),
          isParent: true
        });
      }
      
      return sections;
    }, [children, childTasks, handleTaskCompletion, viewMode, dbUser?.role, renderParentContent]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <DashboardNav username={typeof user?.user_metadata?.name === 'string' ? user.user_metadata.name : 'User'} onSignOut={handleSignOut} />

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {error && (
                    <div className="error-message mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="success-message mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                        {successMessage}
                        <button 
                            className="ml-2 text-sm underline" 
                            onClick={() => setSuccessMessage(null)}
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* Display total family points at the top */}
                {children && (
                    <PointsDisplay 
                        childAccounts={children}
                    />
                )}

                {/* Navigation between parent and child views */}
                {viewMode === 'accordion' ? (
                    <DashboardAccordion sections={accordionSections} gridLayout={true} />
                ) : (
                    <div>
                        <DashboardTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                        <div className="p-4 bg-white shadow rounded-lg">
                            {activeTab === 'parent' ? (
                                renderParentContent()
                            ) : (
                                selectedChild && (
                                    <ChildDashboardSection 
                                        key={selectedChild.id} 
                                        child={selectedChild} 
                                        tasks={childTasks[selectedChild.id] || []} 
                                        onComplete={handleTaskCompletion} 
                                        viewMode={viewMode}
                                    />
                                )
                            )}
                        </div>
                    </div>
                )}

                {/* Child Selector Modal */}
                <ChildSelectorModal
                    isOpen={isChildSelectorOpen}
                    onClose={() => {
                        setIsChildSelectorOpen(false);
                        setSelectedBonusAwardId(null);
                    }}
                    onSelect={handleChildSelect}
                    childAccounts={children}
                />
            </main>
        </div>
    );
} 