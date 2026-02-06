# Board.Africa - Master Implementation Plan (v2.0)

> ⚠️ **THIS IS THE SINGLE SOURCE OF TRUTH**  
> All other planning documents (MILESTONE_4_PLAN.md, implementation_plan.md, strategic_integration_plan.md, etc.) are **superseded** by this document.

---

## Project Overview

**Board.Africa** is a comprehensive board management and governance platform for African organizations, combining:
- Board meeting and document management
- Talent marketplace for board positions
- Learning management system (LMS)
- Compliance and governance tools

**Tech Stack:**
- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes, Supabase (PostgreSQL + Auth + Storage)
- **Deployment:** Cloudflare Pages
- **Payments:** Stripe + Flutterwave (M-Pesa)

---

## Current Status Summary

| Phase | Status | Completion |
|:------|:-------|:-----------|
| Phase 1: Foundation (Auth) | ✅ Complete | 100% |
| Phase 2: Organizations & Board Members | ✅ Complete | 100% |
| Phase 3: Meetings Management | ✅ Complete | 100% |
| Phase 4: Documents Management | ✅ Complete | 100% |
| Phase 5: Resolution Voting | ✅ Complete | 100% |
| Phase 6: E-Signatures | ✅ Complete | 100% |
| Phase 7: Document Annotations | ✅ Complete | 100% |
| Phase 8: Structured Agenda Builder | ✅ Complete | 100% |
| Phase 9: Calendar Integration | ✅ Complete | 100% |
| Phase 10: Policy Library | ✅ Complete | 100% |
| Phase 11: Professional Profiles & Marketplace | ✅ Complete | 100% |
| Phase 12: Payments (Stripe + M-Pesa) | ✅ Complete | 100% |
| Phase 13: LMS (Courses & Certificates) | 🔄 Deferred | 0% (Built but not active) |
| Phase 14: Video Conferencing | ✅ Complete | 100% |
| Phase 15: AI Features (Transcription, Matching) | ✅ Complete | 100% |
| Phase 16: Board Evaluations & Performance | ✅ Complete | 100% |
| Phase 17: Africa Compliance Library | ✅ Complete | 100% |
| Phase 18: PWA & Offline Access | 🔄 Deferred | 0% (Post-launch feature) |
| Phase 19: Global Search | ✅ Complete | 100% |
| Phase 20: Analytics Dashboard | ⏳ Pending | 0% |
| Phase 21: Admin Dashboard | ⏳ Pending | 0% |
| Phase 22: Security, Testing & Launch | ⏳ Pending | 0% |

---

## Applied Database Migrations

```
✅ 001_create_profiles.sql
✅ 002_add_profile_fields.sql
✅ 003_create_avatars_bucket.sql
✅ 004_create_organizations_table.sql
✅ 005_create_board_members_table.sql
✅ 006_create_meetings_table.sql
✅ 007_create_meeting_attendees_table.sql
✅ 008_create_documents_table.sql
✅ 009_create_action_items_table.sql
✅ 010_setup_documents_storage.sql
✅ 011_create_resolutions_table.sql
✅ 012_create_signatures_table.sql
✅ 013_create_annotations_table.sql
✅ 014_create_agenda_items_table.sql
✅ 015_add_library_flag.sql
✅ 016_create_professional_profiles.sql
✅ 017_create_marketplace_tables.sql
✅ 018_add_billing_fields.sql
✅ 019_create_lms_tables.sql
✅ 020_add_video_conferencing.sql
✅ 021_switch_to_livekit.sql
✅ 022_create_evaluations.sql
✅ 023_create_compliance.sql
```

---

# ✅ COMPLETED PHASES

---

## Phase 1: Foundation & Authentication ✅ COMPLETE

### What Was Built
- Next.js 15 project with TypeScript and Tailwind CSS
- Supabase project setup and configuration
- shadcn/ui component library integration
- Email/password authentication (signup, login, logout)
- Email verification via Resend
- Password reset flow
- Protected routes middleware
- User profiles table with RLS

### Key Files
- `/src/app/(auth)/login/page.tsx`
- `/src/app/(auth)/signup/page.tsx`
- `/src/app/(auth)/forgot-password/page.tsx`
- `/src/middleware.ts`
- `/supabase/migrations/001_create_profiles.sql`
- `/supabase/migrations/002_add_profile_fields.sql`

---

## Phase 2: Organizations & Board Members ✅ COMPLETE

### What Was Built
- Organization profiles with company details
- Board member management (CRUD operations)
- Member roles (Chair, Director, Secretary, Treasurer, Member)
- Organization dashboard with metrics
- Avatar/logo uploads to Supabase Storage

### Key Files
- `/src/app/(dashboard)/settings/page.tsx`
- `/src/app/(dashboard)/board-members/page.tsx`
- `/src/components/dashboard/board-members/BoardMemberForm.tsx`
- `/src/components/dashboard/board-members/BoardMemberList.tsx`
- `/supabase/migrations/004_create_organizations_table.sql`
- `/supabase/migrations/005_create_board_members_table.sql`

---

## Phase 3: Meetings Management ✅ COMPLETE

### What Was Built
- Meeting scheduler with date/time, location, type
- Meeting status workflow (Scheduled → In Progress → Completed → Cancelled)
- Attendee management with RSVP status
- Action items with assignment and due dates
- Meeting minutes (text field)
- Agenda (text field - to be upgraded in Phase 8)

### Key Files
- `/src/app/(dashboard)/meetings/page.tsx`
- `/src/app/(dashboard)/meetings/new/page.tsx`
- `/src/app/(dashboard)/meetings/[id]/page.tsx`
- `/src/components/dashboard/meetings/MeetingForm.tsx`
- `/src/components/dashboard/meetings/MeetingList.tsx`
- `/src/components/dashboard/meetings/MeetingDetails.tsx`
- `/src/app/api/meetings/route.ts`
- `/src/app/api/meetings/[id]/route.ts`
- `/supabase/migrations/006_create_meetings_table.sql`
- `/supabase/migrations/007_create_meeting_attendees_table.sql`
- `/supabase/migrations/009_create_action_items_table.sql`

---

## Phase 4: Documents Management ✅ COMPLETE

### What Was Built
- Document upload with drag-and-drop
- Document categorization (Board Pack, Financial, Legal, etc.)
- Document-to-meeting linking
- Document vault with search and filters
- Supabase Storage integration
- Access control via RLS

### Key Files
- `/src/app/(dashboard)/documents/page.tsx`
- `/src/components/dashboard/documents/DocumentUpload.tsx`
- `/src/components/dashboard/documents/DocumentList.tsx`
- `/src/app/api/documents/route.ts`
- `/src/app/api/documents/[id]/route.ts`
- `/supabase/migrations/008_create_documents_table.sql`
- `/supabase/migrations/010_setup_documents_storage.sql`

---

# ⏳ PENDING PHASES

---

## Phase 5: Resolution Voting System

### Overview
Enable board members to vote on resolutions during meetings with full audit trail and quorum tracking.

### Duration: 2-3 days

### Database Migrations

**File:** `supabase/migrations/011_create_resolutions_table.sql`

```sql
-- Resolutions table
CREATE TABLE resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  title TEXT NOT NULL CHECK (char_length(title) >= 3),
  description TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed', 'passed', 'failed')),
  voting_type VARCHAR(20) DEFAULT 'simple_majority' CHECK (voting_type IN ('simple_majority', 'two_thirds', 'unanimous')),
  quorum_required INTEGER DEFAULT 0,
  opened_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes table
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id UUID NOT NULL REFERENCES resolutions(id) ON DELETE CASCADE,
  board_member_id UUID NOT NULL REFERENCES board_members(id),
  vote VARCHAR(20) NOT NULL CHECK (vote IN ('approve', 'reject', 'abstain')),
  comment TEXT,
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resolution_id, board_member_id)
);

-- Indexes
CREATE INDEX idx_resolutions_meeting ON resolutions(meeting_id);
CREATE INDEX idx_resolutions_org ON resolutions(organization_id);
CREATE INDEX idx_votes_resolution ON votes(resolution_id);

-- RLS
ALTER TABLE resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policies (similar pattern to action_items)
CREATE POLICY "Users can view resolutions for their org meetings"
  ON resolutions FOR SELECT
  USING (organization_id = auth.uid());

CREATE POLICY "Users can create resolutions for their meetings"
  ON resolutions FOR INSERT
  WITH CHECK (organization_id = auth.uid());

CREATE POLICY "Users can update their org resolutions"
  ON resolutions FOR UPDATE
  USING (organization_id = auth.uid());

CREATE POLICY "Users can delete draft resolutions"
  ON resolutions FOR DELETE
  USING (organization_id = auth.uid() AND status = 'draft');
```

### TypeScript Types

**Add to:** `src/types/database.types.ts`

```typescript
export interface Resolution {
  id: string;
  meeting_id: string;
  organization_id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'open' | 'closed' | 'passed' | 'failed';
  voting_type: 'simple_majority' | 'two_thirds' | 'unanimous';
  quorum_required: number;
  opened_at: string | null;
  closed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  resolution_id: string;
  board_member_id: string;
  vote: 'approve' | 'reject' | 'abstain';
  comment: string | null;
  voted_at: string;
  // Joined data
  board_member?: BoardMember;
}

export interface ResolutionWithVotes extends Resolution {
  votes: Vote[];
  vote_summary: {
    approve: number;
    reject: number;
    abstain: number;
    total: number;
  };
}
```

### Validation Schemas

**File:** `src/lib/validations/resolution.ts`

```typescript
import { z } from 'zod';

export const createResolutionSchema = z.object({
  meeting_id: z.string().uuid('Invalid meeting ID'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(255),
  description: z.string().optional(),
  voting_type: z.enum(['simple_majority', 'two_thirds', 'unanimous']).default('simple_majority'),
  quorum_required: z.number().int().min(0).default(0),
});

export const updateResolutionSchema = z.object({
  title: z.string().min(3).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'open', 'closed', 'passed', 'failed']).optional(),
  voting_type: z.enum(['simple_majority', 'two_thirds', 'unanimous']).optional(),
  quorum_required: z.number().int().min(0).optional(),
});

export const voteSchema = z.object({
  vote: z.enum(['approve', 'reject', 'abstain']),
  comment: z.string().max(500).optional(),
});
```

### API Routes

**File:** `src/app/api/resolutions/route.ts`
- `GET` - List resolutions (query: meeting_id)
- `POST` - Create new resolution

**File:** `src/app/api/resolutions/[id]/route.ts`
- `GET` - Get single resolution with votes
- `PATCH` - Update resolution
- `DELETE` - Delete resolution (only draft)

**File:** `src/app/api/resolutions/[id]/vote/route.ts`
- `POST` - Cast vote
- `PATCH` - Update vote
- `DELETE` - Retract vote

**File:** `src/app/api/resolutions/[id]/open/route.ts`
- `POST` - Open voting

**File:** `src/app/api/resolutions/[id]/close/route.ts`
- `POST` - Close voting and calculate result

### UI Components

**File:** `src/components/dashboard/resolutions/ResolutionList.tsx`
- List all resolutions for a meeting
- Status badges
- Vote summary display

**File:** `src/components/dashboard/resolutions/ResolutionForm.tsx`
- Create/edit resolution form
- Fields: title, description, voting_type, quorum

**File:** `src/components/dashboard/resolutions/ResolutionCard.tsx`
- Individual resolution card
- Voting buttons (Approve/Reject/Abstain)
- Vote tally with progress bars
- Open/Close actions

**File:** `src/components/dashboard/resolutions/VotingPanel.tsx`
- Detailed voting interface
- Shows all voters and their votes
- Quorum indicator

### Integration

**Modify:** `src/components/dashboard/meetings/MeetingDetails.tsx`
- Add "Resolutions" tab after "Action Items"
- Render `ResolutionList` component

### Acceptance Criteria
- [x] Can create resolution from meeting details
- [x] Can open voting on resolution
- [x] Board members can cast votes
- [x] Vote tally updates in real-time
- [x] Can close voting and see result (passed/failed)
- [x] RLS prevents unauthorized access

**Status:** ✅ **COMPLETED** (2026-01-29)

---

## Phase 6: E-Signatures for Resolutions

### Overview
Electronic signatures for passed resolutions.

### Duration: 1-2 days

### Database Migration

**File:** `supabase/migrations/012_create_signatures_table.sql`

```sql
CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id UUID NOT NULL REFERENCES resolutions(id) ON DELETE CASCADE,
  board_member_id UUID NOT NULL REFERENCES board_members(id),
  signature_data TEXT NOT NULL, -- base64 encoded image
  signature_type VARCHAR(20) DEFAULT 'drawn' CHECK (signature_type IN ('drawn', 'typed')),
  typed_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  signed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resolution_id, board_member_id)
);

CREATE INDEX idx_signatures_resolution ON signatures(resolution_id);
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;
```

### Components

**File:** `src/components/dashboard/resolutions/SignaturePad.tsx`
- Canvas drawing using react-signature-canvas
- Clear, Type, Draw options

**File:** `src/components/dashboard/resolutions/SignatureModal.tsx`
- Modal for collecting signature
- Legal disclaimer

**File:** `src/components/dashboard/resolutions/SignatureList.tsx`
- Display collected signatures

### API Routes

**File:** `src/app/api/resolutions/[id]/sign/route.ts`
- `POST` - Submit signature
- `GET` - Get signatures for resolution

### Acceptance Criteria
- [x] Can sign passed resolutions (draw + type modes)
- [x] Signature stored securely (with audit trail)
- [x] Can view all signatures
- [x] Dual signature modes (canvas drawing + typed name)
- [x] Legal disclaimer and agreement checkbox
- [x] One signature per member per resolution

**Status:** ✅ **COMPLETED** (2026-01-29)

---

## Phase 7: Document Annotations

### Overview
PDF markup with highlights and notes.

### Duration: 3-4 days

### Database Migration

**File:** `supabase/migrations/013_create_annotations_table.sql`

```sql
CREATE TABLE document_annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  page_number INTEGER NOT NULL,
  annotation_type VARCHAR(20) NOT NULL CHECK (annotation_type IN ('highlight', 'note', 'underline', 'strikethrough')),
  position JSONB NOT NULL, -- {x, y, width, height}
  content TEXT, -- for notes
  color VARCHAR(20) DEFAULT '#FFFF00',
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_annotations_document ON document_annotations(document_id);
CREATE INDEX idx_annotations_user ON document_annotations(user_id);
ALTER TABLE document_annotations ENABLE ROW LEVEL SECURITY;
```

### Components

**File:** `src/components/dashboard/documents/PDFViewer.tsx`
- PDF rendering with react-pdf
- Annotation overlay

**File:** `src/components/dashboard/documents/AnnotationToolbar.tsx`
- Tool selection, color picker

**File:** `src/components/dashboard/documents/AnnotationLayer.tsx`
- Render and create annotations

### API Routes

**File:** `src/app/api/documents/[id]/annotations/route.ts`
- `GET` - List annotations
- `POST` - Create annotation

**File:** `src/app/api/documents/[id]/annotations/[annotationId]/route.ts`
- `PATCH` - Update
- `DELETE` - Delete

### Acceptance Criteria
- [ ] Can view PDF in-app
- [ ] Can add highlights and notes
- [ ] Annotations persist
- [ ] Can share annotations publicly

---

## Phase 8: Structured Agenda Builder

### Overview
Drag-and-drop agenda items replacing text field.

### Duration: 2-3 days

### Database Migration

**File:** `supabase/migrations/014_create_agenda_items_table.sql`

```sql
CREATE TABLE agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES agenda_items(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  item_type VARCHAR(20) DEFAULT 'regular' CHECK (item_type IN ('regular', 'consent', 'presentation', 'vote', 'break')),
  document_id UUID REFERENCES documents(id),
  resolution_id UUID REFERENCES resolutions(id),
  presenter_id UUID REFERENCES board_members(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agenda_meeting ON agenda_items(meeting_id);
ALTER TABLE agenda_items ENABLE ROW LEVEL SECURITY;
```

### Components

**File:** `src/components/dashboard/meetings/AgendaBuilder.tsx`
- Drag-drop with @dnd-kit/core
- Add/reorder items

**File:** `src/components/dashboard/meetings/AgendaItemForm.tsx`
- Create/edit agenda item

**File:** `src/components/dashboard/meetings/AgendaItemCard.tsx`
- Draggable card

**File:** `src/components/dashboard/meetings/AgendaView.tsx`
- Read-only view for meeting details

### API Routes

**File:** `src/app/api/meetings/[id]/agenda/route.ts`
- `GET`, `POST`, `PUT` (bulk reorder)

**File:** `src/app/api/meetings/[id]/agenda/[itemId]/route.ts`
- `PATCH`, `DELETE`

### Acceptance Criteria
- [x] Can create structured agenda
- [x] Can drag-drop to reorder
- [x] Can link documents and resolutions
- [x] Legacy text agendas still display

**Status:** ✅ **COMPLETED** (2026-01-29)

---

## Phase 9: Calendar Integration

### Overview
Add meetings to calendar apps.

### Duration: 1 day

### Implementation

**File:** `src/lib/calendar/ics-generator.ts`
- Generate .ics file from meeting data

**File:** `src/app/api/meetings/[id]/calendar/route.ts`
- `GET` - Download .ics

**File:** `src/components/dashboard/meetings/AddToCalendarButton.tsx`
- Google, Outlook, Apple options

### Acceptance Criteria
- [x] Can download .ics file
- [x] Calendar links work

**Status:** ✅ **COMPLETED** (2026-01-29)

---

## Phase 10: Policy Library

### Overview
Dedicated section for permanent reference documents.

### Duration: 1 day

### Database Changes

**File:** `supabase/migrations/015_add_library_flag.sql`

```sql
ALTER TABLE documents ADD COLUMN is_library_item BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN library_category VARCHAR(50);
```

### Components

**File:** `src/app/(dashboard)/library/page.tsx`
- Library list with category tabs

**File:** `src/components/dashboard/library/LibraryList.tsx`
- Filtered document list

### Acceptance Criteria
- [ ] Can mark documents as library items
- [ ] Library page shows categorized documents

---

## Phase 11: Professional Profiles & Marketplace

### Overview
Board talent marketplace for organizations and professionals.

### Duration: 5-7 days

### Key Features
- Professional profiles (experience, skills, certifications)
- Board Readiness Score calculation
- Position posting by organizations
- Application system with ATS
- AI-powered matching

### Database Tables
- `professional_profiles`
- `experiences`
- `skills`
- `certifications`
- `board_positions` (postings)
- `applications`

---

## Phase 12: Payments (Stripe + M-Pesa)

### Overview
Subscription billing with Stripe and Flutterwave.

### Duration: 3-4 days

### Key Features
- Pricing page with tiers
- Stripe Checkout integration
- M-Pesa via Flutterwave
- Webhook handlers
- Customer portal

---

## Phase 13: LMS (Courses & Certificates)

### Overview
Learning management system for governance training.

### Duration: 4-5 days

### Key Features
- Course catalog
- Video streaming (Cloudflare Stream)
- Progress tracking
- Quizzes and assessments
- Certificate generation

---

## Phase 14: Video Conferencing

### Overview
Built-in video meetings via Daily.co.

### Duration: 2-3 days

### Key Features
- Meeting rooms
- Recording
- Storage to R2

---

## Phase 15: AI Features

### Overview
AI-powered features for enhanced productivity.

### Duration: 4-5 days

### Key Features
- Meeting transcription (Deepgram/AssemblyAI)
- Auto-generated minutes
- AI action item extraction
- Smart matching for marketplace
- Document analysis

---

## Phase 16: Board Evaluations & Performance

### Overview
Board self-assessments and 360° feedback.

### Duration: 2-3 days

### Key Features
- Evaluation survey templates
- Self-assessment forms
- Peer feedback
- Performance reports

---

## Phase 17: Africa Compliance Library

### Overview
Africa-specific regulatory database.

### Duration: 3-4 days

### Key Features
- Regulatory database (10+ countries)
- Compliance calendar
- Checklist generator
- Template library

---

## Phase 18: PWA & Offline Access

### Overview
Progressive Web App with offline support.

### Duration: 2-3 days

### Key Features
- PWA manifest and service worker
- Offline document caching
- Background sync

---

## Phase 19: Global Search

### Overview
Search across all content.

### Duration: 1-2 days

### Key Features
- Full-text search
- Command palette (Cmd+K)
- Grouped results

---

## Phase 20: Analytics Dashboard

### Overview
Governance health metrics.

### Duration: 2 days

### Key Features
- Governance score
- Diversity metrics
- Meeting effectiveness
- PDF reports

---

## Phase 21: Admin Dashboard

### Overview
Platform administration.

### Duration: 1-2 days

### Key Features
- Platform metrics
- User management
- Content moderation

---

## Phase 22: Security, Testing & Launch

### Overview
Final hardening and launch preparation.

### Duration: 3-4 days

### Key Features
- Rate limiting
- Security headers
- Integration tests (Playwright)
- Documentation
- Launch checklist

---

## Phase 23: Hybrid Meeting Support

### Overview
Enable hybrid virtual/physical meetings with video conferencing integration.

### Duration: 6-8 days

### Rationale
Based on Kenya COG tender analysis - market demand for hybrid meeting solutions in government sector.

### Key Features
- Video conferencing integration (Zoom/Teams/Google Meet APIs)
- WebRTC fallback for native video calls
- Screen sharing capabilities
- Virtual meeting room URLs
- Meeting recording storage (Supabase Storage)
- Recording playback interface with timestamps
- Automatic recording linking to meeting records

### Database Changes
```sql
-- Video conference integration
ALTER TABLE meetings ADD COLUMN video_conference_url TEXT;
ALTER TABLE meetings ADD COLUMN video_provider TEXT; -- 'zoom', 'teams', 'meet', 'native'
ALTER TABLE meetings ADD COLUMN recording_url TEXT;
ALTER TABLE meetings ADD COLUMN recording_duration INTEGER;

-- Meeting recordings table
CREATE TABLE meeting_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Phase 24: AI Meeting Intelligence

### Overview
AI-powered meeting transcription, summaries, and action item extraction.

### Duration: 4-6 days

### Rationale
Critical competitive gap identified in COMPETITIVE_ANALYSIS.md and tender requirements.

### Key Features
- Real-time meeting transcription (AssemblyAI/Whisper integration)
- Auto-generated meeting summaries
- Action item extraction from transcripts
- Speaker identification and attribution
- Searchable transcript archive
- AI-generated meeting minutes drafts
- Key decision highlighting

### Database Changes
```sql
-- Meeting transcripts
CREATE TABLE meeting_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  summary TEXT,
  language TEXT DEFAULT 'en',
  word_count INTEGER,
  provider TEXT, -- 'assemblyai', 'whisper', 'deepgram'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extracted action items
CREATE TABLE transcript_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transcript_id UUID REFERENCES meeting_transcripts(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  assigned_to UUID REFERENCES user_profiles(id),
  confidence_score DECIMAL(3,2),
  timestamp_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Phase 25: Government Sector Module

### Overview
Specialized features for public sector governance and compliance.

### Duration: 3-4 days

### Rationale
Kenya COG tender represents government market opportunity; Africa has many government boards.

### Key Features
- Public sector governance templates
- Enhanced audit trail with regulatory compliance
- Government-specific board types and roles
- Multi-language support (Swahili, French, Portuguese for pan-African)
- Regulatory reporting templates
- Public meeting disclosure features
- Government-specific onboarding flow
- Integration with e-government systems

### Database Changes
```sql
-- Government-specific extensions
ALTER TABLE organizations ADD COLUMN sector TEXT DEFAULT 'private'; -- 'private', 'public', 'ngo', 'parastatal'
ALTER TABLE organizations ADD COLUMN regulatory_body TEXT;
ALTER TABLE organizations ADD COLUMN public_disclosure_required BOOLEAN DEFAULT FALSE;

-- Audit enhancements
CREATE TABLE compliance_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  actor_id UUID REFERENCES user_profiles(id),
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Phase 26: Board Pack Management

### Overview
Document preparation workflow for secretaries and board members.

### Duration: 3-4 days

### Rationale
Critical governance requirement - board members must receive documents with sufficient time to review before meetings.

### Key Features
- Document deadline tracking for meetings
- Secretary dashboard with preparation checklist
- Board pack status (draft/ready/sent)
- Required document types (agenda, minutes, financials, committee reports)
- Automated reminders for secretaries
- Board member document read tracking
- Calendar integration with document availability
- "Send Board Pack" workflow with email notifications

### Database Changes
```sql
-- Document deadline and status tracking
ALTER TABLE meetings 
  ADD COLUMN document_deadline TIMESTAMPTZ,
  ADD COLUMN board_pack_status TEXT DEFAULT 'draft' 
    CHECK (board_pack_status IN ('draft', 'ready', 'sent')),
  ADD COLUMN board_pack_sent_at TIMESTAMPTZ,
  ADD COLUMN board_pack_checklist JSONB;

-- Board pack items
CREATE TABLE board_pack_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  item_type TEXT CHECK (item_type IN ('agenda', 'minutes', 'financial_report', 'committee_report', 'other')),
  is_required BOOLEAN DEFAULT TRUE,
  uploaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track document read status
CREATE TABLE board_pack_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  board_member_id UUID REFERENCES board_members(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meeting_id, board_member_id, document_id)
);

-- Cron job for deadline notifications
CREATE OR REPLACE FUNCTION notify_document_deadlines()
RETURNS void AS $$
BEGIN
  -- Notify secretaries 3 days before deadline
  -- Notify board members when pack is sent
  -- Reminder 2 days before meeting if not read
END;
$$ LANGUAGE plpgsql;
```

### UI Components
- Secretary preparation dashboard
- Document deadline countdown
- Board pack checklist (agenda, minutes, reports)
- "Send Board Pack" button
- Board member notification of available documents
- Document read tracking/receipts

---

## Phase 27: Post-Meeting Workflow

### Overview
Complete the meeting lifecycle: minutes approval, action item follow-up, committee reporting.

### Duration: 3-4 days

### Rationale
Critical governance workflow gaps identified - meetings need proper closure and follow-up.

### Key Features
- **Minutes Approval Workflow:**
  - Draft → Review → Approval → Archive
  - Board members can comment/suggest edits
  - Chair approves final version
  - Approved minutes locked and archived
  
- **Quorum Management:**
  - Real-time quorum tracking
  - Meeting cannot proceed without quorum
  - Quorum rules per committee type
  - Automatic quorum validation
  
- **Conflict of Interest Declarations:**
  - Board members declare conflicts before voting
  - Conflicts recorded per resolution/agenda item
  - Automatic recusal from votes
  - Audit trail of all declarations
  
- **Committee Reporting to Board:**
  - Committee findings → Board meeting agenda
  - Committee chair presents report
  - Board votes on committee recommendations
  
- **Action Item Follow-up:**
  - Automated reminders before due date
  - Progress tracking (not started/in progress/completed)
  - Escalation for overdue items
  - Reporting on completion rates

### Database Changes
```sql
-- Minutes approval workflow
ALTER TABLE meetings 
  ADD COLUMN minutes_status TEXT DEFAULT 'draft' 
    CHECK (minutes_status IN ('draft', 'under_review', 'approved', 'archived')),
  ADD COLUMN minutes_approved_by UUID REFERENCES board_members(id),
  ADD COLUMN minutes_approved_at TIMESTAMPTZ;

CREATE TABLE minutes_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  board_member_id UUID REFERENCES board_members(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quorum management
ALTER TABLE committees ADD COLUMN quorum_percentage INTEGER DEFAULT 50;
ALTER TABLE meetings ADD COLUMN quorum_met BOOLEAN DEFAULT FALSE;

CREATE TABLE meeting_quorum_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  total_members INTEGER NOT NULL,
  present_members INTEGER NOT NULL,
  quorum_required INTEGER NOT NULL,
  quorum_met BOOLEAN NOT NULL,
  checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conflict of interest
CREATE TABLE conflict_of_interest_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  agenda_item_id UUID REFERENCES meeting_agenda_items(id) ON DELETE CASCADE,
  resolution_id UUID REFERENCES resolutions(id) ON DELETE CASCADE,
  board_member_id UUID REFERENCES board_members(id) ON DELETE CASCADE,
  conflict_type TEXT CHECK (conflict_type IN ('financial', 'personal', 'professional', 'other')),
  description TEXT NOT NULL,
  action_taken TEXT CHECK (action_taken IN ('recused', 'disclosed_proceeded', 'left_meeting')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Committee reports to board
CREATE TABLE committee_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id UUID REFERENCES committees(id) ON DELETE CASCADE,
  presented_at_meeting_id UUID REFERENCES meetings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  recommendations TEXT,
  document_id UUID REFERENCES documents(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'presented', 'approved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Action item reminders and escalation
ALTER TABLE action_items 
  ADD COLUMN reminder_sent_at TIMESTAMPTZ,
  ADD COLUMN escalated BOOLEAN DEFAULT FALSE,
  ADD COLUMN escalated_at TIMESTAMPTZ,
  ADD COLUMN progress_notes TEXT;

-- Resolution implementation tracking
CREATE TABLE resolution_implementation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id UUID REFERENCES resolutions(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES board_members(id),
  implementation_status TEXT DEFAULT 'pending' 
    CHECK (implementation_status IN ('pending', 'in_progress', 'completed', 'blocked')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  target_completion_date DATE,
  actual_completion_date DATE,
  progress_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emergency meeting support (minimal addition)
ALTER TABLE meetings 
  ADD COLUMN is_emergency BOOLEAN DEFAULT FALSE,
  ADD COLUMN emergency_justification TEXT;
```

### Workflows
1. **Minutes Cycle:** Draft (secretary) → Review (members) → Approve (chair) → Archive
2. **Quorum Check:** Before meeting starts → Real-time during meeting → Logged for compliance
3. **COI Process:** Agenda item discussed → Member declares conflict → System records → Member recused from vote
4. **Committee Reporting:** Committee meeting → Report drafted → Submitted to board → Presented at board meeting → Board votes
5. **Action Follow-up:** Created → Reminders at 50% timeline → Overdue escalation → Completion tracking
6. **Resolution Implementation:** Approved → Assigned → Progress tracking → Completion (lightweight, non-cumbersome)
7. **Emergency Meetings:** Flag as emergency → Provide justification → Reduced notice period accepted

---

## Phase 28: Strategic Planning & Goal Tracking

### Overview
Multi-year strategic planning, organizational goals, and progress monitoring for boards.

### Duration: 4-5 days

### Rationale
Boards need to set and monitor long-term strategic objectives beyond day-to-day governance.

### Key Features
- **Strategic Objectives Management:**
  - Multi-year goal setting (3-5 year plans)
  - Objective categories (growth, financial, governance, ESG, operational)
  - Key results/milestones per objective
  - Target dates and success metrics
  
- **Progress Dashboards:**
  - Real-time progress tracking per objective
  - Visual progress indicators (charts, gauges)
  - At-risk objective alerts
  - Quarterly/annual progress reports
  
- **Strategic Initiatives:**
  - Link initiatives to objectives
  - Project tracking and status
  - Resource allocation
  - Cross-committee collaboration
  
- **Board Retreat Planning:**
  - Annual/biannual retreat scheduling
  - Strategic session agendas
  - Pre-retreat preparation materials
  - Post-retreat action items
  
- **Goal Alignment:**
  - Link committee activities to strategic goals
  - Resolution impact on strategic objectives
  - Department/team goal cascading

### Database Changes
```sql
-- Strategic objectives
CREATE TABLE strategic_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('growth', 'financial', 'governance', 'esg', 'operational', 'innovation', 'risk_management')),
  start_date DATE NOT NULL,
  target_date DATE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'deferred', 'cancelled')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  owner_id UUID REFERENCES board_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Key results/milestones
CREATE TABLE objective_key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID REFERENCES strategic_objectives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_value DECIMAL,
  current_value DECIMAL,
  unit TEXT, -- e.g., '%', '$', 'points'
  target_date DATE,
  achieved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Strategic initiatives/projects
CREATE TABLE strategic_initiatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID REFERENCES strategic_objectives(id) ON DELETE CASCADE,
  committee_id UUID REFERENCES committees(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  budget DECIMAL,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'on_hold')),
  start_date DATE,
  end_date DATE,
  lead_id UUID REFERENCES board_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress updates
CREATE TABLE objective_progress_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID REFERENCES strategic_objectives(id) ON DELETE CASCADE,
  update_text TEXT NOT NULL,
  progress_percentage INTEGER,
  reported_by UUID REFERENCES board_members(id),
  reported_at TIMESTAMPTZ DEFAULT NOW()
);

-- Board retreats
CREATE TABLE board_retreats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  retreat_date DATE NOT NULL,
  location TEXT,
  agenda TEXT,
  focus_areas TEXT[], -- e.g., ['strategy', 'succession', 'risk']
  attendees JSONB,
  outcomes_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link resolutions to strategic objectives
ALTER TABLE resolutions 
  ADD COLUMN objective_id UUID REFERENCES strategic_objectives(id);
```

### UI Components
- Strategic objectives dashboard
- Progress tracking charts (line, gauge, bar)
- Multi-year timeline view
- Retreat planning calendar
- Goal alignment matrix
- Executive summary reports

### Reports
- Quarterly strategy progress report
- Annual strategic review
- Objective completion rates
- Initiative ROI analysis

---

## Timeline Summary

| Phase | Duration | Cumulative |
|:------|:---------|:-----------|
| 5: Resolution Voting | 2-3 days | Week 1 |
| 6: E-Signatures | 1-2 days | Week 1 |
| 7: Document Annotations | 3-4 days | Week 2 |
| 8: Structured Agenda | 2-3 days | Week 2 |
| 9: Calendar Integration | 1 day | Week 2 |
| 10: Policy Library | 1 day | Week 2-3 |
| 11: Marketplace | 5-7 days | Week 3-4 |
| 12: Payments | 3-4 days | Week 4-5 |
| 13: LMS | 4-5 days | Week 5-6 |
| 14: Video Conferencing | 2-3 days | Week 6 |
| 15: AI Features | 4-5 days | Week 7 |
| 16: Board Evaluations | 2-3 days | Week 7-8 |
| 17: Compliance Library | 3-4 days | Week 8 |
| ~~18: PWA & Offline~~ | ~~2-3 days~~ | ~~Deferred~~ |
| 19: Global Search | 1-2 days | Week 8-9 |
| 20: Analytics | 2 days | Week 9 |
| 21: Admin Dashboard | 1-2 days | Week 9 |
| 22: Security & Launch | 3-4 days | Week 9-10 |
| 23: Hybrid Meeting Support | 6-8 days | Week 11-12 |
| 24: AI Meeting Intelligence | 4-6 days | Week 12-13 |
| 25: Government Sector Module | 3-4 days | Week 13-14 |
| 26: Board Pack Management | 3-4 days | Week 14-15 |
| 27: Post-Meeting Workflow | 3-4 days | Week 15-16 |
| 28: Strategic Planning & Goal Tracking | 4-5 days | Week 16-18 |

**Total: ~16-18 weeks from Phase 5 onwards** (Phases 13 & 18 deferred)

---

## Execution Instructions

For each phase:

1. **Read** the phase requirements completely
2. **Create** database migrations and apply to Supabase
3. **Add** TypeScript types to `database.types.ts`
4. **Create** validation schemas in `src/lib/validations/`
5. **Build** API routes with error handling
6. **Build** UI components following existing patterns
7. **Integrate** into existing pages
8. **Test** all functionality
9. **Commit** with descriptive message: `feat(phase-X): Add [feature name]`

### Code Standards
- Follow existing file/folder structure
- Use SWR for data fetching
- Use React Hook Form + Zod for forms
- Add loading and error states
- Add empty states for lists
- Use existing UI components (Button, Input, Card, etc.)
- Add `suppressHydrationWarning` to form inputs

---

**Document Version:** 3.0  
**Last Updated:** February 5, 2026  
**Status:** Active - Single Source of Truth
