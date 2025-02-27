// src/components/BonusAwardCardSimple.tsx
// BonusAwardCardSimple: A simple card component for displaying bonus awards in a grid layout.
// This component displays the award icon at the top center, title, points, and if the award has been redeemed,
// it is highlighted with a gradient and glow. Available awards appear more faint.

import React from 'react';
import { Star } from 'lucide-react';
import { AVAILABLE_ICONS, IconConfig } from '@/components/BonusAwardCard';
import { useTheme } from '@/contexts/ThemeContext';
import StarDisplay from './StarDisplay';

export interface BonusAwardSimple {
  id: string;
  title: string;
  points: number;
  status: 'available' | 'awarded';
  awarded_at?: string;
  icon: string;
  color?: string;
}

export interface BonusAwardCardSimpleProps {
  bonusAward: BonusAwardSimple;
  hideActions?: boolean;
}

const BonusAwardCardSimple: React.FC<BonusAwardCardSimpleProps> = ({ bonusAward, hideActions }) => {
  // Use theme for consistent styling
  const { theme } = useTheme();
  const iconLookup = AVAILABLE_ICONS.find((i: IconConfig) => i.name === bonusAward.icon);
  // Fall back to Star icon if no matching icon is found
  const IconComponent = iconLookup ? iconLookup.icon : Star;
  
  // Use custom color if available, otherwise use the default color for the icon
  const iconColor = bonusAward.color || iconLookup?.color || '#FFD700';

  // Create custom colors based on the icon color or use theme defaults when needed
  const customColors = {
    borderColor: bonusAward.status === 'awarded' ? '#FFD700' : (iconColor || theme.borderColor),
    backgroundColor: bonusAward.status === 'awarded' 
      ? '#FFC371' // Use a solid color from the gradient instead of a gradient string
      : `${iconColor}33` || theme.backgroundColor, // Add 33 (20% opacity) to the hex color
    shadowColor: bonusAward.status === 'awarded'
      ? 'rgba(255,215,0,0.7)' 
      : `${iconColor}66` || theme.shadowColor, // Add 66 (40% opacity) to the hex color
  };

  // Apply custom colors
  const cardStyle = {
    '--brutalist-card-border-color': customColors.borderColor,
    '--brutalist-card-bg-color': customColors.backgroundColor,
    '--brutalist-card-shadow-color': customColors.shadowColor,
    // For awarded cards, apply the box-shadow directly rather than using a CSS variable
    ...(bonusAward.status === 'awarded' ? { boxShadow: '0 0 10px 2px rgba(255,215,0,0.7)' } : {}),
    // For available cards, make them slightly faded
    opacity: bonusAward.status === 'available' ? 0.85 : 1,
  } as React.CSSProperties;

  // Check if dark mode is enabled
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  
  // Get the card background color based on theme
  const cardBgColor = isDarkMode ? '#1f2937' : '#ffffff';

  return (
    <div className="brutalist-card brutalist-card--themed brutalist-card--simple" style={cardStyle}>
      {/* Apply background color with gradient fade */}
      <div 
        className="brutalist-card__header-wrapper" 
        style={{
          background: bonusAward.status === 'awarded'
            ? 'linear-gradient(45deg, #FFC371, #FF5F6D)'
            : `linear-gradient(180deg, ${customColors.backgroundColor} 0%, ${customColors.backgroundColor} 30%, ${cardBgColor} 100%)`,
        }}
      >
        <div className="brutalist-card__header">
          <div 
            className="brutalist-card__icon" 
            style={{ 
              left: '50%', 
              transform: 'translateX(-50%)', 
              top: '-5px',
            }}
          >
            <IconComponent color={iconColor} />
          </div>
          <h3 
            style={{ 
              marginLeft: '0', 
              marginTop: '40px', 
              textAlign: 'center',
              width: '100%',
              padding: '0 0.5rem',
              fontWeight: 500,
              color: isDarkMode ? '#f9fafb' : '#1f2937', 
              fontSize: '1rem',
              position: 'relative',
              zIndex: 1
            }}
          >
            {bonusAward.title}
          </h3>
        </div>
      </div>

      <div className="brutalist-card__stars" style={{ marginTop: '0.5rem' }}>
        {/* Optionally show stars for more important awards */}
        {bonusAward.points >= 50 && (
          <StarDisplay points={bonusAward.points} size="sm" />
        )}
        <div className="brutalist-card__points" style={{ fontSize: '0.75rem' }}>
          {bonusAward.points} pts
        </div>
      </div>

      {bonusAward.status === "awarded" && (
        <div className="text-green-500 text-xs mt-1 text-center">Awarded!</div>
      )}
      
      {!hideActions && bonusAward.status === "available" && (
        <div className="brutalist-card__actions p-2">
          <div className="flex justify-center space-x-2">
            <button className="text-blue-500 text-xs">Edit</button>
            <button className="text-red-500 text-xs">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BonusAwardCardSimple; 