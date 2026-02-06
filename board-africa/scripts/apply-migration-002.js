// Script to apply database migration 002
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

async function applyMigration() {
    console.log('🔄 Applying Migration 002: Add Profile Fields...\n');

    try {
        // Read migration file
        const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '002_add_profile_fields.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

        console.log('📄 Migration SQL:');
        console.log('─'.repeat(60));
        console.log(migrationSQL);
        console.log('─'.repeat(60));
        console.log('\n⚠️  Please copy the above SQL and run it in your Supabase SQL Editor:');
        console.log(`   ${supabaseUrl.replace('.supabase.co', '.supabase.co/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/sql')}\n`);
        console.log('After running the SQL, press Enter to verify...');

        // Wait for user input
        await new Promise(resolve => {
            process.stdin.once('data', resolve);
        });

        // Verify migration
        console.log('\n🔍 Verifying migration...');

        const { data, error } = await supabase
            .from('profiles')
            .select('company_name, job_title, industry, country')
            .limit(0);

        if (error) {
            console.error('❌ Migration verification failed:');
            console.error(error);
            console.log('\n⚠️  Please ensure you ran the SQL in Supabase SQL Editor');
            process.exit(1);
        }

        console.log('✅ Migration verified successfully!');
        console.log('\n📋 New fields added to profiles table:');
        console.log('   - company_name');
        console.log('   - company_website');
        console.log('   - company_size');
        console.log('   - industry');
        console.log('   - country');
        console.log('   - job_title');
        console.log('   - bio');
        console.log('   - linkedin_url');
        console.log('   - years_experience');
        console.log('\n🎉 Migration 002 complete!');

    } catch (error) {
        console.error('\n❌ Error during migration:');
        console.error(error);
        process.exit(1);
    }
}

applyMigration();
