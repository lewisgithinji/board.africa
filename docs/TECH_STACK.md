# Board.Africa - Complete Tech Stack

## Overview
This document provides the final, refined technology stack for Board.Africa, optimized for rapid development, cost-effectiveness, and scalability.

---

## Core Technologies

### Frontend Framework
**Next.js 15+** (App Router)
- **Why:** Industry standard, excellent DX, built-in optimization, SSR/SSG support
- **Features Used:**
  - App Router for modern routing
  - Server Actions for form handling
  - API Routes for backend
  - Image Optimization
  - Font Optimization (next/font)
  - Metadata API for SEO

### Programming Language
**TypeScript 5+** (Strict Mode)
- **Why:** Type safety, better IDE support, fewer runtime errors
- **Config:** Strict mode enabled for maximum type safety

### Styling
**Tailwind CSS 3.4+**
- **Why:** Utility-first, rapid development, consistent design, small bundle size
- **Plugins:**
  - `tailwindcss-animate` for animations
  - Custom config for Board.Africa brand colors

### UI Components
**shadcn/ui**
- **Why:** Copy-paste components (no npm bloat), fully customizable, accessible
- **Components Used:**
  - Button, Card, Dialog, Dropdown, Input, Label, Select, Table, Toast, Tabs, Avatar, Badge, Calendar, Checkbox, Combobox, Form, Popover, Radio, Separator, Sheet, Slider, Switch, Tooltip

---

## Backend & Database

### Database
**Supabase (PostgreSQL 15+)**
- **Why:** Managed PostgreSQL, built-in auth, real-time subscriptions, generous free tier
- **Features Used:**
  - PostgreSQL database
  - Supabase Auth
  - Row Level Security (RLS)
  - Storage (for non-R2 files)
  - Realtime subscriptions
  - Edge Functions (if needed)

### ORM
**Prisma** (optional, if needed for complex queries) OR **Direct Supabase Client**
- **Recommendation:** Use Supabase client directly for speed
- **Why:** Type-safe queries, auto-generated TypeScript types from database schema

### Authentication
**Supabase Auth**
- **Why:** Free, integrated with database, supports OAuth, magic links, MFA
- **Providers:**
  - Email/Password
  - Google OAuth
  - LinkedIn OAuth (optional)
  - Magic Links

---

## File Storage

### Primary Storage
**Cloudflare R2**
- **Why:** S3-compatible, free egress, cheaper than S3, same ecosystem as hosting
- **Use Cases:**
  - User avatars
  - Organization logos
  - Board documents (PDFs, Word, Excel)
  - Meeting recordings
  - Course resources
- **Access:** Via AWS S3 SDK

### Video Hosting (LMS)
**Cloudflare Stream** OR **Mux**
- **Recommendation:** Cloudflare Stream (same ecosystem)
- **Why:** Adaptive bitrate streaming, automatic transcoding, analytics
- **Use Cases:**
  - Course video lessons
  - Meeting recordings
  - Training content

---

## Deployment & Hosting

### Hosting
**Cloudflare Pages**
- **Why:** Fast global CDN, free tier, unlimited bandwidth, Workers integration
- **Features:**
  - Auto-deploy from GitHub
  - Preview deployments
  - Instant rollbacks
  - Edge optimization

### Serverless Functions
**Cloudflare Workers**
- **Why:** Low latency (edge computing), integrated with Pages, generous free tier
- **Use Cases:**
  - API routes
  - Webhook handlers
  - Background jobs
  - Image optimization

### Adapter
**@cloudflare/next-on-pages**
- **Why:** Official adapter to run Next.js on Cloudflare Pages + Workers

---

## Payments

### Card Payments
**Stripe**
- **Why:** Industry standard, excellent docs, comprehensive features
- **Features Used:**
  - Stripe Checkout (hosted payment page)
  - Customer Portal (self-service subscription management)
  - Webhooks for payment events
  - Invoicing
  - Subscription management

### M-Pesa & African Payments
**Flutterwave**
- **Why:** Best multi-country African payment gateway, supports M-Pesa, bank transfers
- **Features Used:**
  - M-Pesa (Kenya, Tanzania, Uganda)
  - Bank transfers
  - Mobile money
  - Webhooks

**Alternative:** Paystack (if focusing only on West Africa)

---

## Email Service

### Transactional Emails
**Resend**
- **Why:** Modern API, React email templates, generous free tier (3,000 emails/month)
- **Use Cases:**
  - Verification emails
  - Password reset
  - Application notifications
  - Meeting reminders
  - Payment receipts
  - Course completion certificates

### Email Templates
**React Email** (optional)
- **Why:** Build emails with React components, great DX

---

## Video Conferencing

### Video Platform
**Daily.co**
- **Why:** Great free tier (10 rooms), simple API, embedded rooms, recording support
- **Features Used:**
  - Video rooms for board meetings
  - Meeting recordings
  - Screen sharing
  - Embed in app (no redirect)

**Alternative:** Jitsi Meet (unlimited, self-hosted, but more setup)

---

## State Management

### Client State
**Zustand**
- **Why:** Lightweight, simple API, no boilerplate, TypeScript support
- **Use Cases:**
  - UI state (sidebar open/close, modals)
  - User preferences
  - Temporary form data

### Server State
**TanStack Query (React Query)**
- **Why:** Best-in-class data fetching, caching, optimistic updates, pagination
- **Use Cases:**
  - API data fetching
  - Caching API responses
  - Optimistic updates
  - Infinite scroll
  - Polling/refetching

---

## Forms & Validation

### Form Management
**React Hook Form**
- **Why:** Performant, minimal re-renders, great DX, TypeScript support
- **Features:**
  - Field validation
  - Form state management
  - Error handling

### Schema Validation
**Zod**
- **Why:** TypeScript-first schema validation, great DX, integrates with React Hook Form
- **Use Cases:**
  - Form validation
  - API request validation
  - Database schema validation
  - Type inference

---

## Data Tables

### Table Library
**TanStack Table (formerly React Table)**
- **Why:** Headless UI, fully customizable, sorting, filtering, pagination
- **Features:**
  - Sorting
  - Filtering
  - Pagination
  - Row selection
  - Column resizing

---

## Rich Text Editor

### Editor
**Tiptap**
- **Why:** Headless, extensible, modern, based on ProseMirror
- **Use Cases:**
  - Meeting minutes
  - Board resolutions
  - Course content
  - Professional bios

**Alternative:** Novel (Notion-style editor by Vercel)

---

## Calendar & Scheduling

### Calendar Component
**React Big Calendar**
- **Why:** Full-featured, customizable, supports day/week/month views
- **Use Cases:**
  - Meeting calendar
  - Event scheduling
  - Board member availability

**Alternative:** FullCalendar (more features, paid license for commercial)

### Date Utilities
**date-fns**
- **Why:** Lightweight, tree-shakeable, immutable, TypeScript support
- **Use Cases:**
  - Date formatting
  - Date calculations
  - Timezone handling

---

## Charts & Analytics

### Charting Library
**Recharts**
- **Why:** React-based, composable, customizable, good defaults
- **Use Cases:**
  - Governance analytics
  - Board diversity metrics
  - Revenue charts
  - Engagement metrics

**Alternative:** Chart.js (more options, but not React-native)

---

## PDF Generation

### PDF Library
**@react-pdf/renderer**
- **Why:** Create PDFs with React components, great DX
- **Use Cases:**
  - Meeting minutes PDF
  - Board reports
  - Governance reports
  - Course certificates

**Alternative:** Puppeteer (headless Chrome, more powerful but heavier)

---

## File Uploads

### Upload Component
**react-dropzone**
- **Why:** Simple drag-and-drop, file validation, preview support
- **Use Cases:**
  - Document uploads
  - Avatar uploads
  - Logo uploads
  - Course resource uploads

**Alternative:** Uploadthing (managed service, easier but paid)

---

## Notifications

### Toast Notifications
**Sonner**
- **Why:** Beautiful default styling, customizable, Promise support
- **Use Cases:**
  - Success messages
  - Error alerts
  - Info notifications

**Alternative:** react-hot-toast

---

## Icons

### Icon Library
**Lucide React**
- **Why:** Modern, consistent, tree-shakeable, used by shadcn/ui
- **Size:** ~1000 icons

---

## Search

### Full-Text Search
**PostgreSQL Full-Text Search** (via Supabase)
- **Why:** Built-in, no additional service, good enough for MVP
- **Use Cases:**
  - Search board positions
  - Search professionals
  - Search documents

**Future Upgrade:** Meilisearch or Algolia (if advanced search needed)

---

## Real-Time Features

### Real-Time Updates
**Supabase Realtime**
- **Why:** Built-in, WebSocket-based, no additional service
- **Use Cases:**
  - Live notifications
  - Meeting attendance updates
  - Application status changes

---

## Testing

### End-to-End Testing
**Playwright**
- **Why:** Fast, reliable, cross-browser, great DX
- **Tests:**
  - Authentication flows
  - Application flows
  - Payment flows

### Unit/Integration Testing
**Vitest** (optional, if needed)
- **Why:** Fast, Vite-powered, Jest-compatible API

---

## Monitoring & Analytics

### Error Tracking
**Sentry**
- **Why:** Best-in-class error tracking, performance monitoring, free tier
- **Features:**
  - Error tracking
  - Performance monitoring
  - Session replay

### Analytics
**Cloudflare Web Analytics** (Free) OR **Plausible/Fathom** (Paid, privacy-focused)
- **Why:** Privacy-friendly, lightweight, GDPR-compliant
- **Alternative:** Google Analytics (more features, but privacy concerns)

### Logging
**Axiom** OR **Logtail**
- **Why:** Structured logging, searchable, affordable
- **Use Cases:**
  - Application logs
  - Error logs
  - Audit logs

---

## CI/CD

### Version Control
**GitHub**

### CI/CD Pipeline
**GitHub Actions** + **Cloudflare Pages Auto-Deploy**
- **Why:** Free, integrated, automatic deployments
- **Workflow:**
  - Lint on PR
  - Type check on PR
  - Build on push to main
  - Deploy to Cloudflare Pages

---

## Developer Tools

### Code Quality
**ESLint**
- **Config:** `eslint-config-next` (Next.js recommended config)

**Prettier** (optional)
- **Why:** Consistent code formatting

### Package Manager
**npm** (default) OR **pnpm** (faster)
- **Recommendation:** Start with npm, migrate to pnpm if needed

### CLI Tools
**Wrangler** (Cloudflare CLI)
**Supabase CLI** (for migrations)

---

## Third-Party Integrations

### Calendar Integration
**Google Calendar API** OR **Microsoft Graph API**
- **Use Case:** Sync board meetings to external calendars

### E-Signature (Optional)
**DocuSign** OR **SignRequest**
- **Use Case:** Sign board resolutions, contracts

### Background Checks (Optional)
**Checkr** OR **Sterling**
- **Use Case:** Verify board director credentials

---

## Security

### Security Headers
Configured via `next.config.js`:
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Content-Security-Policy

### Rate Limiting
**Cloudflare Rate Limiting** (Free tier: 10,000 requests/month)
- **Alternative:** Upstash Rate Limit (Redis-based)

### CAPTCHA (if needed)
**Cloudflare Turnstile** (Free alternative to reCAPTCHA)

---

## Cost Breakdown (Monthly Estimates)

### Free Tier (MVP)
| Service | Cost |
|---------|------|
| Cloudflare Pages | $0 (500 builds/month) |
| Cloudflare R2 | $0 (10 GB storage, 10M reads) |
| Cloudflare Workers | $0 (100k requests/day) |
| Supabase | $0 (500 MB database, 1 GB storage) |
| Resend | $0 (3,000 emails/month) |
| Daily.co | $0 (10 rooms) |
| Stripe | 2.9% + $0.30 per transaction |
| Flutterwave | 3.8% per transaction |
| **Total** | **~$0-50/month** (depending on transaction volume) |

### Paid Tier (Production)
| Service | Cost |
|---------|------|
| Cloudflare Pages | $20/month (Pro plan) |
| Cloudflare R2 | $15-30/month (100 GB) |
| Supabase | $25/month (Pro plan) |
| Cloudflare Stream | $1 per 1,000 minutes |
| Resend | $20/month (50k emails) |
| Daily.co | $99/month (100 rooms) |
| Stripe | 2.9% + $0.30 per transaction |
| Flutterwave | 3.8% per transaction |
| Sentry | $26/month (Team plan) |
| **Total** | **~$200-300/month** + transaction fees |

---

## Package.json Summary

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "typescript": "^5.3.0",

    "@supabase/supabase-js": "^2.39.0",
    "@supabase/ssr": "^0.0.10",

    "@radix-ui/*": "latest",
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

    "react-big-calendar": "^1.8.5",
    "date-fns": "^3.0.0",

    "recharts": "^2.10.0",

    "@react-pdf/renderer": "^3.1.15",

    "lucide-react": "^0.307.0",

    "react-dropzone": "^14.2.3",

    "sonner": "^1.3.1"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",

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

## Decision Rationale

### Why Supabase over Prisma + PostgreSQL?
- **Faster setup:** Auth, database, storage all in one
- **Cost:** Free tier is generous
- **Real-time:** Built-in subscriptions
- **Auth:** Saves weeks of development time

### Why Cloudflare Pages over Vercel?
- **Cost:** Better free tier, unlimited bandwidth
- **Ecosystem:** R2, Workers, Stream all in same platform
- **Performance:** Edge network just as fast

### Why Flutterwave over Paystack?
- **Coverage:** Supports more African countries
- **M-Pesa:** Better M-Pesa integration for East Africa

### Why Daily.co over Jitsi?
- **Ease:** Simpler API, less setup
- **Reliability:** Managed service
- **Free tier:** 10 rooms is enough for MVP

### Why shadcn/ui over Material-UI or Chakra?
- **Bundle size:** Copy-paste, not npm package
- **Customization:** Fully customizable
- **Modern:** Uses Radix UI primitives (accessible)

---

## Summary

✅ **Modern Stack:** Next.js 15, TypeScript, Tailwind, shadcn/ui
✅ **Fast Development:** Pre-built components, minimal custom code
✅ **Cost-Effective:** $0-50/month for MVP
✅ **Scalable:** Can handle 10k+ users without major changes
✅ **Africa-Optimized:** Flutterwave, M-Pesa, Cloudflare global CDN
✅ **Production-Ready:** Monitoring, logging, error tracking

**Next Step:** Start building Milestone 1 - Project Setup!
