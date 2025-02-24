// src/pages/child/Awards.tsx
// Updated to filter awards by child's family_id

"use client";

import React, { useState, useEffect } from 'react';
import AwardCard, { Award } from '@/components/AwardCard';
import { supabase } from '@/lib/supabase';
import { showToast } from '@/utils/toast';

interface AwardsProps {
  activeChildId: string; // Active child account id selected via parent tabs
}

const Awards: React.FC<AwardsProps> = ({ activeChildId }) => {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [childPoints, setChildPoints] = useState<number>(0);
  const [childFamilyId, setChildFamilyId] = useState<string | null>(null);
  const [claimInProgress, setClaimInProgress] = useState<boolean>(false);

  useEffect(() => {
    async function fetchProfile() {
      console.log('Fetching profile for child:', activeChildId);
      const { data, error } = await supabase
         .from('users')
         .select('*')  // Changed to select all fields for debugging
         .eq('id', activeChildId)
         .single();
      if (error) {
         console.error('Error fetching profile:', error.message);
         showToast.error('Error loading profile');
      } else if (data) {
         console.log('Fetched child profile:', data);
         setChildPoints(data.points);
         setChildFamilyId(data.family_id);
      }
    }
    fetchProfile();
  }, [activeChildId]);

  useEffect(() => {
    async function fetchAwards() {
      // Only fetch awards when child's family id is available
      if (!childFamilyId) return;

      const familyIdString = String(childFamilyId);
      const { data, error } = await supabase
        .from('awards')
        .select('*')
        .eq('family_id', familyIdString);

      if (error) {
        console.error('Error fetching awards:', error.message);
        showToast.error('Error loading awards');
      } else if (data) {
        setAwards(data as Award[]);
      }
      setLoading(false);
    }
    fetchAwards();
  }, [childFamilyId]);

  const handleClaimAward = async (awardId: string) => {
    // Prevent multiple claim attempts
    if (claimInProgress) {
      return;
    }
    
    setClaimInProgress(true);
    
    try {
      const award = awards.find(a => a.id === awardId);
      if (!award) {
        console.error('Award not found:', awardId);
        showToast.error('Award not found');
        setClaimInProgress(false);
        return;
      }
      
      // Re-fetch points to ensure we have the latest
      const { data: currentProfile, error: profileCheckError } = await supabase
        .from('users')
        .select('points')
        .eq('id', activeChildId)
        .single();
        
      if (profileCheckError) {
        console.error('Error checking current points:', profileCheckError);
        showToast.error('Could not verify your current points');
        setClaimInProgress(false);
        return;
      }
      
      const currentPoints = currentProfile?.points ?? childPoints;
      console.log('Claiming award:', {
        awardId,
        awardPoints: award.points,
        childId: activeChildId,
        currentPoints,
        storedChildPoints: childPoints
      });

      if (currentPoints < award.points) {
        console.log('Insufficient points:', { required: award.points, available: currentPoints });
        showToast.error("You don't have enough points to redeem this reward");
        setClaimInProgress(false);
        return;
      }

      // Use the new transaction function
      const { data: transactionResult, error: transactionError } = await supabase
        .rpc('claim_award_transaction', {
          p_award_id: award.id,
          p_child_id: activeChildId,
          p_points: award.points
        });

      if (transactionError) {
        console.error('Transaction error:', transactionError);
        showToast.error(`Failed to claim award: ${transactionError.message}`);
        setClaimInProgress(false);
        return;
      }

      if (transactionResult === false) {
        console.error('Transaction failed without error');
        showToast.error('Failed to claim award - insufficient points');
        setClaimInProgress(false);
        return;
      }

      console.log('Transaction successful:', transactionResult);
      
      // Re-fetch the user's points
      const { data: updatedProfile, error: profileError } = await supabase
        .from('users')
        .select('points')
        .eq('id', activeChildId)
        .single();
        
      if (profileError) {
        console.error('Error fetching updated points:', profileError);
      } else if (updatedProfile) {
        setChildPoints(updatedProfile.points);
        
        // Dispatch custom event to update PointsDisplay instantly
        window.dispatchEvent(new CustomEvent('childPointsUpdated', { 
          detail: { childId: activeChildId, points: updatedProfile.points } 
        }));
      } else {
        // Fallback to estimated points if we can't fetch the updated profile
        setChildPoints(currentPoints - award.points);
        
        // Dispatch custom event with estimated points
        window.dispatchEvent(new CustomEvent('childPointsUpdated', { 
          detail: { childId: activeChildId, points: currentPoints - award.points } 
        }));
      }
      
      // Update the local awards list to mark this award as awarded
      setAwards(prevAwards => 
        prevAwards.map(a => 
          a.id === award.id ? { ...a, awarded: true } : a
        )
      );
      
      showToast.success(`Successfully claimed award: ${award.title}`);
    } catch (err) {
      console.error('Error in handleClaimAward:', err);
      showToast.error('An unexpected error occurred while claiming the award');
    } finally {
      setClaimInProgress(false);
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontFamily: 'Poppins, sans-serif' }}>Awards</h1>
      {loading ? (
        <p>Loading awards...</p>
      ) : (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: 'Poppins, sans-serif' }}>Available Awards</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {awards.filter(award => !award.awarded).map(award => (
              <AwardCard 
                key={award.id} 
                award={award} 
                onClaim={handleClaimAward} 
                hideActions={claimInProgress}
              />
            ))}
            {awards.filter(award => !award.awarded).length === 0 && (
              <p>No available awards to claim.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Awards; 