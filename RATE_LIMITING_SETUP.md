# Rate Limiting Setup

## Overview
The application now uses database-backed rate limiting to prevent abuse and handle Supabase's email rate limits better.

## Setup Steps

### 1. Add Service Role Key to Environment

Get your Supabase Service Role Key:
1. Go to your Supabase project dashboard
2. Click on **Settings** (⚙️ icon in sidebar)
3. Click on **API** in the settings menu
4. Find the **Service role** section
5. Copy the `service_role` key (⚠️ **Keep this secret!**)

Add it to your `.env` file:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

⚠️ **Important**: Never commit this key to version control. It's already in `.gitignore`.

### 2. Run the Database Migration

Run the migration to create the `rate_limits` table:

```sql
-- Go to Supabase Dashboard → SQL Editor → New Query
-- Copy and paste the contents of:
-- supabase/migrations/20260312_create_rate_limits.sql
```

Or if using Supabase CLI:
```bash
supabase db push
```

### 3. Verify the Migration

Check that the table was created:
```sql
-- In Supabase SQL Editor
SELECT * FROM rate_limits LIMIT 5;
```

You should see an empty table with the correct schema.

## How It Works

### Before (In-Memory)
- ❌ Rate limits reset on server restart
- ❌ Not shared across server instances
- ❌ Lost during deployments

### After (Database-Backed)
- ✅ Persistent across restarts
- ✅ Shared across all server instances
- ✅ Maintains state during deployments
- ✅ Better handling of Supabase rate limits

## API Endpoint

The rate limiting is now handled server-side via API route:

**POST** `/api/rate-limit`

```json
{
  "identifier": "signup:fingerprint123",
  "maxAttempts": 3,
  "windowMs": 3600000
}
```

Response:
```json
{
  "allowed": true,
  "remaining": 2,
  "resetTime": 1710259200000
}
```

## Rate Limit Configuration

Current limits:
- **Signup**: 3 attempts per hour per device
- Uses browser fingerprint to track attempts
- Automatically cleans up expired records

## Error Handling

The system now properly handles:
- ✅ Supabase "email rate limit exceeded" errors
- ✅ "User already registered" errors
- ✅ Database connection failures (fails open for availability)
- ✅ User-friendly error messages

## Cleanup

Optional: You can periodically clean up expired rate limit records:

```sql
-- Run in Supabase SQL Editor or via cron job
SELECT cleanup_expired_rate_limits();
```

## Troubleshooting

### "email rate limit exceeded" Error
This error means:
1. **Your rate limiting** - Too many signups from same device/IP
   - Solution: Wait 1 hour or reset: `DELETE FROM rate_limits WHERE identifier LIKE 'signup:%'`

2. **Supabase rate limiting** - Too many auth requests to Supabase
   - Solution: Wait a few minutes, Supabase resets automatically

### Migration Fails
If the migration fails:
1. Check if table already exists: `\dt rate_limits`
2. Drop and recreate: `DROP TABLE IF EXISTS rate_limits CASCADE;`
3. Run migration again

### Service Role Key Not Working
1. Verify it's the **service_role** key, not the **anon** key
2. Check it's in `.env` (not `.env.local` or `.env.example`)
3. Restart your dev server after adding the key

## Security Notes

- Service role key bypasses Row Level Security (RLS)
- Only used server-side in API routes
- Never exposed to client
- Rate limits table has RLS enabled (service role only)
