import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { organizationCreateSchema, organizationUpdateSchema } from '@/lib/validations/organization';
import type { OrganizationInsert } from '@/lib/types/database.types';

// GET /api/organizations - Fetch current user's organization
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch organization
        const { data: organization, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('id', user.id)
            .maybeSingle(); // Use maybeSingle() instead of single() to handle no results

        if (error) {
            console.error('Error fetching organization:', error);
            return NextResponse.json({ error: 'Failed to fetch organization' }, { status: 500 });
        }

        // If no organization, return null
        if (!organization) {
            return NextResponse.json({ organization: null });
        }

        // Get member count
        const { count } = await supabase
            .from('board_members')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', user.id);

        return NextResponse.json({
            organization: {
                ...organization,
                member_count: count || 0,
            },
        });
    } catch (error) {
        console.error('GET /api/organizations error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/organizations - Create organization
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse and validate request body
        const body = await request.json();
        const validationResult = organizationCreateSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        // Generate slug if not provided
        let slug = data.slug;
        if (!slug) {
            const { data: generatedSlug, error: slugError } = await supabase.rpc('generate_org_slug', {
                company_name: data.company_name,
                user_id: user.id,
            });

            if (slugError) {
                console.error('Error generating slug:', slugError);
                return NextResponse.json({ error: 'Failed to generate slug' }, { status: 500 });
            }

            slug = generatedSlug;
        }

        // Check if organization already exists
        const { data: existing } = await supabase
            .from('organizations')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();

        if (existing) {
            return NextResponse.json(
                { error: 'Organization already exists for this user' },
                { status: 409 }
            );
        }

        // Create organization
        const organizationData: OrganizationInsert = {
            id: user.id,
            slug,
            company_name: data.company_name,
            display_name: data.display_name || null,
            tagline: data.tagline || null,
            description: data.description || null,
            logo_url: data.logo_url || null,
            cover_image_url: data.cover_image_url || null,
            brand_color: data.brand_color || '#1a1a1a',
            website: data.website || null,
            company_size: data.company_size || null,
            industry: data.industry || null,
            country: data.country || null,
            contact_email: data.contact_email || null,
            contact_phone: data.contact_phone || null,
            headquarters_address: data.headquarters_address || null,
            registration_number: data.registration_number || null,
            tax_id: data.tax_id || null,
            year_founded: data.year_founded || null,
            is_public: data.is_public ?? false,
            allow_member_directory: data.allow_member_directory ?? false,
        };

        const { data: organization, error } = await supabase
            .from('organizations')
            .insert(organizationData)
            .select()
            .single();

        if (error) {
            console.error('Error creating organization:', error);
            return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
        }

        return NextResponse.json({ organization }, { status: 201 });
    } catch (error) {
        console.error('POST /api/organizations error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH /api/organizations - Update or create organization (upsert)
export async function PATCH(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Get current user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Parse and validate request body
        const body = await request.json();
        const validationResult = organizationUpdateSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const data = validationResult.data;

        // Check if organization exists
        const { data: existing } = await supabase
            .from('organizations')
            .select('id, slug, company_name')
            .eq('id', user.id)
            .maybeSingle();

        // Generate or preserve slug
        let slug = existing?.slug;
        const companyNameChanged = data.company_name && data.company_name !== existing?.company_name;

        if (!existing || companyNameChanged) {
            const { data: newSlug, error: slugError } = await supabase.rpc('generate_org_slug', {
                company_name: data.company_name || existing?.company_name || 'organization',
                user_id: user.id,
            });

            if (slugError) {
                console.error('Error generating slug:', slugError);
                return NextResponse.json({ error: 'Failed to generate slug' }, { status: 500 });
            }

            slug = newSlug;
        }

        // Prepare upsert data - include required fields if creating
        const upsertData: any = {
            id: user.id,
            slug: slug,
            company_name: data.company_name || existing?.company_name || 'My Organization',
            ...data,
        };

        // Upsert organization (insert or update)
        const { data: organization, error } = await supabase
            .from('organizations')
            .upsert(upsertData, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.error('Error upserting organization:', error);
            return NextResponse.json({ error: 'Failed to save organization' }, { status: 500 });
        }

        return NextResponse.json({ organization });
    } catch (error) {
        console.error('PATCH /api/organizations error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
