// src/pages/child/Awards.tsx
// Awards Page for Child View: Displays available awards and awarded awards using a grid layout of Award Cards
import React, { useState, useEffect } from 'react';
import AwardCard, { Award } from '@/components/AwardCard';

const Awards: React.FC = () => {
  const [awards, setAwards] = useState<Award[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // TODO: Replace with actual API call to fetch awards from the backend (e.g., via supabase)
    async function fetchAwards() {
      // Dummy data for demonstration
      const dummyAwards: Award[] = [
        { id: '1', title: 'Best Effort', description: 'Awarded for trying hard!', points: 10, awarded: false },
        { id: '2', title: 'Super Star', description: 'Awarded for extraordinary performance!', points: 20, awarded: true },
        { id: '3', title: 'Champion', description: 'Awarded for beating the level!', points: 15, awarded: false },
        { id: '4', title: 'MVP', description: 'Awarded for most valuable performance!', points: 25, awarded: true }
      ];
      setAwards(dummyAwards);
      setLoading(false);
    }
    fetchAwards();
  }, []);

  const handleClaimAward = (awardId: string) => {
    // Here you would typically call a backend function to claim the award
    // For demo purposes, we simply update the UI state to mark the award as claimed
    setAwards(prevAwards =>
      prevAwards.map(award =>
        award.id === awardId ? { ...award, awarded: true } : award
      )
    );
  };

  return (
    <div style={{ padding: '16px' }}>
      <h1 style={{ fontFamily: 'Poppins, sans-serif' }}>Awards</h1>
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
                <AwardCard key={award.id} award={award} onClaim={handleClaimAward} />
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
                <AwardCard key={award.id} award={award} hideActions />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Awards; 