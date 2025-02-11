# Database Schema Documentation

This document describes the structure of the PostgreSQL database used in the application. It includes details on database tables, columns, data types, default values, constraints, and relationships as defined in the current schema. The database uses the "uuid-ossp" extension for generating UUIDs.

## Overview
The database consists of the following tables:

- families
- tasks
- users
- awards
- cli_login_sessions
- access_tokens

## Families Table
- **family_id**: uuid, primary key, auto-generated using uuid_generate_v4(), not null.
- **name**: text, not null.
- **owner_id**: uuid, not null; represents the owner or manager of the family.
- **created_at**: timestamp with time zone, not null, defaults to now().
- **updated_at**: timestamp with time zone, not null, defaults to now().

## Tasks Table
- **id**: uuid, primary key, auto-generated using uuid_generate_v4(), not null.
- **title**: text, not null.
- **description**: text, optional.
- **reward_points**: integer, not null, defaults to 0.
- **frequency**: text, not null; allowed values: 'daily', 'weekly', 'one-off' (enforced by a check constraint).
- **status**: text, not null; allowed values: 'assigned', 'pending approval', 'completed', 'rejected' (enforced by a check constraint).
- **created_by**: uuid, not null; references the user who created the task.
- **assigned_child_id**: uuid, optional; references the assigned child.
- **created_at**: timestamp with time zone, not null, defaults to now().
- **updated_at**: timestamp with time zone, not null, defaults to now().

## Users Table
- **id**: uuid, primary key, auto-generated using uuid_generate_v4(), not null.
- **name**: text, not null.
- **family_id**: uuid, optional; associates the user with a family.
- **points**: integer, not null, defaults to 0.
- **role**: text, not null; allowed values: 'parent' or 'child' (enforced by a check constraint).
- **user_metadata**: jsonb, optional; stores additional data about the user.
- **created_at**: timestamp with time zone, not null, defaults to now().
- **updated_at**: timestamp with time zone, not null, defaults to now().

## Awards Table
- **id**: uuid, primary key, auto-generated using uuid_generate_v4(), not null.
- **title**: text, not null.
- **description**: text, optional.
- **points**: integer, not null.
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

## Access Tokens Table
- **id**: uuid, primary key, auto-generated using uuid_generate_v4(), not null.
- **user_id**: uuid, not null; associates the token with a user.
- **token**: text, not null, unique.
- **created_at**: timestamp with time zone, not null, defaults to now().
- **updated_at**: timestamp with time zone, not null, defaults to now().

## Additional Notes
- The database utilizes the "uuid-ossp" extension to provide UUID generation capabilities.
- Default values and check constraints ensure data integrity throughout the database schema.