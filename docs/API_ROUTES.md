# Board.Africa - API Routes Map

## Overview
This document maps all API endpoints organized by milestone and feature. All routes are RESTful and return JSON responses.

---

## Base URL Structure

```
Production: https://board.africa/api
Preview: https://preview.board.africa/api
Local: http://localhost:3000/api
```

---

## Milestone 1-3: Core Authentication & Profiles

### Authentication Routes

#### POST `/api/auth/signup`
Register a new user.
```typescript
Request:
{
  email: string
  password: string
  full_name: string
}

Response:
{
  user: User
  message: "Verification email sent"
}
```

#### POST `/api/auth/login`
Login existing user.
```typescript
Request:
{
  email: string
  password: string
}

Response:
{
  user: User
  session: Session
  profile: Profile
}
```

#### POST `/api/auth/logout`
Logout current user.
```typescript
Response:
{
  message: "Logged out successfully"
}
```

#### POST `/api/auth/forgot-password`
Request password reset email.
```typescript
Request:
{
  email: string
}

Response:
{
  message: "Reset email sent"
}
```

#### POST `/api/auth/reset-password`
Reset password with token.
```typescript
Request:
{
  token: string
  password: string
}

Response:
{
  message: "Password updated successfully"
}
```

#### GET `/api/auth/session`
Get current user session.
```typescript
Response:
{
  user: User | null
  session: Session | null
}
```

### Profile Routes

#### GET `/api/profile`
Get current user's profile.
```typescript
Response:
{
  profile: Profile
  organization?: Organization
  professional?: Professional
}
```

#### PATCH `/api/profile`
Update current user's profile.
```typescript
Request:
{
  full_name?: string
  phone?: string
  avatar_url?: string
}

Response:
{
  profile: Profile
}
```

#### POST `/api/profile/onboarding`
Complete onboarding and set role.
```typescript
Request:
{
  role: 'organization' | 'professional'
  data: OrganizationData | ProfessionalData
}

Response:
{
  profile: Profile
  redirect: string
}
```

### Organization Routes

#### POST `/api/organizations`
Create organization profile.
```typescript
Request:
{
  company_name: string
  industry: string
  company_size: string
  country: string
  description?: string
  website?: string
}

Response:
{
  organization: Organization
}
```

#### GET `/api/organizations/[id]`
Get organization by ID.
```typescript
Response:
{
  organization: Organization
}
```

#### PATCH `/api/organizations/[id]`
Update organization profile.
```typescript
Request:
{
  // Any organization fields
}

Response:
{
  organization: Organization
}
```

### Professional Routes

#### POST `/api/professionals`
Create professional profile.
```typescript
Request:
{
  username: string
  headline: string
  bio?: string
  location: string
  country: string
  industries: string[]
}

Response:
{
  professional: Professional
}
```

#### GET `/api/professionals/[username]`
Get professional by username.
```typescript
Response:
{
  professional: Professional
  experience: Experience[]
  education: Education[]
  certifications: Certification[]
  skills: Skill[]
}
```

#### PATCH `/api/professionals/[id]`
Update professional profile.
```typescript
Request:
{
  // Any professional fields
}

Response:
{
  professional: Professional
}
```

#### POST `/api/professionals/[id]/experience`
Add experience entry.
```typescript
Request:
{
  experience_type: 'board_position' | 'executive' | 'employment' | 'advisory'
  title: string
  company_name: string
  start_date: string
  end_date?: string
  is_current: boolean
  description?: string
}

Response:
{
  experience: Experience
}
```

#### DELETE `/api/professionals/[id]/experience/[experienceId]`
Delete experience entry.
```typescript
Response:
{
  message: "Experience deleted"
}
```

---

## Milestone 4-7: Board Marketplace

### Position Routes

#### GET `/api/positions`
List all active board positions (public marketplace).
```typescript
Query Params:
  ?page=1
  &limit=20
  &industry=fintech
  &location=Kenya
  &position_type=board_director
  &search=chairman

Response:
{
  positions: Position[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

#### GET `/api/positions/[id]`
Get position details.
```typescript
Response:
{
  position: Position
  organization: Organization
}
```

#### POST `/api/positions`
Create new board position (organization only).
```typescript
Request:
{
  title: string
  position_type: 'board_director' | 'advisory_board' | 'committee_chair' | 'ceo'
  description: string
  requirements: string
  skills_required: string[]
  industries: string[]
  location: string
  is_remote: boolean
  compensation_type: string
  compensation_min?: number
  compensation_max?: number
  time_commitment: string
}

Response:
{
  position: Position
}
```

#### PATCH `/api/positions/[id]`
Update position.
```typescript
Request:
{
  // Any position fields
}

Response:
{
  position: Position
}
```

#### DELETE `/api/positions/[id]`
Delete/close position.
```typescript
Response:
{
  message: "Position closed"
}
```

#### POST `/api/positions/[id]/close`
Close position to applications.
```typescript
Response:
{
  position: Position
}
```

#### GET `/api/positions/[id]/recommended-candidates`
Get AI-recommended candidates for a position (organization only).
```typescript
Response:
{
  candidates: Professional[]
  match_scores: { [professionalId: string]: number }
}
```

### Application Routes

#### POST `/api/applications`
Apply to a position.
```typescript
Request:
{
  position_id: string
  cover_letter: string
}

Response:
{
  application: Application
  message: "Application submitted"
}
```

#### GET `/api/applications`
Get user's applications (professional) or received applications (organization).
```typescript
Query Params:
  ?status=applied
  &position_id=xxx

Response:
{
  applications: Application[]
}
```

#### GET `/api/applications/[id]`
Get application details.
```typescript
Response:
{
  application: Application
  position: Position
  professional: Professional
}
```

#### PATCH `/api/applications/[id]/status`
Update application status (organization only).
```typescript
Request:
{
  status: 'under_review' | 'shortlisted' | 'interview' | 'rejected' | 'accepted'
  notes?: string
}

Response:
{
  application: Application
}
```

#### DELETE `/api/applications/[id]`
Withdraw application (professional only).
```typescript
Response:
{
  message: "Application withdrawn"
}
```

### Search & Matching Routes

#### GET `/api/search/positions`
Search positions with advanced filters.
```typescript
Query Params:
  ?q=fintech director
  &skills=finance,governance
  &industries=fintech,banking
  &location=Kenya
  &min_compensation=50000
  &max_compensation=150000

Response:
{
  positions: Position[]
  total: number
}
```

#### GET `/api/search/professionals`
Search professionals (organization only).
```typescript
Query Params:
  ?q=CFO
  &skills=finance,audit
  &industries=fintech
  &location=Kenya
  &availability=available

Response:
{
  professionals: Professional[]
  total: number
}
```

#### GET `/api/recommendations/positions`
Get recommended positions for professional.
```typescript
Response:
{
  positions: Position[]
  match_scores: { [positionId: string]: number }
}
```

---

## Milestone 8-10: Board Management

### Board Members Routes

#### GET `/api/organizations/[orgId]/board-members`
List board members.
```typescript
Response:
{
  members: BoardMember[]
}
```

#### POST `/api/organizations/[orgId]/board-members`
Add board member.
```typescript
Request:
{
  professional_id?: string  // If on platform
  full_name: string
  email?: string
  title: string
  is_independent: boolean
  start_date: string
}

Response:
{
  member: BoardMember
}
```

#### PATCH `/api/board-members/[id]`
Update board member.
```typescript
Request:
{
  title?: string
  end_date?: string
  status?: 'active' | 'inactive' | 'resigned'
}

Response:
{
  member: BoardMember
}
```

#### DELETE `/api/board-members/[id]`
Remove board member.
```typescript
Response:
{
  message: "Board member removed"
}
```

### Committee Routes

#### GET `/api/organizations/[orgId]/committees`
List committees.
```typescript
Response:
{
  committees: Committee[]
}
```

#### POST `/api/organizations/[orgId]/committees`
Create committee.
```typescript
Request:
  type: 'audit' | 'risk' | 'hr' | 'governance' | 'ict'
  name: string
  description?: string
  chair_id?: string
}

Response:
{
  committee: Committee
}
```

#### POST `/api/committees/[id]/members`
Add committee member.
```typescript
Request:
{
  board_member_id: string
  role: 'chair' | 'member'
}

Response:
{
  membership: CommitteeMember
}
```

### Meeting Routes

#### GET `/api/organizations/[orgId]/meetings`
List meetings.
```typescript
Query Params:
  ?status=scheduled
  &committee_id=xxx
  &from=2024-01-01
  &to=2024-12-31

Response:
{
  meetings: Meeting[]
}
```

#### GET `/api/meetings/[id]`
Get meeting details.
```typescript
Response:
{
  meeting: Meeting
  attendees: MeetingAttendee[]
  agenda_items: AgendaItem[]
  resolutions: Resolution[]
  documents: Document[]
}
```

#### POST `/api/organizations/[orgId]/meetings`
Create meeting.
```typescript
Request:
{
  title: string
  meeting_type: 'board' | 'committee' | 'special' | 'annual'
  committee_id?: string
  scheduled_at: string
  duration_minutes: number
  location?: string
  agenda?: string
}

Response:
{
  meeting: Meeting
}
```

#### PATCH `/api/meetings/[id]`
Update meeting.
```typescript
Request:
{
  // Any meeting fields
}

Response:
{
  meeting: Meeting
}
```

#### POST `/api/meetings/[id]/start`
Start meeting (changes status to in_progress).
```typescript
Response:
{
  meeting: Meeting
  video_room_url: string  // Daily.co room URL
}
```

#### POST `/api/meetings/[id]/complete`
Complete meeting.
```typescript
Request:
{
  minutes: string
}

Response:
{
  meeting: Meeting
}
```

#### POST `/api/meetings/[id]/attendees`
Add meeting attendee.
```typescript
Request:
{
  board_member_id: string
}

Response:
{
  attendee: MeetingAttendee
}
```

#### PATCH `/api/meetings/[id]/attendees/[attendeeId]`
Update attendance status.
```typescript
Request:
{
  attendance_status: 'accepted' | 'declined' | 'attended' | 'absent'
}

Response:
{
  attendee: MeetingAttendee
}
```

### Resolution Routes

#### POST `/api/meetings/[meetingId]/resolutions`
Create resolution.
```typescript
Request:
{
  title: string
  description: string
  proposed_by: string  // board_member_id
}

Response:
{
  resolution: Resolution
}
```

#### POST `/api/resolutions/[id]/vote`
Vote on resolution.
```typescript
Request:
{
  vote: 'for' | 'against' | 'abstain'
  comment?: string
}

Response:
{
  vote: ResolutionVote
  resolution: Resolution  // Updated with vote counts
}
```

### Action Items Routes

#### GET `/api/organizations/[orgId]/action-items`
List action items.
```typescript
Query Params:
  ?status=pending
  &assigned_to=xxx
  &overdue=true

Response:
{
  actionItems: ActionItem[]
}
```

#### POST `/api/meetings/[meetingId]/action-items`
Create action item.
```typescript
Request:
{
  title: string
  description?: string
  assigned_to: string  // board_member_id
  due_date: string
}

Response:
{
  actionItem: ActionItem
}
```

#### PATCH `/api/action-items/[id]`
Update action item.
```typescript
Request:
{
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  due_date?: string
}

Response:
{
  actionItem: ActionItem
}
```

---

## Milestone 9: Document Management

### Document Routes

#### GET `/api/organizations/[orgId]/documents`
List documents.
```typescript
Query Params:
  ?folder_id=xxx
  &category=board_pack
  &meeting_id=xxx

Response:
{
  documents: Document[]
}
```

#### POST `/api/organizations/[orgId]/documents/upload`
Upload document to R2.
```typescript
Request: FormData
{
  file: File
  folder_id?: string
  meeting_id?: string
  document_category: string
  access_level: 'public' | 'board' | 'committee' | 'restricted'
}

Response:
{
  document: Document
  url: string
}
```

#### GET `/api/documents/[id]`
Get document details.
```typescript
Response:
{
  document: Document
  signed_url: string  // Presigned R2 URL for download
}
```

#### GET `/api/documents/[id]/download`
Download document (creates audit log entry).
```typescript
Response:
{
  url: string  // Presigned download URL
}
```

#### DELETE `/api/documents/[id]`
Delete document.
```typescript
Response:
{
  message: "Document deleted"
}
```

### Folder Routes

#### GET `/api/organizations/[orgId]/folders`
List folders.
```typescript
Response:
{
  folders: DocumentFolder[]
}
```

#### POST `/api/organizations/[orgId]/folders`
Create folder.
```typescript
Request:
{
  name: string
  parent_folder_id?: string
}

Response:
{
  folder: DocumentFolder
}
```

---

## Milestone 11-13: Payments & Subscriptions

### Subscription Routes

#### GET `/api/subscriptions`
Get organization's subscription.
```typescript
Response:
{
  subscription: Subscription
  plan_details: PlanDetails
}
```

#### POST `/api/subscriptions/checkout`
Create Stripe checkout session.
```typescript
Request:
{
  plan: 'starter' | 'professional' | 'enterprise'
  payment_method: 'stripe' | 'flutterwave'
}

Response:
{
  checkout_url: string  // Stripe Checkout URL
  session_id: string
}
```

#### POST `/api/subscriptions/portal`
Get Stripe customer portal URL.
```typescript
Response:
{
  portal_url: string
}
```

#### POST `/api/subscriptions/cancel`
Cancel subscription.
```typescript
Response:
{
  subscription: Subscription
  message: "Subscription will cancel at period end"
}
```

### M-Pesa Routes (Flutterwave)

#### POST `/api/payments/mpesa/initiate`
Initiate M-Pesa payment.
```typescript
Request:
{
  phone_number: string  // Format: 254XXXXXXXXX
  amount: number
  plan: string
}

Response:
{
  transaction_id: string
  message: "STK push sent to your phone"
}
```

#### GET `/api/payments/mpesa/verify/[transactionId]`
Verify M-Pesa payment status.
```typescript
Response:
{
  status: 'pending' | 'successful' | 'failed'
  transaction: Transaction
}
```

### Webhook Routes

#### POST `/api/webhooks/stripe`
Stripe webhook handler.
```typescript
// Handles: payment_intent.succeeded, customer.subscription.updated, etc.
```

#### POST `/api/webhooks/flutterwave`
Flutterwave webhook handler.
```typescript
// Handles: charge.completed, transfer.completed, etc.
```

---

## Milestone 14-15: Learning Management System

### Course Routes

#### GET `/api/courses`
List courses.
```typescript
Query Params:
  ?category=governance
  &level=intermediate
  &is_featured=true

Response:
{
  courses: Course[]
}
```

#### GET `/api/courses/[slug]`
Get course details.
```typescript
Response:
{
  course: Course
  lessons: Lesson[]
  instructor: Instructor
  is_enrolled: boolean
}
```

#### POST `/api/courses/[id]/enroll`
Enroll in course.
```typescript
Request:
{
  payment_id?: string  // If paid course
}

Response:
{
  enrollment: Enrollment
}
```

#### GET `/api/courses/[id]/progress`
Get course progress.
```typescript
Response:
{
  enrollment: Enrollment
  completed_lessons: string[]
  progress_percentage: number
  quiz_attempts: QuizAttempt[]
}
```

### Lesson Routes

#### GET `/api/lessons/[id]`
Get lesson content.
```typescript
Response:
{
  lesson: Lesson
  video_url: string  // Cloudflare Stream URL
  resources: Resource[]
  next_lesson: Lesson | null
}
```

#### POST `/api/lessons/[id]/complete`
Mark lesson as completed.
```typescript
Response:
{
  progress: LessonProgress
  enrollment: Enrollment  // Updated progress
}
```

### Quiz Routes

#### GET `/api/quizzes/[id]`
Get quiz questions.
```typescript
Response:
{
  quiz: Quiz
  questions: Question[]
  attempts_remaining: number
}
```

#### POST `/api/quizzes/[id]/submit`
Submit quiz answers.
```typescript
Request:
{
  answers: { [questionId: string]: string }
}

Response:
{
  attempt: QuizAttempt
  score: number
  passed: boolean
  correct_answers: { [questionId: string]: string }
}
```

### Certificate Routes

#### GET `/api/enrollments/[id]/certificate`
Generate and download certificate.
```typescript
Response:
{
  certificate_url: string  // PDF URL
}
```

---

## Milestone 16-20: Advanced Features

### Video Conferencing Routes (Daily.co)

#### POST `/api/meetings/[id]/room`
Create Daily.co video room.
```typescript
Response:
{
  room_url: string
  room_name: string
  expires: string
}
```

#### POST `/api/meetings/[id]/recording/start`
Start meeting recording.
```typescript
Response:
{
  recording_id: string
}
```

#### POST `/api/meetings/[id]/recording/stop`
Stop recording and save to R2.
```typescript
Response:
{
  recording_url: string
}
```

### Notification Routes

#### GET `/api/notifications`
Get user notifications.
```typescript
Query Params:
  ?unread=true
  &limit=20

Response:
{
  notifications: Notification[]
  unread_count: number
}
```

#### PATCH `/api/notifications/[id]/read`
Mark notification as read.
```typescript
Response:
{
  notification: Notification
}
```

#### POST `/api/notifications/mark-all-read`
Mark all notifications as read.
```typescript
Response:
{
  message: "All notifications marked as read"
}
```

### Analytics Routes

#### GET `/api/analytics/organization/[orgId]`
Get organization analytics dashboard.
```typescript
Response:
{
  governance_score: number
  board_diversity: DiversityMetrics
  meeting_stats: MeetingStats
  compliance_status: ComplianceStatus
}
```

#### GET `/api/analytics/admin`
Get platform-wide analytics (admin only).
```typescript
Response:
{
  total_users: number
  total_organizations: number
  total_positions: number
  total_applications: number
  revenue: RevenueStats
  engagement: EngagementMetrics
}
```

---

## File Upload Routes

### General Upload

#### POST `/api/upload/avatar`
Upload profile avatar.
```typescript
Request: FormData
{
  file: File
}

Response:
{
  url: string
}
```

#### POST `/api/upload/logo`
Upload organization logo.
```typescript
Request: FormData
{
  file: File
}

Response:
{
  url: string
}
```

---

## Error Response Format

All API errors follow this structure:

```typescript
{
  error: {
    code: string           // e.g. "UNAUTHORIZED", "VALIDATION_ERROR"
    message: string        // Human-readable error message
    details?: any          // Additional error details
  }
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

---

## Rate Limiting

### Default Limits
- **Authenticated requests:** 1000/hour
- **Unauthenticated requests:** 100/hour
- **File uploads:** 20/hour
- **Payment endpoints:** 10/hour

### Rate Limit Headers
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## Authentication

All protected routes require authentication via session cookies set by Supabase Auth.

### Authorization Header (Optional, for API clients)
```
Authorization: Bearer <supabase-jwt-token>
```

---

## Pagination

List endpoints support pagination:

```typescript
Query Params:
  ?page=1
  &limit=20

Response:
{
  data: any[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}
```

---

## Summary

**Total API Routes:** 100+

**Categories:**
- Authentication & Profiles (15 routes)
- Marketplace (20 routes)
- Board Management (30 routes)
- Document Management (10 routes)
- Payments & Subscriptions (10 routes)
- Learning Management (15 routes)
- Video & Notifications (10 routes)
- Analytics & Admin (5 routes)
- File Uploads (5 routes)

**Next Step:** Implement API routes incrementally as each milestone progresses.
