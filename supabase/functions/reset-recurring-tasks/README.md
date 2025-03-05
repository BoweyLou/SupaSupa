# Reset Recurring Tasks Edge Function

This Supabase Edge Function automatically resets recurring tasks (daily and weekly) at each user's local midnight time, replacing the manual reset functionality.

## How It Works

1. The function runs automatically every hour via a cron schedule defined in `config.json`
2. For each run, it:
   - Fetches all parent users and their timezone settings
   - Identifies which users are currently experiencing midnight in their local timezone
   - For each user at midnight, fetches their recurring tasks (daily and weekly)
   - Resets these tasks: sets status to "assigned" and calculates the next occurrence date
   - Returns detailed results for logging and monitoring

## Timezone-Based Processing Logic

The function determines if it's midnight for a user by:
1. Fetching the user's IANA timezone (e.g., "America/New_York") from the database
2. Using `Intl.DateTimeFormat` to get the current hour in that timezone
3. Checking if the hour is 0 (midnight)

For each matching user, it then:
1. Fetches all recurring tasks created by that user
2. Resets each task to "assigned" status 
3. Sets the next occurrence date based on task frequency:
   - Daily tasks: 24 hours in the future
   - Weekly tasks: 7 days in the future

## Configuration

The cron schedule is defined in `config.json` and runs hourly:

```json
{
  "schedules": [
    {
      "cron": "0 * * * *",
      "name": "reset-recurring-tasks-hourly",
      "description": "Reset recurring tasks hourly to support midnight resets for users in different timezones"
    }
  ]
}
```

## Database Requirements

This function requires a `timezone` field in the `users` table. This was added via a migration:

```sql
-- Add timezone field to users table
ALTER TABLE public.users ADD COLUMN timezone TEXT NOT NULL DEFAULT 'America/New_York';

-- Create an index on the timezone column for improved performance
CREATE INDEX idx_users_timezone ON public.users(timezone);
```

## Deployment

To deploy this function to your Supabase project, use the Supabase CLI:

```bash
# Make sure you're linked to your Supabase project
supabase link --project-ref your-project-ref

# Deploy the function
supabase functions deploy reset-recurring-tasks --project-ref your-project-ref
```

## Testing

You can manually invoke the function using the Supabase CLI:

```bash
supabase functions serve reset-recurring-tasks
```

Then send a request to the local endpoint:

```bash
curl http://localhost:54321/functions/v1/reset-recurring-tasks
```

## Logs and Monitoring

Function logs and run history can be viewed in the Supabase Dashboard under:
- Edge Functions > reset-recurring-tasks > Logs
- Edge Functions > reset-recurring-tasks > Schedules