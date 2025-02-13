// src/repositories/tasksRepository.ts
// Purpose: Encapsulate all tasks-related database operations using Supabase.
// This repository provides functions to fetch tasks for a parent user, fetch tasks for a child, update a task's status or other fields, delete a task, and add a new task.

import { supabase } from '@/lib/supabase';

export async function fetchParentTasks(createdBy: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('created_by', createdBy);
  if (error) {
    throw error;
  }
  return data;
}

export async function fetchChildTasks(childId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_child_id', childId);
  if (error) {
    throw error;
  }
  return data;
}

export async function updateTaskStatus(taskId: string, status: string) {
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
  return data;
}

export async function updateTask(taskId: string, payload: Record<string, any>) {
  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', taskId);
  if (error) {
    throw error;
  }
  return data;
}

export async function deleteTask(taskId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);
  if (error) {
    throw error;
  }
  return data;
}

export async function addTask(payload: Record<string, any>) {
  const { data, error } = await supabase
    .from('tasks')
    .insert([payload])
    .select()
    .single();
  if (error) {
    throw error;
  }
  return data;
}

// NEW FUNCTION: fetchTask
export async function fetchTask(taskId: string) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();
  if (error) {
    throw error;
  }
  return data;
} 