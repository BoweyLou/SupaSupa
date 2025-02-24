# Quest Card Component Feature Plan

## Purpose & Context
The Quest Card is a key UI element representing tasks (or "quests") that children need to complete. It serves different views and functionalities for both Parents and Children, displaying tasks in an engaging, game-like manner while maintaining functionality.

## Core Features Needed

### Visual Elements
- [x] Task title and description
- [x] Points reward display
- [x] Task frequency indicator (daily, weekly, one-off)
- [x] Status indicator (assigned, pending approval, completed)
- [ ] Visual feedback for different states
- [ ] Progress/streak indicators (if applicable)

### Interactive Elements

#### For Children
- [x] Complete task button/action
- [ ] Progress visualization
- [ ] Points/rewards preview

#### For Parents
- [ ] Assign task functionality
- [x] Approve/Reject buttons
- [ ] Points adjustment capability
- [ ] Determine one off or recurring
- [ ] Select an icon for the task
- [ ] Task management options (edit, delete)

## Design Considerations

### Visual Hierarchy
- [x] Primary information (task name, points) prominence
- [x] Immediately visible status
- [x] Accessible secondary information (description, frequency)

### Gamification Elements
- [x] Game-like visual style
- [x] State change animations
- [x] Completion celebrations
- [ ] Level/achievement integration

### Accessibility & UX
- [ ] Color coding for different states
- [x] Readable typography
- [ ] Touch-friendly hit areas
- [ ] Clear action feedback

## Technical Architecture

### Component Structure
- [x] Main QuestCard container
- [x] Header section (title, points)
- [x] Content section (description, status)
- [x] Action section (role-based buttons)
- [ ] Optional sections (progress, streaks)

#### Backend Integration
The Quest Card feature now integrates with our updated database schema (see /Docs/database_schema.md) via the new tasks table. This table stores each quest with the following fields:
- id (uuid, auto-generated)
- title (text)
- description (text)
- reward_points (integer)
- frequency (text: accepts "daily", "weekly", or "one-off")
- status (text: accepts "assigned", "pending approval", "completed", or "rejected")
- assigned_child_id (uuid, linking to the child responsible)
- created_by (uuid, linking to the parent who created the task)
- created_at / updated_at (timestamps)

This integration supports real-time updates and precise task tracking, ensuring a seamless quest experience for both children and parents.

### Props Interface
- [x] Task data structure
- [x] User role handling
- [x] Status management
- [x] Action callbacks
- [ ] Feature flags integration

### State Management
- [ ] Local UI interaction state
- [ ] Global task status integration
- [ ] Animation state handling

## Variants

### View Types
- [ ] Compact list view
- [ ] Expanded detail view

### Role-based Variants
- [x] Child view implementation
- [x] Parent view implementation

### Status-based Variants
- [x] Assigned state
- [ ] In Progress state
- [ ] Pending Approval state
- [ ] Completed state
- [ ] Failed/Rejected state

## Implementation Phases

### Phase 1: Core Structure
- [x] Basic card layout
- [x] Essential information display
- [x] Primary actions implementation

### Phase 2: Enhanced Functionality
- [ ] Status management system
- [ ] Role-based features
- [ ] Animation states implementation

### Phase 3: Polish
- [ ] Gamification elements
- [ ] Advanced animations
- [ ] Accessibility improvements

## Review and Next Steps

So far, we have implemented a basic Quest Card component that provides the core display and actions for both children and parents, along with integration into the dashboard. The following are the next steps to continue enhancing this feature:

1. Enhance visual feedback: Implement animations and visual cues for state changes and task completions.
2. Add progress indicators and streak displays to show progress in task completion.
3. Integrate dynamic task status: Connect the Quest Card with backend data (using Supabase) to manage real-time task states.
4. Improve interactive features: For children, add progress visualization and rewards preview; for parents, implement task assignment, points adjustment, recurring tasks determination, and task management options (like edit and delete).
5. Incorporate advanced design elements like a game-like visual style, color coding for dynamic statuses, and improved accessibility features.
6. Evaluate and implement feature flags to enable/disable extra capabilities during the rollout.

Each of these steps will be documented and prioritized further. The documentation will be updated accordingly in the next revisions.

Note: Future changes should also update the repository's README, release notes, and changelog to reflect these enhancements. 