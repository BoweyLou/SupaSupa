"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import ClaimedAwardCard from './ClaimedAwardCard';
import { Award } from './AwardCard';

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
      const { data, error } = await supabase
        .from('claimed_awards')
        .select('*, awards(*)')
        .eq('child_id', activeChildId);
      if (error) {
        console.error('Error fetching claimed awards:', error.message);
      } else if (data) {
        setClaimedAwards(data as ClaimedAward[]);
      }
      setLoading(false);
    }
    fetchClaimedAwards();
  }, [activeChildId]);

  if (loading) return <p>Loading claimed awards...</p>;

  return (
    <div>
      {claimedAwards.length === 0 ? (
        <p>No claimed awards yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {claimedAwards.map((claim) => {
            if (!claim.awards) return null;
            return (
              <ClaimedAwardCard
                key={claim.id}
                award={claim.awards}
                claimedAt={claim.claimed_at}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClaimedAwards; 