# Icon Selector Component

This document outlines the IconSelector component and the available icon categories for use in QuestCard and AwardCard components.

## Overview

The IconSelector component allows users to choose icons from various categories. These icons are used to visually represent tasks, achievements, and rewards throughout the application. The component is particularly useful for:

1. Parents creating quests/tasks for children
2. Parents creating awards/rewards that children can redeem
3. Visually categorizing different types of activities and responsibilities

## Available Icon Categories

The IconSelector includes the following categories of icons:

### Default Icons
Primarily for achievements and rewards:
- Award
- Star
- Gift
- Trophy
- Medal
- Crown

### Emotions
Expressive icons for reactions and feelings:
- Heart
- ThumbsUp
- Sparkles
- Zap
- Smile

### Productivity
Icons related to time management and productivity:
- CheckCircle
- Target
- Rocket
- Clock
- Calendar
- Timer

### Lifestyle
General lifestyle activity icons:
- Book
- Briefcase
- ShoppingBag
- Coffee
- Music

### Tech
Technology-related icons:
- Gamepad
- Smartphone
- Laptop
- Camera
- Headphones

### Chores
Icons specific to household chores and responsibilities:
- Home (general home tasks)
- Bed (make bed)
- Brush (cleaning)
- Handwashing (washing hands)
- Laundry (folding/putting away clothes)
- Trash (taking out garbage)
- Cleaning (general cleaning)
- Recycle (recycling tasks)
- Bath (bathroom cleaning/bath time)
- Hygiene (personal hygiene)
- Dishes (washing dishes)
- Plants (watering/caring for plants)

### School
Education-related icons:
- School (general school tasks)
- Homework (homework assignments)
- Learning (educational activities)
- Graduate (academic achievements)
- Reading (reading tasks)
- Writing (writing assignments)
- Art (art projects)
- Ruler (math/measurements)
- Puzzle (problem-solving)
- Quiet (quiet time/study)

### Activities
Icons for various kid-friendly activities:
- Bike (bike riding)
- Walking (walks/steps)
- Outdoors (outdoor activities)
- Pets (pet care)
- Cat (cat care)
- Cooking (kitchen/cooking tasks)
- Movies (screen time/movie watching)
- Sports (physical activities)
- Garden (gardening)
- Car (travel/errands)

## Usage in Components

### Using Icons in QuestCard

QuestCards represent tasks or chores that children can complete to earn points. When creating or editing a QuestCard, parents can select an appropriate icon that visually represents the task.

```tsx
<QuestCard
  quest={{
    id: "1",
    title: "Clean Your Room",
    description: "Make your bed and put away toys",
    points: 10,
    status: "assigned",
    icon: "Bed" // Using the Bed icon from the chores category
  }}
  userRole="parent"
  onComplete={() => {}}
/>
```

### Using Icons in AwardCard

AwardCards represent rewards that children can claim with their earned points. When creating or editing an AwardCard, parents can select an icon that visually represents the reward.

```tsx
<AwardCard
  award={{
    id: "1",
    title: "Movie Night",
    description: "Choose a movie for family movie night",
    points: 50,
    awarded: false,
    familyId: "family1",
    icon: "Movies" // Using the Movies icon from the activities category
  }}
  isParentView={true}
  onEdit={() => {}}
  onDelete={() => {}}
/>
```

## Programmatic Usage

### Getting an Icon Component by Name

The IconSelector exports a utility function `getIconByName` that returns the corresponding icon component for a given name:

```tsx
import { getIconByName } from '@/components/IconSelector';

// Later in component
const IconComponent = getIconByName('Bike');

// Use in JSX
<div className="my-icon-container">
  <IconComponent />
</div>
```

### Custom Icon Selection UI

For parent-facing interfaces, you can use the full IconSelector component to allow selection from all categories:

```tsx
import IconSelector from '@/components/IconSelector';

// In your component
const [selectedIcon, setSelectedIcon] = useState('Award');

// In your JSX
<IconSelector
  selectedIcon={selectedIcon}
  onSelectIcon={setSelectedIcon}
/>
```

## Adding New Icons

To add new icons to the system:

1. Import the desired icon from the Lucide icon library in `src/components/IconSelector.tsx`
2. Add the icon to the appropriate category in the `iconSets` object
3. Use the icon name in your components

## Accessibility Considerations

When using icons:

1. Always pair icons with text labels when possible
2. Use the `title` attribute for icons that stand alone
3. Choose icons that clearly represent the action or concept
4. Maintain consistent icon usage throughout the application

## Related Files

- `src/components/IconSelector.tsx` - Main component implementation
- `src/components/QuestCard.tsx` - Task card implementation
- `src/components/AwardCard.tsx` - Reward card implementation 