import { Star } from 'lucide-react';
import React from 'react';

interface StarDisplayProps {
  points: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  maxStarsPerRow?: number; // Added for more control
}

const StarDisplay = ({ 
  points, 
  size = 'md', 
  className = '',
  maxStarsPerRow 
}: StarDisplayProps) => {
  const fullStars = Math.floor(points / 10);
  const hasHalfStar = points % 10 >= 5;
  const stars = [];

  // Determine star size - responsive sizes based on viewports
  const getStarSize = () => {
    // Base sizes
    const baseSize = {
      sm: 18,
      md: 22,
      lg: 28
    }[size];
    
    // Scale based on viewport
    let scaleFactor = 1.25; // Default scale
    
    // Adjust scale based on screen width for more responsive sizing
    // We'll check through CSS and React
    if (typeof window !== 'undefined') {
      const screenWidth = window.innerWidth;
      if (screenWidth <= 480) {
        // Mobile devices - slightly smaller
        scaleFactor = 1.1;
      } else if (screenWidth <= 768) {
        // Tablets - medium size
        scaleFactor = 1.2;
      } else {
        // Desktops - original size
        scaleFactor = 1.25;
      }
    }
    
    return Math.round(baseSize * scaleFactor);
  };
  
  const starSize = getStarSize();
  
  // Determine max stars per row based on available width and props
  const starsPerRow = maxStarsPerRow || (
    typeof window !== 'undefined' && window.innerWidth <= 480 ? 5 : 7
  );

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

  // Group stars into rows with responsive number of stars per row
  const rows = [];
  
  for (let i = 0; i < stars.length; i += starsPerRow) {
    rows.push(
      <div key={`row-${i}`} className="flex justify-center mb-1">
        {stars.slice(i, i + starsPerRow)}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {rows}
    </div>
  );
};

export default StarDisplay; 