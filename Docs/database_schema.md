# Database Schema Documentation

This document provides an overview of the database schema used in the SupaSupa project.

## Families Table

This table stores information about families.

**Columns:**
- family_id (uuid): Unique identifier for a family.
- name (text): The name of the family.
- owner_id (uuid): References the user who owns the family.
- created_at (timestamp with time zone): When the family was created.
- updated_at (timestamp with time zone): When the family was last updated.

## Users Table

This table stores user information.

**Columns:**
- id (uuid): Unique identifier for a user.
- name (text): The user's name.
- points (integer): The user's accumulated points.
- role (text): The role of the user, which can be either 'parent' or 'child'.
- family_id (uuid): Associates the user with a family.
- created_at (timestamp with time zone): When the user was created.
- updated_at (timestamp with time zone): When the user was last updated.

## Tasks Table

This table is used to store quest/task information that integrates with the Quest Card feature.

**Columns:**
- id (uuid): Unique identifier for each task, auto-generated using uuid_generate_v4().
- title (text): The title of the quest.
- description (text): A description of the quest.
- reward_points (integer): Points awarded upon task completion.
- frequency (text): Indicates how often the task repeats. Accepts "daily", "weekly", or "one-off".
- status (text): Current status of the task. Accepts "assigned", "pending approval", "completed", or "rejected".
- assigned_child_id (uuid): References the child who is assigned the task.
- created_by (uuid): References the parent who created the task.
- created_at (timestamp with time zone): When the task was created.
- updated_at (timestamp with time zone): When the task was last updated.

**Constraints:**
- The frequency column is constrained to only accept "daily", "weekly", or "one-off".
- The status column is constrained to only accept "assigned", "pending approval", "completed", or "rejected".
- Foreign key constraints on assigned_child_id and created_by link the task to valid user entries in the users table.

This updated schema supports the quest flow by enabling detailed tracking of tasks from creation through completion and approval, ensuring real-time updates and robust data integrity.
