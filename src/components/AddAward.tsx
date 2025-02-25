"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Users, RefreshCw, Clock } from 'lucide-react';

// Props for the AddAward component
export interface AddAwardProps {
  onAwardAdded?: () => void; // Callback to refresh awards list after adding a new award
  familyId?: string;         // Current user's family id
  childAccounts?: Array<{ id: string, name: string }>; // Available child accounts for selection
}

const AddAward: React.FC<AddAwardProps> = ({ onAwardAdded, familyId, childAccounts = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [awardName, setAwardName] = useState('');
  const [description, setDescription] = useState('');
  const [costPoints, setCostPoints] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // New state variables for enhanced award features
  const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
  const [redemptionType, setRedemptionType] = useState<'once' | 'unlimited' | 'custom'>('once');
  const [customRedemptionLimit, setCustomRedemptionLimit] = useState('2');
  const [lockoutPeriod, setLockoutPeriod] = useState('');
  const [lockoutUnit, setLockoutUnit] = useState<'days' | 'weeks'>('days');

  // Handler for form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!awardName || !description || !costPoints) {
      setError('All fields are required.');
      return;
    }
    const cost = parseInt(costPoints, 10);
    if (isNaN(cost)) {
      setError('Cost points must be a valid number.');
      return;
    }
    
    // Validate custom redemption limit if selected
    let finalRedemptionLimit: number | null = 1; // Default to once
    if (redemptionType === 'unlimited') {
      finalRedemptionLimit = null;
    } else if (redemptionType === 'custom') {
      const limit = parseInt(customRedemptionLimit, 10);
      if (isNaN(limit) || limit < 1) {
        setError('Redemption limit must be a valid number greater than 0.');
        return;
      }
      finalRedemptionLimit = limit;
    }
    
    // Validate lockout period if provided
    let finalLockoutPeriod: number | undefined = undefined;
    let finalLockoutUnit: 'days' | 'weeks' | undefined = undefined;
    if (lockoutPeriod && lockoutPeriod.trim() !== '') {
      const period = parseInt(lockoutPeriod, 10);
      if (isNaN(period) || period < 1) {
        setError('Lockout period must be a valid number greater than 0.');
        return;
      }
      finalLockoutPeriod = period;
      finalLockoutUnit = lockoutUnit;
    }
    
    setLoading(true);
    setError('');
    try {
      const { error: dbError } = await supabase
        .from('awards')
        .insert([{ 
          title: awardName, 
          description, 
          points: cost, 
          awarded: false, 
          family_id: familyId,
          allowed_children_ids: selectedChildren.length > 0 ? selectedChildren : null,
          redemption_limit: finalRedemptionLimit,
          redemption_count: 0,
          lockout_period: finalLockoutPeriod,
          lockout_unit: finalLockoutUnit
        }]);
      if (dbError) {
        setError(dbError.message);
      } else {
        if (onAwardAdded) onAwardAdded();
        setAwardName('');
        setDescription('');
        setCostPoints('');
        setSelectedChildren([]);
        setRedemptionType('once');
        setCustomRedemptionLimit('2');
        setLockoutPeriod('');
        setLockoutUnit('days');
        setIsModalOpen(false);
      }
    } catch (err: unknown) {
      setError('An unexpected error occurred.');
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Plus card to open modal */}
      <div
        className="cursor-pointer border-2 border-dashed border-gray-300 rounded p-4 flex items-center justify-center text-gray-500 hover:bg-gray-200"
        onClick={() => setIsModalOpen(true)}
      >
        <Plus className="mr-2" /> Add Reward
      </div>

      {/* Modal for adding a new award */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl mb-4">Add New Reward</h2>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Reward Name</label>
                <input
                  type="text"
                  value={awardName}
                  onChange={(e) => setAwardName(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Enter reward name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Enter description"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cost Points</label>
                <input
                  type="number"
                  value={costPoints}
                  onChange={(e) => setCostPoints(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                  placeholder="Enter required points"
                  required
                />
              </div>
              
              {/* Child selection */}
              {childAccounts && childAccounts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <Users size={16} className="inline mr-1" /> Visible to
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded">
                    <div className="mb-2">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedChildren.length === 0}
                          onChange={() => setSelectedChildren([])}
                          className="mr-2"
                        />
                        All children
                      </label>
                    </div>
                    {childAccounts.map(child => (
                      <div key={child.id} className="ml-4">
                        <label className="inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedChildren.includes(child.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedChildren([...selectedChildren, child.id]);
                              } else {
                                setSelectedChildren(selectedChildren.filter(id => id !== child.id));
                              }
                            }}
                            className="mr-2"
                          />
                          {child.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Redemption limit */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <RefreshCw size={16} className="inline mr-1" /> Redemption Limit
                </label>
                <div className="space-y-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="redemptionType"
                      value="once"
                      checked={redemptionType === 'once'}
                      onChange={() => setRedemptionType('once')}
                      className="mr-2"
                    />
                    Once only
                  </label>
                  <br />
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="redemptionType"
                      value="unlimited"
                      checked={redemptionType === 'unlimited'}
                      onChange={() => setRedemptionType('unlimited')}
                      className="mr-2"
                    />
                    Unlimited
                  </label>
                  <br />
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="redemptionType"
                      value="custom"
                      checked={redemptionType === 'custom'}
                      onChange={() => setRedemptionType('custom')}
                      className="mr-2"
                    />
                    Custom:
                    <input
                      type="number"
                      value={customRedemptionLimit}
                      onChange={(e) => setCustomRedemptionLimit(e.target.value)}
                      disabled={redemptionType !== 'custom'}
                      min="1"
                      className="ml-2 p-1 w-16 border border-gray-200 rounded"
                    />
                    times
                  </label>
                </div>
              </div>
              
              {/* Lockout period */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Clock size={16} className="inline mr-1" /> Lockout Period
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={lockoutPeriod}
                    onChange={(e) => setLockoutPeriod(e.target.value)}
                    min="0"
                    placeholder="No lockout"
                    className="p-2 border border-gray-200 rounded w-20 mr-2"
                  />
                  <select
                    value={lockoutUnit}
                    onChange={(e) => setLockoutUnit(e.target.value as 'days' | 'weeks')}
                    className="p-2 border border-gray-200 rounded"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for no lockout period
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
                  {loading ? 'Adding Reward...' : 'Add Reward'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddAward; 