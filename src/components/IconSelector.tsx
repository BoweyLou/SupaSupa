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
  Headphones
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
    { name: 'Zap', component: Zap }
  ],
  productivity: [
    { name: 'CheckCircle', component: CheckCircle },
    { name: 'Target', component: Target },
    { name: 'Rocket', component: Rocket },
    { name: 'Clock', component: Clock },
    { name: 'Calendar', component: Calendar }
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