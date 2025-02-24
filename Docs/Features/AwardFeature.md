# docs/Features/AwardFeature.md
// Updated to match actual code usage and table structure

## Overview

This feature implements an Awards system that allows children to claim "rewards" using their accumulated points. Each award requires a certain number of points (stored in the `points` column). A child can "claim" the award if they have enough points, and upon claiming, their points are deducted accordingly. A record of the claim is stored in the `claimed_awards` table. The code also uses an `awarded` boolean in the `awards` table to indicate if an award has been claimed, although usage may vary between parent or child flows.

## Checklist (Updated)

- [x] **Database Changes**
  - **awards** table:
    - `id` (UUID, primary key)
    - `title` (text)
    - `description` (text)
    - `points` (integer) — the cost in points to claim an award
    - `family_id` (UUID, references the `families.family_id`)
    - `awarded` (boolean) — code sets this to `true` once it’s claimed, though it may vary in usage
    - Timestamps: `created_at` and `updated_at`

  - **claimed_awards** table:
    - `id` (UUID, primary key)
    - `award_id` (UUID) — references the award
    - `child_id` (UUID) — references the child user claiming it
    - `claimed_at` (timestamp) — defaults to `now()`
    - (Optional) `points_deducted` (integer) – can track how many points were deducted at the time of claim

- [x] **Frontend & Redeem Flow**
  - The child sees a "Claim Award" button if they have enough points to claim the award.
  - `handleClaimAward` in the code:
    1. Checks if `dbUser.points >= award.points`.
    2. Deducts points from the user's record in the `users` table.
    3. Inserts a row into `claimed_awards`.
    4. Optionally updates the `awarded` boolean in `awards`.

- [x] **Parent / Admin Features**
  - Parents can add new awards using the `AddAward.tsx` component, specifying `title`, `description`, and `points`.
  - The code sets `awarded: false` at creation, but the parent can edit or delete the award.

- [ ] **Real-Time or Future Enhancements** (Not fully implemented yet)
  - Freeze/cooldown periods or manual disabling (`is_enabled`) are not in the current code.
  - Additional validations or parent approval for claiming could be added.
  - `image_url` is also not currently implemented in the code.

## Summary

Currently, the code allows parents to create awards, children to claim awards, and automatically deducts points. The `claimed_awards` table stores redeemed items, while the code also uses an `awarded` boolean in the `awards` table to indicate a one-time claim. Future improvements such as freeze-out periods or more advanced parent controls remain potential next steps.