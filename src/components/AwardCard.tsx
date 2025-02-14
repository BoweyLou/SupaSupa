// src/components/AwardCard.tsx
// Award Card component: Displays an award with title, description, points, and allows for claiming if not awarded.
"use client";

import React, { useState } from 'react';
import { Award as AwardIcon } from 'lucide-react';

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
  // Check if the award belongs to the current family
  if (currentFamilyId && award.familyId !== currentFamilyId) {
    // If the award's family id does not match the logged in user's family id, do not render the award
    return null;
  }

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(award.title);
  const [editDescription, setEditDescription] = useState(award.description || '');
  const [editPoints, setEditPoints] = useState(award.points.toString());
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditLoading(true);
    const parsedPoints = parseInt(editPoints, 10);
    if (isNaN(parsedPoints)) {
      setEditError('Points must be a valid number.');
      setEditLoading(false);
      return;
    }
    if (onEdit) {
      onEdit(award.id, { title: editTitle, description: editDescription, points: parsedPoints });
    }
    setEditLoading(false);
    setIsEditModalOpen(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <AwardIcon size={24} className="text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">{award.title}</h3>
        </div>
        <div className="text-sm font-medium text-gray-600">{award.points} pts</div>
      </div>
      {award.description && <p className="text-sm text-gray-700">{award.description}</p>}
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
              className="mt-2 w-full py-1 px-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: '#fff', padding: 20, borderRadius: 8, width: '90%', maxWidth: 500 }}>
            <h2>Edit Award</h2>
            {editError && <p style={{ color: 'red' }}>{editError}</p>}
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Title</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required style={{ width: '100%', padding:'8px', border: '1px solid #ccc', borderRadius:'4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Description</label>
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} style={{ width: '100%', padding:'8px', border: '1px solid #ccc', borderRadius:'4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Points</label>
                <input type="number" value={editPoints} onChange={(e) => setEditPoints(e.target.value)} required style={{ width: '100%', padding:'8px', border: '1px solid #ccc', borderRadius:'4px' }} />
              </div>
              <div style={{ display:'flex', justifyContent:'flex-end', gap:'10px' }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding:'8px 12px', backgroundColor:'#ccc', border:'none', borderRadius:'4px', cursor:'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={editLoading} style={{ padding:'8px 12px', backgroundColor:'#4CAF50', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer' }}>
                  {editLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* End of Award card */}
    </div>
  );
};

export default AwardCard; 