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

## Phase 2: Code Integration
- **Front-End** (`AwardCard.tsx`, `DashboardPage.tsx`, etc.):
  - `AddAward.tsx` inserts a new award with `points` as the cost.
  - On claim (`handleClaimAward`), points are deducted from the child, and a record is inserted into `claimed_awards`.
  - The `awarded` field in `awards` is optionally updated if the code sets it to true (one-time usage pattern).

## Future Considerations
- Freeze/cooldown periods, manual disabling, or parental approval are not yet implemented in the current code.
- The code references `onClaim` or `handleClaimAward`; ensure consistent naming as features expand.
- Revisit how `awarded` is used. If multiple children can claim the same award, usage might differ.

## Summary
Currently, the awarding flow uses a child’s available points to claim an item by deducting `points` from their total. The plan can evolve if freeze-out or multiple claim logic is needed. For now, the system is fairly direct: “Points” cost, deduction, record in `claimed_awards`.