import { Star } from 'lucide-react';

interface ChildPoints {
  id: string;
  name: string;
  points: number;
}

interface PointsDisplayProps {
  childAccounts: ChildPoints[];
  showFamilyPoints?: boolean;
}

// Updated renderStars function with soft glow and multi-line support
const renderStars = (points: number) => {
  const fullStars = Math.floor(points / 10);
  const hasHalfStar = points % 10 >= 5;
  const stars = [];
  for (let i = 0; i < fullStars; i++) {
    stars.push(<Star key={`full-${i}`} className="inline-block text-yellow-400 mr-1 drop-shadow-lg" />);
  }
  if (hasHalfStar) {
    stars.push(<Star key="half" className="inline-block text-yellow-400 mr-1 drop-shadow-lg" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
  }
  const maxStarsPerRow = 10;
  const rows = [];
  for (let i = 0; i < stars.length; i += maxStarsPerRow) {
    rows.push(
      <div key={`row-${i}`} className="flex">
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
                  {child.points}<span className="ml-1 text-sm opacity-90">points</span>
                </div>
                <div className="mt-2 flex justify-center">
                  {renderStars(child.points)}
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