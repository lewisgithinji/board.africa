# Board.Africa

Africa's leading platform for board excellence and corporate governance leadership.

## 🌍 About

Board.Africa is an all-in-one platform that combines:
- **Board Management Software** - Digital meeting management, document vault, governance tools
- **Talent Marketplace** - Connect organizations with board-ready professionals
- **Learning Management System** - Governance training and certification programs
- **Africa Compliance Library** - Regulatory database for 10+ African countries

## 🚀 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (Strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **File Storage:** Cloudflare R2
- **Payments:** Stripe + Flutterwave (M-Pesa)
- **Email:** Resend
- **Video:** Daily.co
- **Deployment:** Cloudflare Pages

## 📋 Prerequisites

- Node.js 20+ and npm
- Supabase account
- Cloudflare account
- Stripe account
- Flutterwave account (for M-Pesa)
- Resend account
- Daily.co account

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/board-africa.git
   cd board-africa
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```

   Then fill in your environment variables in `.env.local`

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📦 Project Structure

```
board-africa/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   ├── (marketing)/       # Public marketing pages
│   │   ├── marketplace/       # Job board for board positions
│   │   ├── courses/           # Learning management system
│   │   └── api/               # API routes
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── auth/              # Authentication components
│   │   ├── dashboard/         # Dashboard components
│   │   └── shared/            # Shared components
│   ├── lib/                   # Utility functions and configs
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # Zustand stores
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
└── docs/                      # Documentation
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Build
npm run build            # Build for production
npm run start            # Start production server

# Linting
npm run lint             # Run ESLint

# Cloudflare Pages
npm run pages:build      # Build for Cloudflare Pages
npm run pages:deploy     # Deploy to Cloudflare Pages
```

## 🗄️ Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the database migrations from `docs/DATABASE_SCHEMA.md`
3. Set up Row Level Security (RLS) policies
4. Configure authentication providers

## 🔐 Environment Variables

See `.env.local.example` for all required environment variables.

**Required for Milestone 1:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Required for later milestones:**
- Cloudflare R2 credentials
- Stripe API keys
- Flutterwave API keys
- Resend API key
- Daily.co API key

## 🚀 Deployment

### Cloudflare Pages (Recommended)

This project is configured for deployment on **Cloudflare Pages**.

#### Quick Deploy via GitHub

1. **Push to GitHub** (✅ Already done!)
   ```bash
   git push origin main
   ```

2. **Connect to Cloudflare Pages**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Click "Workers & Pages" → "Create Application" → "Pages"
   - Connect your GitHub repository: `lewisgithinji/board.africa`

3. **Configure Build Settings**
   ```
   Build command:    npm run pages:build
   Build directory:  .vercel/output/static
   Root directory:   board-africa
   Node version:     18
   ```

4. **Add Environment Variables**
   - Copy variables from `.env.production.example`
   - Add them in Cloudflare Pages settings
   - See `CLOUDFLARE_DEPLOYMENT.md` for full list

5. **Deploy!**
   - Click "Save and Deploy"
   - Your site will be live at `https://board-africa.pages.dev`

#### Important Notes

- ⚠️ **Windows Users**: Local builds may fail due to Windows compatibility. Use GitHub deployment instead (works perfectly)
- ✅ **GitHub Actions**: Automated CI/CD is configured in `.github/workflows/deploy.yml`
- ✅ **Auto Deploy**: Every push to `main` triggers automatic deployment

#### Deployment Documentation

- 📖 [Complete Deployment Guide](./CLOUDFLARE_DEPLOYMENT.md) - Step-by-step instructions
- 📖 [Deployment Options](./DEPLOYMENT_OPTIONS.md) - Comparison of deployment methods
- 📖 [Windows Build Note](./WINDOWS_BUILD_NOTE.md) - Important for Windows users
- 📖 [Environment Variables](../.env.production.example) - Required variables for production


## 📚 Documentation

- [Enhanced MVP Roadmap](../docs/ENHANCED_MVP_ROADMAP.md) - 10-12 week development plan
- [Competitive Analysis](../docs/COMPETITIVE_ANALYSIS.md) - Market research and feature gaps
- [Database Schema](../docs/DATABASE_SCHEMA.md) - Complete database design
- [API Routes](../docs/API_ROUTES.md) - All API endpoints
- [Tech Stack](../docs/TECH_STACK.md) - Technology choices and rationale
- [Auth Flow](../docs/AUTH_FLOW.md) - Authentication system documentation
- [Cloudflare Config](../docs/CLOUDFLARE_CONFIG.md) - Deployment configuration

## 🎯 Development Roadmap

### Phase 1: Foundation (Weeks 1-2) ✓ IN PROGRESS
- [x] Project setup
- [ ] Authentication system
- [ ] User onboarding

### Phase 2: Marketplace (Weeks 3-4)
- [ ] Organization & professional profiles
- [ ] Board position marketplace
- [ ] Application tracking system
- [ ] AI-powered matching

### Phase 3: Board Management (Weeks 5-6)
- [ ] Meeting management
- [ ] AI transcription & minutes
- [ ] Document vault
- [ ] Board evaluations

### Phase 4: Africa Compliance (Week 7)
- [ ] Compliance library
- [ ] Recruiting & succession planning

### Phase 5: Payments & LMS (Weeks 8-9)
- [ ] Stripe & M-Pesa integration
- [ ] Course catalog
- [ ] Video streaming

### Phase 6: Advanced Features (Week 10)
- [ ] Video conferencing
- [ ] Notifications
- [ ] Analytics dashboard

### Phase 7: Polish & Launch (Weeks 11-12)
- [ ] Mobile optimization
- [ ] SEO & performance
- [ ] Security audit
- [ ] Launch preparation

## 🤝 Contributing

This is a private project. For inquiries, contact connect@board.africa

## 📄 License

Proprietary - All rights reserved

## 🌟 Features

### For Organizations
- 📊 Board management & meeting tools
- 📄 Secure document vault
- 🎯 Board recruiting & succession planning
- 📈 Governance analytics & reporting
- ✅ Africa-specific compliance tracking

### For Professionals
- 💼 Board-ready profile builder
- 🔍 AI-powered job matching
- 📚 Governance training & certification
- 🎓 CPD hours tracking
- 🤝 Networking & mentorship

### Platform-Wide
- 🤖 AI meeting transcription & summaries
- 🎥 Built-in video conferencing
- 📱 Mobile-responsive design
- 💳 Stripe + M-Pesa payments
- 🌍 10+ African countries' regulations

## 📞 Support

- Email: connect@board.africa
- Documentation: [docs/](../docs/)
- Issues: GitHub Issues (when public)

---

**Built with ❤️ for Africa's boardrooms**
