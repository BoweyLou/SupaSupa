// src/pages/child/Awards.tsx
// Updated to filter awards by child's family_id

"use client";

import React, { useState, useEffect } from 'react';
import AwardCard, { Award } from '@/components/AwardCard';
import { supabase } from '@/lib/supabase';

interface AwardsProps {
  activeChildId: string; // Active child account id selected via parent tabs
}

const Awards: React.FC<AwardsProps> = ({ activeChildId }) => {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [childPoints, setChildPoints] = useState<number>(0);
  const [childFamilyId, setChildFamilyId] = useState<string | null>(null);

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
      } else if (data) {
        setAwards(data as Award[]);
      }
      setLoading(false);
    }
    fetchAwards();
  }, [childFamilyId]);

  const handleClaimAward = async (awardId: string) => {
    const award = awards.find(a => a.id === awardId);
    if (!award) {
      console.error('Award not found:', awardId);
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
      alert("You don't have enough points to redeem this reward.");
      return;
    }
    const { data: updatedProfile, error: profileError } = await supabase
      .rpc('deduct_points', { child_uuid: activeChildId, deduction: award.points });
    if (profileError) {
      console.error('Error deducting points:', profileError.message);
      return;
    }
    console.log('Updated Profile from RPC:', updatedProfile);
    if (updatedProfile && updatedProfile.length > 0) {
      setChildPoints(updatedProfile[0].points);
    } else {
      // In case RPC returns no data, fallback to deducting locally
      setChildPoints(childPoints - award.points);
    }
    // Dispatch custom event to update PointsDisplay instantly
    const newPoints = updatedProfile && updatedProfile.length > 0 ? updatedProfile[0].points : childPoints - award.points;
    window.dispatchEvent(new CustomEvent('childPointsUpdated', { detail: { childId: activeChildId, points: newPoints } }));

    // Insert a record into the claimed_awards table for phase 2 award claim tracking
    const { error: claimError } = await supabase
      .from('claimed_awards')
      .insert({
         award_id: award.id,
         child_id: activeChildId,
         claimed_at: new Date().toISOString(),
         points_deducted: award.points
      });
    if (claimError) {
       console.error('Error inserting claimed award record:', claimError.message);
       return;
    }

    // Mark the award as claimed in the awards table
    const { error: awardUpdateError } = await supabase
      .from('awards')
      .update({ awarded: true })
      .eq('id', award.id);
    if (awardUpdateError) {
      console.error('Error updating award status:', awardUpdateError.message);
      return;
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
            {awards.map(award => (
              <AwardCard key={award.id} award={{ ...award, awarded: false }} onClaim={handleClaimAward} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Awards; 