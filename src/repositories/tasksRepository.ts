// src/repositories/tasksRepository.ts
// Purpose: Encapsulate all tasks-related database operations using Supabase.
// This repository provides functions to fetch tasks for a parent user, fetch tasks for a child, update a task's status or other fields, delete a task, and add a new task.

import { supabase } from '@/lib/supabase';

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

export async function updateTaskStatus(taskId: string, status: string): Promise<TaskResponse[]> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ 
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', taskId);
  if (error) {
    throw error;
  }
  if (!data) return [];
  return data as TaskResponse[];
}

export async function updateTask(taskId: string, payload: Partial<TaskResponse>): Promise<TaskResponse[]> {
  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', taskId);
  if (error) {
    throw error;
  }
  if (!data) return [];
  return data as TaskResponse[];
}

export async function deleteTask(taskId: string): Promise<TaskResponse[]> {
  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
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