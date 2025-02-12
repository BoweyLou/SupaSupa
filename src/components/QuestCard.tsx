// src/components/QuestCard.tsx
// Quest Card component: Displays a task card with title, description, points reward, and role-based actions.
// This component is based on the QuestCardFeature.md plan and will serve as the UI element for tasks in the dashboard.
import React, { useState, useEffect } from 'react';
import { Award, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { updateTask, deleteTask } from '@/repositories/tasksRepository';

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
    <div style={{
      position: 'relative',
      border: '2px solid #f9c74f',
      borderRadius: '12px',
      padding: '16px',
      margin: '8px 0',
      background: 'linear-gradient(45deg, #fff9f0, #fff4e6)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.2s ease-in-out'
    }}>
      {/* Updated Header: Include Award icon with quest title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Award size={36} color="#f9c74f" style={{ marginRight: '8px' }} />
          <h3 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>{quest.title}</h3>
        </div>
        <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.2rem', fontWeight: 'bold', color: '#f9c74f', display: 'flex', alignItems: 'center' }}>
          <Zap size={20} color="#f9c74f" style={{ marginRight: '4px' }} />
          {quest.points} pts
        </span>
      </div>
      {/* Content: Description and Frequency/Status/Assignment based on userRole */}
      <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1rem', color: '#333', margin: '4px 0' }}>{quest.description}</p>
      {userRole === 'parent' && (
        <>
          {quest.frequency && (
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.95rem', color: '#555', margin: '4px 0' }}>
              <strong>Frequency:</strong> {quest.frequency}
            </p>
          )}
          <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.95rem', color: '#555', margin: '4px 0' }}>
            <strong>Status:</strong> {quest.status}
          </p>
          {quest.assignedChildId && (
            <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.95rem', color: '#555', margin: '4px 0' }}>
              <strong>Assigned to:</strong> {childNameMapping ? (childNameMapping[quest.assignedChildId] || quest.assignedChildId) : quest.assignedChildId}
            </p>
          )}
        </>
      )}
      {/* Role-based actions */}
      {!hideActions && userRole === 'child' && quest.status === 'assigned' && (
        <button
          style={{
            width: '100%',
            fontFamily: 'Poppins, sans-serif',
            fontSize: '1rem',
            padding: '8px 12px',
            backgroundColor: '#f9c74f',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
          onClick={handleComplete}
        >
          I did it
        </button>
      )}
      {!hideActions && userRole === 'parent' && (
        <div style={{ marginTop: '8px', display: 'flex', gap: '8px', width: '100%' }}>
          {quest.status === 'pending' && (
            <>
              <button
                style={{
                  flex: 1,
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '1rem',
                  padding: '8px 12px',
                  backgroundColor: '#f9c74f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={handleApprove}
              >
                Approve
              </button>
              <button
                style={{
                  flex: 1,
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '1rem',
                  padding: '8px 12px',
                  backgroundColor: '#ddd',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={handleReject}
              >
                Reject
              </button>
            </>
          )}
          <button
            style={{
              flex: 1,
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1rem',
              padding: '8px 12px',
              backgroundColor: '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={handleOpenEditModal}
          >
            Edit
          </button>
          <button
            style={{
              flex: 1,
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1rem',
              padding: '8px 12px',
              backgroundColor: '#f44336',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      )}
      {/* Celebration overlay for gamification feedback */}
      {showCelebration && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          animation: 'fadeInOut 3s ease-in-out'
        }}>
          <span style={{ fontSize: '24px', color: '#f9c74f' }}>🎉 Quest Completed! 🎉</span>
        </div>
      )}
      {/* Edit Modal for Parent */}
      {isEditModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor:'rgba(0, 0, 0, 0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 50 }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px' }}>
            <h2>Edit Quest</h2>
            {editError && <p style={{ color: 'red' }}>{editError}</p>}
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Title</label>
                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required style={{ width:'100%', padding:'8px', border: '1px solid #ccc', borderRadius:'4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Description</label>
                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} required style={{ width:'100%', padding:'8px', border: '1px solid #ccc', borderRadius:'4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Reward Points</label>
                <input type="number" value={editRewardPoints} onChange={(e) => setEditRewardPoints(e.target.value)} required style={{ width:'100%', padding:'8px', border: '1px solid #ccc', borderRadius:'4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Frequency</label>
                <select value={editFrequency} onChange={(e) => setEditFrequency(e.target.value)} style={{ width:'100%', padding:'8px', border: '1px solid #ccc', borderRadius:'4px' }}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="one-off">One-off</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap:'10px' }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding:'8px 12px', backgroundColor:'#ccc', border:'none', borderRadius:'4px', cursor:'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={editLoading} style={{ padding:'8px 12px', backgroundColor:'#4CAF50', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer' }}>
                  {editLoading ? 'Saving...' : 'Save'}
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
      `}</style>
    </div>
  );
};

export default QuestCard; 