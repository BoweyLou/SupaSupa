# Modern Card Design System

This document outlines the modern card design system implemented in our application. The design style is characterized by clean, rounded shapes, subtle shadows, and a minimalist aesthetic.

## Overview

Our modern design system includes:

1. **Modern Cards**: Clean, rounded cards with subtle shadows and customizable colors
2. **Status Indicators**: Visual indicators for different states using colored pills
3. **Modern Buttons**: Clean buttons with hover effects
4. **Form Elements**: Styled inputs, labels, and form controls
5. **Modals**: Styled modal dialogs with modern aesthetics
6. **Color Pickers**: UI for selecting custom colors
7. **Icon Selectors**: UI for selecting icons
8. **Dark Mode Support**: Full dark mode compatibility

## CSS Classes

The modern design system is implemented through a set of CSS classes in `src/app/brutalist.css` (renamed from the previous brutalist system). These classes can be applied to any component to give it a modern aesthetic.

### Card Components

The main card components (`AwardCard` and `QuestCard`) have been updated to use the modern design system. They now support:

- Custom icons
- Custom colors for backgrounds
- Subtle shadows and hover effects
- Rounded corners and clean aesthetics

### Example Usage

```tsx
<div className="brutalist-card">
  <div className="brutalist-card__icon">
    <Icon />
  </div>
  <div className="brutalist-card__header">
    <h3 className="brutalist-card__title">
      Card Title
    </h3>
  </div>
  <div className="brutalist-card__content">
    <p className="brutalist-card__message">
      Content goes here
    </p>
  </div>
  <div className="brutalist-card__footer">
    Footer content
  </div>
  <div className="brutalist-card__arrow-button">
    <svg>...</svg>
  </div>
</div>
```

## Status Indicators

Status indicators use the following classes:

- `brutalist-card__status`: Base class for all status indicators
- `brutalist-card__status--pending`: Blue background for pending items
- `brutalist-card__status--awarded`: Green background for completed items
- `brutalist-card__status--unavailable`: Yellow background for unavailable items
- `brutalist-card__status--locked`: Gray background for locked items

All status indicators now use a pill shape with rounded corners for a modern look.

## Buttons

Buttons use the following classes:

- `brutalist-card__button`: Base class for all buttons
- `brutalist-card__button--primary`: Blue background for primary actions
- `brutalist-card__button--approve`: Green background for success actions
- `brutalist-card__button--reject`: Red background for dangerous actions
- `brutalist-card__button--claim`: Green background for claim actions

## Database Schema

The database schema remains compatible with the new design system. The following fields are still used:

- `icon`: A string field that stores the name of the icon to display
- `custom_colors`: A JSON field that stores custom colors for the card:
  - `backgroundColor`: The color of the card background

## Dark Mode Support

The modern design system fully supports dark mode through dedicated dark mode classes:

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  return (
    <div className={`brutalist-card ${isDarkMode ? 'dark' : ''}`}>
      {/* Card content */}
    </div>
  );
}
```

## Customization

Users can customize the appearance of cards through the `ThemeCustomizer` component, which allows them to:

1. Select custom icons from a library of icons
2. Choose custom colors for backgrounds
3. Save their preferences to be applied to all cards

## Responsive Design

The modern design system is fully responsive and adapts to different screen sizes. On smaller screens:

- Card headers stack vertically
- Card footers stack vertically
- Padding is reduced to save space
- Modals take up more screen space

## Implementation Details

The modern design system is implemented through:

1. CSS classes in `src/app/brutalist.css` (we kept the class names for backward compatibility)
2. Component updates in `src/components/AwardCard.tsx` and `src/components/QuestCard.tsx`
3. Theme integration through `src/contexts/ThemeContext.tsx`

## Design Inspiration

The new design is inspired by modern UI trends, featuring:

- Rounded corners for a friendly, approachable feel
- Subtle shadows for depth without heaviness
- Clean typography with good readability
- Minimalist aesthetic that focuses on content
- Smooth transitions and hover effects
- Accessible color contrasts
- Support for both light and dark modes 