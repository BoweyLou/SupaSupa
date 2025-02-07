// src/components/QuestCard.tsx
// Quest Card component: Displays a task card with title, description, points reward, and role-based actions.
// This component is based on the QuestCardFeature.md plan and will serve as the UI element for tasks in the dashboard.
import React, { useState, useEffect } from 'react';
import { Award, Zap } from 'lucide-react';

export interface Quest {
  id: string;
  title: string;
  description: string;
  points: number;
  frequency?: string; // e.g., daily, weekly, one-off
  status: 'assigned' | 'in-progress' | 'pending' | 'completed' | 'failed';
}

export interface QuestCardProps {
  quest: Quest;
  userRole: 'parent' | 'child';
  // Callback when the task action is triggered
  onComplete?: (questId: string) => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, userRole, onComplete }) => {
  const [showCelebration, setShowCelebration] = useState(false);

  const handleComplete = () => {
    if (onComplete) onComplete(quest.id);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };

  const handleApprove = () => {
    if (onComplete) onComplete(quest.id);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
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
      {/* Content: Description and Frequency */}
      <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1rem', color: '#333', margin: '4px 0' }}>{quest.description}</p>
      {quest.frequency && <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.95rem', color: '#555', margin: '4px 0' }}><strong>Frequency:</strong> {quest.frequency}</p>}
      {/* Status */}
      <p style={{ fontFamily: 'Poppins, sans-serif', fontSize: '0.95rem', color: '#555', margin: '4px 0' }}><strong>Status:</strong> {quest.status}</p>
      {/* Role-based actions */}
      {userRole === 'child' && (
        <button
          style={{
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
          Complete Task
        </button>
      )}
      {userRole === 'parent' && (
        <div>
          <button
            style={{
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
              fontFamily: 'Poppins, sans-serif',
              fontSize: '1rem',
              padding: '8px 12px',
              backgroundColor: '#ddd',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginLeft: '8px'
            }}
            onClick={() => onComplete && onComplete(quest.id)}
          >
            Reject
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