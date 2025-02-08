import { useState, useEffect } from 'react';

interface ChildPoints {
  id: string;
  name: string;
  points: number;
}

interface PointsDisplayProps {
  children: ChildPoints[];
  totalPoints?: number;
}

const calculateLevel = (points: number): number => {
  // Simple level calculation - can be adjusted based on requirements
  return Math.floor(points / 50) + 1;
};

export default function PointsDisplay({ children, totalPoints = 0 }: PointsDisplayProps) {
  return (
    <div className="mb-8">
      {/* Total Family Points Card */}
      <div 
        className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg p-6 mb-4 text-white shadow-lg"
        style={{
          background: 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)'
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <h2 className="text-xl font-semibold">Total Family Points</h2>
            </div>
            <div className="mt-2">
              <span className="text-4xl font-bold">{totalPoints}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Family Level</div>
            <div className="text-3xl font-bold">{calculateLevel(totalPoints)}</div>
          </div>
        </div>
      </div>

      {/* Individual Child Points */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {children.map((child) => (
          <div 
            key={child.id}
            className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-4 text-white shadow-md"
            style={{
              background: 'linear-gradient(to right, #3b82f6, #a855f7)'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{child.name}</h3>
                <div className="mt-1">
                  <span className="text-2xl font-bold">{child.points}</span>
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