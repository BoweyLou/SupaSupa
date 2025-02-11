// src/components/AwardsSection.tsx
// Award Feature: AwardsSection Component
// This component fetches available awards from the database and displays them as cards per child.
// For each child account provided in childrenAccounts, a collapsible section with the child's name and available awards is rendered.
// Each award card allows redemption for that specific child if they have enough points and the award is enabled.

"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

// Define interface for Award
export interface Award {
  award_id: string;
  title: string;
  description: string;
  cost_points: number;
  freeze_out_period: number;
  is_enabled: boolean;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Define a minimal interface for Child
export interface Child {
  id: string;
  name: string;
  points: number;
}

// Props for AwardsSection component
export interface AwardsSectionProps {
  childrenAccounts: Child[]; // list of child accounts available for redemption
  onRedeemSuccess?: (childId: string, newPoints: number) => void; // callback to update points instantly
  hideHeading?: boolean;
}

export default function AwardsSection({ childrenAccounts, onRedeemSuccess, hideHeading }: AwardsSectionProps) {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available awards from the 'awards' table
  useEffect(() => {
    async function fetchAwards() {
      setLoading(true);
      const { data, error } = await supabase
        .from('awards')
        .select('*');
      if (error) {
        console.error('Error fetching awards:', error);
        setError('Failed to fetch awards');
      } else {
        setAwards(data);
      }
      setLoading(false);
    }
    fetchAwards();
  }, []);

  // Updated handler for redeeming an award for a specific child
  async function handleRedeem(award: Award, child: Child) {
    // Check if child has enough points
    if (child.points < award.cost_points) {
      alert(`${child.name} does not have enough points to redeem this award.`);
      return;
    }

    // NOTE: Freeze out period check should be implemented here.
    // For now, we are assuming the award is redeemable if it is enabled.

    // Confirm redemption action
    const confirmRedeem = confirm(`Redeem ${award.title} for ${child.name} for ${award.cost_points} points?`);
    if (!confirmRedeem) return;

    // Proceed to redeem: Insert a record into 'user_awards' and deduct points
    const redeemedAt = new Date().toISOString();
    const { error: insertError } = await supabase
      .from('user_awards')
      .insert([{ user_id: child.id, award_id: award.award_id, redeemed_at: redeemedAt }]);
    if (insertError) {
      console.error('Error redeeming award:', insertError);
      alert('Failed to redeem award. Please try again.');
      return;
    }

    // Deduct the cost from the child's points
    const newPoints = child.points - award.cost_points;
    const { error: updateError } = await supabase
      .from('users')
      .update({ points: newPoints })
      .eq('id', child.id);
    if (updateError) {
      console.error('Error updating child\'s points:', updateError);
      alert('Award redeemed, but failed to update points. Please contact support.');
      return;
    }

    alert(`Successfully redeemed ${award.title} for ${child.name}!`);
    // Trigger callback to update parent's state immediately if provided
    if (onRedeemSuccess) {
      onRedeemSuccess(child.id, newPoints);
    }
    // Optionally, trigger a state update or callback to refresh child accounts data
  }

  // Local component to render each child's awards section in a collapsible card
  function AwardChildSection({ child, awards, onRedeem } : { child: Child, awards: Award[], onRedeem: (award: Award, child: Child) => void }) {
    const [expanded, setExpanded] = useState(true);
    return (
      <div className="mb-4">
        <div className="flex justify-end items-center w-full">
          <button onClick={() => setExpanded(!expanded)} className="text-blue-600">
            {expanded ? 'Hide Rewards' : `Show Rewards (${awards.length})`}
          </button>
        </div>
        {expanded && (
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            {awards.map(award => (
              <div key={award.award_id} className="border p-4 rounded shadow">
                {award.image_url && (
                  <img src={award.image_url} alt={award.title} className="w-full h-40 object-cover mb-2 rounded" />
                )}
                <h4 className="text-lg font-bold">{award.title}</h4>
                <p className="mb-2">{award.description}</p>
                <p className="mb-2">Cost: {award.cost_points} points</p>
                <button
                  onClick={() => onRedeem(award, child)}
                  disabled={!award.is_enabled || child.points < award.cost_points}
                  className={`px-4 py-2 rounded text-white ${!award.is_enabled || child.points < award.cost_points ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  Redeem
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {!hideHeading && (
        <h2 className="text-2xl font-semibold mb-4">Rewards Catalog</h2>
      )}
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700">{error}</div>}
      {loading ? (
        <div>Loading awards...</div>
      ) : (
        <>
          {childrenAccounts && childrenAccounts.length > 0 ? (
            childrenAccounts.map(child => (
              <AwardChildSection key={child.id} child={child} awards={awards} onRedeem={handleRedeem} />
            ))
          ) : (
            <div className="mb-4 text-gray-500">No child accounts available for redemption.</div>
          )}
          {awards.length === 0 && (
            <p className="text-gray-500">No rewards available at this time.</p>
          )}
        </>
      )}
    </div>
  );
} 