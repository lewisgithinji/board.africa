// Check if migration 002 is applied
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

const supabase = createClient(
    envVars.NEXT_PUBLIC_SUPABASE_URL,
    envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMigration() {
    console.log('🔍 Checking if Profile fields exist...');

    // Try to select the new columns
    const { data, error } = await supabase
        .from('profiles')
        .select('company_name, job_title')
        .limit(1);

    if (error) {
        console.log('❌ Migration 002 NOT applied yet.');
        console.log('Error:', error.message);
        console.log('\nPlease run the SQL from: Supabase/onboarding_migration.sql');
    } else {
        console.log('✅ Migration 002 applied successfully!');
        console.log('Columns company_name and job_title exist.');
    }
}

checkMigration();
