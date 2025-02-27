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

  // Determine star size - increase all sizes
  const starSize = {
    sm: 18,
    md: 22,
    lg: 28
  }[size];

  // Create full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star 
        key={`full-${i}`} 
        size={starSize}
        className="inline-block text-yellow-400 mr-1" 
        fill="#FFD700"
        strokeWidth={1}
      />
    );
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <Star 
        key="half" 
        size={starSize}
        className="inline-block text-yellow-400 mr-1" 
        fill="#FFD700"
        strokeWidth={1}
        style={{ clipPath: 'inset(0 50% 0 0)' }} 
      />
    );
  }

  // Group stars into rows of 5 for better display
  const maxStarsPerRow = 5;
  const rows = [];
  for (let i = 0; i < stars.length; i += maxStarsPerRow) {
    rows.push(
      <div key={`row-${i}`} className="flex">
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