// src/components/BonusAwardCardSimple.tsx
// BonusAwardCardSimple: A simple card component for displaying bonus awards in a grid layout.
// This component displays the award icon at the top center, title, points, and if the award has been redeemed,
// it is highlighted with a gradient and glow. Available awards appear more faint.

import React from 'react';
import { Star } from 'lucide-react';
import { AVAILABLE_ICONS, IconConfig } from '@/components/BonusAwardCard';

export interface BonusAwardSimple {
  id: string;
  title: string;
  points: number;
  status: 'available' | 'awarded';
  awarded_at?: string;
  icon: string;
}

export interface BonusAwardCardSimpleProps {
  bonusAward: BonusAwardSimple;
  hideActions?: boolean;
}

const BonusAwardCardSimple: React.FC<BonusAwardCardSimpleProps> = ({ bonusAward, hideActions }) => {
  const iconLookup = AVAILABLE_ICONS.find((i: IconConfig) => i.name === bonusAward.icon);
  // Fall back to Star icon if no matching icon is found
  const IconComponent = iconLookup ? iconLookup.icon : Star;

  const containerStyle: React.CSSProperties = bonusAward.status === 'awarded'
    ? {
        border: '1px solid #FFD700',
        borderRadius: '8px',
        padding: '8px',
        background: 'linear-gradient(45deg, #FFC371, #FF5F6D)',
        boxShadow: '0 0 10px 2px rgba(255,215,0,0.7)',
        textAlign: 'center',
        position: 'relative'
      }
    : {
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '8px',
        backgroundColor: '#fff',
        opacity: 0.7,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        textAlign: 'center',
        position: 'relative'
      };

  return (
    <div style={containerStyle}>
      {/* Icon at the top center, rendered always */}
      {IconComponent && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
          <IconComponent 
            size={64} 
            fill="#f9c74f" 
            stroke="none"
            style={{ 
              filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.8))',
              transform: 'scale(1.5)'
            }} 
          />
        </div>
      )}
      <div style={{ fontWeight: 'bold', fontSize: '0.8rem', marginBottom: '4px' }}>
        {bonusAward.title}
      </div>
      <div style={{ fontSize: '0.75rem', color: '#333' }}>
        {bonusAward.points} pts
      </div>
      {bonusAward.status === "awarded" && (
        <div className="text-green-500 text-xs mt-1">Awarded!</div>
      )}
      {!hideActions && bonusAward.status === "available" && (
        <div className="mt-2 flex space-x-2">
          <button className="text-blue-500 text-xs">Edit</button>
          <button className="text-red-500 text-xs">Delete</button>
        </div>
      )}
    </div>
  );
};

export default BonusAwardCardSimple; 