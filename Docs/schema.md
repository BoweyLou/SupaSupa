| table_name            | column_name       | data_type                |
| --------------------- | ----------------- | ------------------------ |
| access_tokens         | id                | uuid                     |
| access_tokens         | user_id           | uuid                     |
| access_tokens         | token             | text                     |
| access_tokens         | created_at        | timestamp with time zone |
| access_tokens         | updated_at        | timestamp with time zone |
| awards                | id                | uuid                     |
| awards                | title             | text                     |
| awards                | description       | text                     |
| awards                | points            | integer                  |
| awards                | created_at        | timestamp with time zone |
| awards                | updated_at        | timestamp with time zone |
| bonus_award_instances | id                | uuid                     |
| bonus_award_instances | bonus_award_id    | uuid                     |
| bonus_award_instances | assigned_child_id | uuid                     |
| bonus_award_instances | awarded_at        | timestamp with time zone |
| bonus_award_instances | created_at        | timestamp with time zone |
| bonus_award_instances | updated_at        | timestamp with time zone |
| bonus_awards          | id                | uuid                     |
| bonus_awards          | title             | text                     |
| bonus_awards          | icon              | text                     |
| bonus_awards          | points            | integer                  |
| bonus_awards          | status            | text                     |
| bonus_awards          | assigned_child_id | uuid                     |
| bonus_awards          | created_at        | timestamp with time zone |
| bonus_awards          | updated_at        | timestamp with time zone |
| cli_login_sessions    | session_id        | uuid                     |
| cli_login_sessions    | public_key        | text                     |
| cli_login_sessions    | token_name        | text                     |
| cli_login_sessions    | device_code       | text                     |
| cli_login_sessions    | nonce             | text                     |
| cli_login_sessions    | created_at        | timestamp with time zone |
| cli_login_sessions    | updated_at        | timestamp with time zone |
| families              | family_id         | uuid                     |
| families              | name              | text                     |
| families              | owner_id          | uuid                     |
| families              | created_at        | timestamp with time zone |
| families              | updated_at        | timestamp with time zone |
| feedback              | id                | bigint                   |
| feedback              | date_created      | date                     |
| feedback              | vote              | USER-DEFINED             |
| feedback              | page              | text                     |
| feedback              | metadata          | jsonb                    |
| last_changed          | id                | bigint                   |
| last_changed          | checksum          | text                     |
| last_changed          | parent_page       | text                     |
| last_changed          | heading           | text                     |
| last_changed          | last_updated      | timestamp with time zone |
| last_changed          | last_checked      | timestamp with time zone |
| launch_weeks          | id                | text                     |
| launch_weeks          | created_at        | timestamp with time zone |
| launch_weeks          | start_date        | timestamp with time zone |
| launch_weeks          | end_date          | timestamp with time zone |
| meetups               | id                | uuid                     |
| meetups               | created_at        | timestamp with time zone |
| meetups               | launch_week       | text                     |
| meetups               | title             | text                     |
| meetups               | country           | text                     |
| meetups               | start_at          | timestamp with time zone |
| meetups               | link              | text                     |
| meetups               | display_info      | text                     |
| meetups               | is_live           | boolean                  |
| meetups               | is_published      | boolean                  |
| meetups               | timezone          | text                     |
| meetups               | city              | text                     |
| page                  | id                | bigint                   |
| page                  | path              | text                     |
| page                  | checksum          | text                     |
| page                  | meta              | jsonb                    |
| page                  | type              | text                     |
| page                  | source            | text                     |
| page                  | version           | uuid                     |
| page                  | last_refresh      | timestamp with time zone |
| page                  | content           | text                     |
| page                  | fts_tokens        | tsvector                 |
| page                  | title_tokens      | tsvector                 |
| page_section          | id                | bigint                   |
| page_section          | page_id           | bigint                   |
| page_section          | content           | text                     |
| page_section          | token_count       | integer                  |
| page_section          | embedding         | USER-DEFINED             |
| page_section          | slug              | text                     |
| page_section          | heading           | text                     |
| page_section          | rag_ignore        | boolean                  |
| tasks                 | id                | uuid                     |
| tasks                 | title             | text                     |
| tasks                 | description       | text                     |
| tasks                 | reward_points     | integer                  |
| tasks                 | frequency         | text                     |
| tasks                 | status            | text                     |
| tasks                 | created_by        | uuid                     |
| tasks                 | assigned_child_id | uuid                     |
| tasks                 | created_at        | timestamp with time zone |
| tasks                 | updated_at        | timestamp with time zone |
| tasks                 | next_occurrence   | timestamp with time zone |
| tickets               | id                | uuid                     |
| tickets               | created_at        | timestamp with time zone |
| tickets               | launch_week       | text                     |
| tickets               | user_id           | uuid                     |
| tickets               | email             | text                     |
| tickets               | name              | text                     |

# Prerequisites

Before running the database migrations, the following helper functions must be created in the database:

```sql
CREATE OR REPLACE FUNCTION public.validate_troubleshooting_errors(errors jsonb[])
RETURNS boolean AS $$
BEGIN
  -- TODO: Implement your validation logic here.
  RETURN true;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

This function is used to validate the format and content of troubleshooting errors stored in the database. It's designed to be extensible for future validation requirements.

# Database Schema Documentation

This document describes the structure of the PostgreSQL database used in the application. It outlines the tables, the columns within each table, and their respective data types, default values, and constraints. The database utilizes the "uuid-ossp" extension for generating UUIDs to maintain data integrity.

## Overview
The database consists of the following tables:
- access_tokens
- awards
- bonus_award_instances
- bonus_awards
- cli_login_sessions
- families
- feedback
- last_changed
- launch_weeks
- meetups
- page
- page_section
- tasks
- tickets

## Access Tokens Table
- **id**: uuid, primary key, auto-generated using uuid_generate_v4(), not null.
- **user_id**: uuid, not null; associates the token with a user.
- **token**: text, not null, unique.
- **created_at**: timestamp with time zone, not null, defaults to now().
- **updated_at**: timestamp with time zone, not null, defaults to now().

## Awards Table
- **id**: uuid, primary key, auto-generated using uuid_generate_v4(), not null.
- **title**: text, not null.
- **description**: text, optional.
- **points**: integer, not null.
- **created_at**: timestamp with time zone, not null, defaults to now().
- **updated_at**: timestamp with time zone, not null, defaults to now().

## Bonus Award Instances Table
- **id**: uuid, primary key, auto-generated using uuid_generate_v4(), not null.
- **bonus_award_id**: uuid, not null; references the bonus awards table.
- **assigned_child_id**: uuid, not null; identifier for the child assigned this bonus award.
- **awarded_at**: timestamp with time zone; indicates when the bonus award was given.
- **created_at**: timestamp with time zone, not null, defaults to now().
- **updated_at**: timestamp with time zone, not null, defaults to now().

## Bonus Awards Table
- **id**: uuid, primary key, auto-generated using uuid_generate_v4(), not null.
- **title**: text, not null.
- **icon**: text; provided to visually represent the bonus award.
- **points**: integer, not null.
- **status**: text, not null; the current state of the bonus award.
- **assigned_child_id**: uuid, optional; identifier for the child if the bonus award is assigned.
- **created_at**: timestamp with time zone, not null, defaults to now().
- **updated_at**: timestamp with time zone, not null, defaults to now().

## CLI Login Sessions Table
- **session_id**: uuid, primary key, auto-generated using uuid_generate_v4(), not null.
- **public_key**: text, not null.
- **token_name**: text, optional.
- **device_code**: text, not null.
- **nonce**: text, optional.
- **created_at**: timestamp with time zone, not null, defaults to now().
- **updated_at**: timestamp with time zone, not null, defaults to now().

## Families Table
- **family_id**: uuid, primary key, auto-generated using uuid_generate_v4(), not null.
- **name**: text, not null.
- **owner_id**: uuid, not null; represents the owner or manager of the family.
- **created_at**: timestamp with time zone, not null, defaults to now().
- **updated_at**: timestamp with time zone, not null, defaults to now().

## Feedback Table
- **id**: bigint, primary key.
- **date_created**: date; the date when the feedback was submitted.
- **vote**: USER-DEFINED; may indicate the type or value of feedback.
- **page**: text; refers to the page associated with the feedback.
- **metadata**: jsonb; stores additional context or details about the feedback.

## Last Changed Table
- **id**: bigint, primary key.
- **checksum**: text; used for verifying content integrity.
- **parent_page**: text; identifies the main page or section changed.
- **heading**: text; a title or descriptor for the change.
- **last_updated**: timestamp with time zone; when the last update occurred.
- **last_checked**: timestamp with time zone; when the change was last verified.

## Launch Weeks Table
- **id**: text; unique identifier for the launch week.
- **created_at**: timestamp with time zone, not null, defaults to now().
- **start_date**: timestamp with time zone; indicates when the launch week begins.
- **end_date**: timestamp with time zone; indicates when the launch week ends.

## Meetups Table
- **id**: uuid, primary key, auto-generated using uuid_generate_v4(), not null.
- **created_at**: timestamp with time zone, not null, defaults to now().
- **launch_week**: text; associates the meetup with a specific launch week.
- **title**: text; name of the meetup.
- **country**: text; location of the meetup.
- **start_at**: timestamp with time zone; start time of the meetup.
- **link**: text; URL or link for more information.
- **display_info**: text; additional details for displaying the meetup.
- **is_live**: boolean; indicates if the meetup is currently in progress.
- **is_published**: boolean; indicates if the meetup is public.
- **timezone**: text; timezone relevant to the meetup.
- **city**: text; specific city where the meetup is held.

## Page Table
- **id**: bigint, primary key.
- **path**: text; file path or URL representing the page.
- **checksum**: text; used for verifying the page's integrity.
- **meta**: jsonb; contains metadata for the page.
- **type**: text; categorizes the page.
- **source**: text; indicates the origin of the page content.
- **version**: uuid; version information for the page.
- **last_refresh**: timestamp with time zone; the last time the page was refreshed.
- **content**: text; the main body content of the page.
- **fts_tokens**: tsvector; full-text search tokens for efficient searching.
- **title_tokens**: tsvector; tokens extracted from the title for search purposes.

## Page Section Table
- **id**: bigint, primary key.
- **page_id**: bigint; foreign key linking to the page table.
- **content**: text; section content.
- **token_count**: integer; count of tokens in the section.
- **embedding**: USER-DEFINED; stores data for machine learning embeddings.
- **slug**: text; a URL-friendly identifier for the section.
- **heading**: text; title or header of the section.
- **rag_ignore**: boolean; flag indicating whether to ignore this section in retrieval-augmented generation (RAG) processes.

## Tasks Table
- **id**: uuid, primary key, auto-generated using uuid_generate_v4(), not null.
- **title**: text, not null.
- **description**: text, optional.
- **reward_points**: integer, not null, defaults to 0.
- **frequency**: text, not null; allowed values: 'daily', 'weekly', 'one-off'.
- **status**: text, not null; allowed values: 'assigned', 'pending approval', 'completed', 'rejected'.
- **created_by**: uuid, not null; references the creator of the task.
- **assigned_child_id**: uuid, optional; references the child to whom the task is assigned.
- **created_at**: timestamp with time zone, not null, defaults to now().
- **updated_at**: timestamp with time zone, not null, defaults to now().
- **next_occurrence**: timestamp with time zone, optional; indicates the next scheduled occurrence of the task.

## Tickets Table
- **id**: uuid, primary key, auto-generated using uuid_generate_v4(), not null.
- **created_at**: timestamp with time zone, not null, defaults to now().
- **launch_week**: text; associates the ticket with a specific launch week.
- **user_id**: uuid, not null; identifies the user associated with the ticket.
- **email**: text; contact email provided.
- **name**: text; name associated with the ticket.

## Additional Notes
- Default values and check constraints are in place to ensure data integrity.
- The "uuid-ossp" extension is used for UUID generation.
- Some columns use USER-DEFINED types, indicating custom types or enumerations.