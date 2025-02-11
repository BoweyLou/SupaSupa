import { useState, useEffect } from 'react';
import { Star, Zap } from 'lucide-react';

interface ChildPoints {
  id: string;
  name: string;
  points: number;
}

interface PointsDisplayProps {
  children: ChildPoints[];
  totalPoints?: number;
  showFamilyPoints?: boolean;
}

const calculateLevel = (points: number): number => {
  // Simple level calculation - can be adjusted based on requirements
  return Math.floor(points / 50) + 1;
};

export default function PointsDisplay({ children, totalPoints = 0, showFamilyPoints = true }: PointsDisplayProps) {
  const numColumns = children.length > 0 ? children.length : 1;

  if (showFamilyPoints) {
    return (
      <div className="mb-8">
        <div 
          className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg p-6 mb-4 text-white shadow-lg"
          style={{ background: 'linear-gradient(to right, #ef4444, #f97316)' }}
        >
          <div className="flex">
            {children.map(child => (
              <div key={child.id} className="flex-1 text-center border-r border-white last:border-r-0 relative p-2">
                <div className="text-lg font-semibold">{child.name}</div>
                <div className="text-4xl font-bold"><Star className="inline-block mr-1" />{child.points}</div>
                <div className="absolute bottom-2 right-2 text-xs flex items-center">
                  <Zap className="inline-block mr-1" /> Level {calculateLevel(child.points)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="mb-8">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${numColumns}, minmax(0, 1fr))` }}>
          {children.map((child) => (
            <div 
              key={child.id}
              className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-4 text-white shadow-md"
              style={{ background: 'linear-gradient(to right, #3b82f6, #a855f7)' }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="mt-1">
                    <span className="text-2xl font-bold"><Star className="inline-block mr-1" />{child.points}</span>
                    <span className="ml-1 text-sm opacity-90">points</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm opacity-90">Level</div>
                  <div className="text-xl font-bold">{calculateLevel(child.points)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
} 