# Board.Africa - Setup Guide

## 🚀 Milestone 2: Authentication System Setup

This guide will walk you through setting up Supabase authentication for Board.Africa.

---

## Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)** and sign up/log in
2. **Click "New Project"**
3. **Fill in project details:**
   - **Project name:** board-africa
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose closest to your users (e.g., EU West for Europe/Africa)
   - **Pricing Plan:** Free tier is perfect for development

4. **Wait 2-3 minutes** for project to be created

---

## Step 2: Get Your API Keys

1. **In your Supabase project**, go to **Project Settings** (gear icon)
2. **Click "API"** in the left sidebar
3. **Copy these values:**
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public** key (starts with `eyJ...`)

---

## Step 3: Configure Environment Variables

1. **Create `.env.local` file** in the project root:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Edit `.env.local`** and add your Supabase credentials:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME=Board.Africa
   ```

3. **Save the file**

---

## Step 4: Set Up Database Tables

1. **In Supabase Dashboard**, go to **SQL Editor**
2. **Create a new query**
3. **Copy the contents** of `supabase/migrations/001_create_profiles.sql`
4. **Paste and run the SQL**

This will create:
- ✅ `profiles` table
- ✅ Row Level Security (RLS) policies
- ✅ Automatic profile creation trigger
- ✅ Updated timestamp trigger

---

## Step 5: Configure Email Authentication

### Option A: Use Supabase Email (Development)

1. **Go to Authentication > Settings**
2. **Scroll to "Email Auth"**
3. **Enable "Confirm email"** (optional for production)
4. **For development**, you can disable email confirmation temporarily

### Option B: Use Resend (Production - Recommended)

1. **Create account at [resend.com](https://resend.com)**
2. **Get API key** from dashboard
3. **In Supabase:**
   - Go to **Project Settings > Auth**
   - Scroll to **SMTP Settings**
   - Enable **Custom SMTP**
   - **Sender name:** Board.Africa
   - **Sender email:** noreply@board.africa
   - **Host:** smtp.resend.com
   - **Port:** 465
   - **Username:** resend
   - **Password:** (your Resend API key)

4. **Add to `.env.local`:**
   ```env
   RESEND_API_KEY=re_your_api_key
   RESEND_FROM_EMAIL=noreply@board.africa
   ```

---

## Step 6: Test the Authentication System

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open browser:** http://localhost:3000

3. **Test signup:**
   - Go to http://localhost:3000/signup
   - Fill in the form
   - Submit
   - Check your email for verification (if enabled)

4. **Test login:**
   - Go to http://localhost:3000/login
   - Enter your credentials
   - You should be redirected to `/dashboard`

5. **Test logout:**
   - Click "Sign out" button on dashboard
   - You should be redirected to `/login`

6. **Test password reset:**
   - Go to http://localhost:3000/forgot-password
   - Enter your email
   - Check email for reset link

---

## Step 7: Verify Database

1. **In Supabase Dashboard**, go to **Table Editor**
2. **Click on `profiles` table**
3. **You should see your profile** with:
   - ✅ Your user ID
   - ✅ Your email
   - ✅ Your full name
   - ✅ Timestamps

---

## 🎯 Acceptance Criteria

Test these to mark Milestone 2 as complete:

- ✅ User can sign up with email/password
- ✅ User receives verification email (if enabled)
- ✅ User can log in with verified email
- ✅ User can log out
- ✅ Protected routes redirect to login if not authenticated
- ✅ Session persists across page refreshes
- ✅ Password reset flow works
- ✅ Profile automatically created in database
- ✅ Dashboard displays user information

---

## Troubleshooting

### "Invalid API Key" Error
- ✅ Check `.env.local` file exists
- ✅ Verify Supabase URL and keys are correct
- ✅ Restart development server after changing `.env.local`

### Email Not Sending
- ✅ Check spam/junk folder
- ✅ Verify email confirmation is enabled in Supabase
- ✅ Check SMTP settings if using custom email

### "Profile not found" Error
- ✅ Run the SQL migration again
- ✅ Check if trigger is created in Supabase
- ✅ Manually insert profile if needed

### Session Not Persisting
- ✅ Clear browser cookies
- ✅ Check middleware.ts is configured correctly
- ✅ Verify Supabase client setup

---

## Next Steps (Milestone 3)

Once authentication is working:

1. **Build role selection** (Organization vs Professional)
2. **Create onboarding wizard**
3. **Build profile setup pages**
4. **Implement avatar upload** to Cloudflare R2
5. **Add role-based access control**

---

## Files Created in Milestone 2

```
src/
├── lib/
│   └── supabase/
│       ├── client.ts              ✅ Browser client
│       ├── server.ts              ✅ Server client
│       └── middleware.ts          ✅ Auth middleware
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx             ✅ Auth layout
│   │   ├── signup/page.tsx        ✅ Signup page
│   │   ├── login/page.tsx         ✅ Login page
│   │   └── forgot-password/page.tsx ✅ Password reset
│   ├── (dashboard)/
│   │   └── dashboard/page.tsx     ✅ Dashboard
│   └── auth/
│       ├── callback/route.ts      ✅ Email verification
│       └── signout/route.ts       ✅ Sign out
├── middleware.ts                   ✅ Route protection
└── supabase/
    └── migrations/
        └── 001_create_profiles.sql ✅ Database schema
```

---

## Environment Variables Checklist

Required for Milestone 2:
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY` (optional for now)

Optional (for production):
- ⏳ `RESEND_API_KEY`
- ⏳ `RESEND_FROM_EMAIL`

---

## Commands Reference

```bash
# Start development server
npm run dev

# Check if server is running
curl http://localhost:3000

# Test signup endpoint
curl http://localhost:3000/signup

# Test login endpoint
curl http://localhost:3000/login
```

---

## Support

If you encounter issues:

1. **Check this guide first**
2. **Review Supabase documentation:** https://supabase.com/docs/guides/auth
3. **Check Next.js + Supabase guide:** https://supabase.com/docs/guides/auth/server-side/nextjs
4. **Review our code in `src/lib/supabase/`**

---

**Status:** Ready to set up! Follow the steps above to complete Milestone 2. 🚀
