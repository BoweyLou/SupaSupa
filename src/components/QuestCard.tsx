// src/components/QuestCard.tsx
// Quest Card component: Displays a task card with title, description, points reward, and role-based actions.
// This component is based on the QuestCardFeature.md plan and will serve as the UI element for tasks in the dashboard.
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Award, Zap } from 'lucide-react';
import { updateTask, deleteTask } from '@/repositories/tasksRepository';
import StarDisplay from './StarDisplay';
import { getIconByName } from './IconSelector';
import { useTheme } from '@/contexts/ThemeContext';
import IconSelector from './IconSelector';
import { createPortal } from 'react-dom';

export interface Quest {
  id: string;
  title: string;
  description: string;
  points: number;
  frequency?: string; // e.g., daily, weekly, one-off
  status: 'assigned' | 'in-progress' | 'pending' | 'completed' | 'failed';
  assignedChildId?: string;
  completedAt?: string; // Optional property to track the date the task was completed
  // New properties for brutalist design
  icon?: string; // Icon name for the quest
  customColors?: {
    borderColor?: string;
    backgroundColor?: string;
    shadowColor?: string;
  };
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
  const { theme } = useTheme();
  
  // New state for brutalist design
  const [selectedIcon, setSelectedIcon] = useState<string>(quest.icon || 'CheckCircle');
  const [customBorderColor, setCustomBorderColor] = useState(quest.customColors?.borderColor || '');
  const [customBgColor, setCustomBgColor] = useState(quest.customColors?.backgroundColor || '');
  const [customShadowColor, setCustomShadowColor] = useState(quest.customColors?.shadowColor || '');

  // Add ref for the title element
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Add effect to log computed styles after render
  useEffect(() => {
    if (titleRef.current) {
      const styles = window.getComputedStyle(titleRef.current);
      console.log('QuestCard - Title computed styles:', {
        marginLeft: styles.marginLeft,
        marginTop: styles.marginTop,
        width: styles.width,
        padding: styles.padding,
        paddingLeft: styles.paddingLeft,
        paddingRight: styles.paddingRight,
        textAlign: styles.textAlign,
        display: styles.display,
        position: styles.position
      });
    }
    
    if (cardRef.current) {
      const brutalistCardTitle = cardRef.current.querySelector('.brutalist-card__title');
      if (brutalistCardTitle) {
        console.log('QuestCard - brutalist-card__title class element found:', brutalistCardTitle);
        const styles = window.getComputedStyle(brutalistCardTitle as Element);
        console.log('QuestCard - .brutalist-card__title class computed styles:', {
          marginLeft: styles.marginLeft,
          marginTop: styles.marginTop,
          width: styles.width,
          padding: styles.padding,
          paddingLeft: styles.paddingLeft,
          paddingRight: styles.paddingRight
        });
      } else {
        console.log('QuestCard - No .brutalist-card__title class element found');
      }
    }
  }, []);

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
    
    // Prepare custom colors object
    const customColors = {
      borderColor: customBorderColor || undefined,
      backgroundColor: customBgColor || undefined,
      shadowColor: customShadowColor || undefined
    };
    
    try {
      const payload = {
        title: editTitle,
        description: editDescription,
        reward_points: points,
        frequency: editFrequency,
        icon: selectedIcon,
        custom_colors: Object.values(customColors).some(Boolean) ? customColors : undefined
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

  // Get the icon component
  const IconComponent = getIconByName(quest.icon || 'CheckCircle');
  
  // Apply custom colors or use theme defaults
  const cardStyle = {
    '--brutalist-card-border-color': quest.customColors?.borderColor || theme.borderColor,
    '--brutalist-card-bg-color': quest.customColors?.backgroundColor || theme.backgroundColor,
    '--brutalist-card-shadow-color': quest.customColors?.shadowColor || theme.shadowColor,
  } as React.CSSProperties;

  // Get status display
  const getStatusDisplay = () => {
    switch (quest.status) {
      case 'pending':
        return <div className="brutalist-card__status brutalist-card__status--pending">PENDING APPROVAL</div>;
      case 'completed':
        return <div className="brutalist-card__status brutalist-card__status--awarded">COMPLETED</div>;
      case 'failed':
        return <div className="brutalist-card__status brutalist-card__status--unavailable">FAILED</div>;
      default:
        return null;
    }
  };

  // Get the background color for gradient
  const bgColor = quest.customColors?.backgroundColor || theme.backgroundColor;
  
  // Function to create a transparent version of a color (currently unused)
  // const getTransparentColor = (color: string) => {
  //   if (color.startsWith('rgb')) {
  //     return color.replace(/rgba?\(([^)]+)\)/, 'rgba($1, 0)');
  //   }
  //   return color;
  // };
  
  // const transparentBgColor = getTransparentColor(bgColor);
  
  // Get the card background color based on theme
  const cardBgColor = document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff';
  
  // Check if dark mode is enabled
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div className="brutalist-card brutalist-card--themed" style={cardStyle} ref={cardRef}>
      <div 
        className="brutalist-card__header-wrapper" 
        style={{
          background: `linear-gradient(180deg, ${bgColor} 0%, ${bgColor} 30%, ${cardBgColor} 100%)`,
          height: '180px',
          marginBottom: '-40px'
        }}
      >
        <div className="brutalist-card__header">
          <div 
            className="brutalist-card__icon" 
            style={{ 
              left: '50%', 
              transform: 'translateX(-50%)', 
              top: '-10px',
              width: '72px',
              height: '72px'
            }}
          >
            <IconComponent />
          </div>
          <h3 
            ref={titleRef}
            className="" 
            style={{ 
              marginLeft: '0', 
              marginTop: '70px', 
              textAlign: 'center',
              width: '100%',
              padding: '0 1.5rem',
              fontWeight: 500,
              color: isDarkMode ? '#f9fafb' : '#1f2937', 
              fontSize: '1.5rem',
              position: 'relative',
              zIndex: 1
            }}
          >
            {quest.title}
          </h3>
        </div>
      </div>
      
      <div className="brutalist-card__message" style={{ marginTop: '50px' }}>{quest.description}</div>
      
      <div className="brutalist-card__stars">
        <StarDisplay 
          points={quest.points} 
          size="lg"
        />
        <div className="brutalist-card__points">{quest.points} pts</div>
      </div>
      
      {userRole === 'parent' && (
        <div className="brutalist-card__info">
          {quest.frequency && (
            <div className="brutalist-card__info-item">
              <Zap size={16} />
              <span><strong>Frequency:</strong> {quest.frequency}</span>
            </div>
          )}
          <div className="brutalist-card__info-item">
            <Award size={16} />
            <span><strong>Status:</strong> {quest.status}</span>
          </div>
          {quest.assignedChildId && childNameMapping && (
            <div className="brutalist-card__info-item">
              <Award size={16} />
              <span>
                <strong>Assigned to:</strong> {childNameMapping[quest.assignedChildId] || 'Unknown'}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="brutalist-card__actions">
        {!hideActions && userRole === 'child' && quest.status === 'assigned' && (
          <button
            className="brutalist-card__button brutalist-card__button--claim"
            onClick={handleComplete}
          >
            I DID IT
          </button>
        )}

        {!hideActions && userRole === 'parent' && (
          <>
            {quest.status === 'pending' && (
              <div className="flex gap-2">
                <button
                  className="brutalist-card__button brutalist-card__button--approve"
                  onClick={handleApprove}
                >
                  APPROVE
                </button>
                <button
                  className="brutalist-card__button brutalist-card__button--reject"
                  onClick={handleReject}
                >
                  REJECT
                </button>
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleOpenEditModal}
                className="brutalist-card__button"
                title="Edit"
              >
                EDIT
              </button>
              <button
                onClick={handleDelete}
                className="brutalist-card__button brutalist-card__button--reject"
                title="Delete"
              >
                DELETE
              </button>
            </div>
          </>
        )}
        
        {getStatusDisplay()}
      </div>

      {showCelebration && (
        <div className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center pointer-events-none animate-fadeInOut z-40">
          <span className="text-4xl">🎉 QUEST COMPLETED! 🎉</span>
        </div>
      )}

      {isEditModalOpen && typeof window === 'object' && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="brutalist-modal max-w-md w-[95%] max-h-[90vh] overflow-y-auto m-2 p-4 relative">
            <h2 className="brutalist-modal__title">Edit Quest</h2>
            {editError && <p className="text-red-500 mb-4">{editError}</p>}
            <form onSubmit={handleEditSubmit} className="space-y-4 pb-4">
              <div>
                <label className="brutalist-modal__label">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  className="brutalist-modal__input"
                />
              </div>
              <div>
                <label className="brutalist-modal__label">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  required
                  className="brutalist-modal__input"
                />
              </div>
              <div>
                <label className="brutalist-modal__label">Reward Points</label>
                <input
                  type="number"
                  value={editRewardPoints}
                  onChange={(e) => setEditRewardPoints(e.target.value)}
                  required
                  className="brutalist-modal__input"
                />
              </div>
              
              {/* Icon selection */}
              <IconSelector 
                selectedIcon={selectedIcon}
                onSelectIcon={setSelectedIcon}
              />
              
              {/* Custom colors */}
              <div>
                <label className="brutalist-modal__label">Custom Colors (Optional)</label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-sm">Border</label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        value={customBorderColor || theme.borderColor}
                        onChange={(e) => setCustomBorderColor(e.target.value)}
                        className="w-8 h-8 border-2 border-black"
                      />
                      <button
                        type="button"
                        onClick={() => setCustomBorderColor('')}
                        className="ml-1 text-xs underline"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm">Background</label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        value={customBgColor || theme.backgroundColor}
                        onChange={(e) => setCustomBgColor(e.target.value)}
                        className="w-8 h-8 border-2 border-black"
                      />
                      <button
                        type="button"
                        onClick={() => setCustomBgColor('')}
                        className="ml-1 text-xs underline"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm">Shadow</label>
                    <div className="flex items-center">
                      <input
                        type="color"
                        value={customShadowColor || theme.shadowColor}
                        onChange={(e) => setCustomShadowColor(e.target.value)}
                        className="w-8 h-8 border-2 border-black"
                      />
                      <button
                        type="button"
                        onClick={() => setCustomShadowColor('')}
                        className="ml-1 text-xs underline"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="brutalist-modal__label">Frequency</label>
                <select
                  value={editFrequency}
                  onChange={(e) => setEditFrequency(e.target.value)}
                  className="brutalist-modal__input"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="one-off">One-off</option>
                </select>
              </div>
              <div className="flex justify-end space-x-2 sticky bottom-0 pt-4 bg-inherit">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="brutalist-card__button"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="brutalist-card__button brutalist-card__button--primary"
                >
                  {editLoading ? 'SAVING...' : 'SAVE'}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="brutalist-card__button brutalist-card__button--reject"
                >
                  DELETE
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default QuestCard; 