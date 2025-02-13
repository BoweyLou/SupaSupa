// src/components/AwardsSection.tsx
// Award Feature: AwardsSection Component
// This component fetches available awards from the database and displays them as cards per child.
// For each child account provided in childrenAccounts, a collapsible section with the child's name and available awards is rendered.
// Each award card allows redemption for that specific child if they have enough points and the award is enabled.

"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AwardCard, { Award } from './AwardCard';
import { Settings, Trash } from 'lucide-react';

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

const AwardsSection: React.FC<AwardsSectionProps> = ({ childrenAccounts, onRedeemSuccess, hideHeading }) => {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Extract fetchAwards function for reusability
  const fetchAwards = async () => {
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
  };

  useEffect(() => {
    fetchAwards();
  }, []);

  // Handler for redeeming an award (unchanged)
  async function handleRedeem(award: Award, child: Child) {
    if (child.points < award.points) {
      alert(`${child.name} does not have enough points to redeem this award.`);
      return;
    }
    const confirmRedeem = confirm(`Redeem ${award.title} for ${child.name} for ${award.points} points?`);
    if (!confirmRedeem) return;

    const redeemedAt = new Date().toISOString();
    const { error: insertError } = await supabase
      .from('user_awards')
      .insert([{ user_id: child.id, award_id: award.id, redeemed_at: redeemedAt }]);
    if (insertError) {
      console.error('Error redeeming award:', insertError);
      alert('Failed to redeem award. Please try again.');
      return;
    }

    const newPoints = child.points - award.points;
    const { error: updateError } = await supabase
      .from('users')
      .update({ points: newPoints })
      .eq('id', child.id);
    if (updateError) {
      console.error("Error updating child's points:", updateError);
      alert('Award redeemed, but failed to update points. Please contact support.');
      return;
    }

    alert(`Successfully redeemed ${award.title} for ${child.name}!`);
    if (onRedeemSuccess) {
      onRedeemSuccess(child.id, newPoints);
    }
    // Refresh awards list
    fetchAwards();
  }

  // New handler to edit an award
  const handleEditAward = async (award: Award) => {
    const newTitle = window.prompt('Enter new title for the award', award.title);
    if (!newTitle) return;
    const newPointsStr = window.prompt('Enter new points value', award.points.toString());
    if (!newPointsStr) return;
    const newPoints = parseInt(newPointsStr, 10);
    if (isNaN(newPoints)) {
      alert('Invalid points value');
      return;
    }
    const { error } = await supabase
      .from('awards')
      .update({ title: newTitle, points: newPoints, updated_at: new Date().toISOString() })
      .eq('id', award.id);
    if (error) {
      console.error('Error updating award:', error);
      alert('Failed to update award');
    } else {
      alert('Award updated successfully');
      fetchAwards();
    }
  };

  // New handler to delete an award
  const handleDeleteAward = async (award: Award) => {
    if (!window.confirm('Are you sure you want to delete this award?')) return;
    const { error } = await supabase
      .from('awards')
      .delete()
      .eq('id', award.id);
    if (error) {
      console.error('Error deleting award:', error);
      alert('Failed to delete award');
    } else {
      alert('Award deleted successfully');
      fetchAwards();
    }
  };

  const handleClaimAward = (awardId: string) => {
    // Here you'd typically call a backend function to claim the award
    // For demo purposes, update the UI state to mark the award as claimed
    setAwards(prevAwards =>
      prevAwards.map(award =>
        award.id === awardId ? { ...award, awarded: true } : award
      )
    );
    // Optionally, call onRedeemSuccess callback if needed
    // onRedeemSuccess(childId, newPoints);
  };

  return (
    <div style={{ padding: '16px' }}>
      {!hideHeading && <h1 style={{ fontFamily: 'Poppins, sans-serif' }}>Awards</h1>}
      {error && <div className="mb-4 p-2 bg-red-100 text-red-700">{error}</div>}
      {loading ? (
        <p>Loading awards...</p>
      ) : (
        <>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontFamily: 'Poppins, sans-serif' }}>Available Awards</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px'
            }}>
              {awards.filter(a => !a.awarded).map(award => (
                <AwardCard 
                  key={award.id}
                  award={award}
                  onClaim={handleClaimAward}
                  isParentView={false}
                />
              ))}
            </div>
          </div>
          <div>
            <h2 style={{ fontFamily: 'Poppins, sans-serif' }}>Awarded Awards</h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px'
            }}>
              {awards.filter(a => a.awarded).map(award => (
                <AwardCard 
                  key={award.id} 
                  award={award}
                  isParentView={false}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AwardsSection; 