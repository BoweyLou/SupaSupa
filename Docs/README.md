# SupaSupa Documentation

Welcome to the SupaSupa documentation! This directory contains comprehensive documentation about the SupaSupa application, its database structure, and functionality.

## Documentation Files

- [**Database Schema**](database_schema.md) - Detailed information about all tables in the Supabase database, including columns, types, and descriptions.
- [**Database Functions**](database_functions.md) - Documentation of all database functions, their parameters, return values, and usage examples.
- [**Database Relationships**](database_relationships.md) - Overview of the relationships between tables in the database, including foreign keys and entity relationship diagrams.

## About SupaSupa

SupaSupa is a family task management application that helps parents assign tasks to children and reward them with points that can be redeemed for awards. The application uses Supabase for its backend, providing authentication, database, and real-time functionality.

### Key Features

- **User Management**: Support for parent and child user roles within family units
- **Task Management**: Create, assign, and track tasks for children
- **Award System**: Set up awards that children can claim with earned points
- **Bonus Award System**: Special awards that can be assigned to children
- **Theme Settings**: Customizable themes for each family

## Database Structure

The SupaSupa database is organized around several core concepts:

1. **Users and Families**: Users belong to families, with each family having an owner
2. **Tasks**: Assignments that can be created by parents and completed by children
3. **Awards**: Rewards that children can claim using points earned from completing tasks
4. **Bonus Awards**: Special awards that can be assigned directly to children
5. **Theme Settings**: Customization options for the application's appearance

## Using This Documentation

- Refer to the **Database Schema** document when you need to understand the structure of a specific table
- Check the **Database Functions** document when you need to understand how a particular database function works
- Use the **Database Relationships** document to understand how different tables are connected

## Contributing to Documentation

When making changes to the application that affect the database structure or functionality, please update the relevant documentation files to keep them in sync with the codebase.

---

For more information about the SupaSupa application, please refer to the main [README.md](../README.md) file in the project root. 