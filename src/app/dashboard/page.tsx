'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import QuestCard, { Quest } from '@/components/QuestCard';

// Define a Child interface for proper typing of child accounts
interface Child {
  id: string;
  name: string;
}

// Define an interface for the user record from our database
interface DBUser {
  id: string;
  name: string;
  family_id: string;
  role: string;
  points: number;
}

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // New state for child account management
    const [familyId, setFamilyId] = useState(null);
    const [children, setChildren] = useState<Child[]>([]);
    const [childName, setChildName] = useState('');
    const [childLoading, setChildLoading] = useState(false);

    // New state for tasks/quests
    const [tasks, setTasks] = useState<Quest[]>([]);

    // New state for the current user's record from our users table
    const [dbUser, setDbUser] = useState<DBUser | null>(null);

    console.log('DashboardPage rendering', { user, dbUser, tasks });

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

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
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

    // Define handleTaskCompletion function BEFORE it's used in JSX
    const handleTaskCompletion = async (questId: string) => {
      const userRole = user?.user_metadata?.role || 'parent';
      const newStatus = userRole === 'child' ? 'pending approval' : 'completed';
      console.log(`Updating task ${questId} to status: ${newStatus}`);
      const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', questId);
      if (error) {
          console.error('Error updating task status:', error);
      } else {
          console.log('Task updated successfully');
          fetchTasks();
      }
    };

    // Fetch parent's family and child accounts once the current dbUser is available
    useEffect(() => {
        if (dbUser) {
            const fetchFamilyAndChildren = async () => {
                // Fetch family record where parent is the owner using parent's DB ID
                const { data: familyData, error: familyError } = await supabase
                    .from('families')
                    .select('*')
                    .eq('owner_id', dbUser.id)
                    .single();
                if (familyError) {
                    console.error('Error fetching family:', familyError);
                    return;
                }
                if (familyData) {
                    setFamilyId(familyData.family_id);
                    // Fetch child accounts associated with this family
                    const { data: childrenData, error: childrenError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('family_id', familyData.family_id)
                        .eq('role', 'child');
                    if (childrenError) {
                        console.error('Error fetching children:', childrenError);
                    } else {
                        setChildren(childrenData);
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

    // Function to fetch tasks (quests) from the Supabase 'tasks' table using the dbUser's id
    const fetchTasks = async () => {
      if (!dbUser) return;
      
      console.log('Fetching tasks for user:', dbUser.id);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('created_by', 'f52a4434-3d0b-4fd2-b6a5-912c2f1c6011');  // Using the UUID from your sample task
      
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
          status: mapStatus(task.status)
        }));
        console.log('Mapped tasks (quests):', quests);
        setTasks(quests);
      }
    };

    // Fetch tasks once the current dbUser is available
    useEffect(() => {
      if (dbUser) {
        console.log('dbUser available, fetching tasks...');
        fetchTasks();
      }
    }, [dbUser]);

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            window.location.href = '/login';
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // New function to handle adding a child account
    const handleAddChild = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!childName || !familyId) return;
        setChildLoading(true);
        const { data, error } = await supabase
            .from('users')
            .insert([{ family_id: familyId, name: childName, role: 'child', points: 0 }])
            .select();
        if (error) {
            console.error('Error adding child:', error);
        } else if (data && data.length > 0) {
            // Append new child to the list; assuming data is an array with the inserted record
            setChildren([...children, data[0]]);
            setChildName('');
        }
        setChildLoading(false);
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
                {/* New section for Child Accounts */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Child Accounts</h2>
                    {children && children.length > 0 ? (
                        <ul className="mb-4">
                            {children.map((child) => (
                                <li key={child.id} className="p-2 border-b">{child.name}</li>
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

                {/* New section for displaying Tasks as QuestCards */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
                    {tasks.length > 0 ? (
                      tasks.map((task) => (
                        <QuestCard 
                          key={task.id} 
                          quest={task} 
                          userRole={user?.user_metadata?.role || 'parent'} 
                          onComplete={handleTaskCompletion} 
                        />
                      ))
                    ) : (
                      <p className="mb-4">No tasks found.</p>
                    )}
                </section>

                <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                    <p className="text-gray-500 text-xl">Dashboard content coming soon...</p>
                </div>
            </main>
        </div>
    );
} 