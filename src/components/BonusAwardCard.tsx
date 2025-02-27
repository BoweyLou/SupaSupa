/* src/components/BonusAwardCard.tsx */
// BonusAwardCard component: Displays a bonus award card with icon, title, and point value. Provides buttons to award, edit, and delete a bonus award.
import React, { useState } from 'react';
import { 
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
  Bike,
  Settings
} from 'lucide-react';
import StarDisplay from './StarDisplay';
import { createPortal } from 'react-dom';
import { useTheme } from '@/contexts/ThemeContext';

// Define available icons with their colors - keep in sync with AddBonusAward
export const AVAILABLE_ICONS = [
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
] as const;

// Define available colors for custom selection
export const AVAILABLE_COLORS = [
  '#FFD700', // Gold
  '#FFA500', // Orange
  '#FF69B4', // Hot Pink
  '#00CED1', // Turquoise
  '#4169E1', // Royal Blue
  '#C0C0C0', // Silver
  '#FF1493', // Deep Pink
  '#4CAF50', // Green
  '#8B4513', // Brown
  '#9C27B0', // Purple
  '#2196F3', // Blue
  '#FF5722', // Deep Orange
  '#E91E63', // Pink
  '#3F51B5', // Indigo
  '#F44336', // Red
  '#009688', // Teal
  '#673AB7', // Deep Purple
  '#FFEB3B', // Yellow
  '#795548', // Brown
];

// Also export the icon config type
export type IconConfig = typeof AVAILABLE_ICONS[number];

interface BonusAward {
  id: string;
  title: string;
  icon: string;
  points: number;
  status: 'available' | 'awarded';
  assigned_child_id?: string;
  created_at?: string;
  updated_at?: string;
  color?: string; // Add color property
}

interface BonusAwardCardProps {
  bonusAward: BonusAward;
  onAward: () => void;
  onEdit: (bonusAwardId: string, updatedData: {
    title: string;
    icon: string;
    color: string | null;
    points: number;
  }) => void;
  onDelete: () => void;
}

const BonusAwardCard: React.FC<BonusAwardCardProps> = ({ bonusAward, onAward, onEdit, onDelete }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(bonusAward ? bonusAward.title : '');
  const [editPoints, setEditPoints] = useState(bonusAward ? bonusAward.points.toString() : '');
  const [editIcon, setEditIcon] = useState(bonusAward ? bonusAward.icon : '');
  const [editColor, setEditColor] = useState(bonusAward?.color || '');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const { theme } = useTheme();

  if (!bonusAward || !bonusAward.id) {
    console.error('Invalid bonus award data:', bonusAward);
    return null;
  }

  const iconConfig = AVAILABLE_ICONS.find(i => i.name === bonusAward.icon) || AVAILABLE_ICONS[0];
  const IconComponent = iconConfig?.icon || Star;
  
  // Use custom color if available, otherwise use the default color for the icon
  const iconColor = bonusAward.color || iconConfig?.color || '#FFD700';

  // Create custom colors based on the icon color or use theme defaults
  const customColors = {
    borderColor: iconColor || theme.borderColor,
    backgroundColor: `${iconColor}33` || theme.backgroundColor, // Add 33 (20% opacity) to the hex color
    shadowColor: `${iconColor}66` || theme.shadowColor, // Add 66 (40% opacity) to the hex color
  };

  // Apply custom colors
  const cardStyle = {
    '--brutalist-card-border-color': customColors.borderColor,
    '--brutalist-card-bg-color': customColors.backgroundColor,
    '--brutalist-card-shadow-color': customColors.shadowColor,
  } as React.CSSProperties;

  const handleOpenEditModal = () => {
    setEditTitle(bonusAward.title);
    setEditPoints(bonusAward.points.toString());
    setEditIcon(bonusAward.icon);
    setEditColor(bonusAward.color || iconConfig?.color || '#FFD700');
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditLoading(true);
    
    const points = parseInt(editPoints, 10);
    if (isNaN(points)) {
      setEditError('Points must be a valid number.');
      setEditLoading(false);
      return;
    }
    
    try {
      // Pass the updated values to the parent component
      onEdit(bonusAward.id, {
        title: editTitle,
        icon: editIcon,
        color: editColor || null,
        points: points
      });
      
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error updating bonus award:', err);
      setEditError('An unexpected error occurred.');
    }
    
    setEditLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this bonus award?')) return;
    try {
      onDelete();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Error deleting bonus award:', err);
    }
  };

  const IconPickerGrid = () => (
    <div className="grid grid-cols-5 gap-2 p-4 bg-gray-50 rounded-lg max-h-60 overflow-y-auto">
      {AVAILABLE_ICONS.map(({ icon: IconComponent, name, color }) => (
        <div
          key={name}
          onClick={() => setEditIcon(name)}
          className={`
            p-2 rounded-lg cursor-pointer transition-all duration-200 
            flex flex-col items-center justify-center gap-1
            hover:bg-gray-200
            ${editIcon === name ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-white'}
          `}
        >
          <IconComponent size={20} color={editColor || color} />
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
          onClick={() => setEditColor(color)}
          className={`
            w-6 h-6 rounded-full cursor-pointer transition-all duration-200
            hover:scale-110 hover:shadow-md
            ${editColor === color ? 'ring-2 ring-blue-500 scale-110' : ''}
          `}
          style={{ backgroundColor: color }}
          title={color}
        />
      ))}
    </div>
  );

  // Check if dark mode is enabled
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  
  // Get the card background color based on theme
  const cardBgColor = isDarkMode ? '#1f2937' : '#ffffff';

  return (
    <div className="brutalist-card brutalist-card--themed" style={cardStyle}>
      {/* Settings icon for editing, positioned at top right */}
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={handleOpenEditModal}
          className="bg-none border-none cursor-pointer p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Edit Award"
        >
          <Settings className="w-4 h-4" color={iconColor} />
        </button>
      </div>

      {/* Apply background color with gradient fade */}
      <div 
        className="brutalist-card__header-wrapper" 
        style={{
          background: `linear-gradient(180deg, ${customColors.backgroundColor} 0%, ${customColors.backgroundColor} 30%, ${cardBgColor} 100%)`,
          height: '160px',
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
              width: '60px',
              height: '60px'
            }}
          >
            <IconComponent color={iconColor} />
          </div>
          <h3 
            className="" 
            style={{ 
              marginLeft: '0', 
              marginTop: '60px', 
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
            {bonusAward.title || 'Untitled Bonus'}
          </h3>
        </div>
      </div>

      <div className="brutalist-card__stars">
        <StarDisplay 
          points={bonusAward.points} 
          size="lg"
        />
        <div className="brutalist-card__points">{bonusAward.points || 0} pts</div>
      </div>

      <div className="brutalist-card__actions">
        <button 
          onClick={onAward} 
          className="brutalist-card__button brutalist-card__button--primary"
          style={{ backgroundColor: iconColor }}
        >
          AWARD
        </button>
      </div>

      {isEditModalOpen && typeof window === 'object' && createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <div className="brutalist-modal max-w-md w-[95%] max-h-[90vh] overflow-y-auto m-2 p-4 relative">
            <h2 className="brutalist-modal__title">Edit Bonus Award</h2>
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
                <label className="brutalist-modal__label">Points</label>
                <input
                  type="number"
                  value={editPoints}
                  onChange={(e) => setEditPoints(e.target.value)}
                  required
                  className="brutalist-modal__input"
                />
              </div>
              <div>
                <label className="brutalist-modal__label">Select Icon</label>
                <IconPickerGrid />
              </div>
              <div>
                <label className="brutalist-modal__label">Select Color</label>
                <ColorPickerGrid />
                {editIcon && editColor && (
                  <div className="mt-2 p-2 bg-gray-50 rounded flex items-center gap-2">
                    <span>Preview:</span>
                    {React.createElement(
                      AVAILABLE_ICONS.find(i => i.name === editIcon)?.icon || Star,
                      { 
                        size: 24, 
                        color: editColor 
                      }
                    )}
                    <span>{editIcon}</span>
                  </div>
                )}
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

export default BonusAwardCard; 