// Check if avatars bucket exists
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

async function checkBucket() {
    console.log('🔍 Checking for "avatars" bucket...');

    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('❌ Error listing buckets:', error.message);
        return;
    }

    const avatarBucket = buckets.find(b => b.id === 'avatars');

    if (avatarBucket) {
        console.log('✅ "avatars" bucket exists!');
        console.log('Public:', avatarBucket.public);
    } else {
        console.log('❌ "avatars" bucket NOT found.');
        console.log('Please run the SQL from: supabase/migrations/003_create_avatars_bucket.sql');
    }
}

checkBucket();
