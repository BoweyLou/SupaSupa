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
    borderColor?: string;
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
      borderColor?: string;
      backgroundColor?: string;
      shadowColor?: string;
    }
  }) => void;
  onDelete?: (awardId: string) => void;
  hideActions?: boolean;
  currentFamilyId?: string; // current user's family id
  childAccounts?: Array<{ id: string, name: string }>; // Available child accounts for selection
  currentChildId?: string; // ID of the current child viewing the award
}

const AwardCard: React.FC<AwardCardProps> = ({ 
  award, 
  onClaim, 
  currentFamilyId, 
  isParentView = false, 
  onEdit, 
  onDelete, 
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
  const [customBorderColor, setCustomBorderColor] = useState(award.customColors?.borderColor || '');
  const [customBgColor, setCustomBgColor] = useState(award.customColors?.backgroundColor || '');
  const [customShadowColor, setCustomShadowColor] = useState(award.customColors?.shadowColor || '');

  // Add refs - MOVED UP BEFORE ANY CONDITIONAL RETURNS
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  
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
    if (award.redemptionLimit === null) return null; // Unlimited
    if (award.redemptionLimit === undefined) return null; // Not set
    return Math.max(0, award.redemptionLimit - (award.redemptionCount || 0));
  }, [award.redemptionLimit, award.redemptionCount]);
  
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
    
    // Prepare custom colors object
    const customColors = {
      borderColor: customBorderColor || undefined,
      backgroundColor: customBgColor || undefined,
      shadowColor: customShadowColor || undefined
    };
    
    try {
      if (onEdit) {
        await onEdit(award.id, { 
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

  // Get the icon component
  const IconComponent = useMemo(() => {
    return getIconByName(award.icon || 'Award');
  }, [award.icon]);

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

  // Apply custom colors or use theme defaults
  const cardStyle = {
    '--brutalist-card-border-color': award.customColors?.borderColor || theme.borderColor,
    '--brutalist-card-bg-color': award.customColors?.backgroundColor || theme.backgroundColor,
    '--brutalist-card-shadow-color': award.customColors?.shadowColor || theme.shadowColor,
  } as React.CSSProperties;

  // Get the background color for gradient
  const bgColor = award.customColors?.backgroundColor || theme.backgroundColor;
  
  // Get the card background color based on theme
  const cardBgColor = document.documentElement.classList.contains('dark') ? '#1f2937' : '#ffffff';
  
  // Check if dark mode is enabled
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div className="brutalist-card brutalist-card--themed" style={cardStyle} ref={cardRef}>
      {/* Apply background color only to the header section with a gradient fade */}
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
            {award.title}
          </h3>
        </div>
      </div>
      
      {award.description && (
        <div className="brutalist-card__message" style={{ marginTop: '50px' }}>{award.description}</div>
      )}
      
      <div className="brutalist-card__stars">
        <StarDisplay 
          points={award.points} 
          size="lg"
        />
        <div className="brutalist-card__points">{award.points} pts</div>
      </div>
      
      {/* Display redemption and lockout information */}
      {(award.redemptionLimit !== undefined || isInLockout || award.allowedChildrenIds?.length) && (
        <div className="brutalist-card__info">
          {award.redemptionLimit !== null && (
            <div className="brutalist-card__info-item">
              <RefreshCw size={16} />
              {remainingRedemptions !== null && remainingRedemptions > 0 ? (
                <span>
                  {remainingRedemptions} of {award.redemptionLimit} redemption{award.redemptionLimit !== 1 ? 's' : ''} remaining
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
          
          {award.allowedChildrenIds && award.allowedChildrenIds.length > 0 && isParentView && (
            <div className="brutalist-card__info-item">
              <Users size={16} />
              <span>Limited to {award.allowedChildrenIds.length} child{award.allowedChildrenIds.length !== 1 ? 'ren' : ''}</span>
            </div>
          )}
        </div>
      )}

      <div className="brutalist-card__actions">
        {!award.awarded && !hideActions && isAvailableForRedemption && (
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
                  onClick={() => onDelete(award.id)}
                >
                  DELETE
                </button>
              </div>
            )
          ) : (
            onClaim && (
              <button
                className="brutalist-card__button brutalist-card__button--claim"
                onClick={() => onClaim(award.id)}
              >
                CLAIM AWARD
              </button>
            )
          )
        )}
        
        {/* Show unavailable message if in lockout or fully redeemed */}
        {!award.awarded && !isAvailableForRedemption && (
          <div className="brutalist-card__status brutalist-card__status--unavailable">
            {isInLockout ? 
              `AVAILABLE IN ${formatLockoutDate(lockoutEndDate)}` : 
              remainingRedemptions !== null && remainingRedemptions <= 0 ?
              'FULLY REDEEMED' : 
              'NOT AVAILABLE'
            }
          </div>
        )}
        
        {award.awarded && (
          <div className="brutalist-card__status brutalist-card__status--awarded">AWARDED!</div>
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