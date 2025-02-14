"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus } from 'lucide-react';

// Props for the AddAward component
interface AddAwardProps {
  onAwardAdded?: () => void; // Callback to refresh awards list after adding a new award
}

const AddAward: React.FC<AddAwardProps> = ({ onAwardAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [awardName, setAwardName] = useState('');
  const [description, setDescription] = useState('');
  const [costPoints, setCostPoints] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!awardName || !description || !costPoints) {
      setError('All fields are required.');
      return;
    }
    const cost = parseInt(costPoints, 10);
    if (isNaN(cost)) {
      setError('Cost points must be a valid number.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { error: dbError } = await supabase
        .from('awards')
        .insert([{ title: awardName, description, points: cost, awarded: false }]);
      if (dbError) {
        setError(dbError.message);
      } else {
        if (onAwardAdded) onAwardAdded();
        setAwardName('');
        setDescription('');
        setCostPoints('');
        setIsModalOpen(false);
      }
    } catch (err: unknown) {
      setError('An unexpected error occurred.');
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Plus card to open modal */}
      <div
        className="cursor-pointer border-2 border-dashed border-gray-300 rounded p-4 flex items-center justify-center text-gray-500 hover:bg-gray-200"
        onClick={() => setIsModalOpen(true)}
      >
        <Plus className="mr-2" /> Add Reward
      </div>

      {/* Modal for adding a new award */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-2xl mb-4">Add New Reward</h2>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Reward Name</label>
                <input
                  type="text"
                  value={awardName}
                  onChange={(e) => setAwardName(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Enter reward name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Enter description"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cost Points</label>
                <input
                  type="number"
                  value={costPoints}
                  onChange={(e) => setCostPoints(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Enter required points"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
                  {loading ? 'Adding Reward...' : 'Add Reward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddAward; 