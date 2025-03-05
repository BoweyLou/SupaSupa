# Deployment Instructions for Timezone-Aware Task Reset

This document explains how to deploy the Edge Function and database changes.

## 1. Database Migration

First, ensure that the timezone field is added to your users table by applying the migration:

```bash
# Navigate to your project's root directory
cd /path/to/your/project

# Run the migration using Supabase CLI
supabase migration up
```

This will add the new `timezone` field to the users table with a default value of 'America/New_York'.

## 2. Edge Function Deployment

Deploy the Edge Function that will run hourly to reset tasks at each user's local midnight:

```bash
# Navigate to your project's root directory
cd /path/to/your/project

# Link your project if not already linked
supabase link --project-ref your-project-ref

# Deploy the Edge Function
supabase functions deploy reset-recurring-tasks --project-ref your-project-ref
```

## 3. Verify Edge Function Deployment

1. Visit your Supabase Dashboard
2. Go to Edge Functions section
3. Locate the `reset-recurring-tasks` function
4. Verify that the scheduled trigger is set up (hourly)
5. Check the logs to ensure it's running properly

## Testing

You can manually invoke the function to test it:

```bash
# For local testing
supabase functions serve reset-recurring-tasks

# In another terminal
curl http://localhost:54321/functions/v1/reset-recurring-tasks
```

For production testing, you can invoke it through the Supabase Dashboard.

## Monitoring

Monitor the function's execution through:

- Supabase Dashboard > Edge Functions > reset-recurring-tasks > Logs
- Supabase Dashboard > Edge Functions > reset-recurring-tasks > Invocations

## Important Notes

1. The function runs every hour but only resets tasks for users who are currently experiencing midnight in their timezone.
2. Users can select their timezone through the dashboard settings.
3. The timezone field defaults to 'America/New_York' if not set by the user.

## Rollback Plan

If needed, you can disable the scheduled function through the Supabase Dashboard and restore manual reset functionality by uncommenting the manual reset code in the dashboard page.