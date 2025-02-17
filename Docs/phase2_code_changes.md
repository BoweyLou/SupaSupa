# Phase 2 Code Modifications

This document describes the modifications implemented in Phase 2 of the Award System Improvement Plan. These changes enhance the award claiming process and ensure that awards are family-specific.

## Changes in AwardCard Component (src/components/AwardCard.tsx)

- The `AwardCardProps` interface was updated to include a new property `currentFamilyId`. This allows the component to determine if an award should be rendered based on the current user's family.
- Inside the AwardCard component, a check (`shouldRenderAward`) is performed. If the `currentFamilyId` is provided, the component only renders the award if the award's `familyId` matches `currentFamilyId`.

## Changes in DashboardPage (src/app/dashboard/page.tsx)

- **Fetching Awards:**
  - The `fetchAwards` function was modified to filter awards by the current user's family. When the `dbUser` has a `family_id`, only awards with matching `family_id` are fetched.

- **Claiming an Award:**
  - The `handleClaimAward` function was updated to implement the following logic:
    - Check if the award exists and if the user (child) has sufficient points to claim the award.
    - If the user has enough points, deduct the award's points from the user's account in the `users` table.
    - Insert a new record into the `claimed_awards` table to log the claim.
    - Update the award's status in the `awards` table by marking it as awarded.
    - Update the local state to reflect the new points balance and award status.
  - If the user does not have enough points, an error message is displayed.

- **Passing Props to AwardCard:**
  - The DashboardPage now passes the `currentFamilyId` prop to each AwardCard component to ensure awards are rendered only for the correct family.

## BonusAwardCardSimple Component

- The `BonusAwardCardSimple` component was not modified to include `currentFamilyId` because it does not require family-specific filtering.

## Summary

Phase 2 modifications ensure that:
- Awards displayed are relevant to the current user's family.
- The award claiming process includes necessary validations for points deduction,
  recording the claim, and updating the award status.

For more details on the changes, review the modified sections in the codes:
- `src/components/AwardCard.tsx`
- `src/app/dashboard/page.tsx`

For further instructions on using the Supabase CLI and managing database migrations, please refer to the [Supabase CLI Documentation](https://supabase.com/docs/guides/cli) and the [Supabase CLI Essentials Guide](https://www.restack.io/docs/supabase-knowledge-supabase-cli-guide). 