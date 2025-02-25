"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Plus,
  Star
} from 'lucide-react';
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from './BonusAwardCard';

interface AddBonusAwardProps {
  onBonusAdded: () => void;
}

const AddBonusAward: React.FC<AddBonusAwardProps> = ({ onBonusAdded }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [points, setPoints] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTitle("");
    setSelectedIcon("");
    setSelectedColor("");
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
        return;
      }
      if (!selectedIcon) {
        setError("Please select an icon");
        return;
      }
      const parsedPoints = parseInt(points, 10);
      if (isNaN(parsedPoints) || parsedPoints <= 0) {
        setError("Please enter a valid number of points");
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
            color: selectedColor || undefined, // Only include color if selected
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
        return;
      }

      // Success
      onBonusAdded();
      resetForm();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Unexpected error creating bonus award:', err);
      setError('An unexpected error occurred');
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
          <IconComponent size={20} color={selectedColor || color} />
          <span className="text-xs text-gray-600">{name}</span>
        </div>
      ))}
    </div>
  );

  const ColorPickerGrid = () => (
    <div className="grid grid-cols-10 gap-2 p-4 bg-gray-50 rounded-lg">
      {AVAILABLE_COLORS.map((color) => (
        <div
          key={color}
          onClick={() => setSelectedColor(color)}
          className={`
            w-6 h-6 rounded-full cursor-pointer transition-all duration-200
            hover:scale-110 hover:shadow-md
            ${selectedColor === color ? 'ring-2 ring-blue-500 scale-110' : ''}
          `}
          style={{ backgroundColor: color }}
          title={color}
        />
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
                        color: selectedColor || AVAILABLE_ICONS.find(i => i.name === selectedIcon)?.color 
                      }
                    )}
                    <span>{selectedIcon}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Select Color (Optional)</label>
                <ColorPickerGrid />
                {selectedColor && (
                  <div className="mt-2 p-2 bg-gray-50 rounded flex items-center gap-2">
                    <span>Selected color:</span>
                    <div 
                      className="w-6 h-6 rounded-full" 
                      style={{ backgroundColor: selectedColor }}
                    ></div>
                    <span>{selectedColor}</span>
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