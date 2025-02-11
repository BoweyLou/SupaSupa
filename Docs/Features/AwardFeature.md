# docs/Features/AwardFeature.md
// AwardFeature: Detailed Plan for Implementing the Awards Component
// This document outlines the plan with checklists to track progress. Use [ ] for pending items and [x] when completed.

---

## Overview

This feature adds an Awards component that allows children to redeem rewards using accumulated points. In addition, some rewards can have freeze out periods to prevent too many concurrent redemptions, and some can be disabled manually by parents (making them visible but not redeemable).

---

## Checklist

- [ ] **Database Changes**
  - [ ] Create a new `awards` table with the following fields:
    - `award_id` (UUID, primary key)
    - `title` (text)
    - `description` (text)
    - `cost_points` (integer): points required to redeem the award
    - `freeze_out_period` (integer): the duration (e.g., in hours) for the cooldown after a redemption, during which the award cannot be redeemed again
    - `is_enabled` (boolean): flag controlled by parents to manually disable/enable an award, default is true
    - `image_url` (optional, text): URL for an image representing the award
    - Timestamps: `created_at` and `updated_at`
  - [ ] Create a join table `user_awards` to record redemptions with fields such as:
    - `id` (UUID, primary key)
    - `user_id` (UUID): references the child's user record
    - `award_id` (UUID): references the redeemed award
    - `redeemed_at` (timestamp)
    - [ ] Optionally add a `status` field if parent approval is required for redemption

- [ ] **Backend & API / Repository Layer**
  - [ ] Create repository functions in a new file (e.g., `awardsRepository.ts`):
    - `fetchAvailableAwards`: Retrieve all awards.
    - `redeemAward`:
      - Validate that the child has enough points.
      - Check if the award is currently in a freeze out period for that user (i.e., if a recent redemption exists within the `freeze_out_period`).
      - Ensure that the reward is enabled (`is_enabled == true`); if not, redemption should be blocked.
      - Deduct the cost from the child's points or mark the redemption as pending (if parental approval is needed).
      - Insert a record into the `user_awards` table.
  - [ ] Set up real-time subscriptions if needed (similar to tasks) to update the UI when awards are redeemed or when points change.

- [ ] **Frontend Components**
  - [ ] **AwardCard Component**
    - Display award details (title, description, image, and cost in points).
    - Show visual indicators if the award is in a cooldown period (freeze out) or if it is disabled by a parent (e.g., grayed out).
    - Include a "Redeem" button that is disabled if:
      - The award is currently in a freeze out period.
      - The award is manually disabled (`is_enabled == false`).
  - [ ] **AwardsList / AwardsCatalog Component**
    - Fetch and list all available awards.
    - Display awards in a grid or list with the AwardCard component.
  - [ ] Implement the redemption flow on click:
    - On clicking "Redeem", show a confirmation modal if necessary.
    - Validate the redemption via the repository function and update the child's points and the UI accordingly.

- [ ] **Integration into the Dashboard**
  - [ ] Add a new section (or a dedicated Awards page) in the dashboard to show available awards.
  - [ ] Update the PointsDisplay component to indicate that points can be redeemed for awards.
  - [ ] Ensure real-time or refresh mechanisms to update award availability and child points after redemption.

- [ ] **Documentation Updates**
  - [ ] Update the overall product requirements document (PRD) to include details about the Awards feature.
  - [ ] Update the schema documentation to reflect new tables and fields added.
  - [ ] Include a summary in the README.md and add a changelog entry in CHANGELOG.md explaining the new feature.

- [ ] **Testing & Error Handling**
  - [ ] Write unit and integration tests for new repository functions (e.g., checking freeze out logic, point deductions, and disabled awards).
  - [ ] Test the AwardCard component to ensure proper UI behavior (buttons should be disabled as needed).
  - [ ] Verify error handling and display of error messages consistent with our patterns in `/src/utils/errors.ts`.

- [ ] **Future Improvements & Considerations**
  - [ ] Additional validations to prevent multiple concurrent redemptions beyond what the freeze out period covers.
  - [ ] Parent notifications: Alert parents when a redemption is attempted on a disabled award or when an award enters/exits a freeze period.
  - [ ] UI/UX enhancements, such as animations or success messages upon redemption, to improve user engagement.

---

## Summary

This plan includes:

- Setting up new database tables to support awards with freeze out periods and manual enable/disable settings.
- Implementing backend repository functions that enforce these rules during the redemption process.
- Building frontend components that display awards with clear indicators of availability and disablement.
- Integrating the awards functionality into the existing dashboard and updating documentation and tests accordingly.

Use this document to track progress by checking off items as each step is completed. 