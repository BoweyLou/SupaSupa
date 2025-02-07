# Dashboard Logic Documentation

This document describes the logic implemented in the DashboardPage component (`src/app/dashboard/page.tsx`) and its integration with our Supabase backend.

## Overview

The Dashboard page is responsible for:
- Authenticating the user via Supabase.
- Fetching the current user's record from the `users` table.
- Fetching the user's associated family record from the `families` table and related child accounts from the `users` table.
- Fetching tasks from the `tasks` table associated with the user. For parent users, tasks are intended to be filtered by the `created_by` field, which should correspond to the UUID in the `users` table. (Currently, for demonstration/testing purposes, the query is hardcoded to filter tasks using a fixed UUID.)
- Allowing task status updates via the QuestCard component.

## Detailed Flow

1. **User Authentication:**
   - The page obtains the current authenticated user by calling `supabase.auth.getSession()`. If no session is found, the user is redirected to the login page.

2. **Fetching the Database User Record:**
   - The component checks `user.user_metadata` to determine an identifier for the current user (preferring `name` if available, otherwise falling back to `id`).
   - It then queries the `users` table using the chosen field.
   - If no record is found (error code `PGRST116`), a new record is created in the `users` table, where the `id` is set to `user.user_metadata.sub` (if available) or `user.id`. This ensures that the unique identifier in the `users` table aligns with what is expected by the `tasks` table.
   - The existing or newly created record is stored as `dbUser`.

3. **Family and Child Accounts:**
   - Once `dbUser` is available, the `families` table is queried for a record where `owner_id` matches `dbUser.id`.
   - The fetched family record provides a `family_id`, which is then used to retrieve child account records (filtered by `role = 'child'`) from the `users` table.

4. **Fetching Tasks:**
   - The intended logic is to fetch tasks from the `tasks` table where the `created_by` field matches the UUID from the `users` table (i.e., `dbUser.id`).
   - **Note:** For testing purposes, the current query is hardcoded to filter tasks by the UUID `f52a4434-3d0b-4fd2-b6a5-912c2f1c6011`. This should be updated to use `dbUser.id` dynamically once alignment with the sample data is achieved.
   - The raw task records are mapped to the `Quest` interface and displayed as QuestCard components.

5. **Task Update:**
   - The function `handleTaskCompletion` updates a task's status:
     - For child users, the updated status is set to "pending approval".
     - For parent users, the status is updated to "completed".
   - After an update, tasks are re-fetched to reflect the changes.

## Database Structure

- **users:** Contains user records with columns `id`, `name`, `family_id`, `role`, and `points`.
- **families:** Contains family records with columns such as `family_id` and `owner_id`.
- **tasks:** Contains task records with columns including `id`, `title`, `description`, `reward_points`, `status`, and `created_by`.

## Future Enhancements

- Update the task fetching logic to dynamically use `dbUser.id` instead of a hardcoded value.
- Implement detailed Row Level Security (RLS) policies for secure data access.
- Enhance error handling and user feedback in the dashboard. 