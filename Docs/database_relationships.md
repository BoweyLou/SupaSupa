# SupaSupa Database Relationships Documentation

This document provides a detailed overview of the relationships between tables in the SupaSupa application's Supabase database.

## Table of Contents

- [User and Family Relationships](#user-and-family-relationships)
- [Task Relationships](#task-relationships)
- [Award System Relationships](#award-system-relationships)
- [Bonus Award Relationships](#bonus-award-relationships)
- [Theme Settings Relationships](#theme-settings-relationships)
- [Entity Relationship Diagram](#entity-relationship-diagram)

## User and Family Relationships

### Users to Families

- **Relationship Type**: Many-to-One
- **Foreign Key**: `users.family_id` references `families.family_id`
- **Description**: Each user belongs to at most one family. A family can have multiple users.

### Families to Owner

- **Relationship Type**: Many-to-One
- **Foreign Key**: `families.owner_id` references a user ID
- **Description**: Each family has one owner who is a user. A user can own multiple families.

## Task Relationships

### Tasks to Assigned Child

- **Relationship Type**: Many-to-One
- **Foreign Key**: `tasks.assigned_child_id` references `users.id`
- **Description**: Each task can be assigned to at most one child. A child can have multiple tasks assigned to them.

### Tasks to Creator

- **Relationship Type**: Many-to-One
- **Foreign Key**: `tasks.created_by` references `users.id`
- **Description**: Each task is created by one user (typically a parent). A user can create multiple tasks.

## Award System Relationships

### Awards to Families

- **Relationship Type**: Many-to-One
- **Foreign Key**: `awards.family_id` references `families.family_id`
- **Description**: Each award belongs to at most one family. A family can have multiple awards.

### Claimed Awards to Awards

- **Relationship Type**: Many-to-One
- **Foreign Key**: `claimed_awards.award_id` references `awards.id`
- **Description**: Each claimed award references one award. An award can be claimed multiple times.

### Claimed Awards to Children

- **Relationship Type**: Many-to-One
- **Foreign Key**: `claimed_awards.child_id` references `users.id`
- **Description**: Each claimed award is claimed by one child. A child can claim multiple awards.

### Award Redemptions to Awards

- **Relationship Type**: Many-to-One
- **Foreign Key**: `award_redemptions.award_id` references `awards.id`
- **Description**: Each award redemption references one award. An award can be redeemed multiple times.

### Award Redemptions to Children

- **Relationship Type**: Many-to-One
- **Foreign Key**: `award_redemptions.child_id` references `users.id`
- **Description**: Each award redemption is redeemed by one child. A child can redeem multiple awards.

## Bonus Award Relationships

### Bonus Award Instances to Bonus Awards

- **Relationship Type**: Many-to-One
- **Foreign Key**: `bonus_award_instances.bonus_award_id` references `bonus_awards.id`
- **Description**: Each bonus award instance references one bonus award. A bonus award can have multiple instances.

### Bonus Award Instances to Children

- **Relationship Type**: Many-to-One
- **Foreign Key**: `bonus_award_instances.assigned_child_id` references `users.id`
- **Description**: Each bonus award instance is assigned to one child. A child can have multiple bonus award instances.

## Theme Settings Relationships

### Theme Settings to Families

- **Relationship Type**: One-to-One
- **Foreign Key**: `theme_settings.family_id` references `families.family_id`
- **Description**: Each family has at most one theme setting. Each theme setting belongs to exactly one family.

## Entity Relationship Diagram

Below is a simplified entity relationship diagram (ERD) showing the main tables and their relationships:

```
+-------------+       +-------------+       +-------------+
|   families  |       |    users    |       |    tasks    |
+-------------+       +-------------+       +-------------+
| family_id   |<------| family_id   |       | id          |
| name        |       | id          |<------| assigned_to |
| owner_id    |------>| name        |       | created_by  |----+
+-------------+       | role        |       +-------------+    |
       ^              | points      |                          |
       |              +-------------+                          |
       |                    ^                                  |
       |                    |                                  |
+-------------+             |                                  |
|theme_settings|            +----------------------------------+
+-------------+             |
| id          |             |
| family_id   |             |
+-------------+             |
                            |
+-------------+       +-------------+       +-------------+
|   awards    |       |claimed_awards|      |award_redempt|
+-------------+       +-------------+       +-------------+
| id          |<------| award_id    |       | id          |
| title       |       | child_id    |------>| award_id    |
| points      |       +-------------+       | child_id    |
| family_id   |                             +-------------+
+-------------+
       ^
       |
       |
+-------------+       +-------------+
|bonus_awards  |      |bonus_award_in|
+-------------+       +-------------+
| id          |<------| bonus_award_id|
| title       |       | assigned_child_id|
| points      |       +-------------+
+-------------+
```

## Notes on Relationships

- The `users` table is central to many relationships, as it contains both parents and children.
- The `families` table serves as a grouping mechanism for users and awards.
- The award system involves multiple tables to track different aspects of awards, including claiming and redemption.
- The bonus award system is separate from the regular award system but follows a similar pattern.
- Theme settings have a one-to-one relationship with families, indicating that each family has its own theme settings.

This documentation provides an overview of the relationships between tables in the SupaSupa application's database. Understanding these relationships is crucial for developing and maintaining the application. 