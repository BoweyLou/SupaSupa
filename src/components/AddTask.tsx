// src/components/AddTask.tsx
// AddTask Component: Provides a UI for parents to add a new quest/task. It displays a clickable card with a '+' icon and 'Add Quest' text. Upon clicking, a modal opens with a form to input task details and assign it to a child.

'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { addTask } from '@/repositories/tasksRepository';
import { Plus } from 'lucide-react';

// Define a Child interface matching tasks assignment
export interface Child {
  id: string;
  name: string;
}

// Props for the AddTask component
export interface AddTaskProps {
  parentId: string;              // The parent's user ID to set as the creator of the task
  children: Child[];             // List of child accounts available for assignment
  onTaskAdded?: () => void;      // Callback to refresh tasks after adding a new quest
}

const AddTask: React.FC<AddTaskProps> = ({ parentId, children, onTaskAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rewardPoints, setRewardPoints] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [assignedChild, setAssignedChild] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Basic validation: all fields must be provided
    if (!title || !description || !rewardPoints || !assignedChild) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }

    const points = parseInt(rewardPoints, 10);
    if (isNaN(points)) {
      setError("Reward points must be a valid number.");
      setLoading(false);
      return;
    }

    // Prepare payload matching the tasks schema
    const payload = {
      title,
      description,
      reward_points: points,
      frequency,
      created_by: parentId,
      assigned_child_id: assignedChild,
      status: "assigned"
    };

    try {
      // Use repository function to add the task
      await addTask(payload);
      if (onTaskAdded) {
        onTaskAdded();
      }
      setIsModalOpen(false);
      // Reset form fields
      setTitle("");
      setDescription("");
      setRewardPoints("");
      setFrequency("daily");
      setAssignedChild("");
    } catch (insertError: any) {
      setError(insertError.message);
    }
    setLoading(false);
  };

  return (
    <div>
      {/* Add Quest card: displays a plus icon and text */}
      <div 
        className="cursor-pointer border-2 border-dashed border-gray-300 rounded p-4 flex items-center justify-center text-gray-500 hover:bg-gray-200"
        onClick={() => setIsModalOpen(true)}
      >
         <Plus className="mr-2" /> Add Quest
      </div>

      {/* Modal for adding a new quest */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-2xl mb-4">Add New Quest</h2>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Quest Title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Quest Description"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reward Points</label>
                <input 
                  type="number" 
                  value={rewardPoints}
                  onChange={(e) => setRewardPoints(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Points"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Frequency</label>
                <select 
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="one-off">One-off</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assign To</label>
                <select 
                  value={assignedChild}
                  onChange={(e) => setAssignedChild(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                  required
                >
                  <option value="">Select Child</option>
                  {children.map(child => (
                    <option key={child.id} value={child.id}>{child.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >Cancel</button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Quest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTask; 