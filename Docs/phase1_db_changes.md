# Phase 1 Database Schema Changes (Updated)

This document details the final schema changes implemented for the Award System:

1. **Creation of the `claimed_awards` table**:
   - **id** (UUID, primary key)
   - **award_id** (UUID, references `awards.id`)
   - **child_id** (UUID, references `users.id` - child accounts)
   - **claimed_at** (timestamptz, default now())
   - (Optional) `points_deducted` (Integer) – for auditing

2. **Modification of the `awards` table**:
   - **family_id** (UUID, references `families.family_id`) — associates awards with a specific family.
   - **awarded** (boolean, default `false`) — indicates if an award is claimed. Current code sets it to `true` upon claiming, though usage may vary if multiple claims per award are allowed.

3. **Field Name Consistency**:
   - The code uses `points` instead of `cost_points`. So the `awards` table has a column `points` for how many points are required to claim.

## Migration Steps
- Ran a migration script adding the `claimed_awards` table.
- Altered `awards` to add `family_id` and `awarded`.
- Updated references in the code to ensure points are deducted upon claiming.

## Conclusion
With these final changes, the code can now insert into `claimed_awards` whenever a child redeems an award, and optionally update `awarded` in the `awards` table as needed.