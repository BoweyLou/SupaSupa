import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ChildPoints {
  id: string;
  name: string;
  points: number;
}

interface PointsDisplayProps {
  childAccounts: ChildPoints[];
  showFamilyPoints?: boolean;
}

// Updated renderStars function with non-stacking stars but keeping visual improvements
const renderStars = (points: number) => {
  const fullStars = Math.floor(points / 10);
  const hasHalfStar = points % 10 >= 5;
  const stars = [];
  
  // Increased star size by 25%
  const starSize = 22 * 1.25; // ~28px
  
  // Create full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star 
        key={`full-${i}`} 
        size={starSize}
        className="inline-block text-yellow-400 mr-1" 
        fill="#FFD700"
        strokeWidth={1.5}
        stroke="white" // White border
        style={{ filter: "drop-shadow(0px 2px 3px rgba(0,0,0,0.2))" }} // Soft drop shadow
      />
    );
  }
  
  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <div key="half" className="inline-block relative mr-1">
        {/* Background star */}
        <Star 
          size={starSize}
          className="text-yellow-400" 
          fill="transparent"
          strokeWidth={1.5}
          stroke="white" // White border
          style={{ filter: "drop-shadow(0px 2px 3px rgba(0,0,0,0.2))" }} // Soft drop shadow
        />
        {/* Half-filled star on top */}
        <div className="absolute top-0 left-0 overflow-hidden" style={{ width: "50%" }}>
          <Star 
            size={starSize}
            className="text-yellow-400" 
            fill="#FFD700"
            strokeWidth={0} // No stroke on the half to avoid clipping issues
          />
        </div>
      </div>
    );
  }
  
  // Group stars into rows of 7 for better display
  const maxStarsPerRow = 7;
  const rows = [];
  
  for (let i = 0; i < stars.length; i += maxStarsPerRow) {
    rows.push(
      <div key={`row-${i}`} className="flex justify-center mb-1">
        {stars.slice(i, i + maxStarsPerRow)}
      </div>
    );
  }
  
  return (
    <div className="flex flex-col items-center">
      {rows}
    </div>
  );
};

export default function PointsDisplay({ childAccounts, showFamilyPoints = true }: PointsDisplayProps) {
  // Maintain a local map of child points to allow instant updates
  const [pointsMap, setPointsMap] = useState<{ [key: string]: number }>(() => {
    return childAccounts.reduce((acc, child) => {
      acc[child.id] = child.points;
      return acc;
    }, {} as { [key: string]: number });
  });

  // Update local points map whenever the passed childAccounts prop changes
  useEffect(() => {
    setPointsMap(childAccounts.reduce((acc, child) => {
      acc[child.id] = child.points;
      return acc;
    }, {} as { [key: string]: number }));
  }, [childAccounts]);

  // Subscribe to real-time updates on users to update points instantly
  useEffect(() => {
    const childIds = childAccounts.map(child => child.id);
    const channel = supabase.channel('points-display')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, payload => {
        const updatedUser = payload.new;
        if (childIds.includes(updatedUser.id)) {
          setPointsMap(prev => ({ ...prev, [updatedUser.id]: updatedUser.points }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [childAccounts]);

  // Listen for custom events to instantly update points (especially for self-triggered updates from redemption)
  useEffect(() => {
    const handleChildPointsUpdated = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { childId, points } = customEvent.detail;
      setPointsMap(prev => ({ ...prev, [childId]: points }));
    };

    window.addEventListener('childPointsUpdated', handleChildPointsUpdated);
    return () => {
      window.removeEventListener('childPointsUpdated', handleChildPointsUpdated);
    };
  }, []);

  if (showFamilyPoints) {
    return (
      <div className="mb-8">
        <div 
          className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-6 mb-4 text-white shadow-lg"
          style={{ background: 'linear-gradient(to right, #ef4444, #f97316)' }}
        >
          <div className="flex">
            {childAccounts.map(child => (
              <div key={child.id} className="flex-1 text-left border-r border-white last:border-r-0 relative py-2 px-6">
                <div className="text-lg font-semibold">{child.name}</div>
                <div className="text-4xl font-bold">
                  {pointsMap[child.id] ?? child.points}<span className="ml-1 text-sm opacity-90">points</span>
                </div>
                <div className="mt-2 flex justify-center">
                  {renderStars(pointsMap[child.id] ?? child.points)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } else {
    return null;
  }
} 