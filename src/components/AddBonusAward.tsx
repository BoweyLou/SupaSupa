"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus,
  Star,
  Trophy,
  Heart,
  Sparkles,
  Rocket,
  Crown,
  Medal,
  PartyPopper,
  Smile,
  ThumbsUp,
  Cookie,
  IceCream,
  Candy,
  Gift,
  Gamepad2,
  Puzzle,
  Palette,
  Music4,
  Bike
} from 'lucide-react';
import { showToast } from '@/utils/toast';

// Define available icons with their colors
const AVAILABLE_ICONS = [
  { icon: Star, name: 'Star', color: '#FFD700' },
  { icon: Trophy, name: 'Trophy', color: '#FFA500' },
  { icon: Heart, name: 'Heart', color: '#FF69B4' },
  { icon: Sparkles, name: 'Sparkles', color: '#00CED1' },
  { icon: Rocket, name: 'Rocket', color: '#4169E1' },
  { icon: Crown, name: 'Crown', color: '#FFD700' },
  { icon: Medal, name: 'Medal', color: '#C0C0C0' },
  { icon: PartyPopper, name: 'Party', color: '#FF1493' },
  { icon: Smile, name: 'Smile', color: '#FFD700' },
  { icon: ThumbsUp, name: 'Thumbs Up', color: '#4CAF50' },
  { icon: Cookie, name: 'Cookie', color: '#8B4513' },
  { icon: IceCream, name: 'Ice Cream', color: '#FF69B4' },
  { icon: Candy, name: 'Candy', color: '#FF1493' },
  { icon: Gift, name: 'Gift', color: '#9C27B0' },
  { icon: Gamepad2, name: 'Games', color: '#2196F3' },
  { icon: Puzzle, name: 'Puzzle', color: '#FF5722' },
  { icon: Palette, name: 'Art', color: '#4CAF50' },
  { icon: Music4, name: 'Music', color: '#E91E63' },
  { icon: Bike, name: 'Sports', color: '#3F51B5' }
];

interface AddBonusAwardProps {
  onBonusAdded: () => void;
}

const AddBonusAward: React.FC<AddBonusAwardProps> = ({ onBonusAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [points, setPoints] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setSelectedIcon("");
    setPoints("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      // Validate inputs
      if (!title.trim()) {
        setError("Please enter a title");
        showToast.error("Please enter a title");
        return;
      }
      if (!selectedIcon) {
        setError("Please select an icon");
        showToast.error("Please select an icon");
        return;
      }
      const parsedPoints = parseInt(points, 10);
      if (isNaN(parsedPoints) || parsedPoints <= 0) {
        setError("Please enter a valid number of points");
        showToast.error("Please enter a valid number of points");
        return;
      }

      setLoading(true);

      // Create the bonus award
      const { error } = await supabase
        .from('bonus_awards')
        .insert([
          {
            title: title.trim(),
            icon: selectedIcon,
            points: parsedPoints,
            status: 'available',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating bonus award:', error);
        setError(error.message || 'Failed to create bonus award');
        showToast.error(error.message || 'Failed to create bonus award');
        return;
      }

      // Success
      showToast.success('Bonus award created successfully!');
      onBonusAdded();
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Unexpected error creating bonus award:', err);
      setError('An unexpected error occurred');
      showToast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const IconPickerGrid = () => (
    <div className="grid grid-cols-5 gap-2 p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
      {AVAILABLE_ICONS.map(({ icon: IconComponent, name, color }) => (
        <div
          key={name}
          onClick={() => setSelectedIcon(name)}
          className={`
            p-2 rounded-lg cursor-pointer transition-all duration-200 
            flex flex-col items-center justify-center gap-1
            hover:bg-gray-200
            ${selectedIcon === name ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-white'}
          `}
        >
          <IconComponent size={24} color={color} />
          <span className="text-xs text-gray-600">{name}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      {/* Plus card to open modal */}
      <div
        className="cursor-pointer border-2 border-dashed border-gray-300 rounded p-4 flex items-center justify-center text-gray-500 hover:bg-gray-200"
        onClick={() => {
          resetForm();
          setIsModalOpen(true);
        }}
      >
        <Plus className="mr-2" /> Add Bonus Award
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded p-6 w-full max-w-2xl">
            <h2 className="text-2xl mb-4">Add New Bonus Award</h2>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Enter bonus award title"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Select Icon</label>
                <IconPickerGrid />
                {selectedIcon && (
                  <div className="mt-2 p-2 bg-gray-50 rounded flex items-center gap-2">
                    <span>Selected:</span>
                    {React.createElement(
                      AVAILABLE_ICONS.find(i => i.name === selectedIcon)?.icon || Star,
                      { 
                        size: 24, 
                        color: AVAILABLE_ICONS.find(i => i.name === selectedIcon)?.color 
                      }
                    )}
                    <span>{selectedIcon}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Points</label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Enter bonus points"
                  min="1"
                  disabled={loading}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsModalOpen(false);
                  }}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors duration-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-400"
                >
                  {loading ? 'Adding...' : 'Add Bonus Award'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBonusAward; 