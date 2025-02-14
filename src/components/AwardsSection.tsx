// src/components/AwardsSection.tsx
// Award Feature: AwardsSection Component
// For each child account provided in childrenAccounts, this component renders a simple UI showing the child's name, points, and a button to redeem an award (which simulates deduction of 10 points via onRedeemSuccess callback).

"use client";

import React from 'react';
import { Child } from './ChildAccountCard';

export interface AwardsSectionProps {
  hideHeading?: boolean;
  childrenAccounts: Child[];
  onRedeemSuccess: (childId: string, newPoints: number) => void;
}

export default function AwardsSection({ hideHeading, childrenAccounts, onRedeemSuccess }: AwardsSectionProps) {
  return (
    <div>
      {!hideHeading && <h2 className="text-2xl font-bold mb-4">Awards</h2>}
      {childrenAccounts && childrenAccounts.length > 0 ? (
        childrenAccounts.map(child => (
          <div key={child.id} className="p-4 border rounded mb-2">
            <h3 className="text-lg font-semibold">{child.name}&apos;s Awards</h3>
            <p>You have {child.points} points.</p>
            <button
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => {
                // Simulate redeeming an award by deducting 10 points (ensure points do not drop below 0)
                const updatedPoints = Math.max(child.points - 10, 0);
                onRedeemSuccess(child.id, updatedPoints);
              }}
            >
              Redeem Award (Costs 10 pts)
            </button>
          </div>
        ))
      ) : (
        <p>No awards available.</p>
      )}
    </div>
  );
} 