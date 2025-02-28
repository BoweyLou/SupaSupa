# Responsive Card System

This document describes our responsive card system, including design principles, implementation details, and usage guidelines.

## Overview

The responsive card system is designed to provide a consistent and visually appealing user interface across different device sizes. Cards automatically adapt to the viewport size, ensuring optimal display on mobile, tablet, and desktop devices.

## Design Principles

1. **Mobile-First Approach**: All components are designed with mobile in mind first, then enhanced for larger screens.
2. **Consistent Visual Language**: Cards maintain a consistent visual style, with adaptations for different screen sizes.
3. **Automatic Layout Adjustment**: Grid layout automatically adjusts the number of cards per row based on available space.
4. **Component Adaptability**: Individual card components adapt their internal layout and element sizes based on available space.
5. **Unified Dashboard Experience**: All dashboard sections use the same CardGrid component for a consistent user experience.

## Technical Implementation

### CSS Grid Layout

The card grid uses CSS Grid with media queries to create a responsive layout:

```css
.card-grid {
  display: grid;
  width: 100%;
  gap: 1.5rem;
  padding: 1rem;
}

/* Mobile: 1 card per row */
@media (max-width: 480px) {
  .card-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

/* Small Tablets: 2 cards per row */
@media (min-width: 481px) and (max-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Large Tablets: 3 cards per row */
@media (min-width: 769px) and (max-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Desktop: 4 cards per row */
@media (min-width: 1025px) {
  .card-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Responsive Card Components

Individual card components adjust their appearance based on screen size:

1. **Font Size Adjustment**: Text sizes scale down on smaller screens
2. **Icon Size Adjustment**: Icons are proportionally smaller on mobile devices
3. **Spacing Adjustment**: Internal padding and margins are reduced on smaller screens
4. **Content Layout**: Elements may reorganize for optimal viewing on different devices

## Components

### 1. CardGrid

A layout container that automatically arranges cards in a responsive grid pattern.

**Usage:**

```tsx
import CardGrid from '@/components/CardGrid';

<CardGrid>
  <QuestCard quest={quest1} userRole="parent" />
  <QuestCard quest={quest2} userRole="parent" />
  {/* ... */}
</CardGrid>
```

**Dashboard Integration:**
CardGrid has been implemented across all dashboard sections, including:
- Active Tasks
- Completed Tasks
- Bonus Awards
- Regular Awards
- Child-specific task views
- Quest History

### 2. QuestCard

A card component for displaying tasks/quests, with responsive adaptations.

**Key Features:**
- Adjusts icon and font sizes based on viewport
- Adapts star display rows based on available width
- Maintains readability across all device sizes

### 3. StarDisplay

A component that displays star ratings, with responsive adaptations.

**Key Features:**
- Adjusts star size based on viewport and parent component
- Configurable number of stars per row
- Adapts to different screen sizes automatically

### 4. CompletedTaskCard

A card component for displaying completed tasks with relevant information.

**Key Features:**
- Displays task title, description, and completion time
- Shows points awarded for the task
- Includes the name of the child who completed the task
- Adapts to different screen sizes automatically

## Usage Guidelines

1. **Always Use CardGrid**: Wrap all card collections in the CardGrid component to ensure proper responsive behavior.
2. **Avoid Fixed Widths**: Don't set fixed width values on cards or their containers.
3. **Test on Multiple Devices**: Always test the UI on various screen sizes to ensure proper display.
4. **Use Responsive Props**: Pass device-specific props when needed (e.g., `size={isMobile ? "md" : "lg"}`).

## Browser Compatibility

The responsive card system is compatible with all modern browsers, including:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

For older browsers without CSS Grid support, the layout will gracefully degrade to a single-column view.

## Accessibility Considerations

- Text sizing respects user browser font size settings
- Sufficient color contrast is maintained across all viewport sizes
- Interactive elements maintain adequate touch target size on mobile

## Future Enhancements

- Implementation of container queries for more fine-grained control
- Performance optimizations for large card collections
- Additional card variants for different content types 