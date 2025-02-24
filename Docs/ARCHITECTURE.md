# SupaSupa Architecture Documentation

## 1. Overview

SupaSupa is a web application designed to help families manage tasks (quests) and reward their completion.  It features a parent-child role system, where parents can create and assign tasks, and children can mark them as complete, pending approval. Upon approval, children earn points, which can be redeemed for rewards. The system is gamified with points, bonus awards, and a simple reward claiming mechanic.

## 2. Technology Stack

The application is built using the following core technologies:

*   **Frontend:**
    *   **Next.js (v15.1.6):** A React framework for building server-rendered and statically generated web applications.  Uses the App Router.
    *   **React (v19.0.0):** A JavaScript library for building user interfaces.
    *   **Tailwind CSS (v3.4.17):** A utility-first CSS framework for rapidly building custom designs.
    *   **Lucide React (v0.474.0):**  A library for icons.
    *    **clsx, class-variance-authority, tailwind-merge, tailwindcss-animate**: Utility libraries for more efficient Tailwind CSS use and animation

*   **Backend:**
    *   **Supabase (v2.48.1):**  An open-source Firebase alternative providing a PostgreSQL database, authentication, real-time subscriptions, and serverless functions.

*   **Development Tools:**
    *   **TypeScript (v5.7.3):**  A superset of JavaScript that adds static typing.
    *   **ESLint:**  A linter for identifying and reporting on patterns found in ECMAScript/JavaScript code.
    *   **Prettier:** (Inferred - from code formatting) An opinionated code formatter.
    *    **pnpm**: Package Manager

## 3. Architecture

### 3.1. Frontend

#### 3.1.1. Next.js Framework

SupaSupa utilizes the Next.js framework with the **App Router**. This means the application structure follows the file-based routing system within the `src/app` directory.  Each directory inside `src/app` represents a route segment.

#### 3.1.2. Component Structure

The `src/components` directory houses reusable UI components.  These components are built using React and styled with Tailwind CSS.  Key components include:

*   **`AddTask.tsx`:** A modal component that allows parents to create new tasks.
*   **`AddAward.tsx`:** A modal component for creating rewards.
*   **`AddBonusAward.tsx`**: A modal component for creating Bonus Awards
*   **`AwardCard.tsx`:** Displays an award, with options for claiming (child view) or editing/deleting (parent view).
*  **`BonusAwardCard.tsx`**: Displays Bonus Awards.
*  **`BonusAwardCardSimple.tsx`**: Displays a child's awarded bonus awards
*   **`ChildAccountCard.tsx`:**  Displays information about a child account, including options for editing and deleting (parent view).
*   **`ChildSelectorModal.tsx`:**  A modal for selecting a child to award a bonus to.
*   **`ClaimedAwardCard.tsx`:**  Displays a claimed award.
*   **`ClaimedAwards.tsx`:** Lists claimed rewards for a child.
*   **`CompletedTaskCard.tsx`:**  A small card displaying a completed task.
*   **`DashboardNav.tsx`:**  The navigation bar for the dashboard.
*   **`DashboardSection.tsx`:**  A reusable container for dashboard sections, with optional toggling.
*   **`DashboardTabs.tsx`:**  A tabbed interface for switching between parent and child views.
*   **`PointsDisplay.tsx`:**  Displays the points for children and the family.
*   **`QuestCard.tsx`:**  Displays a task (quest), with role-based actions (complete, approve, reject, edit, delete).
*  **`StarDisplay.tsx`**: Displays a graphical representation of a user or rewards points total.
* **`AwardsSection.tsx`**: Displays a card section for Awards that lets child users redeem points.

#### 3.1.3. Routing

The application uses Next.js's file-based routing. Key routes include:

*   `/`:  Redirects to `/login` if not authenticated, otherwise to `/dashboard`.
*   `/login`:  The login page.
*   `/register`: The registration page.
*   `/dashboard`:  The main dashboard, which displays different content based on user role (parent or child).  Uses tabs to switch between views.

#### 3.1.4. Styling

Tailwind CSS is used extensively for styling.  The `tailwind.config.js` and `tailwind.config.ts` files contain the Tailwind configuration, including custom colors and animations.  The `src/app/globals.css` file sets up base styles and integrates Tailwind's layers.

#### 3.1.5. State Management
The application utilizes React's built-in state management using hooks including but not limited to:
* `useState`
* `useEffect`
* `useCallback`
* `useMemo`

Real-time updates of user points and family members are managed through supabase subscriptions within `useEffect` hooks.

### 3.2. Backend

#### 3.2.1. Supabase

SupaSupa leverages Supabase for various backend functionalities:

*   **Database:**  A PostgreSQL database is used to store user data, family information, tasks, awards, and bonus awards.
*   **Authentication:** Supabase Auth handles user registration, login, and session management.  The `supabase.auth.signInWithPassword` and `supabase.auth.signUp` methods are used for authentication.
*   **Realtime:** Supabase Realtime is used to subscribe to changes in the `users` table, specifically to update points and child accounts instantly.
* **Functions:** The Supabase database includes a custom function, `deduct_points`, for handling points deduction, maintaining data integrity.

#### 3.2.2. Data Repositories

The `src/repositories` directory contains files that encapsulate database interactions.  Currently, `tasksRepository.ts` provides functions for:

*   `fetchParentTasks`:  Fetches tasks created by a specific parent.
*   `fetchChildTasks`:  Fetches tasks assigned to a specific child.
*   `updateTaskStatus`:  Updates the status of a task (e.g., from "assigned" to "pending approval").
*    `updateTask`:  Updates the details of a task (e.g., title, description, points).
*    `deleteTask`:  Deletes a task.
*    `addTask`:  Adds a new task.
*   `fetchTask`: Fetches details of a single task.

These functions interact directly with the Supabase client (`supabase`).

#### 3.2.3. API Routes

There is an `src/api` directory but its usage is minimal, with only basic typescript for fetching quests. This indicates that most logic is handled client-side with direct Supabase interaction, or via database functions.

### 3.3. Data Flow

1.  **Authentication:**  Users register or log in via the `/register` and `/login` pages, which use Supabase Auth.
2.  **Dashboard:**
    *   Upon successful authentication, the user is redirected to `/dashboard`.
    *   The dashboard fetches the current user's data, including their role (parent or child) and family ID.
    *   If the user is a parent:
        *   Fetches all children in the family.
        *   Fetches tasks created by the parent.
        *   Fetches available bonus awards.
        *    Fetches available awards.
    *   If the user is a child:
        *   Fetches tasks assigned to the child.
        *   Fetches the child's points.
3.  **Task Management:**
    *   Parents can create tasks using the `AddTask` component, specifying details and assigning them to a child.
    *   Children can mark tasks as "completed" (which sets the status to "pending approval").
    *   Parents can approve or reject pending tasks.  Approval updates the task status to "completed" and adds points to the child's account.
    *   Parents can edit and delete tasks.
4.  **Bonus Awards:**
    *   Parents can create bonus awards using the `AddBonusAward` component.
    *   Parents can award bonus awards to children, which creates a new record in the `bonus_award_instances` table and adds points to child user records.
    *   Children can view awarded bonuses.
    *  Parents can edit and delete bonus awards
5.  **Awards:**
    *    Parents can create awards using the `AddAward` component.
    *    Children can claim rewards if they have enough points, which deducts points and updates the award's status.
    *   Parents can edit or delete existing awards.
6. **Claimed Rewards:**
    * Child users may claim available rewards if they have enough points.
    * Claiming a reward triggers the `deduct_points` database function.
    * A record is added to the `claimed_awards` table.

## 4. Key Features

### 4.1. User Authentication

*   **Registration:**  New users (parents) can create accounts with an email, password, and name. The `supabase.auth.signUp` function is used. Upon successful registration, a new family is created, and the user is added to the `users` table with the `parent` role.
*   **Login:**  Existing users can log in with their email and password using `supabase.auth.signInWithPassword`.

### 4.2. Family and User Management

*   A `families` table stores family information.
*   A `users` table stores user data, including:
    *   `id`:  A UUID generated by Supabase Auth.
    *   `name`: The user's name.
    *   `family_id`: A foreign key referencing the `families` table.
    *   `role`:  Either "parent" or "child".
    *   `points`: The user's current points.
*   Parents can add child accounts by providing a name. A new user record is created with the `child` role and associated with the parent's family.
*   Parents can edit and delete child accounts.

### 4.3. Task Management

*   A `tasks` table stores task information.
*   Parents can create tasks, assigning them to specific children.
*   Children can mark tasks as "completed", changing their status to "pending approval".
*   Parents can approve or reject pending tasks.  Approval triggers a points update for the child.
*   Recurring tasks (daily, weekly) are supported. A `next_occurrence` field is included, but the manual reset button suggests the automatic reset logic is incomplete or for future implementation.
* Parents can manually reset recurring tasks to "assigned."

### 4.4. Points System

*   Children accumulate points by completing tasks.
*   Points are stored in the `users` table.
*   Points are updated when a parent approves a task.
*   The `PointsDisplay` component shows points for each child and the total family points.

### 4.5 Awards System

*   Parents can create awards, specifying a title, description, and point cost.
*   Awards are stored in an `awards` table.
*  Awards are associated with a family via the `family_id` column in the `awards` table.
*   Children can claim awards if they have enough points.

### 4.6 Bonus Awards

*  Parents can create bonus awards with names, icons, and points.
* Bonus Awards are stored in the `bonus_awards` table.
* Awarded instances of bonus awards are stored in the `bonus_award_instances` table.

### 4.7. Claimed Awards

* Claimed awards by child users are stored in the `claimed_awards` table.
* Claimed Awards displays a list of claimed awards for the child.

## 5. Data Model (Inferred)

Based on the codebase, the likely database schema includes the following tables:

*   **`families`:**
    *   `family_id` (UUID, Primary Key)
    *   `owner_id` (UUID, Foreign Key referencing `users.id` of the parent)
    *   `name` (Text)

*   **`users`:**
    *   `id` (UUID, Primary Key, from Supabase Auth)
    *   `name` (Text)
    *   `family_id` (UUID, Foreign Key referencing `families.family_id`)
    *   `role` (Text, either "parent" or "child")
    *   `points` (Integer)
        *  `created_at` (Timestamp)
        *  `updated_at` (Timestamp)

*   **`tasks`:**
    *   `id` (UUID, Primary Key)
    *   `title` (Text)
    *   `description` (Text)
    *   `reward_points` (Integer)
    *   `frequency` (Text, "daily", "weekly", or "one-off")
    *   `status` (Text, "assigned", "pending approval", "completed", "rejected")
    *   `assigned_child_id` (UUID, Foreign Key referencing `users.id`)
    *   `created_by` (UUID, Foreign Key referencing `users.id` of the parent)
    *   `created_at` (Timestamp)
    *   `updated_at` (Timestamp)
    *   `next_occurrence` (Timestamp, for recurring tasks)

* **`awards`:**
    * `id` (UUID, Primary Key)
    * `title` (Text)
    * `description` (Text, Optional)
    * `points` (Integer)
    * `awarded` (Boolean, defaults to false)
    *   `family_id` (UUID, Foreign Key referencing `families.family_id`)
    * `created_at` (Timestamp)
    * `updated_at` (Timestamp)

* **`bonus_awards`:**
    *  `id` (UUID, Primary Key)
    *  `title` (Text)
    *  `icon` (Text)
    *  `points` (Integer)
    * `status` (Text, 'available' or 'awarded', although this appears to be tracked per-instance instead)
    *  `created_at` (Timestamp)
    *  `updated_at` (Timestamp)

*   **`bonus_award_instances`:**
    *   `id` (UUID, Primary Key)
    *   `bonus_award_id` (UUID, Foreign Key referencing `bonus_awards.id`)
    *   `assigned_child_id` (UUID, Foreign Key referencing `users.id`)
    *   `awarded_at` (Timestamp)

*  **`claimed_awards`:**
     *   `id` (UUID, Primary Key): Unique ID for the claim record.
     *   `award_id` (UUID, Foreign Key referencing awards.id): ID of the claimed award.
     *   `child_id` (UUID, Foreign Key referencing users.id): ID of the child who claimed the award.
     *   `claimed_at` (Timestamp): Date and time of the claim.
     *   `points_deducted` (Integer): Points deducted (redundant, but might be useful for auditing).
     *  `awards` (*, joined data): All column data related to this award.

## 6. Configuration

* **`.env`:**  Contains environment variables, including Supabase credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`).
* **`next.config.js`:** Next.js configuration, which includes webpack configuration to handle the Supabase client (although it's currently commented out, suggesting it's not actively being used to exclude Supabase from client bundles).
* **`tailwind.config.js` / `tailwind.config.ts`:** Tailwind CSS configuration, including theme customizations and plugin usage.
* **`tsconfig.json`**: TypeScript configuration file, including path aliases.
* **`postcss.config.mjs`**: Tailwind CSS config file, including plugin use of tailwindcss.
* **`eslint.config.mjs`**: ESLint configuration file using FlatCompat and extending next/core-web-vitals and next/typescript
* **`components.json`**: Shadcn UI config file.
* **`package.json`**: Contains the project's dependencies and scripts.

This document provides a comprehensive overview of the SupaSupa application's architecture, data flow, key features, and technology stack, based on the provided code.