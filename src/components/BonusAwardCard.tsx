/* src/components/BonusAwardCard.tsx */
// BonusAwardCard component: Displays a bonus award card with icon, title, and point value. Provides buttons to award, edit, and delete a bonus award.
import React from 'react';
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
  Bike
} from 'lucide-react';

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
}

interface BonusAwardCardProps {
  bonusAward: BonusAward;
  onAward: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const BonusAwardCard: React.FC<BonusAwardCardProps> = ({ bonusAward, onAward, onEdit, onDelete }) => {
  // Find the icon configuration based on the stored name
  const iconConfig = AVAILABLE_ICONS.find(i => i.name === bonusAward.icon) || AVAILABLE_ICONS[0];
  const IconComponent = iconConfig?.icon || Star; // Fallback to Star if icon not found

  // Prevent rendering if essential data is missing
  if (!bonusAward || !bonusAward.id) {
    console.error('Invalid bonus award data:', bonusAward);
    return null;
  }

  const handleAward = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      onAward();
    } catch (err) {
      console.error('Error awarding bonus:', err);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      onEdit();
    } catch (err) {
      console.error('Error editing bonus:', err);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      onDelete();
    } catch (err) {
      console.error('Error deleting bonus:', err);
    }
  };

  return (
    <div style={{
      border: '2px solid #f9c74f',
      borderRadius: '12px',
      padding: '16px',
      margin: '8px 0',
      background: 'linear-gradient(45deg, #fff9f0, #fff4e6)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ marginRight: '12px' }}>
          <IconComponent size={40} color={iconConfig?.color || '#FFD700'} />
        </div>
        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
          {bonusAward.title || 'Untitled Bonus'}
        </h3>
      </div>
      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>
        {bonusAward.points || 0} pts
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={handleAward} 
          style={{ flex: 1, padding: '8px', backgroundColor: '#f9c74f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Award
        </button>
        <button 
          onClick={handleEdit} 
          style={{ flex: 1, padding: '8px', backgroundColor: '#4CAF50', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Edit
        </button>
        <button 
          onClick={handleDelete} 
          style={{ flex: 1, padding: '8px', backgroundColor: '#f44336', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default BonusAwardCard; 