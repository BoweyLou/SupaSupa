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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(bonusAward ? bonusAward.title : '');
  const [editPoints, setEditPoints] = useState(bonusAward ? bonusAward.points.toString() : '');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  if (!bonusAward || !bonusAward.id) {
    console.error('Invalid bonus award data:', bonusAward);
    return null;
  }

  const iconConfig = AVAILABLE_ICONS.find(i => i.name === bonusAward.icon) || AVAILABLE_ICONS[0];
  const IconComponent = iconConfig?.icon || Star;

  const handleOpenEditModal = () => {
    setEditTitle(bonusAward.title);
    setEditPoints(bonusAward.points.toString());
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
      // Here you would add your update logic (e.g., call an API to update bonus award)
      // For now, we'll assume the update is successful and then call onEdit callback.
      onEdit();
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

  return (
    <div style={{
      position: 'relative',
      border: '2px solid #f9c74f',
      borderRadius: '12px',
      padding: '16px',
      margin: '8px 0',
      background: 'linear-gradient(45deg, #fff9f0, #fff4e6)',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Cog icon for edit, positioned at top right */}
      <div style={{ position: 'absolute', top: '4px', right: '4px', display: 'flex', gap: '4px', zIndex: 1 }}>
        <button
          onClick={handleOpenEditModal}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          title="Edit Award"
        >
          <Settings className="w-4 h-4" color="#4CAF50" />
        </button>
      </div>

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

      {/* Add star display */}
      <div className="mb-4">
        <StarDisplay points={bonusAward.points} size="sm" />
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <button 
          onClick={onAward} 
          style={{ flex: 1, padding: '8px', backgroundColor: '#f9c74f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Award
        </button>
      </div>

      {isEditModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor:'rgba(0, 0, 0, 0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 50 }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px' }}>
            <h2>Edit Bonus Award</h2>
            {editError && <p style={{ color: 'red' }}>{editError}</p>}
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                  style={{ width:'100%', padding:'8px', border: '1px solid #ccc', borderRadius:'4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px' }}>Points</label>
                <input
                  type="number"
                  value={editPoints}
                  onChange={(e) => setEditPoints(e.target.value)}
                  required
                  style={{ width:'100%', padding:'8px', border: '1px solid #ccc', borderRadius:'4px' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap:'10px' }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} style={{ padding:'8px 12px', backgroundColor:'#ccc', border:'none', borderRadius:'4px', cursor:'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={editLoading} style={{ padding:'8px 12px', backgroundColor:'#4CAF50', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer' }}>
                  {editLoading ? 'Saving...' : 'Save'}
                </button>
                <button type="button" onClick={handleDelete} style={{ padding:'8px 12px', backgroundColor:'#f44336', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer' }}>
                  Delete Award
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BonusAwardCard; 