# Board.Africa - Authentication Flow & User Journeys

## Overview
This document outlines the complete authentication system using Supabase Auth, user onboarding flows, and role-based access control (RBAC).

---

## Authentication System

### Technology
- **Supabase Auth** (built on PostgreSQL + GoTrue)
- **NextAuth.js v5** (optional, for additional providers)
- **Middleware**: Next.js middleware for route protection

### Supported Auth Methods
1. **Email/Password** (primary)
2. **OAuth Providers** (optional):
   - Google
   - LinkedIn
   - Microsoft (Azure AD)
3. **Magic Links** (passwordless email)
4. **Two-Factor Authentication (2FA)** (optional, for enterprise)

---

## User Roles

### 1. Organization
Companies, NGOs, startups posting board positions and managing boards.

### 2. Professional
Board directors, executives, professionals seeking board positions.

### 3. Admin
Platform administrators with full access.

---

## Authentication Flows

### 1. Sign Up Flow

```
┌─────────────┐
│  /signup    │
│  Page       │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ Email + Password     │
│ Form Submission      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Supabase Auth        │
│ Creates User         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Verification Email   │
│ Sent (via Resend)    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ User Clicks Link     │
│ Email Verified ✓     │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Profile Created      │
│ in "profiles" table  │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Redirect to          │
│ /onboarding          │
└──────────────────────┘
```

**Implementation:**
```typescript
// app/(auth)/signup/page.tsx

async function handleSignUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/onboarding`,
      data: {
        full_name: fullName, // Optional metadata
      }
    }
  })

  if (error) throw error

  // Show "Check your email" message
  return data
}
```

---

### 2. Login Flow

```
┌─────────────┐
│  /login     │
│  Page       │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ Email + Password     │
│ Form Submission      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Supabase Auth        │
│ Validates Credentials│
└──────┬───────────────┘
       │
       ├─── Invalid ────> Error Message
       │
       ▼ Valid
┌──────────────────────┐
│ Session Created      │
│ JWT Token Set        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Fetch User Profile   │
│ from "profiles"      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Check Role           │
│ Organization or      │
│ Professional?        │
└──────┬───────────────┘
       │
       ├─── Organization ──> /dashboard/organization
       │
       └─── Professional ──> /dashboard/professional
```

**Implementation:**
```typescript
// app/(auth)/login/page.tsx

async function handleLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, onboarding_completed')
    .eq('id', data.user.id)
    .single()

  // Redirect based on role and onboarding status
  if (!profile.onboarding_completed) {
    router.push('/onboarding')
  } else if (profile.role === 'organization') {
    router.push('/dashboard/organization')
  } else if (profile.role === 'professional') {
    router.push('/dashboard/professional')
  }
}
```

---

### 3. Onboarding Flow

After email verification, users must complete onboarding to select their role and set up their profile.

```
┌──────────────────────┐
│  /onboarding         │
│  Role Selection      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Choose Role:         │
│ □ Organization       │
│ □ Professional       │
└──────┬───────────────┘
       │
       ├─── Organization ────┐
       │                     ▼
       │            ┌──────────────────────┐
       │            │ Organization Setup   │
       │            │ - Company Name       │
       │            │ - Industry           │
       │            │ - Company Size       │
       │            │ - Location           │
       │            └──────┬───────────────┘
       │                   │
       │                   ▼
       │            ┌──────────────────────┐
       │            │ Create org record    │
       │            │ in "organizations"   │
       │            └──────┬───────────────┘
       │                   │
       └───────────────────┴──> ┌────────────────┐
                                │ Mark onboarding│
                                │ complete ✓     │
                                └────────┬───────┘
                                         │
       ┌─── Professional ────────────────┘
       │
       ▼
┌──────────────────────┐
│ Professional Setup   │
│ - Username           │
│ - Headline           │
│ - Location           │
│ - Industries         │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Create professional  │
│ record in            │
│ "professionals"      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Redirect to          │
│ Dashboard            │
└──────────────────────┘
```

**Implementation:**
```typescript
// app/(dashboard)/onboarding/page.tsx

async function handleRoleSelection(role: 'organization' | 'professional') {
  const { data: { user } } = await supabase.auth.getUser()

  // Update profile with role
  await supabase
    .from('profiles')
    .update({ role })
    .eq('id', user.id)

  // Show role-specific onboarding form
  if (role === 'organization') {
    setStep('organization-setup')
  } else {
    setStep('professional-setup')
  }
}

async function completeOnboarding(data: any) {
  const { data: { user } } = await supabase.auth.getUser()

  // Create organization or professional record
  if (role === 'organization') {
    await supabase.from('organizations').insert({
      user_id: user.id,
      company_name: data.companyName,
      industry: data.industry,
      company_size: data.companySize,
      country: data.country,
      slug: generateSlug(data.companyName),
    })
  } else {
    await supabase.from('professionals').insert({
      user_id: user.id,
      username: data.username,
      headline: data.headline,
      location: data.location,
      country: data.country,
    })
  }

  // Mark onboarding complete
  await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('id', user.id)

  // Redirect to dashboard
  router.push(`/dashboard/${role}`)
}
```

---

### 4. Password Reset Flow

```
┌─────────────────────┐
│ /forgot-password    │
│ Enter Email         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Supabase sends      │
│ reset link via email│
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ User clicks link    │
│ Redirected to       │
│ /reset-password     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Enter new password  │
│ twice               │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Supabase updates    │
│ password            │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Redirect to /login  │
│ with success msg    │
└─────────────────────┘
```

**Implementation:**
```typescript
// app/(auth)/forgot-password/page.tsx

async function handlePasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) throw error

  // Show "Check your email" message
}

// app/(auth)/reset-password/page.tsx

async function handleUpdatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) throw error

  router.push('/login?message=Password updated successfully')
}
```

---

### 5. OAuth Login Flow (Google Example)

```
┌─────────────────────┐
│ /login              │
│ "Sign in with       │
│  Google" button     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Supabase redirects  │
│ to Google OAuth     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ User authorizes     │
│ on Google           │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Google redirects    │
│ back to app with    │
│ OAuth token         │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Supabase creates    │
│ user (if new) and   │
│ session             │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Check if profile    │
│ exists              │
└──────┬──────────────┘
       │
       ├─── No ────> Redirect to /onboarding
       │
       └─── Yes ───> Redirect to /dashboard
```

**Implementation:**
```typescript
// app/(auth)/login/page.tsx

async function handleGoogleLogin() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    }
  })

  if (error) throw error
}

// app/auth/callback/route.ts (API route to handle OAuth callback)

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Check if profile exists
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed, role')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.onboarding_completed) {
    return NextResponse.redirect(`${requestUrl.origin}/onboarding`)
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard/${profile.role}`)
}
```

---

## Role-Based Access Control (RBAC)

### Middleware Protection

```typescript
// middleware.ts

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie logic
        },
        remove(name: string, options: CookieOptions) {
          // Remove cookie logic
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Public routes (no auth required)
  const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/marketplace', '/courses', '/pricing']
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // If not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If authenticated, check role-based access
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, onboarding_completed')
      .eq('id', user.id)
      .single()

    // Redirect to onboarding if not completed
    if (!profile?.onboarding_completed && !request.nextUrl.pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin') && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Redirect organization users trying to access professional dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard/professional') && profile?.role !== 'professional') {
      return NextResponse.redirect(new URL('/dashboard/organization', request.url))
    }

    // Redirect professional users trying to access organization dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard/organization') && profile?.role !== 'organization') {
      return NextResponse.redirect(new URL('/dashboard/professional', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## Session Management

### Session Duration
- **Default:** 7 days
- **Refresh Token:** 30 days
- **Auto-refresh:** Handled by Supabase client automatically

### Session Storage
- Stored in HTTP-only cookies (secure)
- Managed by Supabase SSR package

### Logout

```typescript
async function handleLogout() {
  const { error } = await supabase.auth.signOut()

  if (error) throw error

  router.push('/login')
}
```

---

## User Hooks

### Custom React Hooks for Auth

```typescript
// hooks/use-auth.ts

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}

// hooks/use-user.ts

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './use-auth'

export function useUser() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('*, organizations(*), professionals(*)')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}
```

---

## Security Best Practices

### 1. Email Verification
- Users must verify email before full access
- Resend verification email if expired

### 2. Password Requirements
- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 number
- Optional: Special character requirement

### 3. Rate Limiting
- Limit login attempts (5 per 15 minutes)
- Limit password reset requests (3 per hour)
- Implemented via Supabase Auth or API middleware

### 4. Session Security
- HTTP-only cookies
- Secure flag in production
- SameSite=Lax
- CSRF protection

### 5. Row Level Security (RLS)
- All Supabase tables have RLS policies
- Users can only access their own data
- Organization members can access org data
- Public data accessible to all

---

## Email Templates (Resend)

### 1. Verification Email
```
Subject: Verify your Board.Africa account

Hi {name},

Welcome to Board.Africa! Please verify your email address by clicking the link below:

{verification_link}

If you didn't create an account, you can safely ignore this email.

Best regards,
The Board.Africa Team
```

### 2. Password Reset Email
```
Subject: Reset your Board.Africa password

Hi {name},

You requested to reset your password. Click the link below to set a new password:

{reset_link}

This link expires in 1 hour.

If you didn't request this, please ignore this email or contact support.

Best regards,
The Board.Africa Team
```

### 3. Welcome Email (After Onboarding)
```
Subject: Welcome to Board.Africa! 🎉

Hi {name},

Your account is all set up! Here's what you can do next:

[For Organizations]
- Post your first board position
- Build your governance team
- Schedule board meetings

[For Professionals]
- Complete your profile
- Browse open board positions
- Enroll in governance courses

Get started: {dashboard_link}

Questions? Reply to this email or visit our help center.

Best regards,
The Board.Africa Team
```

---

## Testing Checklist

### Sign Up
- ✅ User can sign up with valid email/password
- ✅ User receives verification email
- ✅ Email link verifies account
- ✅ Invalid email shows error
- ✅ Weak password rejected
- ✅ Duplicate email shows error

### Login
- ✅ User can log in with valid credentials
- ✅ Invalid credentials show error
- ✅ Unverified email cannot log in
- ✅ Session persists across refreshes
- ✅ "Remember me" checkbox works

### Onboarding
- ✅ User redirected to onboarding after verification
- ✅ Role selection works
- ✅ Organization setup form validates correctly
- ✅ Professional setup form validates correctly
- ✅ User redirected to correct dashboard after completion

### Password Reset
- ✅ Reset email sent successfully
- ✅ Reset link works
- ✅ New password updates successfully
- ✅ Expired link shows error
- ✅ User can log in with new password

### OAuth
- ✅ Google login redirects correctly
- ✅ New OAuth user goes through onboarding
- ✅ Existing OAuth user goes to dashboard
- ✅ OAuth user profile created correctly

### Session & Logout
- ✅ Session expires after 7 days
- ✅ Logout clears session
- ✅ Logged out user redirected to login

### Role-Based Access
- ✅ Organization user cannot access professional dashboard
- ✅ Professional user cannot access organization dashboard
- ✅ Non-admin cannot access /admin routes
- ✅ Unauthenticated user redirected to login

---

## Summary

✅ **Supabase Auth** for authentication
✅ **Email/Password + OAuth** supported
✅ **Role-based access** (Organization, Professional, Admin)
✅ **Onboarding flow** for profile setup
✅ **Session management** with auto-refresh
✅ **Middleware protection** for routes
✅ **Email notifications** via Resend
✅ **Row Level Security** for data access

**Next Step:** Implement auth system in Milestone 2.
