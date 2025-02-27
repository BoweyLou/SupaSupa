import { Star } from 'lucide-react';

interface StarDisplayProps {
  points: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const StarDisplay = ({ points, size = 'md', className = '' }: StarDisplayProps) => {
  const fullStars = Math.floor(points / 10);
  const hasHalfStar = points % 10 >= 5;
  const stars = [];

  // Determine star size - increase all sizes by 25%
  const starSize = {
    sm: Math.round(18 * 1.25), // ~22
    md: Math.round(22 * 1.25), // ~28
    lg: Math.round(28 * 1.25)  // ~35
  }[size];

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
    <div className={`flex flex-col items-center ${className}`}>
      {rows}
    </div>
  );
};

export default StarDisplay; 