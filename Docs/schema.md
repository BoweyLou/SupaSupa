| table_name | column_name       | data_type                | check_clause                                                                                              |
| ---------- | ----------------- | ------------------------ | --------------------------------------------------------------------------------------------------------- |
| families   | created_at        | timestamp with time zone |                                                                                                           |
| families   | family_id         | uuid                     |                                                                                                           |
| families   | family_id         | uuid                     |                                                                                                           |
| families   | name              | text                     |                                                                                                           |
| families   | owner_id          | uuid                     |                                                                                                           |
| families   | updated_at        | timestamp with time zone |                                                                                                           |
| tasks      | assigned_child_id | uuid                     |                                                                                                           |
| tasks      | created_at        | timestamp with time zone |                                                                                                           |
| tasks      | created_by        | uuid                     |                                                                                                           |
| tasks      | description       | text                     |                                                                                                           |
| tasks      | frequency         | text                     | ((frequency = ANY (ARRAY['daily'::text, 'weekly'::text, 'one-off'::text])))                               |
| tasks      | id                | uuid                     |                                                                                                           |
| tasks      | reward_points     | integer                  |                                                                                                           |
| tasks      | status            | text                     | ((status = ANY (ARRAY['assigned'::text, 'pending approval'::text, 'completed'::text, 'rejected'::text]))) |
| tasks      | title             | text                     |                                                                                                           |
| tasks      | updated_at        | timestamp with time zone |                                                                                                           |
| users      | created_at        | timestamp with time zone |                                                                                                           |
| users      | family_id         | uuid                     |                                                                                                           |
| users      | id                | uuid                     |                                                                                                           |
| users      | id                | uuid                     |                                                                                                           |
| users      | id                | uuid                     |                                                                                                           |
| users      | id                | uuid                     |                                                                                                           |
| users      | id                | uuid                     |                                                                                                           |
| users      | id                | uuid                     |                                                                                                           |
| users      | id                | uuid                     |                                                                                                           |
| users      | id                | uuid                     |                                                                                                           |
| users      | name              | text                     |                                                                                                           |
| users      | points            | integer                  |                                                                                                           |
| users      | role              | text                     | ((role = ANY (ARRAY['parent'::text, 'child'::text])))                                                     |
| users      | updated_at        | timestamp with time zone |                                                                                                           |


## Database Structure Overview

The database is structured into three main tables that organize our application data: **families**, **tasks**, and **users**.

### Families Table

- **created_at**: A timestamp with time zone indicating when the family record was created.
- **family_id**: A unique identifier (uuid) for the family. (Note: It may appear more than once in some query outputs, but only one unique identifier is used.)
- **name**: A text field representing the family's name.
- **owner_id**: A uuid linking to the user who owns or manages the family.
- **updated_at**: A timestamp with time zone marking the last time the record was updated.

### Tasks Table

- **assigned_child_id**: A uuid representing the child assigned to the task.
- **created_at**: A timestamp with time zone indicating when the task was created.
- **created_by**: A uuid referencing the user who created the task.
- **description**: A text field describing the task.
- **frequency**: A text field determining how often the task should occur. Valid values are 'daily', 'weekly', or 'one-off' (enforced by a check constraint).
- **id**: A unique identifier (uuid) for the task.
- **reward_points**: An integer representing the number of points rewarded for completing the task.
- **status**: A text field indicating the current status of the task. It must be one of 'assigned', 'pending approval', 'completed', or 'rejected' as enforced by a check constraint.
- **title**: A text field for the task's title.
- **updated_at**: A timestamp with time zone marking the last time the task record was updated.

### Users Table

- **created_at**: A timestamp with time zone indicating when the user record was created.
- **family_id**: A uuid that associates the user with a family.
- **id**: A unique identifier (uuid) for the user. (Note: The 'id' column appears multiple times in some query outputs, but only one unique identifier is used.)
- **name**: A text field for the user's name.
- **points**: An integer representing the user's accumulated points.
- **role**: A text field with a check constraint ensuring the value is either 'parent' or 'child'. This distinguishes the user's role within the system.
- **updated_at**: A timestamp with time zone marking the last update to the user record.

*Note:* Some columns appear more than once in query results due to the way the schema is queried; only distinct columns are used in the actual table definitions.