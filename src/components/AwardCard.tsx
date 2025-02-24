// src/components/AwardCard.tsx
// Award Card component: Displays an award with title, description, points, and allows for claiming if not awarded.
"use client";

import React, { useState } from 'react';
import { Award as AwardIcon } from 'lucide-react';
import StarDisplay from './StarDisplay';

export interface Award {
  id: string;
  title: string;
  description?: string;
  points: number;
  awarded: boolean; // indicates whether the award has been claimed
  familyId: string; // new property to associate an award with a family
}

export interface AwardCardProps {
  award: Award;
  // Callback when the award claim action is triggered (child view)
  onClaim?: (awardId: string) => void;
  // If true, the component is used in the parent view and will show edit/delete actions
  isParentView?: boolean;
  // Callbacks for admin actions (parent view)
  onEdit?: (awardId: string, updatedAward: { title: string, description?: string, points: number }) => void;
  onDelete?: (awardId: string) => void;
  hideActions?: boolean;
  currentFamilyId?: string; // current user's family id
}

const AwardCard: React.FC<AwardCardProps> = ({ award, onClaim, currentFamilyId, isParentView = false, onEdit, onDelete, hideActions = false }) => {
  // Initialize hooks unconditionally
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(award.title);
  const [editDescription, setEditDescription] = useState(award.description || '');
  const [editPoints, setEditPoints] = useState(award.points.toString());
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Remove the early return after hooks
  const shouldRenderAward = currentFamilyId ? award.familyId === currentFamilyId : true;

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditLoading(true);
    const parsedPoints = parseInt(editPoints, 10);
    if (isNaN(parsedPoints)) {
      setEditError('Points must be a valid number.');
      setEditLoading(false);
      return;
    }
    try {
      if (onEdit) {
        await onEdit(award.id, { 
          title: editTitle, 
          description: editDescription, 
          points: parsedPoints 
        });
      }
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating award:', err);
      setEditError('An unexpected error occurred.');
    }
    setEditLoading(false);
  };

  return shouldRenderAward ? (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <AwardIcon size={24} className="text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">{award.title}</h3>
        </div>
        <div className="text-sm font-medium text-gray-600">{award.points} pts</div>
      </div>
      {award.description && <p className="text-sm text-gray-700">{award.description}</p>}
      
      {/* Add star display */}
      <div className="mt-2 mb-2">
        <div className="star-display-large">
          <StarDisplay 
            points={award.points} 
            size="lg"
          />
        </div>
      </div>

      { !award.awarded && !hideActions && (
        isParentView ? (
          onEdit && onDelete && (
            <div className="mt-2 flex space-x-2">
              <button
                className="w-full py-1 px-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm"
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit
              </button>
              <button
                className="w-full py-1 px-3 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                onClick={() => onDelete(award.id)}
              >
                Delete
              </button>
            </div>
          )
        ) : (
          onClaim && (
            <button
              className="mt-2 w-full py-3 px-4 animated-gradient text-white rounded transition-colors text-base"
              onClick={() => onClaim(award.id)}
            >
              Claim Award
            </button>
          )
        )
      )}
      {award.awarded && (
        <div className="mt-2 text-center text-sm text-green-600">Awarded!</div>
      )}

      {/* Edit Modal for Award */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Award</h2>
            {editError && <p className="text-red-500 mb-4">{editError}</p>}
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-200 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Points</label>
                <input
                  type="number"
                  value={editPoints}
                  onChange={(e) => setEditPoints(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-200 rounded"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                >
                  {editLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* End of Award card */}
    </div>
  ) : null;
};

export default AwardCard; 