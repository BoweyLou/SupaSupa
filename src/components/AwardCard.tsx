// src/components/AwardCard.tsx
// Award Card component: Displays an award with title, description, points, and allows for claiming if not awarded.
"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Clock, RefreshCw, Users } from 'lucide-react';
import StarDisplay from './StarDisplay';
import { getIconByName } from './IconSelector';
import { useTheme } from '@/contexts/ThemeContext';
import IconSelector from './IconSelector';
import { createPortal } from 'react-dom';

export interface Award {
  id: string;
  title: string;
  description?: string;
  points: number;
  awarded: boolean; // indicates whether the award has been claimed
  familyId: string; // new property to associate an award with a family
  // New properties for enhanced award system
  allowedChildrenIds?: string[]; // Array of child IDs who can see/redeem the award
  redemptionLimit?: number | null; // null means unlimited
  redemptionCount?: number; // Current redemption count
  lockoutPeriod?: number; // Duration value
  lockoutUnit?: 'days' | 'weeks'; // Unit for lockout period
  lastRedeemedAt?: string; // ISO date string
  // Computed properties for UI
  isAvailable?: boolean; // Whether the award is currently available
  availableAfter?: string; // Human-readable date/time when award will be available
  remainingRedemptions?: number; // Number of redemptions remaining
  // New properties for brutalist design
  icon?: string; // Icon name for the award
  customColors?: {
    lowerGradientColor?: string;
    backgroundColor?: string;
    shadowColor?: string;
  };
}

export interface AwardCardProps {
  award: Award;
  // Callback when the award claim action is triggered (child view)
  onClaim?: (awardId: string) => void;
  // If true, the component is used in the parent view and will show edit/delete actions
  isParentView?: boolean;
  // Callbacks for admin actions (parent view)
  onEdit?: (awardId: string, updatedAward: { 
    title: string, 
    description?: string, 
    points: number,
    allowedChildrenIds?: string[],
    redemptionLimit?: number | null,
    lockoutPeriod?: number,
    lockoutUnit?: 'days' | 'weeks',
    icon?: string,
    customColors?: {
      lowerGradientColor?: string;
      backgroundColor?: string;
      shadowColor?: string;
    }
  }) => void;
  onDelete?: (awardId: string) => void;
  // New callback for reviving a fully redeemed award
  onRevive?: (awardId: string) => void;
  hideActions?: boolean;
  currentFamilyId?: string; // current user's family id
  childAccounts?: Array<{ id: string, name: string }>; // Available child accounts for selection
  currentChildId?: string; // ID of the current child viewing the award
}

// Update the gradient presets to have separate colors instead of full gradient strings
const gradientPresets = [
  { id: 'none', name: 'None', value: '', colors: { start: '', end: '' } },
  { id: 'pastel-blue', name: 'Pastel Blue', value: 'linear-gradient(0deg, #a8c0ff 0%, #3f87a6 100%)', colors: { start: '#a8c0ff', end: '#3f87a6' } },
  { id: 'pastel-green', name: 'Pastel Green', value: 'linear-gradient(0deg, #c9ffbf 0%, #80cbc4 100%)', colors: { start: '#c9ffbf', end: '#80cbc4' } },
  { id: 'pastel-pink', name: 'Pastel Pink', value: 'linear-gradient(0deg, #ffdde1 0%, #ee9ca7 100%)', colors: { start: '#ffdde1', end: '#ee9ca7' } },
  { id: 'pastel-yellow', name: 'Pastel Yellow', value: 'linear-gradient(0deg, #ffecd2 0%, #fcb69f 100%)', colors: { start: '#ffecd2', end: '#fcb69f' } },
  { id: 'pastel-purple', name: 'Pastel Purple', value: 'linear-gradient(0deg, #e2c9ff 0%, #a16bff 100%)', colors: { start: '#e2c9ff', end: '#a16bff' } },
  { id: 'pastel-orange', name: 'Pastel Orange', value: 'linear-gradient(0deg, #fcf6bd 0%, #ff9d74 100%)', colors: { start: '#fcf6bd', end: '#ff9d74' } },
];

const AwardCard: React.FC<AwardCardProps> = ({ 
  award, 
  onClaim, 
  currentFamilyId, 
  isParentView = false, 
  onEdit, 
  onDelete, 
  onRevive,
  hideActions = false, 
  childAccounts = [],
  currentChildId
}) => {
  // Initialize hooks unconditionally
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(award.title);
  const [editDescription, setEditDescription] = useState(award.description || '');
  const [editPoints, setEditPoints] = useState(award.points.toString());
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const { theme } = useTheme();
  
  // New state variables for enhanced award features
  const [selectedChildren, setSelectedChildren] = useState<string[]>(award.allowedChildrenIds || []);
  const [redemptionType, setRedemptionType] = useState<'once' | 'unlimited' | 'custom'>(
    award.redemptionLimit === null ? 'unlimited' : 
    award.redemptionLimit === 1 ? 'once' : 'custom'
  );
  const [customRedemptionLimit, setCustomRedemptionLimit] = useState(
    (award.redemptionLimit && award.redemptionLimit > 1) ? award.redemptionLimit.toString() : '2'
  );
  const [lockoutPeriod, setLockoutPeriod] = useState(award.lockoutPeriod?.toString() || '');
  const [lockoutUnit, setLockoutUnit] = useState<'days' | 'weeks'>(award.lockoutUnit || 'days');
  
  // New state for brutalist design
  const [selectedIcon, setSelectedIcon] = useState<string>(award.icon || 'Award');
  
  // Updated: Replace color state with selected gradient preset
  const [selectedGradient, setSelectedGradient] = useState<string>(
    award.customColors?.lowerGradientColor || ''
  );
  
  const [customBgColor, setCustomBgColor] = useState(award.customColors?.backgroundColor || '');
  const [customShadowColor, setCustomShadowColor] = useState(award.customColors?.shadowColor || '');

  // Add refs - MOVED UP BEFORE ANY CONDITIONAL RETURNS
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Add state to track if the award has been updated
  const [updatedAward, setUpdatedAward] = useState<Award>(award);
  
  // Update local state when award prop changes
  useEffect(() => {
    setUpdatedAward(award);
    setSelectedGradient(award.customColors?.lowerGradientColor || '');
    setCustomBgColor(award.customColors?.backgroundColor || '');
    setCustomShadowColor(award.customColors?.shadowColor || '');
    setSelectedIcon(award.icon || 'Award');
  }, [award]);

  // Check if award is visible to current child
  const shouldRenderAward = currentFamilyId ? award.familyId === currentFamilyId : true;
  const isVisibleToChild = !currentChildId || 
    !award.allowedChildrenIds || 
    award.allowedChildrenIds.length === 0 || 
    award.allowedChildrenIds.includes(currentChildId);
  
  // Calculate if award is in lockout period
  const [isInLockout, lockoutEndDate] = useMemo(() => {
    if (!award.lastRedeemedAt || !award.lockoutPeriod) {
      return [false, null];
    }
    
    const lastRedeemed = new Date(award.lastRedeemedAt);
    const now = new Date();
    
    // Calculate lockout end date
    const lockoutEnd = new Date(lastRedeemed);
    if (award.lockoutUnit === 'weeks') {
      lockoutEnd.setDate(lockoutEnd.getDate() + (award.lockoutPeriod * 7));
    } else {
      lockoutEnd.setDate(lockoutEnd.getDate() + award.lockoutPeriod);
    }
    
    return [now < lockoutEnd, lockoutEnd];
  }, [award.lastRedeemedAt, award.lockoutPeriod, award.lockoutUnit]);
  
  // Format lockout end date for display
  const formatLockoutDate = (date: Date | null) => {
    if (!date) return '';
    
    const now = new Date();
    const diffTime = Math.abs(date.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      // Calculate hours
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    }
    
    return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  };
  
  // Calculate remaining redemptions
  const remainingRedemptions = useMemo(() => {
    // If already awarded, show 0 remaining redemptions
    if (award.awarded) return 0;
    if (award.redemptionLimit === null) return null; // Unlimited
    if (award.redemptionLimit === undefined) return null; // Not set
    return Math.max(0, award.redemptionLimit - (award.redemptionCount || 0));
  }, [award.redemptionLimit, award.redemptionCount, award.awarded]);
  
  // Check if award is available for redemption
  const isAvailableForRedemption = useMemo(() => {
    // Not available if already fully redeemed
    if (remainingRedemptions !== null && remainingRedemptions <= 0) {
      return false;
    }
    
    // Not available if in lockout period
    if (isInLockout) {
      return false;
    }
    
    // Not available if not visible to current child
    if (currentChildId && !isVisibleToChild) {
      return false;
    }
    
    return true;
  }, [remainingRedemptions, isInLockout, isVisibleToChild, currentChildId]);

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditLoading(true);
    const parsedPoints = parseInt(editPoints, 10);
    if (isNaN(parsedPoints)) {
      setEditError('Points must be a valid number.');
      setEditLoading(false);
      return;
    }
    
    // Validate custom redemption limit if selected
    let finalRedemptionLimit: number | null = 1; // Default to once
    if (redemptionType === 'unlimited') {
      finalRedemptionLimit = null;
    } else if (redemptionType === 'custom') {
      const limit = parseInt(customRedemptionLimit, 10);
      if (isNaN(limit) || limit < 1) {
        setEditError('Redemption limit must be a valid number greater than 0.');
        setEditLoading(false);
        return;
      }
      finalRedemptionLimit = limit;
    }
    
    // Validate lockout period if provided
    let finalLockoutPeriod: number | undefined = undefined;
    if (lockoutPeriod && lockoutPeriod.trim() !== '') {
      const period = parseInt(lockoutPeriod, 10);
      if (isNaN(period) || period < 1) {
        setEditError('Lockout period must be a valid number greater than 0.');
        setEditLoading(false);
        return;
      }
      finalLockoutPeriod = period;
    }
    
    // Prepare custom colors object - using selected gradient
    const customColors = {
      lowerGradientColor: selectedGradient || undefined,
      backgroundColor: customBgColor || undefined,
      shadowColor: customShadowColor || undefined
    };
    
    try {
      if (onEdit) {
        const updatedAwardData = { 
          title: editTitle, 
          description: editDescription, 
          points: parsedPoints,
          allowedChildrenIds: selectedChildren.length > 0 ? selectedChildren : undefined,
          redemptionLimit: finalRedemptionLimit,
          lockoutPeriod: finalLockoutPeriod,
          lockoutUnit: lockoutUnit,
          icon: selectedIcon,
          customColors: Object.values(customColors).some(Boolean) ? customColors : undefined
        };
        
        await onEdit(award.id, updatedAwardData);
        
        // Immediately update the local state with the new values
        setUpdatedAward({
          ...updatedAward,
          title: editTitle,
          description: editDescription,
          points: parsedPoints,
          allowedChildrenIds: selectedChildren.length > 0 ? selectedChildren : undefined,
          redemptionLimit: finalRedemptionLimit,
          lockoutPeriod: finalLockoutPeriod,
          lockoutUnit: lockoutUnit,
          icon: selectedIcon,
          customColors: Object.values(customColors).some(Boolean) ? customColors : undefined
        });
      }
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating award:', err);
      setEditError('An unexpected error occurred.');
    }
    setEditLoading(false);
  };

  // Get the icon component - update to use updatedAward
  const IconComponent = useMemo(() => {
    return getIconByName(updatedAward.icon || 'Award');
  }, [updatedAward.icon]);

  // Add effect to log computed styles after render - MOVED UP BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => {
    if (titleRef.current) {
      const styles = window.getComputedStyle(titleRef.current);
      console.log('AwardCard - Title computed styles:', {
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
        console.log('AwardCard - brutalist-card__title class element found:', brutalistCardTitle);
        const styles = window.getComputedStyle(brutalistCardTitle as Element);
        console.log('AwardCard - .brutalist-card__title class computed styles:', {
          marginLeft: styles.marginLeft,
          marginTop: styles.marginTop,
          width: styles.width,
          padding: styles.padding,
          paddingLeft: styles.paddingLeft,
          paddingRight: styles.paddingRight
        });
      } else {
        console.log('AwardCard - No .brutalist-card__title class element found');
      }
    }
  }, []);

  // Only render if the award should be visible - MOVED AFTER ALL HOOKS
  if (!shouldRenderAward || (currentChildId && !isVisibleToChild)) {
    return null;
  }

  // Update cardStyle to use updatedAward
  const cardStyle = {
    '--brutalist-card-border-color': theme.borderColor,
    '--brutalist-card-bg-color': updatedAward.customColors?.backgroundColor || theme.backgroundColor,
    '--brutalist-card-shadow-color': updatedAward.customColors?.shadowColor || theme.shadowColor,
  } as React.CSSProperties;

  // Get the background color for gradient - update to use updatedAward
  const bgColor = updatedAward.customColors?.backgroundColor || theme.backgroundColor;
  
  // Get the card background color based on theme
  const cardBgColor = document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff';
  
  // Check if dark mode is enabled
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Add this helper function before the return statement
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

  return (
    <div className="brutalist-card brutalist-card--themed" style={cardStyle} ref={cardRef}>
      {/* Apply background color with a gradient fade from bottom to top */}
      <div 
        className="brutalist-card__header-wrapper" 
        style={{
          background: updatedAward.customColors?.lowerGradientColor 
            ? getGradientStyle(updatedAward.customColors.lowerGradientColor)
            : `linear-gradient(to top, ${bgColor} 0%, ${bgColor} 60%, ${cardBgColor} 100%)`,
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          // Remove fixed height to allow proper scaling with content
          pointerEvents: 'none' // Ensure clicks pass through to elements below
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
            width: '72px',
            height: '72px',
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
          className="" 
          style={{ 
            marginLeft: '0', 
            marginTop: '100px', 
            textAlign: 'center',
            width: '100%',
            padding: '0 1.5rem',
            fontWeight: 500,
            color: isDarkMode ? '#f9fafb' : '#1f2937', 
            fontSize: '1.5rem',
            position: 'relative',
            zIndex: 2,
            textShadow: '0 0 1px white, 0 0 2px white'
          }}
        >
          {updatedAward.title}
        </h3>
      </div>
      
      {updatedAward.description && (
        <div 
          className="brutalist-card__message" 
          style={{ 
            marginTop: '10px', 
            position: 'relative', 
            zIndex: 2,
            textShadow: '0 0 1px white, 0 0 2px white'
          }}
        >
          {updatedAward.description}
        </div>
      )}
      
      <div className="brutalist-card__stars" style={{ marginTop: updatedAward.description ? '15px' : '30px', position: 'relative', zIndex: 2 }}>
        <StarDisplay 
          points={updatedAward.points} 
          size="lg"
        />
        <div className="brutalist-card__points">{updatedAward.points} pts</div>
      </div>
      
      {/* Display redemption and lockout information */}
      {(updatedAward.redemptionLimit !== undefined || isInLockout || updatedAward.allowedChildrenIds?.length) && (
        <div className="brutalist-card__info">
          {updatedAward.redemptionLimit !== null && (
            <div className="brutalist-card__info-item">
              <RefreshCw size={16} />
              {remainingRedemptions !== null && remainingRedemptions > 0 ? (
                <span>
                  {remainingRedemptions} of {updatedAward.redemptionLimit} redemption{updatedAward.redemptionLimit !== 1 ? 's' : ''} remaining
                </span>
              ) : (
                <span>No redemptions remaining</span>
              )}
            </div>
          )}
          
          {isInLockout && lockoutEndDate && (
            <div className="brutalist-card__info-item">
              <Clock size={16} />
              <span>Available in {formatLockoutDate(lockoutEndDate)}</span>
            </div>
          )}
          
          {updatedAward.allowedChildrenIds && updatedAward.allowedChildrenIds.length > 0 && isParentView && (
            <div className="brutalist-card__info-item">
              <Users size={16} />
              <span>Limited to {updatedAward.allowedChildrenIds.length} child{updatedAward.allowedChildrenIds.length !== 1 ? 'ren' : ''}</span>
            </div>
          )}
        </div>
      )}

      <div className="brutalist-card__actions">
        {!updatedAward.awarded && !hideActions && isAvailableForRedemption && (
          isParentView ? (
            onEdit && onDelete && (
              <div className="flex gap-2">
                <button
                  className="brutalist-card__button"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  EDIT
                </button>
                <button
                  className="brutalist-card__button brutalist-card__button--reject"
                  onClick={() => onDelete(updatedAward.id)}
                >
                  DELETE
                </button>
              </div>
            )
          ) : (
            onClaim && (
              <button
                className="brutalist-card__button brutalist-card__button--claim"
                onClick={() => onClaim(updatedAward.id)}
              >
                CLAIM AWARD
              </button>
            )
          )
        )}
        
        {/* Show unavailable message if in lockout or fully redeemed */}
        {!updatedAward.awarded && !isAvailableForRedemption && (
          <div className="brutalist-card__status brutalist-card__status--unavailable">
            {isInLockout ? 
              `AVAILABLE IN ${formatLockoutDate(lockoutEndDate)}` : 
              remainingRedemptions !== null && remainingRedemptions <= 0 ?
              'FULLY REDEEMED' : 
              'NOT AVAILABLE'
            }
            {/* Add REVIVE button for parent view when award is fully redeemed but not in lockout */}
            {isParentView && !isInLockout && remainingRedemptions !== null && remainingRedemptions <= 0 && onRevive && (
              <button
                className="brutalist-card__button brutalist-card__button--claim mt-2"
                onClick={() => onRevive(updatedAward.id)}
              >
                REVIVE AWARD
              </button>
            )}
          </div>
        )}
        
        {updatedAward.awarded && (
          <div className="brutalist-card__status brutalist-card__status--awarded">
            AWARDED!
            {/* Add REVIVE button for awarded awards in parent view */}
            {isParentView && onRevive && (
              <button
                className="brutalist-card__button brutalist-card__button--claim mt-2 relative z-[3]"
                onClick={() => onRevive(updatedAward.id)}
              >
                REVIVE AWARD
              </button>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal for Award */}
      {isEditModalOpen && typeof window === 'object' && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="brutalist-modal max-w-md w-[95%] max-h-[90vh] overflow-y-auto m-2 p-4 relative">
            <h2 className="brutalist-modal__title">Edit Award</h2>
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
                  className="brutalist-modal__input"
                />
              </div>
              <div>
                <label className="brutalist-modal__label">Points</label>
                <input
                  type="number"
                  value={editPoints}
                  onChange={(e) => setEditPoints(e.target.value)}
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
              
              {/* Child selection */}
              {childAccounts && childAccounts.length > 0 && (
                <div>
                  <label className="brutalist-modal__label">Visible to</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 border-3 border-black">
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
                <label className="brutalist-modal__label">Redemption Limit</label>
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
                      className="ml-2 p-1 w-16 border-2 border-black"
                    />
                    times
                  </label>
                </div>
              </div>
              
              {/* Lockout period */}
              <div>
                <label className="brutalist-modal__label">Lockout Period</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={lockoutPeriod}
                    onChange={(e) => setLockoutPeriod(e.target.value)}
                    min="0"
                    placeholder="No lockout"
                    className="brutalist-modal__input w-20 mr-2"
                  />
                  <select
                    value={lockoutUnit}
                    onChange={(e) => setLockoutUnit(e.target.value as 'days' | 'weeks')}
                    className="brutalist-modal__input"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for no lockout period
                </p>
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
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AwardCard; 