// src/components/QuestCard.tsx
// Quest Card component: Displays a task card with title, description, points reward, and role-based actions.
// This component is based on the QuestCardFeature.md plan and will serve as the UI element for tasks in the dashboard.
import React, { useState } from 'react';
import { Award, Zap, Settings, Trash } from 'lucide-react';
import { updateTask, deleteTask } from '@/repositories/tasksRepository';
import StarDisplay from './StarDisplay';

export interface Quest {
  id: string;
  title: string;
  description: string;
  points: number;
  frequency?: string; // e.g., daily, weekly, one-off
  status: 'assigned' | 'in-progress' | 'pending' | 'completed' | 'failed';
  assignedChildId?: string;
  completedAt?: string; // Optional property to track the date the task was completed
}

export interface QuestCardProps {
  quest: Quest;
  userRole: 'parent' | 'child';
  // Callback when the task action is triggered
  onComplete?: (questId: string, action?: 'approve' | 'assigned' | 'edit' | 'delete') => void;
  hideActions?: boolean;
  childNameMapping?: { [childId: string]: string };
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, userRole, onComplete, hideActions, childNameMapping }) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(quest.title);
  const [editDescription, setEditDescription] = useState(quest.description);
  const [editRewardPoints, setEditRewardPoints] = useState(quest.points.toString());
  const [editFrequency, setEditFrequency] = useState(quest.frequency || 'daily');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const handleComplete = () => {
    if (onComplete) onComplete(quest.id);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const handleApprove = () => {
    if (onComplete) onComplete(quest.id, 'approve');
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const handleReject = () => {
    if (onComplete) onComplete(quest.id, 'assigned');
  };

  const handleOpenEditModal = () => {
    setEditTitle(quest.title);
    setEditDescription(quest.description);
    setEditRewardPoints(quest.points.toString());
    setEditFrequency(quest.frequency || 'daily');
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditLoading(true);
    const points = parseInt(editRewardPoints, 10);
    if (isNaN(points)) {
      setEditError('Reward points must be a valid number.');
      setEditLoading(false);
      return;
    }
    try {
      const payload = {
        title: editTitle,
        description: editDescription,
        reward_points: points,
        frequency: editFrequency
      };
      await updateTask(quest.id, payload);
      if (onComplete) onComplete(quest.id, 'edit');
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating quest:', err);
      setEditError('An unexpected error occurred.');
    }
    setEditLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this quest?')) return;
    try {
      await deleteTask(quest.id);
      if (onComplete) onComplete(quest.id, 'delete');
    } catch (err) {
      console.error('Error in deleting quest:', err);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Award size={24} className="text-gray-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-800">{quest.title}</h3>
        </div>
        <div className="text-sm font-medium text-gray-600">
          <Zap size={16} className="inline mr-1" />
          {quest.points} pts
        </div>
      </div>
      
      <p className="text-sm text-gray-700 mb-2">{quest.description}</p>
      
      <div className="mt-2 mb-2">
        <StarDisplay 
          points={quest.points} 
          size={64} 
          style={{ 
            filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.8))', 
            fill: '#FFD700',
            stroke: 'none'
          }} 
        />
      </div>
      
      {userRole === 'parent' && (
        <div className="space-y-1">
          {quest.frequency && (
            <p className="text-sm text-gray-600">
              <strong>Frequency:</strong> {quest.frequency}
            </p>
          )}
          <p className="text-sm text-gray-600">
            <strong>Status:</strong> {quest.status}
          </p>
          {quest.assignedChildId && (
            <p className="text-sm text-gray-600">
              <strong>Assigned to:</strong> {childNameMapping && childNameMapping[quest.assignedChildId] ? childNameMapping[quest.assignedChildId] : 'Unknown'}
            </p>
          )}
        </div>
      )}

      {!hideActions && userRole === 'child' && quest.status === 'assigned' && (
        <button
          className="mt-2 w-full py-3 px-4 animated-gradient text-white rounded transition-colors text-base"
          onClick={handleComplete}
        >
          I did it
        </button>
      )}

      {!hideActions && userRole === 'parent' && (
        <div className="mt-2 flex space-x-2">
          {quest.status === 'pending' && (
            <>
              <button
                className="w-full py-1 px-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                onClick={handleApprove}
              >
                Approve
              </button>
              <button
                className="w-full py-1 px-3 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm"
                onClick={handleReject}
              >
                Reject
              </button>
            </>
          )}
          <button
            onClick={handleOpenEditModal}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title="Edit"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 text-red-500 hover:text-red-700 transition-colors"
            title="Delete"
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      )}

      {showCelebration && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center pointer-events-none animate-fadeInOut">
          <span className="text-2xl text-yellow-500">🎉 Quest Completed! 🎉</span>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Quest</h2>
            {editError && <p className="text-red-500 mb-4">{editError}</p>}
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-200 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-200 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reward Points</label>
                <input
                  type="number"
                  value={editRewardPoints}
                  onChange={(e) => setEditRewardPoints(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-200 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Frequency</label>
                <select
                  value={editFrequency}
                  onChange={(e) => setEditFrequency(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="one-off">One-off</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                >
                  {editLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                >
                  Delete Quest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-fadeInOut {
          animation: fadeInOut 3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default QuestCard; 