#!/usr/bin/env node
/**
 * Admin yordamchi skript: foydalanuvchi kreditlarini yangilash.
 *
 * Ishlatish:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/update-credits.js <email> <credits>
 *
 * Misol:
 *   node scripts/update-credits.js user@example.com 100
 */
'use strict';

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl        = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('Xatolik: SUPABASE_URL va SUPABASE_SERVICE_ROLE_KEY muhit o\'zgaruvchilari talab qilinadi.');
  process.exit(1);
}

const email   = process.argv[2];
const credits = parseInt(process.argv[3], 10);

if (!email) {
  console.error('Xatolik: Email kiritilmagan.');
  console.error('Foydalanish: node scripts/update-credits.js email@example.com <credits>');
  process.exit(1);
}
if (isNaN(credits) || credits < 0) {
  console.error('Xatolik: Kredit soni manfiy bo\'lmagan butun son bo\'lishi kerak.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRole, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  console.log(`'${email}' foydalanuvchisini Auth dan qidirilmoqda...`);
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
  console.log(`Kredit ${credits} ga o'rnatilmoqda...`);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ credits_remaining: credits })
    .eq('id', targetUser.id);

  if (updateError) {
    console.error('Kreditlarni yangilashda xatolik:', updateError);
    process.exit(1);
  }

  console.log(`✅ Muvaffaqiyatli: '${email}' foydalanuvchisining krediti ${credits} ga yangilandi.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
