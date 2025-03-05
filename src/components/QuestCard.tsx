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
import { showToast } from '@/utils/toast';
import dynamic from 'next/dynamic';

// Import confetti with dynamic import to avoid SSR issues
const ReactConfetti = dynamic(() => import('react-confetti'), { ssr: false });

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
    lowerGradientColor?: string;
    backgroundColor?: string;
    shadowColor?: string;
  };
}

// Add gradient presets collection
const gradientPresets = [
  { id: 'none', name: 'None', value: '', colors: { start: '', end: '' } },
  { id: 'pastel-blue', name: 'Pastel Blue', value: 'linear-gradient(0deg, #a8c0ff 0%, #3f87a6 100%)', colors: { start: '#a8c0ff', end: '#3f87a6' } },
  { id: 'pastel-green', name: 'Pastel Green', value: 'linear-gradient(0deg, #c9ffbf 0%, #80cbc4 100%)', colors: { start: '#c9ffbf', end: '#80cbc4' } },
  { id: 'pastel-pink', name: 'Pastel Pink', value: 'linear-gradient(0deg, #ffdde1 0%, #ee9ca7 100%)', colors: { start: '#ffdde1', end: '#ee9ca7' } },
  { id: 'pastel-yellow', name: 'Pastel Yellow', value: 'linear-gradient(0deg, #ffecd2 0%, #fcb69f 100%)', colors: { start: '#ffecd2', end: '#fcb69f' } },
  { id: 'pastel-purple', name: 'Pastel Purple', value: 'linear-gradient(0deg, #e2c9ff 0%, #a16bff 100%)', colors: { start: '#e2c9ff', end: '#a16bff' } },
  { id: 'pastel-orange', name: 'Pastel Orange', value: 'linear-gradient(0deg, #fcf6bd 0%, #ff9d74 100%)', colors: { start: '#fcf6bd', end: '#ff9d74' } },
];

export interface QuestCardProps {
  quest: Quest;
  userRole: 'parent' | 'child';
  // Callback when the task action is triggered
  onComplete?: (questId: string, action?: 'approve' | 'assigned' | 'edit' | 'delete') => void;
  hideActions?: boolean;
  childNameMapping?: { [childId: string]: string };
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, userRole, onComplete, hideActions, childNameMapping }) => {
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
  
  // Replace color picker state with selected gradient preset
  const [selectedGradient, setSelectedGradient] = useState<string>(quest.customColors?.lowerGradientColor || '');
  const [customBgColor, setCustomBgColor] = useState(quest.customColors?.backgroundColor || '');
  const [customShadowColor, setCustomShadowColor] = useState(quest.customColors?.shadowColor || '');
  
  // Add state to track if the quest has been updated
  const [updatedQuest, setUpdatedQuest] = useState<Quest>(quest);

  // Add state for confetti animation
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState<{ width: number; height: number } | null>(null);

  // Add ref for the title element
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Update local state when quest prop changes
  useEffect(() => {
    setUpdatedQuest(quest);
    setSelectedGradient(quest.customColors?.lowerGradientColor || '');
    setCustomBgColor(quest.customColors?.backgroundColor || '');
    setCustomShadowColor(quest.customColors?.shadowColor || '');
    setSelectedIcon(quest.icon || 'CheckCircle');
  }, [quest]);
  
  // For screen size detection
  const [isMobile, setIsMobile] = useState(false);
  
  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 480);
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    // Check on mount
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Hide confetti after 5 seconds
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleComplete = () => {
    if (onComplete) onComplete(quest.id);
    setShowConfetti(true);
    showToast.success(`Great job! Quest "${quest.title}" completed! 🎉`);
  };

  const handleApprove = () => {
    if (onComplete) onComplete(quest.id, 'approve');
    setShowConfetti(true);
    showToast.success(`Quest "${quest.title}" approved! ${quest.points} points awarded! 🌟`);
  };

  const handleReject = () => {
    if (onComplete) onComplete(quest.id, 'assigned');
  };

  const handleOpenEditModal = () => {
    setEditTitle(updatedQuest.title);
    setEditDescription(updatedQuest.description);
    setEditRewardPoints(updatedQuest.points.toString());
    setEditFrequency(updatedQuest.frequency || 'daily');
    setSelectedIcon(updatedQuest.icon || 'CheckCircle');
    setSelectedGradient(updatedQuest.customColors?.lowerGradientColor || '');
    setCustomBgColor(updatedQuest.customColors?.backgroundColor || '');
    setCustomShadowColor(updatedQuest.customColors?.shadowColor || '');
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
    
    // Prepare custom colors object with selected gradient
    const customColors = {
      lowerGradientColor: selectedGradient || undefined,
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
      
      // Immediately update the local state with the new values
      setUpdatedQuest({
        ...updatedQuest,
        title: editTitle,
        description: editDescription,
        points: points,
        frequency: editFrequency,
        icon: selectedIcon,
        customColors: Object.values(customColors).some(Boolean) ? customColors : undefined
      });
      
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
  const IconComponent = getIconByName(updatedQuest.icon || 'CheckCircle');
  
  // Apply custom colors or use theme defaults
  const cardStyle = {
    '--brutalist-card-border-color': theme.borderColor,
    '--brutalist-card-bg-color': updatedQuest.customColors?.backgroundColor || theme.backgroundColor,
    '--brutalist-card-shadow-color': updatedQuest.customColors?.shadowColor || theme.shadowColor,
  } as React.CSSProperties;

  // Get status display
  const getStatusDisplay = () => {
    switch (updatedQuest.status) {
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
  const bgColor = updatedQuest.customColors?.backgroundColor || theme.backgroundColor;
  
  // Get the card background color based on theme
  const cardBgColor = document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff';
  
  // Check if dark mode is enabled
  const isDarkMode = document.documentElement.classList.contains('dark');

  const getGradientStyle = (gradientValue: string) => {
    // Check if this is one of our preset gradients
    const preset = gradientPresets.find(preset => preset.value === gradientValue);
    
    if (preset && preset.colors.start && preset.colors.end) {
      // If it's a preset with start/end colors, create a bottom-to-top gradient
      return `linear-gradient(to top, ${preset.colors.end} 0%, ${preset.colors.start} 100%)`;
    } else if (gradientValue.includes('linear-gradient')) {
      // If it's a full gradient string but not one of our presets, use it directly
      return gradientValue;
    } else {
      // If it's just a color, create a gradient from that color to transparent
      return `linear-gradient(to top, ${gradientValue} 0%, ${gradientValue} 40%, ${cardBgColor} 85%, ${cardBgColor} 100%)`;
    }
  };

  // Adjust maxStarsPerRow based on screen size
  const maxStarsPerRow = isMobile ? 5 : 7;

  return (
    <div className="brutalist-card brutalist-card--themed" style={cardStyle} ref={cardRef}>
      {/* Confetti component */}
      {showConfetti && windowDimensions && (
        <ReactConfetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#FFD700', '#FFA500', '#FF4500', '#FF6347', '#8A2BE2', '#4169E1', '#00BFFF']}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        />
      )}
      
      <div 
        className="brutalist-card__header-wrapper" 
        style={{
          background: updatedQuest.customColors?.lowerGradientColor 
            ? getGradientStyle(updatedQuest.customColors.lowerGradientColor)
            : `linear-gradient(to top, ${bgColor} 0%, ${bgColor} 60%, ${cardBgColor} 100%)`,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          height: '100%', 
          marginBottom: 0,
          zIndex: 0
        }}
      >
      </div>
      
      <div className="brutalist-card__header" style={{ position: 'relative', zIndex: 2, paddingTop: '1.5rem' }}>
        <div 
          className="brutalist-card__icon" 
          style={{ 
            position: 'absolute',
            left: '50%', 
            transform: 'translateX(-50%)', 
            top: '20px',
            width: isMobile ? '50px' : '72px',
            height: isMobile ? '50px' : '72px',
            backgroundColor: isDarkMode ? '#374151' : 'white',
            borderRadius: '50%',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3
          }}
        >
          <div style={{ transform: 'scale(0.95)' }}>
            <IconComponent />
          </div>
        </div>
        <h3 
          ref={titleRef}
          className="brutalist-card__title" 
          style={{ 
            marginTop: isMobile ? '70px' : '100px', 
            fontSize: isMobile ? '1.25rem' : '1.5rem',
            fontWeight: 500,
            color: isDarkMode ? '#f9fafb' : '#1f2937',
            textShadow: '0 0 1px white, 0 0 2px white'
          }}
        >
          {updatedQuest.title}
        </h3>
      </div>
      
      <div 
        className="brutalist-card__message" 
        style={{ 
          padding: isMobile ? '0 1rem' : '0 1.5rem',
          textShadow: '0 0 1px white, 0 0 2px white'
        }}
      >
        {updatedQuest.description}
      </div>
      
      <div className="brutalist-card__stars">
        <StarDisplay 
          points={updatedQuest.points} 
          size={isMobile ? "md" : "lg"}
          maxStarsPerRow={maxStarsPerRow}
        />
        <div className="brutalist-card__points">{updatedQuest.points} pts</div>
      </div>
      
      {userRole === 'parent' && (
        <div className="brutalist-card__info">
          {updatedQuest.frequency && (
            <div className="brutalist-card__info-item">
              <Zap size={16} />
              <span><strong>Frequency:</strong> {updatedQuest.frequency}</span>
            </div>
          )}
          <div className="brutalist-card__info-item">
            <Award size={16} />
            <span><strong>Status:</strong> {updatedQuest.status}</span>
          </div>
          {updatedQuest.assignedChildId && childNameMapping && (
            <div className="brutalist-card__info-item">
              <Award size={16} />
              <span>
                <strong>Assigned to:</strong> {childNameMapping[updatedQuest.assignedChildId] || 'Unknown'}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="brutalist-card__actions">
        {!hideActions && userRole === 'child' && updatedQuest.status === 'assigned' && (
          <button
            className="brutalist-card__button brutalist-card__button--claim"
            onClick={handleComplete}
          >
            I DID IT
          </button>
        )}

        {!hideActions && userRole === 'parent' && (
          <>
            {updatedQuest.status === 'pending' && (
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
              
              {/* Custom colors with gradient presets */}
              <div>
                <label className="brutalist-modal__label">Custom Colors (Optional)</label>
                
                {/* Gradient presets */}
                <div className="mb-4">
                  <label className="text-sm mb-2 block">Gradient</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {gradientPresets.map(preset => (
                      <div 
                        key={preset.id}
                        className={`relative cursor-pointer rounded-md overflow-hidden border-2 transition-all ${selectedGradient === preset.value ? 'border-blue-500 shadow-md' : 'border-gray-200'}`}
                        onClick={() => setSelectedGradient(preset.value)}
                      >
                        <div 
                          className="h-16 w-full" 
                          style={{ 
                            background: preset.value || '#f9fafb',
                            opacity: preset.id === 'none' ? 0.2 : 1
                          }}
                        />
                        <div className="text-xs p-1 bg-white dark:bg-gray-800 text-center">
                          {preset.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
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