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

  // Determine star size
  const starSize = {
    sm: 14,
    md: 16,
    lg: 20
  }[size];

  // Create full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star 
        key={`full-${i}`} 
        size={starSize}
        className="inline-block text-yellow-400 mr-1 drop-shadow-lg" 
      />
    );
  }

  // Add half star if needed
  if (hasHalfStar) {
    stars.push(
      <Star 
        key="half" 
        size={starSize}
        className="inline-block text-yellow-400 mr-1 drop-shadow-lg" 
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