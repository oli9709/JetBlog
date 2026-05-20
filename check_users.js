const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hgdwelubuyhlddqncenr.supabase.co';
const supabaseServiceRole = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZHdlbHVidXlobGRkcW5jZW5yIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODk2NTA1MywiZXhwIjoyMDk0NTQxMDUzfQ.uj4CWzFq3oDGq-C_BAAWRd1XWNeg9j6-n2CEIgJLYCU';

const supabase = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function main() {
  console.log('Fetching users from Supabase Auth...');
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error fetching users:', error);
    return;
  }

  if (!users || users.length === 0) {
    console.log('No users found in your Supabase Auth database!');
    return;
  }

  console.log('\n=== REGISTERED USERS ===');
  users.forEach((user, index) => {
    console.log(`${index + 1}. Email: ${user.email} | ID: ${user.id} | Last Sign In: ${user.last_sign_in_at || 'Never'}`);
  });
  console.log('========================\n');
}

main().catch(console.error);
