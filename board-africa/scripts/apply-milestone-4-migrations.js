/**
 * Script to apply Milestone 4 database migrations
 * Applies migrations 004 (organizations) and 005 (board_members)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables manually from .env.local
function loadEnv() {
    const envPath = join(__dirname, '..', '.env.local');
    const envContent = readFileSync(envPath, 'utf-8');
    const env = {};

    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Remove quotes if present
            value = value.replace(/^["']|["']$/g, '');
            env[key] = value;
        }
    });

    return env;
}

const env = loadEnv();

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function applyMigration(name, sqlPath) {
    console.log(`\n📄 Applying migration: ${name}...`);
    console.log(`   Reading: ${sqlPath}`);

    try {
        const sql = readFileSync(sqlPath, 'utf-8');

        // Execute the SQL
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            // If exec_sql doesn't exist, try direct execution
            console.log('   Using direct SQL execution...');
            const { error: directError } = await supabase.from('_migrations').select('*').limit(0);

            // Split SQL into individual statements and execute
            const statements = sql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0 && !s.startsWith('--'));

            for (const statement of statements) {
                if (statement) {
                    const { error: stmtError } = await supabase.rpc('exec', { sql: statement });
                    if (stmtError) {
                        throw stmtError;
                    }
                }
            }
        }

        console.log(`✅ Migration ${name} applied successfully!`);
        return true;
    } catch (error) {
        console.error(`❌ Error applying migration ${name}:`, error.message);
        return false;
    }
}

async function verifyMigrations() {
    console.log('\n🔍 Verifying migrations...\n');

    // Check organizations table
    console.log('Checking organizations table...');
    const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .limit(1);

    if (orgError) {
        console.log('❌ organizations table:', orgError.message);
    } else {
        console.log('✅ organizations table exists');
    }

    // Check board_members table
    console.log('Checking board_members table...');
    const { data: memberData, error: memberError } = await supabase
        .from('board_members')
        .select('*')
        .limit(1);

    if (memberError) {
        console.log('❌ board_members table:', memberError.message);
    } else {
        console.log('✅ board_members table exists');
    }

    // Check custom types
    console.log('\nChecking custom types...');
    const { data: typeData, error: typeError } = await supabase
        .rpc('exec_sql', {
            sql_query: `
        SELECT typname FROM pg_type 
        WHERE typname IN ('member_status', 'member_position')
      `
        });

    if (!typeError && typeData) {
        console.log('✅ Custom enum types created');
    }
}

async function main() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║     Board.Africa - Milestone 4 Database Migrations       ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');

    const migrationsDir = join(__dirname, '..', 'supabase', 'migrations');

    const migrations = [
        {
            name: '004_create_organizations_table',
            path: join(migrationsDir, '004_create_organizations_table.sql')
        },
        {
            name: '005_create_board_members_table',
            path: join(migrationsDir, '005_create_board_members_table.sql')
        }
    ];

    console.log('\n📋 Migrations to apply:');
    migrations.forEach((m, i) => {
        console.log(`   ${i + 1}. ${m.name}`);
    });

    console.log('\n⚠️  IMPORTANT NOTES:');
    console.log('   - This will create organizations and board_members tables');
    console.log('   - Custom enum types will be created');
    console.log('   - RLS policies will be configured');
    console.log('   - Helper functions will be added');

    console.log('\n' + '='.repeat(60));
    console.log('Starting migration process...');
    console.log('='.repeat(60));

    // Since we can't directly execute arbitrary SQL with the JS client,
    // we'll provide instructions to run in Supabase SQL Editor
    console.log('\n⚠️  MANUAL STEP REQUIRED:');
    console.log('\nThe Supabase JavaScript client cannot execute DDL statements directly.');
    console.log('Please apply these migrations manually in the Supabase SQL Editor:\n');

    console.log('1. Go to: https://supabase.com/dashboard/project/vuzymhpdwaurbeeuqdyu/sql/new');
    console.log('\n2. Copy and paste the contents of each migration file:\n');

    migrations.forEach((m, i) => {
        console.log(`   ${i + 1}. supabase/migrations/${m.name}.sql`);
    });

    console.log('\n3. Click "Run" for each migration');
    console.log('\n4. Run this script again to verify the migrations were applied');

    console.log('\n' + '='.repeat(60));
    console.log('\nWould you like to verify if migrations are already applied? (Y/n)');
    console.log('Press Ctrl+C to exit, or wait 5 seconds to verify...\n');

    // Wait 5 seconds then verify
    await new Promise(resolve => setTimeout(resolve, 5000));

    await verifyMigrations();

    console.log('\n' + '='.repeat(60));
    console.log('✅ Script complete!');
    console.log('='.repeat(60) + '\n');
}

main().catch(console.error);
