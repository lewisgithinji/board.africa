# Board.Africa - Cloudflare Deployment Guide

## 🚀 Quick Start

This guide will walk you through deploying Board.Africa to Cloudflare Pages.

---

## Prerequisites

- [x] GitHub repository pushed (✅ Done)
- [ ] Cloudflare account created
- [ ] Domain configured (optional)
- [ ] Environment variables prepared

---

## Step 1: Install Cloudflare Dependencies

The necessary packages have been added to package.json:

```bash
npm install
```

Packages installed:
- `@cloudflare/next-on-pages` - Next.js adapter for Cloudflare Pages
- `wrangler` - Cloudflare CLI tool

---

## Step 2: Configure Environment Variables

Create a `.env.production` file or prepare these values for the Cloudflare dashboard:

### Required Environment Variables

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=Board.Africa

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Flutterwave
FLUTTERWAVE_SECRET_KEY=FLWSECK-...
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-...
NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-...

# LiveKit (Video Conferencing)
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-url

# OpenAI (for AI features)
OPENAI_API_KEY=sk-...

# Resend (Email)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

---

## Step 3: Deploy to Cloudflare Pages

### Option A: Deploy via GitHub (Recommended)

1. **Go to Cloudflare Dashboard**
   - Navigate to https://dash.cloudflare.com
   - Click "Workers & Pages" in the sidebar
   - Click "Create Application" → "Pages" → "Connect to Git"

2. **Connect GitHub Repository**
   - Authorize Cloudflare to access your GitHub
   - Select repository: `lewisgithinji/board.africa`
   - Click "Begin Setup"

3. **Configure Build Settings**
   ```
   Project Name: board-africa
   Production Branch: main
   Framework Preset: Next.js
   Build Command: npm run pages:build
   Build Output Directory: .vercel/output/static
   Root Directory: board-africa
   Node Version: 18
   ```

4. **Add Environment Variables**
   - Click "Environment variables (advanced)"
   - Add all the variables from Step 2
   - Make sure to add them to both Production and Preview environments

5. **Deploy**
   - Click "Save and Deploy"
   - Wait for the build to complete (5-10 minutes)
   - Your site will be available at `https://board-africa.pages.dev`

### Option B: Deploy via CLI

```bash
# Navigate to the project directory
cd board-africa

# Login to Cloudflare
npx wrangler login

# Build the project
npm run pages:build

# Deploy to Cloudflare Pages
npx wrangler pages deploy .vercel/output/static --project-name=board-africa

# Or use the shortcut command
npm run pages:deploy
```

---

## Step 4: Configure Custom Domain (Optional)

1. **Add Custom Domain in Cloudflare**
   - Go to Workers & Pages → board-africa → Custom Domains
   - Click "Set up a custom domain"
   - Enter your domain: `board.africa`
   - Cloudflare will automatically configure DNS

2. **SSL/TLS Settings**
   - Go to SSL/TLS settings
   - Set SSL/TLS encryption mode to "Full (Strict)"
   - Enable "Always Use HTTPS"
   - Enable "Automatic HTTPS Rewrites"

---

## Step 5: Set Up Cloudflare R2 (File Storage)

### Create R2 Bucket

```bash
# Using Wrangler CLI
npx wrangler r2 bucket create board-africa-files

# Create preview bucket
npx wrangler r2 bucket create board-africa-files-preview
```

### Configure CORS

Create `r2-cors.json`:

```json
{
  "AllowedOrigins": ["https://yourdomain.com", "https://*.pages.dev"],
  "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3600
}
```

Apply CORS:

```bash
npx wrangler r2 bucket cors put board-africa-files --config r2-cors.json
```

### Add R2 Environment Variables

Add to Cloudflare Pages environment variables:

```bash
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=board-africa-files
NEXT_PUBLIC_R2_PUBLIC_URL=https://files.yourdomain.com
```

### Enable Public Access (Optional)

1. Go to R2 → board-africa-files → Settings
2. Under "Public Access", click "Allow Access"
3. Connect a custom domain for public files

---

## Step 6: Configure Webhooks

### Stripe Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events to listen for
4. Copy webhook secret and add to environment variables

### Flutterwave Webhooks

1. Go to Flutterwave Dashboard → Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/flutterwave`
3. Copy webhook secret and add to environment variables

---

## Step 7: Test the Deployment

### Verify Core Functionality

- [ ] Homepage loads correctly
- [ ] User registration works
- [ ] User login works
- [ ] Dashboard accessible
- [ ] File uploads work (to R2)
- [ ] Payments process correctly (Stripe/Flutterwave)
- [ ] Video conferencing works (LiveKit)
- [ ] Email notifications send (Resend)

### Check Logs

```bash
# View deployment logs
npx wrangler pages deployment tail --project-name=board-africa

# View real-time logs
npx wrangler pages deployment tail
```

---

## Step 8: Set Up Analytics & Monitoring

### Cloudflare Analytics (Built-in)

- Navigate to Workers & Pages → board-africa → Analytics
- View real-time traffic, requests, and performance metrics

### Optional: Add Sentry for Error Tracking

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

---

## Build Scripts Reference

### Available Scripts

```json
{
  "dev": "next dev",                          // Run development server
  "build": "next build",                      // Standard Next.js build
  "start": "next start",                      // Start production server locally
  "lint": "next lint",                        // Run ESLint
  "pages:build": "npx @cloudflare/next-on-pages",     // Build for Cloudflare
  "pages:deploy": "npm run pages:build && wrangler pages deploy .vercel/output/static", // Build and deploy
  "pages:dev": "npx @cloudflare/next-on-pages --watch" // Watch mode for Cloudflare
}
```

---

## Automatic Deployments

Once connected to GitHub, Cloudflare Pages will automatically:

- **Deploy Production** when you push to `main` branch
- **Create Preview Deployments** for pull requests and other branches
- **Run Build Checks** before deploying

### Preview Deployments

Every PR will get a unique preview URL:
- `https://<commit-hash>.board-africa.pages.dev`

---

## Rollback Strategy

### Via Cloudflare Dashboard

1. Go to Workers & Pages → board-africa → Deployments
2. Find the previous working deployment
3. Click "..." → "Rollback to this deployment"

### Via CLI

```bash
# List deployments
npx wrangler pages deployment list --project-name=board-africa

# Promote a specific deployment
npx wrangler pages deployment tail --deployment-id=<deployment-id>
```

---

## Performance Optimization

### Image Optimization

Since Cloudflare doesn't support Next.js Image Optimization out of the box:

1. Use `unoptimized: true` in next.config.ts (already configured)
2. OR use Cloudflare Images service
3. OR optimize images before uploading

### Caching Strategy

Cloudflare automatically caches static assets. For API routes:

```typescript
// Example: Add cache headers in API routes
export async function GET(request: Request) {
  const data = await fetchData()
  
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
    }
  })
}
```

---

## Troubleshooting

### Build Fails

**Issue**: Build command fails
**Solution**: 
- Check Node version is 18
- Verify all dependencies are installed
- Check build logs for specific errors

### API Routes Not Working

**Issue**: API routes return 404
**Solution**:
- Verify `@cloudflare/next-on-pages` is installed
- Check that routes are in `src/app/api/` directory
- Review Cloudflare Workers logs

### Environment Variables Not Working

**Issue**: Environment variables undefined
**Solution**:
- Verify variables are added in Cloudflare dashboard
- Check variable names match exactly (case-sensitive)
- Redeploy after adding new variables

### Images Not Loading

**Issue**: Images return 404 or don't load
**Solution**:
- Verify `unoptimized: true` in next.config.ts
- Check image domains in remotePatterns
- Verify R2 bucket is publicly accessible if using R2

---

## Cost Estimates

### Cloudflare Pages (Free Tier)
- ✅ Unlimited bandwidth
- ✅ Unlimited requests
- ✅ 500 builds/month
- ✅ 1 concurrent build

### Cloudflare R2 (Free Tier)
- ✅ 10 GB storage/month
- ✅ 1M Class A operations/month
- ✅ 10M Class B operations/month
- ✅ 10 GB egress/month (free)

### Estimated Monthly Cost
- **Free Tier**: $0/month (suitable for MVP and testing)
- **Light Usage**: $5-20/month (when you exceed free tier)
- **Medium Usage**: $50-100/month (with sustained traffic)

---

## Next Steps After Deployment

1. [ ] Configure custom domain
2. [ ] Set up R2 for file storage
3. [ ] Configure webhook endpoints
4. [ ] Enable Cloudflare WAF
5. [ ] Set up monitoring and alerts
6. [ ] Configure backup strategy
7. [ ] Test all features thoroughly
8. [ ] Share preview URL with stakeholders

---

## Support Resources

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Next.js on Cloudflare Pages Guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [@cloudflare/next-on-pages Documentation](https://github.com/cloudflare/next-on-pages)
- [Cloudflare Community](https://community.cloudflare.com/)

---

## Quick Deploy Checklist

- [x] ✅ GitHub repository pushed
- [x] ✅ Dependencies installed (`@cloudflare/next-on-pages`, `wrangler`)
- [x] ✅ `wrangler.toml` configured
- [x] ✅ `next.config.ts` updated for Cloudflare
- [ ] 🔲 Environment variables prepared
- [ ] 🔲 Cloudflare account created
- [ ] 🔲 GitHub connected to Cloudflare
- [ ] 🔲 Build settings configured
- [ ] 🔲 First deployment completed
- [ ] 🔲 Domain configured (optional)
- [ ] 🔲 R2 bucket created and configured
- [ ] 🔲 Webhooks configured
- [ ] 🔲 Deployment tested

---

**Ready to deploy!** 🚀

Start with the GitHub integration (Option A in Step 3) for the easiest setup.
