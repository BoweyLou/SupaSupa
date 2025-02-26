# Award System Improvement Plan (Updated)

This document covers the basic flow of awarding and claiming in the application.

## Current Implementation

- **Awards Table**:
  - Columns:
    - `id` (UUID)
    - `title` (text)
    - `description` (text)
    - `points` (integer) — represents how many points are required to claim the award.
    - `family_id` (UUID) — links award to a specific family.
    - `awarded` (boolean) — toggled to true after being claimed, though usage may vary.
    - `allowed_children_ids` (text[]) — specifies which children can see/claim the award.
    - `redemption_limit` (integer) — how many times the award can be claimed (null = unlimited).
    - `redemption_count` (integer) — how many times the award has been claimed.
    - `lockout_period` (integer) — duration before the award can be claimed again.
    - `lockout_unit` (text) — 'days' or 'weeks' for the lockout period.
    - `last_redeemed_at` (timestamp) — when the award was last claimed.
    - `icon` (text) — name of the icon to display for the award.
    - `custom_colors` (JSON) — custom colors for the award card:
      - `borderColor` (text) — color of the card border.
      - `backgroundColor` (text) — color of the card background.
      - `shadowColor` (text) — color of the card shadow.
    - Timestamps

- **Claimed_Awards Table**:
  - `id` (UUID)
  - `award_id` (UUID, references `awards.id`)
  - `child_id` (UUID, references `users.id`)
  - `claimed_at` (timestamp)
  - Optionally `points_deducted` (to record how many points were deducted)

## Phase 1: Database Schema Changes
- Implemented columns as shown above.
- Confirmed addition of `family_id` to the `awards` table.
- Created a separate `claimed_awards` table to track redemptions.
- Added `icon` and `custom_colors` fields to support the brutalist design system.

## Phase 2: Code Integration
- **Front-End** (`AwardCard.tsx`, `DashboardPage.tsx`, etc.):
  - `AddAward.tsx` inserts a new award with `points` as the cost.
  - On claim (`handleClaimAward`), points are deducted from the child, and a record is inserted into `claimed_awards`.
  - The `awarded` field in `awards` is optionally updated if the code sets it to true (one-time usage pattern).
  - Added UI for selecting icons and custom colors when creating or editing awards.
  - Updated award mapping to include `icon` and `customColors` fields.

## Brutalist Design Integration
- Awards now support custom styling through the brutalist design system:
  - Icons can be selected from a library of icons.
  - Custom colors can be set for the card border, background, and shadow.
  - The `AwardCard` component displays these custom styles.

## Future Considerations
- Freeze/cooldown periods, manual disabling, or parental approval are not yet implemented in the current code.
- The code references `onClaim` or `handleClaimAward`; ensure consistent naming as features expand.
- Revisit how `awarded` is used. If multiple children can claim the same award, usage might differ.
- Consider adding more customization options for the brutalist design system.

## Summary
Currently, the awarding flow uses a child's available points to claim an item by deducting `points` from their total. The plan can evolve if freeze-out or multiple claim logic is needed. For now, the system is fairly direct: "Points" cost, deduction, record in `claimed_awards`. The addition of the brutalist design system allows for more visually appealing and customizable award cards.