# SupaSupa Database Functions Documentation

This document provides detailed information about the database functions available in the SupaSupa application's Supabase database.

## Table of Contents

- [Award System Functions](#award-system-functions)
- [Point Management Functions](#point-management-functions)
- [Search and Utility Functions](#search-and-utility-functions)

## Award System Functions

### `claim_award_transaction`

Handles the transaction for claiming an award, ensuring that points are properly deducted and the award is properly recorded.

**Arguments:**
- `p_award_id` (string): The ID of the award being claimed
- `p_child_id` (string): The ID of the child claiming the award
- `p_points` (number): The number of points to deduct

**Returns:**
- `boolean`: Whether the transaction was successful

**Usage Example:**
```sql
SELECT claim_award_transaction('award-123', 'child-456', 100);
```

### `is_award_available_for_child`

Checks if an award is available for a specific child based on various criteria such as redemption limits, lockout periods, and allowed children.

**Arguments:**
- `p_award_id` (string): The ID of the award to check
- `p_child_id` (string): The ID of the child to check for

**Returns:**
- `boolean`: Whether the award is available for the child

**Usage Example:**
```sql
SELECT is_award_available_for_child('award-123', 'child-456');
```

## Point Management Functions

### `deduct_points`

Deducts points from a child's balance.

**Arguments:**
- `child_uuid` (string): The ID of the child
- `deduction` (number): The number of points to deduct

**Returns:**
- `users[]`: The updated user record(s)

**Usage Example:**
```sql
SELECT * FROM deduct_points('child-123', 50);
```

## Search and Utility Functions

The database includes several utility functions for various operations, including:

### Vector Operations

- `vector_dims`: Gets the dimensions of a vector
- `vector_norm`: Calculates the norm of a vector
- `vector_avg`: Calculates the average of vectors
- `l2_norm`: Calculates the L2 norm of a vector
- `l2_normalize`: Normalizes a vector using L2 normalization

### JSON Schema Validation

- `json_matches_schema`: Checks if a JSON document matches a schema
- `jsonb_matches_schema`: Checks if a JSONB document matches a schema
- `jsonschema_is_valid`: Checks if a JSON schema is valid
- `jsonschema_validation_errors`: Gets validation errors for a JSON document against a schema

### Search Functions

- `docs_search_embeddings`: Searches for documents using embeddings
- `docs_search_fts`: Searches for documents using full-text search
- `match_page_sections_v2`: Matches page sections using embeddings

## Usage Notes

- These functions are designed to be used within the Supabase database and can be called from SQL queries or through the Supabase API.
- Some functions may have dependencies on other functions or extensions.
- The award system functions are particularly important for the core functionality of the SupaSupa application, as they handle the claiming and redemption of awards.

## Security Considerations

- Access to these functions should be properly controlled through Supabase's Row Level Security (RLS) policies.
- Functions that modify data (such as `claim_award_transaction` and `deduct_points`) should be especially protected to prevent unauthorized use.

This documentation provides an overview of the database functions available in the SupaSupa application. For more detailed information about specific functions, refer to the function definitions in the database. 