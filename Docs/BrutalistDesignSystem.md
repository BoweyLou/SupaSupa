# Brutalist Design System

This document outlines the brutalist design system implemented in our application. The brutalist design style is characterized by bold, geometric shapes, high contrast, and a raw, unpolished aesthetic.

## Overview

Our brutalist design system includes:

1. **Brutalist Cards**: Bold, geometric cards with thick borders, drop shadows, and customizable colors
2. **Status Indicators**: Visual indicators for different states (pending, completed, failed, locked)
3. **Brutalist Buttons**: Bold buttons with drop shadows and hover effects
4. **Form Elements**: Styled inputs, labels, and form controls
5. **Modals**: Styled modal dialogs with brutalist aesthetics
6. **Color Pickers**: UI for selecting custom colors
7. **Icon Selectors**: UI for selecting icons

## CSS Classes

The brutalist design system is implemented through a set of CSS classes in `src/app/brutalist.css`. These classes can be applied to any component to give it a brutalist aesthetic.

### Card Components

The main card components (`AwardCard` and `QuestCard`) have been updated to use the brutalist design system. They now support:

- Custom icons
- Custom colors for borders, backgrounds, and shadows
- Brutalist styling with thick borders and drop shadows

### Example Usage

```tsx
<div className="brutalist-card" 
     style={{ 
       '--border-color': '#000', 
       '--bg-color': '#fff', 
       '--shadow-color': '#000' 
     } as React.CSSProperties}>
  <div className="brutalist-card-header">
    <h3 className="brutalist-card-title">
      <Icon className="brutalist-card-icon" />
      Card Title
    </h3>
  </div>
  <div className="brutalist-card-content">
    Content goes here
  </div>
  <div className="brutalist-card-footer">
    Footer content
  </div>
</div>
```

## Status Indicators

Status indicators use the following classes:

- `brutalist-status`: Base class for all status indicators
- `brutalist-status-pending`: Yellow background for pending items
- `brutalist-status-completed`: Green background for completed items
- `brutalist-status-failed`: Red background for failed items
- `brutalist-status-locked`: Gray background for locked items

## Buttons

Buttons use the following classes:

- `brutalist-button`: Base class for all buttons
- `brutalist-button-primary`: Yellow background for primary actions
- `brutalist-button-success`: Green background for success actions
- `brutalist-button-danger`: Red background for dangerous actions

## Database Schema Updates

The database schema has been updated to support the brutalist design system. The following fields have been added to the `tasks` and `awards` tables:

- `icon`: A string field that stores the name of the icon to display
- `custom_colors`: A JSON field that stores custom colors for the card:
  - `borderColor`: The color of the card border
  - `backgroundColor`: The color of the card background
  - `shadowColor`: The color of the card shadow

## Theme Integration

The brutalist design system integrates with our existing theme system through the `ThemeProvider` component. The theme context provides access to the current theme, which can be used to set default colors for brutalist components.

```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme } = useTheme();
  
  return (
    <div className="brutalist-card" 
         style={{ 
           '--border-color': theme.borderColor, 
           '--bg-color': theme.backgroundColor, 
           '--shadow-color': theme.shadowColor 
         } as React.CSSProperties}>
      {/* Card content */}
    </div>
  );
}
```

## Customization

Users can customize the appearance of cards through the `ThemeCustomizer` component, which allows them to:

1. Select custom icons from a library of icons
2. Choose custom colors for borders, backgrounds, and shadows
3. Save their preferences to be applied to all cards

## Responsive Design

The brutalist design system is fully responsive and adapts to different screen sizes. On smaller screens:

- Card headers stack vertically
- Card footers stack vertically
- Padding is reduced to save space
- Modals take up more screen space

## Implementation Details

The brutalist design system is implemented through:

1. CSS classes in `src/app/brutalist.css`
2. Component updates in `src/components/AwardCard.tsx` and `src/components/QuestCard.tsx`
3. Database schema updates in `supabase/migrations/20240226000000_add_brutalist_design_fields.sql`
4. Theme integration through `src/contexts/ThemeContext.tsx` 