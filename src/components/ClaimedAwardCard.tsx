// src/components/ClaimedAwardCard.tsx
// Claimed Award Card component: Displays a claimed award with a golden glow, 'Reward Claimed' badge, and claim date.

"use client";

import React from 'react';
import { Award } from './AwardCard';

interface ClaimedAwardCardProps {
  award: Award;
  claimedAt: string;
  pointsDeducted?: number; // Optional to maintain backward compatibility
}

const ClaimedAwardCard: React.FC<ClaimedAwardCardProps> = ({ award, claimedAt, pointsDeducted }) => {
  const formattedDate = new Date(claimedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  
  return (
    <div className="border-2 border-yellow-500 rounded-lg p-4 bg-yellow-50 shadow-md">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-yellow-700">{award.title}</h3>
        <div className="text-sm font-medium text-yellow-700">
          {pointsDeducted !== undefined ? pointsDeducted : award.points} pts
        </div>
      </div>
      {award.description && <p className="text-sm text-yellow-600 mb-2">{award.description}</p>}
      <div className="mt-2 text-center text-sm font-bold text-yellow-800">
        Reward Claimed
      </div>
      <div className="text-center text-xs text-yellow-700">
        {formattedDate}
      </div>
    </div>
  );
};

export default ClaimedAwardCard; 