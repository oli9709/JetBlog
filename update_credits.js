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
  console.log('Fetching profiles...');
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  console.log('Profiles found:', JSON.stringify(data, null, 2));

  for (const profile of data) {
    console.log(`Updating credits for profile ${profile.id} (${profile.display_name || 'No Name'}). Current credits: ${profile.credits_remaining}`);
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ credits_remaining: 1000 })
      .eq('id', profile.id)
      .select();

    if (updateError) {
      console.error(`Failed to update profile ${profile.id}:`, updateError);
    } else {
      console.log(`Successfully updated profile ${profile.id}:`, JSON.stringify(updated, null, 2));
    }
  }
}

main().catch(console.error);
