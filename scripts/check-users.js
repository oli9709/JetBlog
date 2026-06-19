#!/usr/bin/env node
/**
 * Admin yordamchi skript: Supabase Auth da ro'yxatdan o'tgan foydalanuvchilarni ko'rish.
 *
 * Ishlatish:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/check-users.js
 */
'use strict';

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('Xatolik: SUPABASE_URL va SUPABASE_SERVICE_ROLE_KEY muhit o\'zgaruvchilari talab qilinadi.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  console.log('Supabase Auth dan foydalanuvchilar olinmoqda...');
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Foydalanuvchilarni olishda xatolik:', error);
    process.exit(1);
  }

  if (!users || users.length === 0) {
    console.log('Supabase Auth da hech qanday foydalanuvchi topilmadi.');
    return;
  }

  console.log('\n=== RO\'YXATDAN O\'TGAN FOYDALANUVCHILAR ===');
  users.forEach((user, i) => {
    console.log(
      `${i + 1}. Email: ${user.email} | ID: ${user.id} | Oxirgi kirish: ${user.last_sign_in_at || 'Hech qachon'}`
    );
  });
  console.log('==========================================\n');
}

main().catch((err) => { console.error(err); process.exit(1); });
