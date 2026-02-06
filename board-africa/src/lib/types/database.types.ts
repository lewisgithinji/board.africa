// Database types for Board.Africa
// This file contains TypeScript types for database entities

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string | null
                    avatar_url: string | null
                    role: 'organization' | 'professional' | null
                    onboarding_completed: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: 'organization' | 'professional' | null
                    onboarding_completed?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    role?: 'organization' | 'professional' | null
                    onboarding_completed?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            organizations: {
                Row: {
                    id: string
                    slug: string
                    display_name: string | null
                    tagline: string | null
                    description: string | null
                    logo_url: string | null
                    cover_image_url: string | null
                    brand_color: string
                    company_name: string
                    website: string | null
                    company_size: string | null
                    industry: string | null
                    country: string | null
                    contact_email: string | null
                    contact_phone: string | null
                    headquarters_address: string | null
                    registration_number: string | null
                    tax_id: string | null
                    year_founded: number | null
                    is_public: boolean
                    allow_member_directory: boolean
                    stripe_customer_id: string | null
                    stripe_subscription_id: string | null
                    plan_id: string | null
                    subscription_status: string | null
                    current_period_end: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    slug: string
                    display_name?: string | null
                    tagline?: string | null
                    description?: string | null
                    logo_url?: string | null
                    cover_image_url?: string | null
                    brand_color?: string
                    company_name: string
                    website?: string | null
                    company_size?: string | null
                    industry?: string | null
                    country?: string | null
                    contact_email?: string | null
                    contact_phone?: string | null
                    headquarters_address?: string | null
                    registration_number?: string | null
                    tax_id?: string | null
                    year_founded?: number | null
                    is_public?: boolean
                    allow_member_directory?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    slug?: string
                    display_name?: string | null
                    tagline?: string | null
                    description?: string | null
                    logo_url?: string | null
                    cover_image_url?: string | null
                    brand_color?: string
                    company_name?: string
                    website?: string | null
                    company_size?: string | null
                    industry?: string | null
                    country?: string | null
                    contact_email?: string | null
                    contact_phone?: string | null
                    headquarters_address?: string | null
                    registration_number?: string | null
                    tax_id?: string | null
                    year_founded?: number | null
                    is_public?: boolean
                    allow_member_directory?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            board_members: {
                Row: {
                    id: string
                    organization_id: string
                    full_name: string
                    email: string | null
                    phone: string | null
                    avatar_url: string | null
                    position: MemberPosition
                    custom_position: string | null
                    department: string | null
                    bio: string | null
                    linkedin_url: string | null
                    qualifications: string[] | null
                    status: MemberStatus
                    start_date: string
                    end_date: string | null
                    term_length: number | null
                    is_independent: boolean
                    committees: string[] | null
                    display_order: number
                    show_on_public_profile: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    full_name: string
                    email?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    position: MemberPosition
                    custom_position?: string | null
                    department?: string | null
                    bio?: string | null
                    linkedin_url?: string | null
                    qualifications?: string[] | null
                    status?: MemberStatus
                    start_date: string
                    end_date?: string | null
                    term_length?: number | null
                    is_independent?: boolean
                    committees?: string[] | null
                    display_order?: number
                    show_on_public_profile?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    full_name?: string
                    email?: string | null
                    phone?: string | null
                    avatar_url?: string | null
                    position?: MemberPosition
                    custom_position?: string | null
                    department?: string | null
                    bio?: string | null
                    linkedin_url?: string | null
                    qualifications?: string[] | null
                    status?: MemberStatus
                    start_date?: string
                    end_date?: string | null
                    term_length?: number | null
                    is_independent?: boolean
                    committees?: string[] | null
                    display_order?: number
                    show_on_public_profile?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            meetings: {
                Row: {
                    id: string
                    organization_id: string
                    title: string
                    description: string | null
                    meeting_type: 'regular' | 'special' | 'emergency' | 'annual'
                    meeting_date: string
                    duration_minutes: number | null
                    location: string | null
                    status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled'
                    agenda: string | null
                    minutes: string | null
                    is_public: boolean
                    video_room_url: string | null
                    video_room_name: string | null
                    video_privacy: string | null
                    transcript: string | null
                    ai_summary: string | null
                    ai_minutes_status: 'none' | 'processing' | 'completed' | 'failed'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    title: string
                    description?: string | null
                    meeting_type: 'regular' | 'special' | 'emergency' | 'annual'
                    meeting_date: string
                    duration_minutes?: number | null
                    location?: string | null
                    status?: 'upcoming' | 'in_progress' | 'completed' | 'cancelled'
                    agenda?: string | null
                    minutes?: string | null
                    is_public?: boolean
                    daily_room_url?: string | null
                    daily_room_name?: string | null
                    daily_privacy?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    title?: string
                    description?: string | null
                    meeting_type?: 'regular' | 'special' | 'emergency' | 'annual'
                    meeting_date?: string
                    duration_minutes?: number | null
                    location?: string | null
                    status?: 'upcoming' | 'in_progress' | 'completed' | 'cancelled'
                    agenda?: string | null
                    minutes?: string | null
                    is_public?: boolean
                    daily_room_url?: string | null
                    daily_room_name?: string | null
                    daily_privacy?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            meeting_attendees: {
                Row: {
                    id: string
                    meeting_id: string
                    board_member_id: string
                    attendance_status: 'invited' | 'attending' | 'absent' | 'excused'
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    meeting_id: string
                    board_member_id: string
                    attendance_status?: 'invited' | 'attending' | 'absent' | 'excused'
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    meeting_id?: string
                    board_member_id?: string
                    attendance_status?: 'invited' | 'attending' | 'absent' | 'excused'
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            documents: {
                Row: {
                    id: string
                    organization_id: string
                    meeting_id: string | null
                    board_member_id: string | null
                    title: string
                    description: string | null
                    category: 'financial' | 'legal' | 'strategic' | 'operational' | 'governance' | 'other' | null
                    file_url: string
                    file_name: string
                    file_size: number | null
                    file_type: string | null
                    is_public: boolean
                    uploaded_by: string | null
                    version: number
                    parent_document_id: string | null
                    is_library_item: boolean
                    library_category: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    meeting_id?: string | null
                    board_member_id?: string | null
                    title: string
                    description?: string | null
                    category?: 'financial' | 'legal' | 'strategic' | 'operational' | 'governance' | 'other' | null
                    file_url: string
                    file_name: string
                    file_size?: number | null
                    file_type?: string | null
                    is_public?: boolean
                    uploaded_by?: string | null
                    version?: number
                    parent_document_id?: string | null
                    is_library_item?: boolean
                    library_category?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    meeting_id?: string | null
                    board_member_id?: string | null
                    title?: string
                    description?: string | null
                    category?: 'financial' | 'legal' | 'strategic' | 'operational' | 'governance' | 'other' | null
                    file_url?: string
                    file_name?: string
                    file_size?: number | null
                    file_type?: string | null
                    is_public?: boolean
                    uploaded_by?: string | null
                    version?: number
                    parent_document_id?: string | null
                    is_library_item?: boolean
                    library_category?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            action_items: {
                Row: {
                    id: string
                    meeting_id: string
                    assigned_to: string | null
                    title: string
                    description: string | null
                    due_date: string | null
                    status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
                    completed_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    meeting_id: string
                    assigned_to?: string | null
                    title: string
                    description?: string | null
                    due_date?: string | null
                    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
                    completed_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    meeting_id?: string
                    assigned_to?: string | null
                    title?: string
                    description?: string | null
                    due_date?: string | null
                    status?: 'pending' | 'in_progress' | 'completed' | 'cancelled'
                    completed_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            resolutions: {
                Row: {
                    id: string
                    meeting_id: string
                    organization_id: string
                    title: string
                    description: string | null
                    status: 'draft' | 'open' | 'closed' | 'passed' | 'failed'
                    voting_type: 'simple_majority' | 'two_thirds' | 'unanimous'
                    quorum_required: number
                    opened_at: string | null
                    closed_at: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    meeting_id: string
                    organization_id: string
                    title: string
                    description?: string | null
                    status?: 'draft' | 'open' | 'closed' | 'passed' | 'failed'
                    voting_type?: 'simple_majority' | 'two_thirds' | 'unanimous'
                    quorum_required?: number
                    opened_at?: string | null
                    closed_at?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    meeting_id?: string
                    organization_id?: string
                    title?: string
                    description?: string | null
                    status?: 'draft' | 'open' | 'closed' | 'passed' | 'failed'
                    voting_type?: 'simple_majority' | 'two_thirds' | 'unanimous'
                    quorum_required?: number
                    opened_at?: string | null
                    closed_at?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            votes: {
                Row: {
                    id: string
                    resolution_id: string
                    board_member_id: string
                    vote: 'approve' | 'reject' | 'abstain'
                    comment: string | null
                    voted_at: string
                }
                Insert: {
                    id?: string
                    resolution_id: string
                    board_member_id: string
                    vote: 'approve' | 'reject' | 'abstain'
                    comment?: string | null
                    voted_at?: string
                }
                Update: {
                    id?: string
                    resolution_id?: string
                    board_member_id?: string
                    vote?: 'approve' | 'reject' | 'abstain'
                    comment?: string | null
                    voted_at?: string
                }
            }
            signatures: {
                Row: {
                    id: string
                    resolution_id: string
                    board_member_id: string
                    signature_data: string
                    signature_type: 'drawn' | 'typed'
                    typed_name: string | null
                    ip_address: string | null
                    user_agent: string | null
                    signed_at: string
                }
                Insert: {
                    id?: string
                    resolution_id: string
                    board_member_id: string
                    signature_data: string
                    signature_type?: 'drawn' | 'typed'
                    typed_name?: string | null
                    ip_address?: string | null
                    user_agent?: string | null
                    signed_at?: string
                }
                Update: {
                    id?: string
                    resolution_id?: string
                    board_member_id?: string
                    signature_data?: string
                    signature_type?: 'drawn' | 'typed'
                    typed_name?: string | null
                    ip_address?: string | null
                    user_agent?: string | null
                    signed_at?: string
                }
            }
            document_annotations: {
                Row: {
                    id: string
                    document_id: string
                    user_id: string
                    page_number: number
                    annotation_type: 'highlight' | 'note' | 'underline' | 'strikethrough'
                    position: Json
                    content: string | null
                    color: string | null
                    is_public: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    document_id: string
                    user_id: string
                    page_number: number
                    annotation_type: 'highlight' | 'note' | 'underline' | 'strikethrough'
                    position: Json
                    content?: string | null
                    color?: string | null
                    is_public?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    document_id?: string
                    user_id?: string
                    page_number?: number
                    annotation_type?: 'highlight' | 'note' | 'underline' | 'strikethrough'
                    position?: Json
                    content?: string | null
                    color?: string | null
                    is_public?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            agenda_items: {
                Row: {
                    id: string
                    meeting_id: string
                    parent_id: string | null
                    title: string
                    description: string | null
                    duration_minutes: number
                    order_index: number
                    item_type: 'regular' | 'consent' | 'presentation' | 'vote' | 'break'
                    document_id: string | null
                    resolution_id: string | null
                    presenter_id: string | null
                    status: 'pending' | 'in_progress' | 'completed' | 'skipped'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    meeting_id: string
                    parent_id?: string | null
                    title: string
                    description?: string | null
                    duration_minutes?: number
                    order_index?: number
                    item_type?: 'regular' | 'consent' | 'presentation' | 'vote' | 'break'
                    document_id?: string | null
                    resolution_id?: string | null
                    presenter_id?: string | null
                    status?: 'pending' | 'in_progress' | 'completed' | 'skipped'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    meeting_id?: string
                    parent_id?: string | null
                    title?: string
                    description?: string | null
                    duration_minutes?: number
                    order_index?: number
                    item_type?: 'regular' | 'consent' | 'presentation' | 'vote' | 'break'
                    document_id?: string | null
                    resolution_id?: string | null
                    presenter_id?: string | null
                    status?: 'pending' | 'in_progress' | 'completed' | 'skipped'
                    created_at?: string
                    updated_at?: string
                }
            }
            professional_profiles: {
                Row: {
                    id: string
                    profile_id: string
                    headline: string | null
                    summary: string | null
                    board_readiness_score: number
                    is_marketplace_visible: boolean
                    availability_status: AvailabilityStatus
                    desired_roles: string[] | null
                    compensation_expectations: Json | null
                    mobility_preference: boolean
                    languages: string[] | null
                    social_links: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    headline?: string | null
                    summary?: string | null
                    board_readiness_score?: number
                    is_marketplace_visible?: boolean
                    availability_status?: AvailabilityStatus
                    desired_roles?: string[] | null
                    compensation_expectations?: Json | null
                    mobility_preference?: boolean
                    languages?: string[] | null
                    social_links?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string
                    headline?: string | null
                    summary?: string | null
                    board_readiness_score?: number
                    is_marketplace_visible?: boolean
                    availability_status?: AvailabilityStatus
                    desired_roles?: string[] | null
                    compensation_expectations?: Json | null
                    mobility_preference?: boolean
                    languages?: string[] | null
                    social_links?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            experiences: {
                Row: {
                    id: string
                    profile_id: string
                    company_name: string
                    title: string
                    location: string | null
                    start_date: string
                    end_date: string | null
                    is_current: boolean
                    description: string | null
                    experience_type: ExperienceType
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    company_name: string
                    title: string
                    location?: string | null
                    start_date: string
                    end_date?: string | null
                    is_current?: boolean
                    description?: string | null
                    experience_type?: ExperienceType
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string
                    company_name?: string
                    title?: string
                    location?: string | null
                    start_date?: string
                    end_date?: string | null
                    is_current?: boolean
                    description?: string | null
                    experience_type?: ExperienceType
                    created_at?: string
                    updated_at?: string
                }
            }
            skills: {
                Row: {
                    id: string
                    profile_id: string
                    name: string
                    category: string | null
                    years_experience: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    name: string
                    category?: string | null
                    years_experience?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string
                    name?: string
                    category?: string | null
                    years_experience?: number | null
                    created_at?: string
                }
            }
            certifications: {
                Row: {
                    id: string
                    profile_id: string
                    name: string
                    issuing_organization: string
                    issue_date: string | null
                    expiry_date: string | null
                    credential_id: string | null
                    credential_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    profile_id: string
                    name: string
                    issuing_organization: string
                    issue_date?: string | null
                    expiry_date?: string | null
                    credential_id?: string | null
                    credential_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    profile_id?: string
                    name?: string
                    issuing_organization?: string
                    issue_date?: string | null
                    expiry_date?: string | null
                    credential_id?: string | null
                    credential_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            board_positions: {
                Row: {
                    id: string
                    organization_id: string
                    title: string
                    description: string
                    requirements: string[] | null
                    is_remunerated: boolean
                    compensation_details: string | null
                    location: string | null
                    position_type: string
                    status: PositionStatus
                    closing_date: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    organization_id: string
                    title: string
                    description: string
                    requirements?: string[] | null
                    is_remunerated?: boolean
                    compensation_details?: string | null
                    location?: string | null
                    position_type?: string
                    status?: PositionStatus
                    closing_date?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    organization_id?: string
                    title?: string
                    description?: string
                    requirements?: string[] | null
                    is_remunerated?: boolean
                    compensation_details?: string | null
                    location?: string | null
                    position_type?: string
                    status?: PositionStatus
                    closing_date?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            applications: {
                Row: {
                    id: string
                    position_id: string
                    profile_id: string
                    status: ApplicationStatus
                    cover_letter: string | null
                    notes: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    position_id: string
                    profile_id: string
                    status?: ApplicationStatus
                    cover_letter?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    position_id?: string
                    profile_id?: string
                    status?: ApplicationStatus
                    cover_letter?: string | null
                    notes?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Enums: {
            member_status: 'active' | 'inactive' | 'pending'
            member_position:
            | 'chairman'
            | 'vice_chairman'
            | 'ceo'
            | 'cfo'
            | 'director'
            | 'independent_director'
            | 'executive_director'
            | 'non_executive_director'
            | 'secretary'
            | 'member'
            | 'observer'
            | 'other'
        }
    }
}

// Convenience types
export type Organization = Database['public']['Tables']['organizations']['Row']
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert']
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update']

export type BoardMember = Database['public']['Tables']['board_members']['Row']
export type BoardMemberInsert = Database['public']['Tables']['board_members']['Insert']
export type BoardMemberUpdate = Database['public']['Tables']['board_members']['Update']

export type MemberStatus = Database['public']['Enums']['member_status']
export type MemberPosition = Database['public']['Enums']['member_position']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Meeting = Database['public']['Tables']['meetings']['Row']
export type MeetingInsert = Database['public']['Tables']['meetings']['Insert']
export type MeetingUpdate = Database['public']['Tables']['meetings']['Update']

export type MeetingAttendee = Database['public']['Tables']['meeting_attendees']['Row']
export type MeetingAttendeeInsert = Database['public']['Tables']['meeting_attendees']['Insert']
export type MeetingAttendeeUpdate = Database['public']['Tables']['meeting_attendees']['Update']

export type Document = Database['public']['Tables']['documents']['Row']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert']
export type DocumentUpdate = Database['public']['Tables']['documents']['Update']

export type ActionItem = Database['public']['Tables']['action_items']['Row']
export type ActionItemInsert = Database['public']['Tables']['action_items']['Insert']
export type ActionItemUpdate = Database['public']['Tables']['action_items']['Update']

export type Resolution = Database['public']['Tables']['resolutions']['Row']
export type ResolutionInsert = Database['public']['Tables']['resolutions']['Insert']
export type ResolutionUpdate = Database['public']['Tables']['resolutions']['Update']

export type Vote = Database['public']['Tables']['votes']['Row']
export type VoteInsert = Database['public']['Tables']['votes']['Insert']
export type VoteUpdate = Database['public']['Tables']['votes']['Update']

export type Signature = Database['public']['Tables']['signatures']['Row']
export type SignatureInsert = Database['public']['Tables']['signatures']['Insert']

export type DocumentAnnotation = Database['public']['Tables']['document_annotations']['Row']
export type DocumentAnnotationInsert = Database['public']['Tables']['document_annotations']['Insert']
export type DocumentAnnotationUpdate = Database['public']['Tables']['document_annotations']['Update']

export type AgendaItem = Database['public']['Tables']['agenda_items']['Row']
export type AgendaItemInsert = Database['public']['Tables']['agenda_items']['Insert']
export type AgendaItemUpdate = Database['public']['Tables']['agenda_items']['Update']

export type MeetingType = 'regular' | 'special' | 'emergency' | 'annual'
export type MeetingStatus = 'upcoming' | 'in_progress' | 'completed' | 'cancelled'
export type AttendanceStatus = 'invited' | 'attending' | 'absent' | 'excused'
export type DocumentCategory = 'financial' | 'legal' | 'strategic' | 'operational' | 'governance' | 'other'
export type ResolutionStatus = 'draft' | 'open' | 'closed' | 'passed' | 'failed'
export type AgendaItemType = 'regular' | 'consent' | 'presentation' | 'vote' | 'break'
export type AgendaItemStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'
export type VotingType = 'simple_majority' | 'two_thirds' | 'unanimous'
export type VoteChoice = 'approve' | 'reject' | 'abstain'
export type SignatureType = 'drawn' | 'typed'
export type AnnotationType = 'highlight' | 'note' | 'underline' | 'strikethrough'

// Extended types with joined data
export interface VoteWithMember extends Vote {
    board_member?: BoardMember
}

export interface SignatureWithMember extends Signature {
    board_member?: BoardMember
}

export interface ResolutionWithVotes extends Resolution {
    votes?: VoteWithMember[]
    vote_summary?: {
        approve: number
        reject: number
        abstain: number
        total: number
    }
}

export interface ResolutionWithSignatures extends Resolution {
    signatures?: SignatureWithMember[]
    signature_count?: number
}

export interface AgendaItemWithDetails extends AgendaItem {
    presenter?: BoardMember
    document?: Document
    resolution?: Resolution
    sub_items?: AgendaItemWithDetails[]
}

// Phase 11: Professional Profiles & Marketplace
export type ProfessionalProfile = Database['public']['Tables']['professional_profiles']['Row']
export type ProfessionalProfileInsert = Database['public']['Tables']['professional_profiles']['Insert']
export type ProfessionalProfileUpdate = Database['public']['Tables']['professional_profiles']['Update']

export type Experience = Database['public']['Tables']['experiences']['Row']
export type ExperienceInsert = Database['public']['Tables']['experiences']['Insert']
export type ExperienceUpdate = Database['public']['Tables']['experiences']['Update']

export type Skill = Database['public']['Tables']['skills']['Row']
export type SkillInsert = Database['public']['Tables']['skills']['Insert']
export type SkillUpdate = Database['public']['Tables']['skills']['Update']

export type Certification = Database['public']['Tables']['certifications']['Row']
export type CertificationInsert = Database['public']['Tables']['certifications']['Insert']
export type CertificationUpdate = Database['public']['Tables']['certifications']['Update']

export type BoardPosition = Database['public']['Tables']['board_positions']['Row']
export type BoardPositionInsert = Database['public']['Tables']['board_positions']['Insert']
export type BoardPositionUpdate = Database['public']['Tables']['board_positions']['Update']

export type Application = Database['public']['Tables']['applications']['Row']
export type ApplicationInsert = Database['public']['Tables']['applications']['Insert']
export type ApplicationUpdate = Database['public']['Tables']['applications']['Update']

export type AvailabilityStatus = 'looking' | 'open' | 'busy' | 'unavailable'
export type ExperienceType = 'executive' | 'board' | 'academic' | 'other'
export type PositionStatus = 'draft' | 'open' | 'closed' | 'filled'
export type ApplicationStatus = 'submitted' | 'reviewing' | 'shortlisted' | 'interviewing' | 'accepted' | 'rejected' | 'withdrawn'

// Phase 16: Board Evaluations & Performance
export interface EvaluationQuestion {
    id: string
    question: string
    type: 'rating' | 'scale' | 'text' | 'multi_choice'
    options?: string[]
    required: boolean
}

export type EvaluationType = 'self_assessment' | 'peer_review' | 'board_evaluation'
export type EvaluationStatus = 'draft' | 'submitted'

export interface EvaluationTemplate {
    id: string
    organization_id: string
    title: string
    description: string | null
    evaluation_type: EvaluationType
    questions: EvaluationQuestion[]
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface Evaluation {
    id: string
    template_id: string
    organization_id: string
    evaluator_id: string
    subject_id: string | null
    status: EvaluationStatus
    responses: Record<string, string | number>
    submitted_at: string | null
    created_at: string
    updated_at: string
}

export interface EvaluationWithDetails extends Evaluation {
    template?: EvaluationTemplate
    subject?: BoardMember
}

// Phase 17: Africa Compliance Library
export type ComplianceCategory =
    | 'corporate_governance'
    | 'financial_reporting'
    | 'anti_money_laundering'
    | 'data_protection'
    | 'tax_compliance'
    | 'securities'
    | 'environmental'
    | 'labor'

export interface ComplianceRegulation {
    id: string
    country: string
    category: ComplianceCategory
    title: string
    reference_code: string | null
    description: string
    key_requirements: string[]
    effective_date: string | null
    source_url: string | null
    created_at: string
}

export type CalendarEventType = 'deadline' | 'review' | 'filing' | 'training' | 'audit'
export type CalendarEventStatus = 'upcoming' | 'overdue' | 'completed' | 'cancelled'

export interface ComplianceCalendarEvent {
    id: string
    organization_id: string
    regulation_id: string | null
    title: string
    description: string | null
    event_type: CalendarEventType
    due_date: string
    status: CalendarEventStatus
    created_at: string
    updated_at: string
}

export type ChecklistStatus = 'draft' | 'in_progress' | 'completed' | 'archived'
export type ChecklistItemStatus = 'pending' | 'in_progress' | 'completed' | 'skipped'

export interface ComplianceChecklist {
    id: string
    organization_id: string
    regulation_id: string | null
    title: string
    description: string | null
    category: string | null
    due_date: string | null
    status: ChecklistStatus
    created_at: string
    updated_at: string
}

export interface ComplianceChecklistItem {
    id: string
    checklist_id: string
    title: string
    description: string | null
    status: ChecklistItemStatus
    order_index: number
    created_at: string
    updated_at: string
}
