# Board.Africa - Project Structure

## Folder Organization

```
board-africa/
├── .github/
│   └── workflows/
│       └── ci.yml                    # GitHub Actions CI/CD
├── public/
│   ├── images/
│   ├── icons/
│   ├── manifest.json                 # PWA manifest
│   └── robots.txt
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/              # Dashboard route group (protected)
│   │   │   ├── dashboard/
│   │   │   │   ├── organization/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── setup/
│   │   │   │   │   ├── board-members/
│   │   │   │   │   ├── meetings/
│   │   │   │   │   ├── documents/
│   │   │   │   │   ├── positions/
│   │   │   │   │   ├── applications/
│   │   │   │   │   └── action-items/
│   │   │   │   └── professional/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── profile/
│   │   │   │       ├── applications/
│   │   │   │       └── courses/
│   │   │   └── layout.tsx            # Dashboard layout with sidebar
│   │   ├── (marketing)/              # Marketing route group
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── about/
│   │   │   ├── pricing/
│   │   │   └── contact/
│   │   ├── (admin)/                  # Admin route group
│   │   │   ├── admin/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── users/
│   │   │   │   ├── positions/
│   │   │   │   └── analytics/
│   │   │   └── layout.tsx
│   │   ├── marketplace/              # Public marketplace
│   │   │   ├── page.tsx
│   │   │   ├── positions/
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── apply/
│   │   │   └── search/
│   │   ├── courses/                  # LMS
│   │   │   ├── page.tsx
│   │   │   └── [slug]/
│   │   │       ├── page.tsx
│   │   │       └── learn/
│   │   ├── professionals/            # Public profiles
│   │   │   └── [username]/
│   │   │       └── page.tsx
│   │   ├── org/                      # Public org profiles
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── meetings/                 # Video conferencing
│   │   │   └── [id]/
│   │   │       └── join/
│   │   ├── api/                      # API routes
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   ├── webhooks/
│   │   │   │   ├── stripe/
│   │   │   │   └── flutterwave/
│   │   │   ├── upload/
│   │   │   ├── meetings/
│   │   │   └── notifications/
│   │   ├── layout.tsx                # Root layout
│   │   ├── globals.css               # Global styles + Tailwind
│   │   └── providers.tsx             # Context providers
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── table.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   ├── auth/
│   │   │   ├── login-form.tsx
│   │   │   ├── signup-form.tsx
│   │   │   └── auth-provider.tsx
│   │   ├── dashboard/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── stats-card.tsx
│   │   │   └── recent-activity.tsx
│   │   ├── marketplace/
│   │   │   ├── position-card.tsx
│   │   │   ├── position-filters.tsx
│   │   │   ├── application-form.tsx
│   │   │   └── search-bar.tsx
│   │   ├── profile/
│   │   │   ├── professional-profile-form.tsx
│   │   │   ├── organization-profile-form.tsx
│   │   │   ├── experience-section.tsx
│   │   │   └── skills-selector.tsx
│   │   ├── meetings/
│   │   │   ├── meeting-calendar.tsx
│   │   │   ├── meeting-form.tsx
│   │   │   ├── agenda-builder.tsx
│   │   │   └── video-room.tsx
│   │   ├── documents/
│   │   │   ├── document-vault.tsx
│   │   │   ├── file-uploader.tsx
│   │   │   ├── pdf-viewer.tsx
│   │   │   └── folder-tree.tsx
│   │   ├── courses/
│   │   │   ├── course-card.tsx
│   │   │   ├── course-player.tsx
│   │   │   ├── quiz-component.tsx
│   │   │   └── certificate-generator.tsx
│   │   ├── payments/
│   │   │   ├── stripe-checkout.tsx
│   │   │   ├── mpesa-form.tsx
│   │   │   └── subscription-card.tsx
│   │   └── shared/
│   │       ├── navigation.tsx
│   │       ├── footer.tsx
│   │       ├── loading-spinner.tsx
│   │       ├── empty-state.tsx
│   │       └── error-boundary.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts             # Supabase client
│   │   │   ├── server.ts             # Supabase server client
│   │   │   └── middleware.ts         # Auth middleware
│   │   ├── stripe/
│   │   │   ├── client.ts
│   │   │   └── webhooks.ts
│   │   ├── flutterwave/
│   │   │   ├── client.ts
│   │   │   └── webhooks.ts
│   │   ├── cloudflare/
│   │   │   ├── r2.ts                 # R2 upload utilities
│   │   │   └── stream.ts             # Cloudflare Stream
│   │   ├── daily/
│   │   │   └── client.ts             # Daily.co video API
│   │   ├── resend/
│   │   │   ├── client.ts
│   │   │   └── templates.ts          # Email templates
│   │   ├── utils.ts                  # Utility functions
│   │   ├── constants.ts              # App constants
│   │   └── validations.ts            # Zod schemas
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-user.ts
│   │   ├── use-subscription.ts
│   │   ├── use-toast.ts
│   │   └── use-debounce.ts
│   ├── store/
│   │   ├── auth-store.ts             # Zustand store
│   │   ├── ui-store.ts
│   │   └── notification-store.ts
│   ├── types/
│   │   ├── database.ts               # Supabase generated types
│   │   ├── user.ts
│   │   ├── organization.ts
│   │   ├── position.ts
│   │   ├── meeting.ts
│   │   ├── course.ts
│   │   └── index.ts
│   └── styles/
│       └── globals.css
├── supabase/
│   ├── migrations/                   # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_positions.sql
│   │   └── ...
│   ├── functions/                    # Edge functions (if needed)
│   └── config.toml
├── tests/
│   ├── e2e/                          # Playwright tests
│   │   ├── auth.spec.ts
│   │   ├── marketplace.spec.ts
│   │   └── payments.spec.ts
│   └── integration/
├── docs/
│   ├── MILESTONE_ROADMAP.md
│   ├── PROJECT_STRUCTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_ROUTES.md
│   ├── AUTH_FLOW.md
│   └── TECH_STACK.md
├── .env.local.example
├── .env.production
├── .eslintrc.json
├── .gitignore
├── components.json                   # shadcn/ui config
├── middleware.ts                     # Next.js middleware for auth
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── tsconfig.json
├── wrangler.toml                     # Cloudflare Pages config
└── README.md
```

---

## Key Directory Explanations

### `/app` - Next.js App Router
- Uses **route groups** `(auth)`, `(dashboard)`, `(marketing)`, `(admin)` for layout organization
- Each route group has its own `layout.tsx`
- Protected routes (dashboard) use middleware for authentication checks

### `/components`
- `/ui` - shadcn/ui primitives (copy-pasted, not npm package)
- Feature-specific folders: `auth/`, `marketplace/`, `meetings/`, etc.
- `shared/` - Reusable components used across features

### `/lib`
- External service clients (Supabase, Stripe, Flutterwave, R2, Daily.co, Resend)
- Utility functions and helpers
- Validation schemas (Zod)

### `/hooks`
- Custom React hooks for common functionality
- Auth, data fetching, UI state management

### `/store`
- Zustand stores for client-side state
- Kept minimal - prefer server state with TanStack Query

### `/types`
- TypeScript type definitions
- `database.ts` auto-generated from Supabase CLI

### `/supabase`
- Database migrations (SQL files)
- Edge functions (optional, if needed)

---

## Package.json Dependencies

```json
{
  "name": "board-africa",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "pages:build": "npx @cloudflare/next-on-pages",
    "pages:deploy": "npm run pages:build && wrangler pages deploy",
    "pages:dev": "npx @cloudflare/next-on-pages --watch",
    "supabase:generate-types": "supabase gen types typescript --project-id <project-id> --schema public > src/types/database.ts",
    "test": "playwright test",
    "test:ui": "playwright test --ui"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.3.0",

    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.0.10",

    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",

    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "tailwindcss-animate": "^1.0.7",

    "react-hook-form": "^7.49.0",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.4",

    "@tanstack/react-query": "^5.17.0",
    "@tanstack/react-table": "^8.11.0",

    "zustand": "^4.5.0",

    "stripe": "^14.13.0",
    "@stripe/stripe-js": "^2.4.0",

    "resend": "^3.0.0",

    "@aws-sdk/client-s3": "^3.490.0",
    "@aws-sdk/s3-request-presigner": "^3.490.0",

    "@daily-co/daily-js": "^0.60.0",
    "@daily-co/daily-react": "^0.40.0",

    "@tiptap/react": "^2.1.0",
    "@tiptap/starter-kit": "^2.1.0",
    "@tiptap/extension-placeholder": "^2.1.0",

    "react-big-calendar": "^1.8.5",
    "date-fns": "^3.0.0",

    "recharts": "^2.10.0",

    "@react-pdf/renderer": "^3.1.15",

    "lucide-react": "^0.307.0",

    "react-dropzone": "^14.2.3",

    "sonner": "^1.3.1",

    "nanoid": "^5.0.4",

    "sharp": "^0.33.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/react-big-calendar": "^1.8.9",

    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.0",

    "@cloudflare/next-on-pages": "^1.9.0",
    "wrangler": "^3.22.0",

    "eslint": "^8",
    "eslint-config-next": "^15.0.0",

    "@playwright/test": "^1.41.0",

    "supabase": "^1.142.0"
  }
}
```

---

## Environment Variables

### `.env.local.example`
```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Board.Africa

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=board-africa-files
NEXT_PUBLIC_R2_PUBLIC_URL=https://files.board.africa

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Flutterwave
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-...
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-...
FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-secret

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@board.africa

# Daily.co
DAILY_API_KEY=your-daily-api-key
NEXT_PUBLIC_DAILY_DOMAIN=board-africa.daily.co

# Cloudflare Stream (optional, if using for videos)
CLOUDFLARE_STREAM_ACCOUNT_ID=your-account-id
CLOUDFLARE_STREAM_API_TOKEN=your-api-token

# Analytics (optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
```

---

## Key Configuration Files

### `next.config.js`
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'your-project.supabase.co',
      'files.board.africa',
      'lh3.googleusercontent.com', // Google OAuth avatars
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Required for Cloudflare Pages
  output: 'standalone',
};

module.exports = nextConfig;
```

### `wrangler.toml`
```toml
name = "board-africa"
compatibility_date = "2024-01-01"
pages_build_output_dir = ".vercel/output/static"

[env.production]
vars = { ENVIRONMENT = "production" }

[env.preview]
vars = { ENVIRONMENT = "preview" }
```

### `middleware.ts`
```ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Check if user is admin (you'll implement this based on your schema)
    // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    // if (profile?.role !== 'admin') {
    //   return NextResponse.redirect(new URL('/dashboard', request.url))
    // }
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/:path*',
  ],
}
```

### `tailwind.config.ts`
```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

---

## Installation & Setup Commands

```bash
# Create Next.js project
npx create-next-app@latest board-africa --typescript --tailwind --app --src-dir

# Navigate to project
cd board-africa

# Install shadcn/ui
npx shadcn-ui@latest init

# Add shadcn components (install as needed)
npx shadcn-ui@latest add button card input label select dialog dropdown-menu table toast

# Install dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install @tanstack/react-query zustand
npm install react-hook-form zod @hookform/resolvers
npm install stripe @stripe/stripe-js
npm install resend
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install @daily-co/daily-js @daily-co/daily-react
npm install @tiptap/react @tiptap/starter-kit
npm install react-big-calendar date-fns
npm install recharts
npm install @react-pdf/renderer
npm install react-dropzone
npm install sonner
npm install nanoid

# Install dev dependencies
npm install -D @cloudflare/next-on-pages wrangler
npm install -D @playwright/test
npm install -D supabase

# Initialize Supabase (if running locally)
supabase init

# Initialize Git
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
gh repo create board-africa --public --source=. --remote=origin
git push -u origin main
```

---

## Current Status

> **📋 For the complete implementation roadmap, see:**  
> **[MASTER_IMPLEMENTATION_PLAN.md](./MASTER_IMPLEMENTATION_PLAN.md)**

### Completed
- ✅ Project structure defined
- ✅ All dependencies installed  
- ✅ Phase 1-4 complete (Auth, Organizations, Meetings, Documents)

### Next
- ⏳ Phase 5: Resolution Voting System

---

**Last Updated:** January 29, 2026
