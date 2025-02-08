'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import QuestCard, { Quest } from '@/components/QuestCard';
import AddTask from '@/components/AddTask';
import PointsDisplay from '@/components/PointsDisplay';

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
}

// ChildDashboardSection: A reusable component to display tasks for a child account
function ChildDashboardSection({ child, tasks, onComplete }: { child: Child; tasks: Quest[]; onComplete: (questId: string) => void; }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="mb-4 border p-2 rounded">
      <div className="flex justify-between items-center">
        <h3 className="text-xl">{child.name}</h3>
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
        <p className="mt-2 text-gray-500">No tasks for this child</p>
      )}
    </div>
  );
}

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

    // Updated handleTaskCompletion to support 'edit' and 'delete' actions
    const handleTaskCompletion = async (questId: string, action?: 'approve' | 'assigned' | 'edit' | 'delete') => {
        if(action === 'edit' || action === 'delete'){
            await fetchTasks();
            if(children && children.length > 0){
                await fetchChildTasks();
            }
            return;
        }

        try {
            // Fetch the task
            const { data: task, error: taskError } = await supabase
                .from('tasks')
                .select('*')
                .eq('id', questId)
                .single();

            if (taskError) {
                console.error('Error fetching task:', taskError);
                return;
            }

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

            // Update task status
            const { error: updateError } = await supabase
                .from('tasks')
                .update({ status: newStatus })
                .eq('id', questId);

            if (updateError) {
                console.error('Error updating task status:', updateError);
                return;
            }

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

    // Fetch parent's family and child accounts once the current dbUser is available
    useEffect(() => {
        if (dbUser) {
            const fetchFamilyAndChildren = async () => {
                console.log('Fetching family for parent:', dbUser.id);
                // Fetch family record where parent is the owner using parent's DB ID
                const { data: familyData, error: familyError } = await supabase
                    .from('families')
                    .select('*')
                    .eq('owner_id', dbUser.id)
                    .single();
                if (familyError) {
                    console.error('Error fetching family:', familyError);
                    setError('Failed to fetch family data');
                    return;
                }
                console.log('Fetched family data:', familyData);
                
                if (familyData) {
                    setFamilyId(familyData.family_id);
                    console.log('Fetching children for family:', familyData.family_id);
                    // Fetch child accounts associated with this family
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
                    // Create a new family if none exists
                    const { data: newFamily, error: createFamilyError } = await supabase
                        .from('families')
                        .insert([{
                            owner_id: dbUser.id,
                            name: `${dbUser.name}'s Family`
                        }])
                        .select()
                        .single();
                    
                    if (createFamilyError) {
                        console.error('Error creating family:', createFamilyError);
                        setError('Failed to create family');
                    } else {
                        console.log('Created new family:', newFamily);
                        setFamilyId(newFamily.family_id);
                    }
                }
            };
            fetchFamilyAndChildren();
        }
    }, [dbUser]);

    // Helper function to convert task status from Supabase to QuestCard expected status
    const mapStatus = (status: string) => {
      if (status === 'pending approval') return 'pending';
      if (status === 'rejected') return 'failed';
      return status as Quest['status'];
    };

    // Function to fetch parent's tasks (quests) from the Supabase 'tasks' table using the dbUser's id
    const fetchTasks = async () => {
      if (!dbUser) return;
      console.log('Fetching tasks for user:', dbUser.id);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('created_by', dbUser.id);
      if (error) {
        console.error('Error fetching tasks:', error);
      } else if (data) {
        console.log('Raw tasks data fetched:', data);
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
      }
    };

    // Function to fetch tasks for each child using their unique ID (assigned_child_id)
    const fetchChildTasks = async () => {
      let updatedChildTasks: { [key: string]: Quest[] } = {};
      for (const child of children) {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('assigned_child_id', child.id);
        if (error) {
          console.error('Error fetching tasks for child', child.id, error);
        } else if (data) {
          updatedChildTasks[child.id] = data.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            points: task.reward_points,
            frequency: task.frequency,
            status: mapStatus(task.status)
          }));
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

    // Add useEffect to calculate total points whenever children or their points change
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

    // Add computed variables for active and completed tasks before the loading check
    const activeTasks = tasks.filter(task => task.status !== 'completed');
    const completedTasks = tasks.filter(task => task.status === 'completed');

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

                {/* Add PointsDisplay component at the top */}
                {children && (
                    <PointsDisplay 
                        children={children} 
                        totalPoints={totalPoints}
                    />
                )}

                {/* Section for Child Accounts */}
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

                {/* Section for Parent Tasks */}
                <section className="mb-8">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
                        <button onClick={() => setParentExpanded(!parentExpanded)} className="text-blue-600">
                           {parentExpanded ? 'Hide Tasks' : 'Show Tasks'}
                        </button>
                    </div>
                    {parentExpanded && (
                      <>
                        {dbUser && (
                            <AddTask parentId={dbUser!.id} children={children} onTaskAdded={() => {
                                fetchTasks();
                                fetchChildTasks();
                            }} />
                        )}
                        {activeTasks.length > 0 ? (
                            activeTasks.map((task: Quest) => (
                                <QuestCard key={task.id} quest={task} userRole={user?.user_metadata?.role || 'parent'} onComplete={handleTaskCompletion} />
                            ))
                        ) : (
                            <p className="mb-4">No tasks found.</p>
                        )}
                      </>
                    )}
                </section>

                {/* New Section for Child Tasks */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Child Tasks</h2>
                    {children.map((child) => (
                        <ChildDashboardSection
                            key={child.id}
                            child={child}
                            tasks={(childTasks[child.id] || []).filter(task => task.status !== 'completed')}
                            onComplete={handleTaskCompletion}
                        />
                    ))}
                </section>

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

                <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                    <p className="text-gray-500 text-xl">Dashboard content coming soon...</p>
                </div>
            </main>
        </div>
    );
} 