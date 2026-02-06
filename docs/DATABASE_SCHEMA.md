# Board.Africa - Database Schema (Supabase/PostgreSQL)

## Overview
This document defines the complete database schema for Board.Africa, organized by feature and milestone. All tables use UUID primary keys and include `created_at` and `updated_at` timestamps.

---

## Core Tables (Milestone 1-3)

### `profiles`
User profiles extending Supabase Auth users.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('organization', 'professional', 'admin')),
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
```

### `organizations`
Company/organization profiles.

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  industry TEXT NOT NULL,
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
  founded_year INTEGER,
  headquarters_location TEXT,
  country TEXT NOT NULL,
  website TEXT,
  logo_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  governance_score INTEGER DEFAULT 0 CHECK (governance_score >= 0 AND governance_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_organizations_user_id ON organizations(user_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_industry ON organizations(industry);
CREATE INDEX idx_organizations_country ON organizations(country);
```

### `professionals`
Professional (board director) profiles.

```sql
CREATE TABLE professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  headline TEXT,
  location TEXT,
  country TEXT,
  languages TEXT[], -- Array of language codes
  linkedin_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  availability_status TEXT DEFAULT 'available' CHECK (availability_status IN ('available', 'not_available', 'open_to_opportunities')),
  board_readiness_score INTEGER DEFAULT 0 CHECK (board_readiness_score >= 0 AND board_readiness_score <= 100),
  total_board_experience_years INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_professionals_user_id ON professionals(user_id);
CREATE INDEX idx_professionals_username ON professionals(username);
CREATE INDEX idx_professionals_availability ON professionals(availability_status);
CREATE INDEX idx_professionals_country ON professionals(country);
```

### `professional_skills`
Skills tagged to professionals.

```sql
CREATE TABLE professional_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_category TEXT CHECK (skill_category IN ('governance', 'finance', 'legal', 'technology', 'operations', 'marketing', 'hr', 'risk', 'audit', 'strategy', 'other')),
  years_of_experience INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_professional_skills_professional_id ON professional_skills(professional_id);
CREATE INDEX idx_professional_skills_skill_name ON professional_skills(skill_name);
```

### `professional_industries`
Industries of expertise for professionals.

```sql
CREATE TABLE professional_industries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  industry_name TEXT NOT NULL,
  years_of_experience INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_professional_industries_professional_id ON professional_industries(professional_id);
CREATE INDEX idx_professional_industries_industry ON professional_industries(industry_name);
```

### `professional_experience`
Work experience and board positions.

```sql
CREATE TABLE professional_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  experience_type TEXT NOT NULL CHECK (experience_type IN ('board_position', 'executive', 'employment', 'advisory')),
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  location TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_professional_experience_professional_id ON professional_experience(professional_id);
CREATE INDEX idx_professional_experience_type ON professional_experience(experience_type);
```

### `professional_education`
Education history.

```sql
CREATE TABLE professional_education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  institution_name TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  start_year INTEGER,
  end_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_professional_education_professional_id ON professional_education(professional_id);
```

### `professional_certifications`
Certifications and credentials.

```sql
CREATE TABLE professional_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  certification_name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  issue_date DATE,
  expiry_date DATE,
  credential_id TEXT,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_professional_certifications_professional_id ON professional_certifications(professional_id);
```

---

## Marketplace Tables (Milestone 4-7)

### `board_positions`
Job postings for board positions.

```sql
CREATE TABLE board_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position_type TEXT NOT NULL CHECK (position_type IN ('board_director', 'advisory_board', 'committee_chair', 'ceo', 'executive')),
  description TEXT NOT NULL,
  requirements TEXT,
  responsibilities TEXT,
  skills_required TEXT[] NOT NULL,
  industries TEXT[] NOT NULL,
  location TEXT,
  is_remote BOOLEAN DEFAULT FALSE,
  compensation_type TEXT CHECK (compensation_type IN ('paid', 'unpaid', 'equity', 'honorarium', 'negotiable')),
  compensation_min INTEGER,
  compensation_max INTEGER,
  compensation_currency TEXT DEFAULT 'USD',
  time_commitment TEXT, -- e.g. "4 meetings per year", "10 hours/month"
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'filled')),
  application_deadline DATE,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_board_positions_organization_id ON board_positions(organization_id);
CREATE INDEX idx_board_positions_status ON board_positions(status);
CREATE INDEX idx_board_positions_position_type ON board_positions(position_type);
CREATE INDEX idx_board_positions_published_at ON board_positions(published_at);
CREATE INDEX idx_board_positions_skills ON board_positions USING GIN(skills_required);
CREATE INDEX idx_board_positions_industries ON board_positions USING GIN(industries);
```

### `applications`
Applications to board positions.

```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES board_positions(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  cover_letter TEXT,
  status TEXT DEFAULT 'applied' CHECK (status IN ('applied', 'under_review', 'shortlisted', 'interview', 'rejected', 'accepted', 'withdrawn')),
  match_score INTEGER CHECK (match_score >= 0 AND match_score <= 100),
  notes TEXT, -- Internal notes by organization
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(position_id, professional_id)
);

CREATE INDEX idx_applications_position_id ON applications(position_id);
CREATE INDEX idx_applications_professional_id ON applications(professional_id);
CREATE INDEX idx_applications_status ON applications(status);
```

---

## Board Management Tables (Milestone 8-10)

### `board_members`
Board members within an organization.

```sql
CREATE TABLE board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL, -- Nullable if not on platform
  full_name TEXT NOT NULL,
  email TEXT,
  title TEXT NOT NULL, -- e.g. "Chair", "Director", "Independent Director"
  is_independent BOOLEAN DEFAULT FALSE,
  is_executive BOOLEAN DEFAULT FALSE,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'resigned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_board_members_organization_id ON board_members(organization_id);
CREATE INDEX idx_board_members_professional_id ON board_members(professional_id);
CREATE INDEX idx_board_members_status ON board_members(status);
```

### `committees`
Board committees (Audit, Risk, HR, etc.).

```sql
CREATE TABLE committees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('audit', 'risk', 'hr', 'governance', 'ict', 'nomination', 'remuneration', 'investment', 'other')),
  description TEXT,
  chair_id UUID REFERENCES board_members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_committees_organization_id ON committees(organization_id);
```

### `committee_members`
Committee membership.

```sql
CREATE TABLE committee_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  committee_id UUID NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  board_member_id UUID NOT NULL REFERENCES board_members(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('chair', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(committee_id, board_member_id)
);

CREATE INDEX idx_committee_members_committee_id ON committee_members(committee_id);
CREATE INDEX idx_committee_members_board_member_id ON committee_members(board_member_id);
```

### `meetings`
Board and committee meetings.

```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  committee_id UUID REFERENCES committees(id) ON DELETE SET NULL, -- Null = full board meeting
  title TEXT NOT NULL,
  meeting_type TEXT CHECK (meeting_type IN ('board', 'committee', 'special', 'annual')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 120,
  location TEXT, -- Physical location or "Virtual"
  video_room_url TEXT, -- Daily.co room URL
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  agenda TEXT,
  minutes TEXT,
  recording_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meetings_organization_id ON meetings(organization_id);
CREATE INDEX idx_meetings_committee_id ON meetings(committee_id);
CREATE INDEX idx_meetings_scheduled_at ON meetings(scheduled_at);
CREATE INDEX idx_meetings_status ON meetings(status);
```

### `meeting_attendees`
Meeting attendance tracking.

```sql
CREATE TABLE meeting_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  board_member_id UUID NOT NULL REFERENCES board_members(id) ON DELETE CASCADE,
  attendance_status TEXT DEFAULT 'invited' CHECK (attendance_status IN ('invited', 'accepted', 'declined', 'attended', 'absent')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(meeting_id, board_member_id)
);

CREATE INDEX idx_meeting_attendees_meeting_id ON meeting_attendees(meeting_id);
CREATE INDEX idx_meeting_attendees_board_member_id ON meeting_attendees(board_member_id);
```

### `meeting_agenda_items`
Agenda items for meetings.

```sql
CREATE TABLE meeting_agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  presenter TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_meeting_agenda_items_meeting_id ON meeting_agenda_items(meeting_id);
```

### `resolutions`
Board resolutions and voting.

```sql
CREATE TABLE resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  resolution_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  proposed_by UUID REFERENCES board_members(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'deferred')),
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  votes_abstain INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_resolutions_meeting_id ON resolutions(meeting_id);
CREATE INDEX idx_resolutions_status ON resolutions(status);
```

### `resolution_votes`
Individual votes on resolutions.

```sql
CREATE TABLE resolution_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resolution_id UUID NOT NULL REFERENCES resolutions(id) ON DELETE CASCADE,
  board_member_id UUID NOT NULL REFERENCES board_members(id) ON DELETE CASCADE,
  vote TEXT NOT NULL CHECK (vote IN ('for', 'against', 'abstain')),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(resolution_id, board_member_id)
);

CREATE INDEX idx_resolution_votes_resolution_id ON resolution_votes(resolution_id);
CREATE INDEX idx_resolution_votes_board_member_id ON resolution_votes(board_member_id);
```

### `action_items`
Action items from meetings.

```sql
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES board_members(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_action_items_meeting_id ON action_items(meeting_id);
CREATE INDEX idx_action_items_assigned_to ON action_items(assigned_to);
CREATE INDEX idx_action_items_status ON action_items(status);
```

---

## Document Management Tables (Milestone 9)

### `documents`
Secure document vault.

```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  meeting_id UUID REFERENCES meetings(id) ON DELETE SET NULL, -- Optional meeting attachment
  folder_id UUID REFERENCES document_folders(id) ON DELETE SET NULL,
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL, -- MIME type
  file_size BIGINT NOT NULL,
  storage_key TEXT NOT NULL, -- R2 object key
  storage_url TEXT NOT NULL, -- R2 presigned URL or public URL
  document_category TEXT CHECK (document_category IN ('board_pack', 'policy', 'charter', 'financial_report', 'minutes', 'resolution', 'other')),
  is_confidential BOOLEAN DEFAULT TRUE,
  access_level TEXT DEFAULT 'board' CHECK (access_level IN ('public', 'board', 'committee', 'restricted')),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_organization_id ON documents(organization_id);
CREATE INDEX idx_documents_meeting_id ON documents(meeting_id);
CREATE INDEX idx_documents_folder_id ON documents(folder_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
```

### `document_folders`
Folder structure for document organization.

```sql
CREATE TABLE document_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  parent_folder_id UUID REFERENCES document_folders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_document_folders_organization_id ON document_folders(organization_id);
CREATE INDEX idx_document_folders_parent_id ON document_folders(parent_folder_id);
```

### `document_access_log`
Audit trail for document access.

```sql
CREATE TABLE document_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL CHECK (action IN ('viewed', 'downloaded', 'shared')),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_document_access_log_document_id ON document_access_log(document_id);
CREATE INDEX idx_document_access_log_user_id ON document_access_log(user_id);
CREATE INDEX idx_document_access_log_created_at ON document_access_log(created_at);
```

---

## Payments & Subscriptions Tables (Milestone 11-13)

### `subscriptions`
Organization subscription plans.

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'starter', 'professional', 'enterprise')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing', 'incomplete')),
  payment_provider TEXT CHECK (payment_provider IN ('stripe', 'flutterwave')),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  flutterwave_subscription_id TEXT UNIQUE,
  flutterwave_customer_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
```

### `payments`
Payment history.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  subscription_id UUID REFERENCES subscriptions(id),
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'refunded')),
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('stripe', 'flutterwave')),
  payment_method TEXT, -- e.g. "card", "mpesa"
  stripe_payment_intent_id TEXT,
  flutterwave_transaction_id TEXT,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_created_at ON payments(created_at);
```

---

## Learning Management System Tables (Milestone 14-15)

### `courses`
Course catalog.

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  thumbnail_url TEXT,
  instructor_name TEXT NOT NULL,
  instructor_bio TEXT,
  instructor_avatar_url TEXT,
  category TEXT NOT NULL CHECK (category IN ('governance', 'risk', 'compliance', 'finance', 'leadership', 'technology', 'esg', 'audit')),
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration_hours DECIMAL(5,2),
  cpd_hours DECIMAL(5,2), -- Continuing Professional Development hours
  price INTEGER DEFAULT 0, -- Price in cents
  currency TEXT DEFAULT 'USD',
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  enrollment_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_courses_is_published ON courses(is_published);
```

### `course_lessons`
Lessons within courses.

```sql
CREATE TABLE course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  video_url TEXT, -- Cloudflare Stream or Mux URL
  video_duration_seconds INTEGER,
  is_preview BOOLEAN DEFAULT FALSE, -- Can be viewed without enrollment
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_lessons_course_id ON course_lessons(course_id);
```

### `course_resources`
Downloadable resources for lessons.

```sql
CREATE TABLE course_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  resource_type TEXT CHECK (resource_type IN ('pdf', 'document', 'spreadsheet', 'slides', 'other')),
  file_url TEXT NOT NULL,
  file_size BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_resources_lesson_id ON course_resources(lesson_id);
```

### `course_quizzes`
Quizzes/assessments within courses.

```sql
CREATE TABLE course_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70, -- Percentage
  max_attempts INTEGER DEFAULT 3,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_course_quizzes_course_id ON course_quizzes(course_id);
```

### `quiz_questions`
Questions within quizzes.

```sql
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES course_quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
  options JSONB, -- Array of answer options
  correct_answer TEXT NOT NULL,
  points INTEGER DEFAULT 1,
  explanation TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions(quiz_id);
```

### `enrollments`
Course enrollments.

```sql
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_at TIMESTAMPTZ,
  certificate_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_status ON enrollments(status);
```

### `lesson_progress`
Tracking lesson completion.

```sql
CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES course_lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  video_progress_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(enrollment_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_enrollment_id ON lesson_progress(enrollment_id);
CREATE INDEX idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
```

### `quiz_attempts`
Quiz attempt history.

```sql
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES course_quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL, -- JSON of question_id: answer pairs
  attempt_number INTEGER NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_attempts_enrollment_id ON quiz_attempts(enrollment_id);
CREATE INDEX idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
```

### `course_reviews`
Course reviews and ratings.

```sql
CREATE TABLE course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, user_id)
);

CREATE INDEX idx_course_reviews_course_id ON course_reviews(course_id);
CREATE INDEX idx_course_reviews_user_id ON course_reviews(user_id);
```

---

## Notifications & Communication Tables (Milestone 18)

### `notifications`
In-app notifications.

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('application_received', 'application_status_changed', 'meeting_reminder', 'new_message', 'document_shared', 'course_completed', 'payment_successful', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- URL to relevant resource
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
```

### `notification_preferences`
User notification preferences.

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  email_applications BOOLEAN DEFAULT TRUE,
  email_meetings BOOLEAN DEFAULT TRUE,
  email_documents BOOLEAN DEFAULT TRUE,
  email_courses BOOLEAN DEFAULT TRUE,
  email_payments BOOLEAN DEFAULT TRUE,
  email_marketing BOOLEAN DEFAULT FALSE,
  in_app_applications BOOLEAN DEFAULT TRUE,
  in_app_meetings BOOLEAN DEFAULT TRUE,
  in_app_documents BOOLEAN DEFAULT TRUE,
  in_app_courses BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Analytics & Reporting Tables (Milestone 20)

### `analytics_events`
Track platform events for analytics.

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  event_data JSONB,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);
```

### `audit_logs`
Security and compliance audit trail.

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id),
  action TEXT NOT NULL, -- e.g. "user.login", "document.delete", "payment.refund"
  resource_type TEXT, -- e.g. "document", "user", "meeting"
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

---

## Row Level Security (RLS) Policies

Example RLS policies (to be applied to all tables):

```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
-- ... (apply to all tables)

-- Example policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Example policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Example policy: Organization owners can manage their organization
CREATE POLICY "Organization owners can manage"
  ON organizations
  FOR ALL
  USING (user_id = auth.uid());

-- Example policy: Anyone can view public professional profiles
CREATE POLICY "Public professional profiles are viewable"
  ON professionals
  FOR SELECT
  USING (is_public = TRUE OR user_id = auth.uid());

-- Example policy: Board members can view documents based on access level
CREATE POLICY "Board members can view documents"
  ON documents
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM board_members
      WHERE professional_id IN (
        SELECT id FROM professionals WHERE user_id = auth.uid()
      )
    )
  );
```

---

## Database Functions

### Update `updated_at` timestamp automatically

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (apply to all relevant tables)
```

### Calculate Board Readiness Score

```sql
CREATE OR REPLACE FUNCTION calculate_board_readiness_score(prof_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  exp_count INTEGER;
  edu_count INTEGER;
  cert_count INTEGER;
  skill_count INTEGER;
BEGIN
  -- Profile completeness (40 points)
  SELECT COUNT(*) INTO exp_count FROM professional_experience WHERE professional_id = prof_id;
  SELECT COUNT(*) INTO edu_count FROM professional_education WHERE professional_id = prof_id;
  SELECT COUNT(*) INTO cert_count FROM professional_certifications WHERE professional_id = prof_id;
  SELECT COUNT(*) INTO skill_count FROM professional_skills WHERE professional_id = prof_id;

  IF exp_count > 0 THEN score := score + 15; END IF;
  IF edu_count > 0 THEN score := score + 10; END IF;
  IF cert_count > 0 THEN score := score + 10; END IF;
  IF skill_count >= 5 THEN score := score + 5; END IF;

  -- Board experience (30 points)
  SELECT COUNT(*) INTO exp_count
  FROM professional_experience
  WHERE professional_id = prof_id AND experience_type = 'board_position';

  score := score + LEAST(exp_count * 10, 30);

  -- Years of experience (30 points)
  SELECT COALESCE(total_board_experience_years, 0) INTO exp_count
  FROM professionals WHERE id = prof_id;

  score := score + LEAST(exp_count * 3, 30);

  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;
```

---

## Summary

**Total Tables:** 45+
**Phases:**
- Phase 1 (Milestone 1-3): Core user tables (profiles, organizations, professionals)
- Phase 2 (Milestone 4-7): Marketplace tables (positions, applications)
- Phase 3 (Milestone 8-10): Board management (meetings, documents, resolutions)
- Phase 4 (Milestone 11-13): Payments (subscriptions, payments)
- Phase 5 (Milestone 14-15): LMS (courses, enrollments, quizzes)
- Phase 6 (Milestone 16-20): Supporting tables (notifications, analytics, audit)

**Next Step:** Run migration scripts in Supabase to create these tables.
