"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ClaimedAwardCard from './ClaimedAwardCard';
import { Award } from './AwardCard';
import { showToast } from '@/utils/toast';

interface ClaimedAward {
  id: string;
  award_id: string;
  child_id: string;
  claimed_at: string;
  points_deducted: number;
  awards: Award; // joined award details from awards table
}

interface ClaimedAwardsProps {
  activeChildId: string;
}

const ClaimedAwards: React.FC<ClaimedAwardsProps> = ({ activeChildId }) => {
  const [claimedAwards, setClaimedAwards] = useState<ClaimedAward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClaimedAwards() {
      try {
        console.log('Fetching claimed awards for child:', activeChildId);
        const { data, error } = await supabase
          .from('claimed_awards')
          .select('*, awards(*)')
          .eq('child_id', activeChildId)
          .order('claimed_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching claimed awards:', error.message);
          showToast.error('Error loading claimed awards');
          setLoading(false);
          return;
        }
        
        console.log('Claimed awards data:', data);
        
        if (data && data.length > 0) {
          setClaimedAwards(data as ClaimedAward[]);
        } else {
          setClaimedAwards([]);
        }
      } catch (err) {
        console.error('Unexpected error fetching claimed awards:', err);
        showToast.error('Failed to load claimed awards');
      } finally {
        setLoading(false);
      }
    }
    
    if (activeChildId) {
      fetchClaimedAwards();
    }
  }, [activeChildId]);

  if (loading) return (
    <div className="flex justify-center items-center p-4">
      <div className="animate-pulse">Loading claimed awards...</div>
    </div>
  );

  return (
    <div>
      {claimedAwards.length === 0 ? (
        <p className="text-center text-gray-500 p-4">No claimed awards yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {claimedAwards.map((claim) => {
            if (!claim.awards) {
              console.warn('Missing award data for claimed award:', claim.id);
              return null;
            }
            return (
              <ClaimedAwardCard
                key={claim.id}
                award={claim.awards}
                claimedAt={claim.claimed_at}
                pointsDeducted={claim.points_deducted}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClaimedAwards; 