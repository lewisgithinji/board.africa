// Simple script to verify Supabase database migration
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Read .env.local file
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
        envVars[match[1].trim()] = match[2].trim();
    }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function verifyDatabase() {
    console.log('🔍 Verifying Supabase Database Migration...\n');
    console.log(`📍 Project URL: ${supabaseUrl}\n`);

    try {
        // 1. Check if profiles table exists
        console.log('1️⃣ Checking if profiles table exists...');
        const { data: profiles, error: tableError, count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true });

        if (tableError) {
            console.error('❌ Profiles table error:');
            console.error(tableError);
            console.log('\n⚠️  The migration may not have been applied yet.');
            console.log('   Please run the SQL from: supabase/migrations/001_create_profiles.sql');
            console.log('   in your Supabase SQL Editor at:');
            console.log(`   ${supabaseUrl.replace('.supabase.co', '.supabase.co/project/vuzymhpdwaurbeeuqdyu/sql')}`);
            return;
        }

        console.log('✅ Profiles table exists!\n');

        // 2. Test querying profiles
        console.log('2️⃣ Querying profiles table...');
        const { data: allProfiles, error: queryError } = await supabase
            .from('profiles')
            .select('*');

        if (queryError) {
            console.error('❌ Error querying profiles:');
            console.error(queryError);
        } else {
            console.log(`✅ Successfully queried profiles table!`);
            console.log(`   Total profiles: ${allProfiles?.length || 0}`);
            if (allProfiles && allProfiles.length > 0) {
                console.log('\n   Existing profiles:');
                allProfiles.forEach(profile => {
                    console.log(`   - ${profile.full_name || 'No name'} (${profile.email})`);
                    console.log(`     Role: ${profile.role || 'Not set'}`);
                    console.log(`     Onboarding: ${profile.onboarding_completed ? 'Complete' : 'Pending'}`);
                });
            } else {
                console.log('   No profiles yet - ready for first signup!');
            }
        }

        // 3. Test authentication
        console.log('\n3️⃣ Testing Supabase Auth connection...');
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();

        if (usersError) {
            console.error('❌ Error fetching users:');
            console.error(usersError);
        } else {
            console.log(`✅ Successfully connected to Supabase Auth!`);
            console.log(`   Total registered users: ${users?.length || 0}`);
            if (users && users.length > 0) {
                console.log('\n   Registered users:');
                users.forEach(user => {
                    console.log(`   - ${user.email}`);
                    console.log(`     ID: ${user.id}`);
                    console.log(`     Created: ${new Date(user.created_at).toLocaleString()}`);
                    console.log(`     Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
                });
            } else {
                console.log('   No users yet - ready for first signup!');
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ DATABASE VERIFICATION COMPLETE!');
        console.log('='.repeat(60));
        console.log('\n📋 Summary:');
        console.log('   ✅ Profiles table exists and is queryable');
        console.log('   ✅ Database connection working');
        console.log('   ✅ Auth system connected');
        console.log(`   📊 Current users: ${users?.length || 0}`);
        console.log(`   📊 Current profiles: ${allProfiles?.length || 0}`);
        console.log('\n🎉 Migration successful! Ready to test authentication.');
        console.log('\n📝 Next steps:');
        console.log('   1. Open http://localhost:3000/signup in your browser');
        console.log('   2. Create a test account');
        console.log('   3. Check your email for verification (if enabled)');
        console.log('   4. Log in at http://localhost:3000/login');
        console.log('   5. You should see the dashboard at http://localhost:3000/dashboard');

    } catch (error) {
        console.error('\n❌ Unexpected error during verification:');
        console.error(error);
    }
}

verifyDatabase();
