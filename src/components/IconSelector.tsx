"use client";

import React, { useState } from 'react';
import { 
  Award, 
  Star, 
  Gift, 
  Trophy, 
  Medal, 
  Crown, 
  Heart, 
  ThumbsUp,
  Zap,
  Sparkles,
  Rocket,
  Target,
  CheckCircle,
  Clock,
  Calendar,
  Book,
  Briefcase,
  ShoppingBag,
  Coffee,
  Music,
  Gamepad,
  Smartphone,
  Laptop,
  Camera,
  Headphones,
  // Additional icons for kids activities and chores
  Home,
  Bath,
  Bed,
  Bike,
  BookOpen,
  BrainCircuit,
  Brush,
  Cat,
  Dog,
  Car,
  Clapperboard,
  Drumstick,
  Footprints,
  GraduationCap,
  Droplets, 
  Shirt,
  Flower,
  Utensils,
  Trash2,
  School,
  Puzzle,
  Pencil,
  Paintbrush,
  Leaf,
  Recycle,
  Smile,
  Sun,
  Scissors,
  Wind,
  VolumeX,
  Timer,
  Ruler
} from 'lucide-react';

// Define icon sets
const iconSets = {
  default: [
    { name: 'Award', component: Award },
    { name: 'Star', component: Star },
    { name: 'Gift', component: Gift },
    { name: 'Trophy', component: Trophy },
    { name: 'Medal', component: Medal },
    { name: 'Crown', component: Crown }
  ],
  emotions: [
    { name: 'Heart', component: Heart },
    { name: 'ThumbsUp', component: ThumbsUp },
    { name: 'Sparkles', component: Sparkles },
    { name: 'Zap', component: Zap },
    { name: 'Smile', component: Smile }
  ],
  productivity: [
    { name: 'CheckCircle', component: CheckCircle },
    { name: 'Target', component: Target },
    { name: 'Rocket', component: Rocket },
    { name: 'Clock', component: Clock },
    { name: 'Calendar', component: Calendar },
    { name: 'Timer', component: Timer }
  ],
  lifestyle: [
    { name: 'Book', component: Book },
    { name: 'Briefcase', component: Briefcase },
    { name: 'ShoppingBag', component: ShoppingBag },
    { name: 'Coffee', component: Coffee },
    { name: 'Music', component: Music }
  ],
  tech: [
    { name: 'Gamepad', component: Gamepad },
    { name: 'Smartphone', component: Smartphone },
    { name: 'Laptop', component: Laptop },
    { name: 'Camera', component: Camera },
    { name: 'Headphones', component: Headphones }
  ],
  // New categories for kids
  chores: [
    { name: 'Home', component: Home },
    { name: 'Bed', component: Bed },
    { name: 'Brush', component: Brush },
    { name: 'Handwashing', component: Droplets },
    { name: 'Laundry', component: Shirt },
    { name: 'Trash', component: Trash2 },
    { name: 'Cleaning', component: Wind },
    { name: 'Recycle', component: Recycle },
    { name: 'Bath', component: Bath },
    { name: 'Hygiene', component: Scissors },
    { name: 'Dishes', component: Utensils },
    { name: 'Plants', component: Leaf }
  ],
  school: [
    { name: 'School', component: School },
    { name: 'Homework', component: BookOpen },
    { name: 'Learning', component: BrainCircuit },
    { name: 'Graduate', component: GraduationCap },
    { name: 'Reading', component: Book },
    { name: 'Writing', component: Pencil },
    { name: 'Art', component: Paintbrush },
    { name: 'Ruler', component: Ruler },
    { name: 'Puzzle', component: Puzzle },
    { name: 'Quiet', component: VolumeX }
  ],
  activities: [
    { name: 'Bike', component: Bike },
    { name: 'Walking', component: Footprints },
    { name: 'Outdoors', component: Sun },
    { name: 'Pets', component: Dog },
    { name: 'Cat', component: Cat },
    { name: 'Cooking', component: Drumstick },
    { name: 'Movies', component: Clapperboard },
    { name: 'Exercise', component: Footprints },
    { name: 'Garden', component: Flower },
    { name: 'Car', component: Car }
  ]
};

// Map icon name to component
export const getIconByName = (iconName: string) => {
  for (const category in iconSets) {
    const icon = iconSets[category as keyof typeof iconSets].find(
      icon => icon.name === iconName
    );
    if (icon) return icon.component;
  }
  return Award; // Default icon
};

interface IconSelectorProps {
  selectedIcon: string;
  onSelectIcon: (iconName: string) => void;
}

const IconSelector: React.FC<IconSelectorProps> = ({ selectedIcon, onSelectIcon }) => {
  const [activeCategory, setActiveCategory] = useState<keyof typeof iconSets>('default');

  return (
    <div className="brutalist-modal__section">
      <label className="brutalist-modal__label">Select Icon</label>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(iconSets).map((category) => (
          <button
            key={category}
            type="button"
            className={`px-3 py-1 text-sm border-2 border-black ${
              activeCategory === category 
                ? 'bg-black text-white' 
                : 'bg-white text-black hover:bg-gray-100'
            }`}
            onClick={() => setActiveCategory(category as keyof typeof iconSets)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {iconSets[activeCategory].map((icon) => {
          const IconComponent = icon.component;
          return (
            <button
              key={icon.name}
              type="button"
              className={`p-3 border-2 transition-all ${
                selectedIcon === icon.name
                  ? 'border-black bg-black text-white transform scale-110 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]'
                  : 'border-gray-300 hover:border-black'
              }`}
              onClick={() => onSelectIcon(icon.name)}
              title={icon.name}
            >
              <IconComponent className="w-6 h-6 mx-auto" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default IconSelector; 