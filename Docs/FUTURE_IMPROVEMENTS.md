# Future Improvements & Enhancements

This document outlines several potential enhancements to the SupaSupa application. Each section describes a conceptual overview, the files or modules most likely to be affected, and potential data or interface changes required for implementation. These ideas build on the existing architecture described in **PRD.md** and **ARCHITECTURE.md**.

---

## 1. Advanced Analytics & Leaderboards

### Overview
Introduce a dashboard for parents to analyze child performance trends and for children to see how they rank relative to siblings or friends. Analytics could include:
- Weekly tasks completed
- Streak tracking over extended periods
- Comparison of points among multiple children

### Proposed Technical Changes
- **New Database Tables/Views**:
  - `leaderboards`: Stores periodic snapshots of each child's points, for a time-based ranking system.
  - Alternatively, could leverage dynamic queries on the existing `users` table (`points`), retrieving the top N children in each family.

- **Frontend Adjustments** (`src/app/dashboard`):
  - A new "Analytics" or "Leaderboards" tab.
  - Graphing libraries or simple bar charts to represent progress over time.

- **Supabase Realtime**:
  - Possibly subscribe to changes in `points` to trigger immediate UI updates.

### Architectural Rationale
Aligns well with gamification, motivating children through transparency of progress and friendly competition.

---

## 2. Push Notifications

### Overview
Enable real-time push notifications to alert:
- Parents when a child completes (or attempts to complete) a task.
- Children when a task is approved or bonus award is issued.

### Proposed Technical Changes
1. **Push Notification Service**:
   - Integrate with a third-party service (e.g., Firebase Cloud Messaging or a Supabase Edge Function-based approach).
   - Store device tokens associated with user accounts in a new column `device_tokens[]` on the `users` table.

2. **Backend Logic** (`src/lib/supabase.ts` or a new serverless function):
   - On `user_tasks` insert or update to `pending_approval`, trigger a notification for the parent.
   - On `task` approval, notify the child.

3. **Frontend Adjustments**:
   - Prompt users to allow notifications (for parent/child on initial login).
   - Update user preferences in a new "Notification Settings" page.

### Architectural Rationale
Keeps the user engaged, ensures quick feedback loops, and integrates seamlessly if each user’s device tokens are tracked in Supabase.

---

## 3. Multi-Family & Co-Parenting Support

### Overview
Extend the system to allow:
- Multiple parents in a single family with equal or partial privileges.
- A single parent belonging to multiple families (blended families or guardians).

### Proposed Technical Changes
- **Database**:
  - `families` table already exists, but expand logic to allow many-to-many relationships between `users` (parents) and `families`.
  - Potentially introduce a junction table `family_parents` to capture distinct roles per parent.

- **Role-based Access**:
  - Distinguish "owner" vs. "co-parent" with partial privileges (like limited task creation or approvals).
  - Modify queries in `tasksRepository.ts` or any place referencing a single `created_by` to handle multiple authorized users.

### Architectural Rationale
Increases product flexibility. Must consider specialized security (only owners can remove a co-parent, for instance).

---

## 4. Tiered Awards & Marketplace

### Overview
Enhance the rewards system by introducing a marketplace concept where children can browse multiple categories of awards or prizes:
- Tiered Awards: Different “levels” or “rarities” of awards with scaled point costs.
- The ability to “upgrade” a reward if children gather enough points to jump to a bigger prize.

### Proposed Technical Changes
- **Database**:
  - Add a `category` column to the `awards` table and a `tier` column (e.g., Bronze, Silver, Gold).
  - Possibly track an `upgraded_from` reference if an award can be upgraded.

- **Redemption Workflow** (`src/components/AwardsSection.tsx`):
  - Children can see multiple categories in a grid or list.
  - Parent can manage awarding upgrades or partial refunds if an upgrade is performed (child might pay the difference in points).

### Architectural Rationale
Encourages children to save points for higher-tier rewards, adding a more strategic dimension to how they spend.

---

## 5. Advanced Recurring Tasks & Scheduling

### Overview
Currently, recurring tasks appear to be semi-manual or minimal. Expand scheduling capabilities to support:
- Automatic daily/weekly resets
- Custom intervals (e.g., every 2 days)
- A scheduling manager that regenerates tasks programmatically

### Proposed Technical Changes
- **Database**:
  - `tasks` or `recurring_tasks` table with a flexible `interval_type` (daily, weekly, custom) and a new `interval_value` field (e.g., “every 2 days”).
  - Store the next occurrence date/time and automatically recalculate after completion.

- **Serverless Cron Jobs** (Supabase Edge Functions or external cron):
  - Periodic function that scans tasks nearing or passing their next occurrence and reassigns them.

### Architectural Rationale
Minimizes manual overhead for parents with many tasks. Prevents oversight where tasks are never reset.

---

## 6. Localization & Multi-Language Support

### Overview
Offer multi-language options to families who speak languages other than English.

### Proposed Technical Changes
- **i18n Setup**:
  - Provide language files for UI strings (e.g., using `next-intl` or a similar library).
  - Store a user’s preferred language in the `users` table.

- **Frontend** (`src/app/...`):
  - Wrap pages in a translation provider.
  - Add language selection to the parent’s Settings page.

### Architectural Rationale
Widen user base, improve accessibility, and help children from different language backgrounds.

---

## 7. Parent Delegation & Child Logging

### Overview
Improve oversight and traceability:
- Let parents delegate tasks to each other or to older children with partial “sub-parent” permissions.
- Log child interactions and show a timeline of completed tasks.

### Proposed Technical Changes
- **Database**:
  - `audit_logs` table capturing user_id, event_type (task completed, points updated), timestamp, etc.
  - Distinguish “sub-parent” from “full parent” in `role` or a new `permissions` field for partial admin capabilities.

- **Frontend**:
  - Timeline or Activity Feed display: Show each child’s recent events.
  - Elevated permissions for older children if appropriate.

### Architectural Rationale
Encourages accountability, provides a full record for disputes, and allows families more flexible roles.

---

## Implementation Considerations

1. **Backward Compatibility**
   All new features must coexist with existing tasks, points, and roles. Ensure migrations are carefully designed so production data remains valid.

2. **Performance Implications**
   Features like analytics or real-time notifications could require thoughtful indexing and load testing, especially if families grow large or tasks scale.

3. **API Security**
   Multi-family or sub-parent features necessitate clearer role checks to ensure data isolation between families and partial access privileges.

4. **UX Clarity**
   Many of these enhancements introduce greater complexity. Each feature should be togglable via a feature flag or parent settings to preserve a simple flow if desired.

---

## Summary of Potential Architecture Changes

- **New DB Structures**:
  - `leaderboards` (or dynamic queries), `audit_logs`, `family_parents`.
- **Extended Models**:
  - `users` model might gain additional columns (`device_tokens[]`, `preferred_language`, `permissions`).
  - `awards` updated with `category` / `tier`.
- **Serverless Functions**:
  - Cron-like scheduled tasks for recurring assignments.
  - Push notification logic integrated with a 3rd-party or built as Supabase Edge Functions.
- **Frontend Modularization**:
  - Additional pages or tabs for analytics, marketplace, notifications settings.
  - Enhanced i18n approach for multi-language.

These enhancements maintain the original SupaSupa mission of gamified family task management while elevating it with new capabilities and a more robust architecture.