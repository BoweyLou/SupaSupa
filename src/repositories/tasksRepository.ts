// src/repositories/tasksRepository.ts
// Purpose: Encapsulate all tasks-related database operations using Supabase.
// This repository provides functions to fetch tasks for a parent user, fetch tasks for a child, update a task's status or other fields, delete a task, and add a new task.

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Add TaskResponse interface
export interface TaskResponse {
  id: string;
  title: string;
  description: string;
  reward_points: number;
  frequency: string;
  status: string;
  assigned_child_id?: string;
  updated_at: string;
  next_occurrence?: string;
  icon?: string;
  custom_colors?: {
    lowerGradientColor?: string;
    backgroundColor?: string;
    shadowColor?: string;
  };
}

// Interface for task data
export interface TaskData {
  title: string;
  description?: string;
  reward_points: number;
  status: string;
  frequency: string;
  assigned_child_id?: string;
  created_by: string;
  icon?: string;
  custom_colors?: {
    lowerGradientColor?: string;
    backgroundColor?: string;
    shadowColor?: string;
  };
}

// Interface for task update data
export interface TaskUpdateData {
  title?: string;
  description?: string;
  reward_points?: number;
  status?: string;
  frequency?: string;
  assigned_child_id?: string;
  icon?: string;
  custom_colors?: {
    lowerGradientColor?: string;
    backgroundColor?: string;
    shadowColor?: string;
  };
}

export async function fetchParentTasks(createdBy: string): Promise<TaskResponse[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('created_by', createdBy);
  if (error) {
    throw error;
  }
  if (!data) return [];
  return data as TaskResponse[];
}

export async function fetchChildTasks(childId: string): Promise<TaskResponse[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_child_id', childId);
  if (error) {
    throw error;
  }
  if (!data) return [];
  return data as TaskResponse[];
}

export async function addTask(payload: Partial<TaskResponse> & { created_by: string; assigned_child_id: string; status: string }): Promise<TaskResponse> {
  const { data, error } = await supabase
    .from('tasks')
    .insert([payload])
    .select()
    .single();
  if (error) {
    throw error;
  }
  if (!data) { throw new Error('No data returned in addTask'); }
  return data as TaskResponse;
}

// NEW FUNCTION: fetchTask
export async function fetchTask(taskId: string): Promise<TaskResponse> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();
  if (error) {
    throw error;
  }
  if (!data) { throw new Error('No data returned in fetchTask'); }
  return data as TaskResponse;
}

// Create a new task
export const createTask = async (taskData: TaskData) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([taskData])
    .select();

  if (error) {
    console.error('Error creating task:', error);
    throw error;
  }

  return data;
};

// Get all tasks
export const getAllTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*');

  if (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }

  return data;
};

// Get tasks by user ID (created by)
export const getTasksByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('created_by', userId);

  if (error) {
    console.error('Error fetching tasks by user ID:', error);
    throw error;
  }

  return data;
};

// Get tasks assigned to a child
export const getTasksByChildId = async (childId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_child_id', childId);

  if (error) {
    console.error('Error fetching tasks by child ID:', error);
    throw error;
  }

  return data;
};

// Update a task
export const updateTask = async (taskId: string, updateData: TaskUpdateData) => {
  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .select();

  if (error) {
    console.error('Error updating task:', error);
    throw error;
  }

  return data;
};

// Delete a task
export const deleteTask = async (taskId: string) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error('Error deleting task:', error);
    throw error;
  }

  return true;
};

// Update task status
export const updateTaskStatus = async (taskId: string, status: string) => {
  return updateTask(taskId, { status });
};

// Assign task to child
export const assignTaskToChild = async (taskId: string, childId: string) => {
  return updateTask(taskId, { assigned_child_id: childId });
};

// Mark task as completed
export const completeTask = async (taskId: string) => {
  return updateTaskStatus(taskId, 'completed');
};

// Mark task as pending (awaiting parent approval)
export const markTaskAsPending = async (taskId: string) => {
  return updateTaskStatus(taskId, 'pending');
};

// Mark task as failed
export const markTaskAsFailed = async (taskId: string) => {
  return updateTaskStatus(taskId, 'failed');
};

// Reset task to assigned state
export const resetTask = async (taskId: string) => {
  return updateTaskStatus(taskId, 'assigned');
}; 