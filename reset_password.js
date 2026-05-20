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
  const email = process.argv[2];

  if (!email) {
    console.error('Xatolik: Iltimos, elektron pochtani kiriting!');
    console.log('Foydalanish: node reset_password.js admin@example.com');
    return;
  }

  console.log(`Supabase-dan '${email}' foydalanuvchisini izlash...`);
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Foydalanuvchilarni olishda xatolik:', listError);
    return;
  }

  const targetUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!targetUser) {
    console.error(`Xatolik: '${email}' elektron pochtasiga mos foydalanuvchi topilmadi!`);
    console.log('\nMavjud elektron pochtalar ro\'yxati:');
    users.forEach(u => console.log(` - ${u.email}`));
    return;
  }

  const newPassword = 'TestPassword123!';
  console.log(`Foydalanuvchi topildi. ID: ${targetUser.id}`);
  console.log(`Parolni '${newPassword}' ga yangilash...`);

  const { data, error: updateError } = await supabase.auth.admin.updateUserById(targetUser.id, {
    password: newPassword
  });

  if (updateError) {
    console.error('Parolni yangilashda xatolik yuz berdi:', updateError);
  } else {
    console.log('\n======================================================');
    console.log('✅ MUVAFFQIYATLI: Parol muvaffaqiyatli yangilandi!');
    console.log(`Akkaunt: ${email}`);
    console.log(`Yangi Parol: ${newPassword}`);
    console.log('======================================================\n');
  }
}

main().catch(console.error);
