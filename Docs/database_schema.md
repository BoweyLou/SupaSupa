# SupaSupa Database Schema Documentation

This document provides a comprehensive overview of the database schema used in the SupaSupa application. The schema is managed through Supabase and includes tables for managing users, families, tasks, awards, and more.

## Table of Contents

- [Users and Authentication](#users-and-authentication)
- [Family Management](#family-management)
- [Task Management](#task-management)
- [Award System](#award-system)
- [Bonus Award System](#bonus-award-system)
- [Theme Settings](#theme-settings)
- [Other Tables](#other-tables)
- [Functions](#functions)

## Users and Authentication

### `users` Table

Stores information about all users in the system, including parents and children.

| Column | Type | Description |
|--------|------|-------------|
| id | string | Primary key, UUID |
| name | string | User's name |
| role | string | User's role (e.g., 'parent', 'child') |
| family_id | string (nullable) | Reference to the family the user belongs to |
| points | number | Points accumulated by the user (primarily for children) |
| user_metadata | JSON (nullable) | Additional user metadata |
| created_at | string (timestamp) | When the user was created |
| updated_at | string (timestamp) | When the user was last updated |

### `access_tokens` Table

Stores access tokens for authentication.

| Column | Type | Description |
|--------|------|-------------|
| id | string | Primary key, UUID |
| user_id | string | Reference to the user |
| token | string | The access token |
| created_at | string (timestamp) | When the token was created |
| updated_at | string (timestamp) | When the token was last updated |

## Family Management

### `families` Table

Stores information about families in the system.

| Column | Type | Description |
|--------|------|-------------|
| family_id | string | Primary key, UUID |
| name | string | Family name |
| owner_id | string | Reference to the user who owns/created the family |
| created_at | string (timestamp) | When the family was created |
| updated_at | string (timestamp) | When the family was last updated |

## Task Management

### `tasks` Table

Stores tasks that can be assigned to children.

| Column | Type | Description |
|--------|------|-------------|
| id | string | Primary key, UUID |
| title | string | Task title |
| description | string (nullable) | Task description |
| reward_points | number | Points awarded for completing the task |
| status | string | Task status (e.g., 'pending', 'completed') |
| frequency | string | How often the task repeats |
| assigned_child_id | string (nullable) | Reference to the child assigned to the task |
| created_by | string | Reference to the user who created the task |
| next_occurrence | string (nullable) | When the task is next due |
| created_at | string (timestamp) | When the task was created |
| updated_at | string (timestamp) | When the task was last updated |

## Award System

### `awards` Table

Stores awards that children can redeem with their points.

| Column | Type | Description |
|--------|------|-------------|
| id | string | Primary key, UUID |
| title | string | Award title |
| description | string (nullable) | Award description |
| points | number | Points required to redeem the award |
| family_id | string (nullable) | Reference to the family the award belongs to |
| awarded | boolean | Whether the award has been awarded |
| allowed_children_ids | string[] (nullable) | Array of child IDs who can redeem this award |
| redemption_limit | number (nullable) | Maximum number of times the award can be redeemed |
| redemption_count | number (nullable) | Current number of times the award has been redeemed |
| lockout_period | number (nullable) | Time period before the award can be redeemed again |
| lockout_unit | string (nullable) | Unit for the lockout period (e.g., 'days', 'weeks') |
| last_redeemed_at | string (nullable) | When the award was last redeemed |
| created_at | string (timestamp) | When the award was created |
| updated_at | string (timestamp) | When the award was last updated |

### `claimed_awards` Table

Tracks when awards are claimed by children.

| Column | Type | Description |
|--------|------|-------------|
| id | string | Primary key, UUID |
| award_id | string (nullable) | Reference to the award |
| child_id | string (nullable) | Reference to the child who claimed the award |
| claimed_at | string (nullable) | When the award was claimed |
| points_deducted | number (nullable) | Points deducted from the child's balance |

### `award_redemptions` Table

Tracks when awards are redeemed by children.

| Column | Type | Description |
|--------|------|-------------|
| id | string | Primary key, UUID |
| award_id | string (nullable) | Reference to the award |
| child_id | string (nullable) | Reference to the child who redeemed the award |
| redeemed_at | string (nullable) | When the award was redeemed |

## Bonus Award System

### `bonus_awards` Table

Stores bonus awards that can be assigned to children.

| Column | Type | Description |
|--------|------|-------------|
| id | string | Primary key, UUID |
| title | string | Bonus award title |
| points | number | Points awarded for the bonus |
| icon | string | Icon for the bonus award |
| color | string (nullable) | Color for the bonus award |
| status | string | Status of the bonus award |
| assigned_child_id | string (nullable) | Reference to the child assigned to the bonus award |
| created_at | string (nullable) | When the bonus award was created |
| updated_at | string (nullable) | When the bonus award was last updated |

### `bonus_award_instances` Table

Tracks instances of bonus awards assigned to children.

| Column | Type | Description |
|--------|------|-------------|
| id | string | Primary key, UUID |
| bonus_award_id | string | Reference to the bonus award |
| assigned_child_id | string | Reference to the child assigned to the bonus award |
| awarded_at | string (nullable) | When the bonus award was awarded |
| created_at | string (nullable) | When the instance was created |
| updated_at | string (nullable) | When the instance was last updated |

## Theme Settings

### `theme_settings` Table

Stores theme settings for families.

| Column | Type | Description |
|--------|------|-------------|
| id | string | Primary key, UUID |
| family_id | string | Reference to the family |
| theme_name | string (nullable) | Name of the theme |
| custom_theme | JSON (nullable) | Custom theme settings |
| created_at | string (nullable) | When the theme settings were created |
| updated_at | string (nullable) | When the theme settings were last updated |

## Other Tables

The database also includes several other tables that appear to be related to Supabase's internal functionality or other features:

- `cli_login_sessions`: For CLI login sessions
- `feedback`: For user feedback
- `last_changed`: For tracking changes
- `launch_weeks`: For launch week events
- `meetups`: For meetup events
- `page`: For page content
- `page_section`: For page sections
- `tickets`: For event tickets
- `troubleshooting_entries`: For troubleshooting entries
- `validation_history`: For validation history

## Functions

The database includes several functions for various operations:

### Award System Functions

- `claim_award_transaction`: Handles the transaction for claiming an award
- `is_award_available_for_child`: Checks if an award is available for a child
- `deduct_points`: Deducts points from a child's balance

### Other Functions

- Various utility functions for vector operations, JSON schema validation, and other operations

## Relationships

The database includes several relationships between tables:

- Users belong to families
- Tasks are created by users and assigned to children
- Awards belong to families and can be claimed by children
- Bonus awards can be assigned to children
- Theme settings belong to families

This schema documentation provides a comprehensive overview of the database structure used in the SupaSupa application. 