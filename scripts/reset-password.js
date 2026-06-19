#!/usr/bin/env node
/**
 * Admin yordamchi skript: foydalanuvchi parolini qayta o'rnatish.
 *
 * Ishlatish:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   NEW_PASSWORD='YangiMahfiyParol1!' \
 *   node scripts/reset-password.js admin@example.com
 */
'use strict';

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl        = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const newPassword        = process.env.NEW_PASSWORD;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('Xatolik: SUPABASE_URL va SUPABASE_SERVICE_ROLE_KEY muhit o\'zgaruvchilari talab qilinadi.');
  process.exit(1);
}
if (!newPassword || newPassword.length < 8) {
  console.error('Xatolik: NEW_PASSWORD muhit o\'zgaruvchisi talab qilinadi (kamida 8 belgi).');
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error('Xatolik: Email kiritilmagan.');
  console.error('Foydalanish: NEW_PASSWORD="..." node scripts/reset-password.js email@example.com');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  console.log(`Supabase Auth dan '${email}' foydalanuvchisini izlash...`);
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('Foydalanuvchilarni olishda xatolik:', listError);
    process.exit(1);
  }

  const targetUser = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (!targetUser) {
    console.error(`Xatolik: '${email}' elektron pochtasiga mos foydalanuvchi topilmadi.`);
    process.exit(1);
  }

  console.log(`Foydalanuvchi topildi. ID: ${targetUser.id}`);
  const { error: updateError } = await supabase.auth.admin.updateUserById(targetUser.id, {
    password: newPassword
  });

  if (updateError) {
    console.error('Parolni yangilashda xatolik:', updateError);
    process.exit(1);
  }

  console.log(`✅ Muvaffaqiyatli: '${email}' foydalanuvchisining paroli yangilandi.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
