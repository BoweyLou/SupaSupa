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
        // Process awards to calculate availability
        const processedAwards = (data || []).map(award => {
          // Check if award is visible to this child
          const isVisibleToChild = 
            !award.allowed_children_ids || 
            award.allowed_children_ids.length === 0 || 
            award.allowed_children_ids.includes(activeChildId);
          
          if (!isVisibleToChild) {
            return null; // Skip awards not visible to this child
          }
          
          // Calculate if award is in lockout period
          let isInLockout = false;
          let availableAfter = '';
          
          if (award.last_redeemed_at && award.lockout_period) {
            const lastRedeemed = new Date(award.last_redeemed_at);
            const now = new Date();
            
            // Calculate lockout end date
            const lockoutEnd = new Date(lastRedeemed);
            if (award.lockout_unit === 'weeks') {
              lockoutEnd.setDate(lockoutEnd.getDate() + (award.lockout_period * 7));
            } else {
              lockoutEnd.setDate(lockoutEnd.getDate() + award.lockout_period);
            }
            
            isInLockout = now < lockoutEnd;
            if (isInLockout) {
              // Format date for display
              availableAfter = lockoutEnd.toLocaleDateString();
            }
          }
          
          // Calculate remaining redemptions
          const remainingRedemptions = award.redemption_limit === null 
            ? null 
            : Math.max(0, award.redemption_limit - (award.redemption_count || 0));
          
          // Check if award is available for redemption
          const isAvailable = 
            // Not available if already fully redeemed
            !(remainingRedemptions !== null && remainingRedemptions <= 0) &&
            // Not available if in lockout period
            !isInLockout;
          
          return {
            ...award,
            // Map database column names to camelCase for the component
            allowedChildrenIds: award.allowed_children_ids,
            redemptionLimit: award.redemption_limit,
            redemptionCount: award.redemption_count,
            lockoutPeriod: award.lockout_period,
            lockoutUnit: award.lockout_unit,
            lastRedeemedAt: award.last_redeemed_at,
            // Add computed properties
            isAvailable,
            availableAfter,
            remainingRedemptions,
            // Map database column names to component props
            familyId: award.family_id,
            // Add icon and customColors mappings
            icon: award.icon,
            customColors: award.custom_colors
          };
        }).filter(Boolean); // Remove null entries (awards not visible to this child)
        
        setAwards(processedAwards as Award[]);
      }
      setLoading(false);
    }
    fetchAwards();
  }, [childFamilyId, activeChildId]);

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
      
      // Check if award is available for redemption
      if (award.isAvailable === false) {
        let errorMessage = 'This award is not available';
        
        if (award.remainingRedemptions !== undefined && 
            award.remainingRedemptions !== null && 
            award.remainingRedemptions <= 0) {
          errorMessage = 'This award has been fully redeemed';
        } else if (award.availableAfter) {
          errorMessage = `This award will be available after ${award.availableAfter}`;
        }
        
        showToast.error(errorMessage);
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
          a.id === award.id ? { 
            ...a, 
            awarded: true,
            // For unlimited awards, update the redemption count and lockout
            redemptionCount: a.redemptionCount !== undefined ? (a.redemptionCount + 1) : 1,
            lastRedeemedAt: new Date().toISOString()
          } : a
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(264px, 1fr))',
            gap: '16px'
          }}>
            {awards.filter(award => !award.awarded).map(award => (
              <AwardCard 
                key={award.id} 
                award={award} 
                onClaim={handleClaimAward} 
                hideActions={claimInProgress}
                currentChildId={activeChildId}
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