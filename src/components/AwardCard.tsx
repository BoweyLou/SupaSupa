// src/components/AwardCard.tsx
// Award Card component: Displays an award with title, description, points, and allows for claiming if not awarded.
"use client";

import React from 'react';
import { Award as AwardIcon } from 'lucide-react';

export interface Award {
  id: string;
  title: string;
  description?: string;
  points: number;
  awarded: boolean; // indicates whether the award has been claimed
}

export interface AwardCardProps {
  award: Award;
  // Callback when the award claim action is triggered (child view)
  onClaim?: (awardId: string) => void;
  // If true, the component is used in the parent view and will show edit/delete actions
  isParentView?: boolean;
  // Callbacks for admin actions (parent view)
  onEdit?: (awardId: string) => void;
  onDelete?: (awardId: string) => void;
}

const AwardCard: React.FC<AwardCardProps> = ({ award, onClaim, isParentView = false, onEdit, onDelete }) => {
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
      { !award.awarded && (
        isParentView ? (
          // In parent view, show Edit and Delete buttons if callbacks are provided
          onEdit && onDelete && (
            <div className="mt-2 flex space-x-2">
              <button
                className="w-full py-1 px-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm"
                onClick={() => onEdit(award.id)}
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
          // In child view, show Claim Award button
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
    </div>
  );
};

export default AwardCard; 