// src/components/CardGrid.tsx
// This component provides a responsive grid layout for card components

import React from 'react';

interface CardGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * CardGrid - A responsive grid layout component for cards
 * 
 * This component will:
 * - Display 1 card per row on mobile (up to 480px)
 * - Display 2 cards per row on small tablets (481px to 768px)
 * - Display 3 cards per row on large tablets (769px to 1024px)
 * - Display 4 cards per row on desktop (1025px and above)
 */
const CardGrid: React.FC<CardGridProps> = ({ children, className = '' }) => {
  return (
    <div className={`card-grid ${className}`}>
      {children}
    </div>
  );
};

export default CardGrid; 