# Board.Africa - Cloudflare Pages Configuration

## Overview
This document details the Cloudflare Pages deployment setup, including Cloudflare Workers for API routes, R2 for storage, and environment configuration.

---

## Cloudflare Ecosystem

### Services Used
1. **Cloudflare Pages** - Frontend and API hosting
2. **Cloudflare Workers** - Serverless API routes
3. **Cloudflare R2** - File storage (S3-compatible)
4. **Cloudflare DNS** - Domain management
5. **Cloudflare CDN** - Global content delivery
6. **Cloudflare Stream** (Optional) - Video hosting for LMS

---

## Project Configuration Files

### 1. `wrangler.toml`

```toml
name = "board-africa"
compatibility_date = "2024-01-22"
pages_build_output_dir = ".vercel/output/static"

# KV Namespaces (for caching, sessions, etc.)
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"

# R2 Buckets
[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "board-africa-files"
preview_bucket_name = "board-africa-files-preview"

# D1 Databases (optional, if using)
# [[d1_databases]]
# binding = "DB"
# database_name = "board-africa-db"
# database_id = "your-database-id"

# Environment Variables (non-secret)
[vars]
ENVIRONMENT = "production"
APP_NAME = "Board.Africa"

# Production environment
[env.production]
name = "board-africa-production"
vars = { ENVIRONMENT = "production" }

# Preview/Staging environment
[env.preview]
name = "board-africa-preview"
vars = { ENVIRONMENT = "preview" }

# Routes (optional, for custom routing)
# [[routes]]
# pattern = "api.board.africa/*"
# zone_name = "board.africa"
```

---

### 2. `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output for Cloudflare Pages
  output: 'export', // For static export, OR
  // output: 'standalone', // For SSR with Workers

  // Image optimization
  images: {
    unoptimized: true, // Cloudflare Images or external optimization
    domains: [
      'your-project.supabase.co',
      'imagedelivery.net', // Cloudflare Images
      'pub-*.r2.dev', // R2 public URLs
      'lh3.googleusercontent.com', // Google OAuth avatars
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
    ],
  },

  // Environment variables exposed to browser
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },

  // Rewrites for API routes (if needed)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },

  // Webpack config (for @cloudflare/next-on-pages)
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        bufferutil: 'bufferutil',
        'utf-8-validate': 'utf-8-validate',
      })
    }
    return config
  },

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
```

---

### 3. `.cloudflare/pages.json` (Build Configuration)

```json
{
  "production_branch": "main",
  "preview_branch_includes": ["*"],
  "preview_branch_excludes": ["main"],
  "build": {
    "command": "npm run pages:build",
    "destination": ".vercel/output/static",
    "node_version": "18",
    "environment_variables": {
      "NODE_ENV": "production"
    }
  },
  "deployment_triggers": {
    "on_push": {
      "branches": ["main", "staging", "develop"]
    }
  }
}
```

---

## Environment Variables

### Cloudflare Dashboard Setup

Navigate to: **Workers & Pages > board-africa > Settings > Environment Variables**

#### Production Environment Variables

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://board.africa
NEXT_PUBLIC_APP_NAME=Board.Africa
ENVIRONMENT=production

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
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Flutterwave
FLUTTERWAVE_SECRET_KEY=FLWSECK-...
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-...
FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-secret
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-...

# Resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@board.africa

# Daily.co
DAILY_API_KEY=your-daily-api-key
NEXT_PUBLIC_DAILY_DOMAIN=board-africa.daily.co

# Cloudflare Stream (Optional)
CLOUDFLARE_STREAM_ACCOUNT_ID=your-account-id
CLOUDFLARE_STREAM_API_TOKEN=your-api-token
NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE=your-customer-code

# Security
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=https://board.africa

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-...
```

#### Preview Environment Variables
Same as production, but with test/sandbox API keys and preview URLs.

---

## Cloudflare R2 Setup

### 1. Create R2 Bucket

```bash
# Using Wrangler CLI
wrangler r2 bucket create board-africa-files

# Create preview bucket
wrangler r2 bucket create board-africa-files-preview
```

### 2. Configure CORS

```bash
# Create cors.json
{
  "AllowedOrigins": ["https://board.africa", "https://*.pages.dev"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3600
}

# Apply CORS configuration
wrangler r2 bucket cors put board-africa-files --config cors.json
```

### 3. R2 Access Configuration

```typescript
// lib/cloudflare/r2.ts

import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToR2(
  file: File | Buffer,
  key: string,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: file,
    ContentType: contentType,
  })

  await r2Client.send(command)

  return `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`
}

export async function getSignedR2Url(key: string, expiresIn: number = 3600): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
  })

  return await getSignedUrl(r2Client, command, { expiresIn })
}
```

### 4. Custom Domain for R2 (Optional)

1. Go to Cloudflare Dashboard > R2 > board-africa-files
2. Click "Settings" > "Public Access"
3. Connect custom domain: `files.board.africa`
4. Update DNS records automatically

---

## Build & Deployment Commands

### Install Cloudflare Adapter

```bash
npm install -D @cloudflare/next-on-pages wrangler
```

### Add Build Scripts to `package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",

    "pages:build": "npx @cloudflare/next-on-pages",
    "pages:deploy": "npm run pages:build && wrangler pages deploy .vercel/output/static",
    "pages:dev": "npx @cloudflare/next-on-pages --watch",
    "preview": "wrangler pages dev .vercel/output/static --compatibility-date=2024-01-22"
  }
}
```

### Manual Deployment

```bash
# Build for Cloudflare Pages
npm run pages:build

# Deploy to Cloudflare Pages
wrangler pages deploy .vercel/output/static --project-name=board-africa

# Deploy to production
wrangler pages deploy .vercel/output/static --project-name=board-africa --branch=main
```

---

## GitHub Integration (Recommended)

### 1. Connect GitHub Repository

1. Go to **Cloudflare Dashboard > Workers & Pages**
2. Click "Create Application" > "Pages" > "Connect to Git"
3. Select GitHub repository: `your-username/board-africa`
4. Configure build settings:
   - **Build command:** `npm run pages:build`
   - **Build output directory:** `.vercel/output/static`
   - **Root directory:** `/`
   - **Node version:** `18`

### 2. Auto-Deployment

- **Production:** Auto-deploys on push to `main` branch
- **Preview:** Auto-deploys on pull requests and other branches

### 3. GitHub Actions (Optional, for additional checks)

```yaml
# .github/workflows/deploy.yml

name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Build for Cloudflare Pages
        run: npm run pages:build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy .vercel/output/static --project-name=board-africa
```

---

## Cloudflare Workers Configuration

### API Routes as Workers

Next.js API routes automatically run as Cloudflare Workers when deployed to Cloudflare Pages using `@cloudflare/next-on-pages`.

### Custom Workers (if needed)

```typescript
// workers/scheduled-tasks.ts

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // Run scheduled tasks
    // Example: Send meeting reminders, process payments, generate reports

    console.log('Scheduled task running at:', new Date(event.scheduledTime))
  },
}
```

---

## Performance Optimization

### 1. Caching Strategy

```typescript
// next.config.js - Add cache headers

async headers() {
  return [
    {
      source: '/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'no-store, must-revalidate',
        },
      ],
    },
  ]
}
```

### 2. Image Optimization

Use Cloudflare Images for automatic optimization:

```typescript
// lib/image-loader.ts

export default function cloudflareImageLoader({ src, width, quality }: any) {
  const params = [`width=${width}`, `quality=${quality || 75}`, 'format=auto']
  return `https://imagedelivery.net/${process.env.NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${src}?${params.join(',')}`
}
```

### 3. Bundle Optimization

```bash
# Analyze bundle size
npm run build

# Use dynamic imports for large components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <LoadingSpinner />,
})
```

---

## Monitoring & Logging

### 1. Cloudflare Analytics

- Built-in Web Analytics dashboard
- Real-time traffic monitoring
- Core Web Vitals tracking

### 2. Wrangler Logs

```bash
# View real-time logs
wrangler pages deployment tail

# View specific deployment logs
wrangler pages deployment tail --project-name=board-africa --deployment-id=<deployment-id>
```

### 3. External Monitoring (Optional)

- **Sentry** for error tracking
- **Logtail** or **Axiom** for structured logging
- **Uptime Robot** for uptime monitoring

---

## Custom Domains

### 1. Add Custom Domain

1. Go to **Workers & Pages > board-africa > Custom Domains**
2. Add domain: `board.africa`
3. Add subdomain: `www.board.africa`
4. Cloudflare automatically configures DNS

### 2. DNS Records

Cloudflare automatically creates:
- `board.africa` → CNAME to `board-africa.pages.dev`
- `www.board.africa` → CNAME to `board-africa.pages.dev`

### 3. SSL/TLS Configuration

- **SSL Mode:** Full (Strict)
- **Always Use HTTPS:** Enabled
- **Automatic HTTPS Rewrites:** Enabled
- **HSTS:** Enabled

---

## Security Configuration

### 1. WAF (Web Application Firewall)

Enable Cloudflare WAF rules:
- OWASP ModSecurity Core Rule Set
- Cloudflare Managed Ruleset
- Rate limiting rules

### 2. DDoS Protection

- Enabled by default
- Configure custom rules if needed

### 3. Bot Management (Optional, paid feature)

- Blocks malicious bots
- Allows good bots (search engines, monitoring)

---

## Rollback Strategy

### Manual Rollback

```bash
# List deployments
wrangler pages deployment list --project-name=board-africa

# Promote a previous deployment to production
wrangler pages deployment tail --project-name=board-africa --deployment-id=<previous-deployment-id>
```

### Atomic Deployments

Cloudflare Pages uses atomic deployments:
- New deployment tested before going live
- Instant rollback to previous version if needed
- Zero-downtime deployments

---

## Cost Optimization

### Free Tier Limits (Cloudflare Pages)
- **Builds:** 500 builds/month
- **Bandwidth:** Unlimited
- **Requests:** Unlimited
- **Seats:** Unlimited

### R2 Free Tier
- **Storage:** 10 GB/month
- **Class A Operations:** 1 million/month (writes)
- **Class B Operations:** 10 million/month (reads)
- **Egress:** 10 GB/month (beyond that, pay for egress)

### Workers Free Tier
- **Requests:** 100,000/day
- **CPU Time:** 10ms per request

**Recommendation:** Start with free tier, monitor usage, upgrade as needed.

---

## Testing Checklist

### Pre-Deployment
- ✅ Environment variables configured
- ✅ R2 bucket created and CORS configured
- ✅ Build succeeds locally with `npm run pages:build`
- ✅ Preview deployment tested
- ✅ Custom domain DNS configured

### Post-Deployment
- ✅ Production site loads correctly
- ✅ All pages accessible
- ✅ API routes working
- ✅ File uploads to R2 working
- ✅ Authentication flow working
- ✅ Payment webhooks configured
- ✅ SSL/HTTPS enabled
- ✅ Monitoring and logging set up

---

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check Node version (use 18)
   - Verify `@cloudflare/next-on-pages` installed
   - Check build logs for errors

2. **R2 Upload Fails**
   - Verify R2 credentials in environment variables
   - Check CORS configuration
   - Ensure bucket exists

3. **API Routes Not Working**
   - Check Cloudflare Workers logs
   - Verify environment variables set correctly
   - Check request/response formats

4. **Images Not Loading**
   - Verify image domains in `next.config.js`
   - Check R2 public access settings
   - Verify Cloudflare Images configuration

---

## Summary

✅ **Cloudflare Pages** for deployment
✅ **Cloudflare Workers** for API routes
✅ **Cloudflare R2** for file storage
✅ **Auto-deployment** from GitHub
✅ **Custom domains** configured
✅ **Environment variables** set
✅ **SSL/TLS** enabled
✅ **WAF & DDoS** protection
✅ **Monitoring & logging** configured

**Next Step:** Deploy to Cloudflare Pages after completing Milestone 1.
