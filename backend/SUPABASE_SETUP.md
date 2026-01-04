# Supabase Setup Guide - Idéfabrikken MVP

This guide walks you through setting up the Supabase project for Idéfabrikken.

## Prerequisites

- Supabase account (sign up at [supabase.com](https://supabase.com) if needed)

## Step 1: Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New project"**
3. Fill in project details:
   - **Organization**: Select your organization (or create new)
   - **Name**: `idefabrikken-mvp`
   - **Database Password**: Generate strong password and **save it securely**
   - **Region**: Europe West (eu-west-1) - closest to Norway
   - **Pricing Plan**: Free tier is sufficient for MVP
4. Click **"Create new project"**
5. Wait 2-3 minutes for project to initialize

## Step 2: Run Database Schema

1. In your Supabase project dashboard, navigate to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy the entire contents of `backend/supabase-schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. Verify success:
   - You should see "Success. No rows returned"
   - Navigate to **Table Editor** and confirm 3 tables exist:
     - `ideas`
     - `chat_messages`
     - `evaluation_jobs`

## Step 3: Get API Keys

1. Navigate to **Settings** → **API** (left sidebar)
2. Find and copy these values:

   **Project URL**:
   ```
   https://<project-ref>.supabase.co
   ```

   **service_role key** (⚠️ **KEEP SECRET** - has full database access):
   ```
   eyJhbGc...
   ```

   ⚠️ **Important**: Do NOT use the `anon` key - we need `service_role` for backend operations.

3. Save these values - you'll need them in Step 4

## Step 4: Generate TypeScript Types

Run this command from the project root (replace `<project-ref>` with your actual project ID from the URL):

```bash
npx supabase gen types typescript --project-id <project-ref> > backend/src/lib/db/types.ts
```

**Example**:
If your Project URL is `https://abcdefgh123456.supabase.co`, then:
```bash
npx supabase gen types typescript --project-id abcdefgh123456 > backend/src/lib/db/types.ts
```

This generates TypeScript types matching your database schema.

## Step 5: Configure Environment Variables

Create `backend/.env` with the values from Step 3:

```bash
# Supabase
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...

# OpenAI
OPENAI_API_KEY=sk-...

# Server
PORT=4000
ALLOWED_ORIGINS=http://localhost:3000
```

**Get OpenAI API key**:
1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create new secret key
3. Copy and paste into `.env`

## Verification Checklist

After completing all steps, verify:

- [x] Supabase project created (name: idefabrikken-mvp)
- [x] 3 tables exist in Table Editor: `ideas`, `chat_messages`, `evaluation_jobs`
- [x] API keys copied (Project URL + service_role key)
- [x] TypeScript types generated at `backend/src/lib/db/types.ts`
- [x] `backend/.env` file created with all 5 variables
- [x] `.env` file is in `.gitignore` (already done in TASK-0.2)

## Next Steps

After verification, you can proceed to:
- **TASK-0.5**: Lag backend-skjelett (Express server with Supabase client)

## Troubleshooting

**"command not found: npx"**
- Ensure Node.js 20+ is installed: `node --version`
- Install dependencies: `pnpm install`

**"Project not found" when generating types**
- Verify project-id matches the URL exactly
- Ensure project initialization is complete (check dashboard)

**SQL errors when running schema**
- Ensure you're in a new query (not an example query)
- Run the entire schema at once (don't split into parts)
- Check for any error messages in the SQL editor output

## Security Notes

⚠️ **NEVER commit `.env` to git**
- Already covered by `.gitignore`
- If accidentally committed, rotate keys immediately in Supabase dashboard

⚠️ **service_role key has full database access**
- Only use in backend (never in frontend)
- Never expose in client-side code
- Frontend will use different auth when implemented
