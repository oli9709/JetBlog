#!/usr/bin/env node
/**
 * Bir martalik migratsiya skripti: sites jadvalidagi Ghost va Webhook
 * adapter_config ichidagi shifrsiz (plaintext) kalitlarni AES-256-GCM bilan shifrlash.
 *
 * MUHIM: Bu skript ikki marta shifrlashdan himoyalangan —
 * agar kalit allaqachon shifrlangan bo'lsa (base64:iv:tag:cipher formatida),
 * uni o'tkazib yuboradi.
 *
 * Ishlatish:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   SUPABASE_VAULT_KEY=kamida-32-belgi-uzoq-kalit \
 *   node scripts/backfill-encrypt-adapter-config.js
 *
 * Xavfsiz: faqat o'qish va yangilash, o'chirish yo'q.
 * Qayta ishga tushirish: xavfsiz (idempotent).
 */
'use strict';

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// ── Muhit o'zgaruvchilarini tekshirish ──────────────────────────────────────

const supabaseUrl        = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const vaultKey           = process.env.SUPABASE_VAULT_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  console.error('Xatolik: SUPABASE_URL va SUPABASE_SERVICE_ROLE_KEY talab qilinadi.');
  process.exit(1);
}
if (!vaultKey || vaultKey.length < 32) {
  console.error('Xatolik: SUPABASE_VAULT_KEY kamida 32 belgi bo\'lishi kerak.');
  process.exit(1);
}

// ── Shifrlash yordamchilari ──────────────────────────────────────────────────

const KEY = crypto.scryptSync(vaultKey, 'jetblog-salt', 32);

/**
 * Qiymat allaqachon shifrlangan yoki yo'qligini tekshiradi.
 * Shifrlangan format: "base64:iv_hex:tag_hex:cipher_base64"
 */
function isAlreadyEncrypted(value) {
  if (!value || typeof value !== 'string') return false;
  const parts = value.split(':');
  // GCM: 4 qism (base64 marker : iv : tag : cipher)
  // CBC: 3 qism (iv : enc : '' — eski format)
  return parts.length >= 3;
}

function encryptText(text) {
  if (!text) return '';
  const iv  = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', KEY, iv);
  const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Format: "base64:<iv_hex>:<tag_hex>:<cipher_base64>"
  return `base64:${iv.toString('hex')}:${tag.toString('hex')}:${enc.toString('base64')}`;
}

// ── Asosiy mantiq ────────────────────────────────────────────────────────────

const supabase = createClient(supabaseUrl, supabaseServiceRole, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  console.log('Sites jadvalidagi Ghost va Webhook yozuvlar olinmoqda...');

  const { data: sites, error } = await supabase
    .from('sites')
    .select('id, platform_type, adapter_config')
    .in('platform_type', ['ghost', 'webhook']);

  if (error) {
    console.error('Saytlarni olishda xatolik:', error);
    process.exit(1);
  }

  if (!sites || sites.length === 0) {
    console.log('Shifrlash talab qiladigan Ghost/Webhook saytlar topilmadi.');
    return;
  }

  console.log(`Jami ${sites.length} ta sayt topildi.\n`);

  let updated = 0;
  let skipped = 0;
  let errors  = 0;

  for (const site of sites) {
    const cfg = site.adapter_config || {};
    let changed = false;
    const newCfg = { ...cfg };

    // Ghost: adminApiKey
    if (site.platform_type === 'ghost' && cfg.adminApiKey) {
      if (isAlreadyEncrypted(cfg.adminApiKey)) {
        console.log(`[SKIP] ${site.id} (ghost) — adminApiKey allaqachon shifrlangan.`);
        skipped++;
      } else {
        newCfg.adminApiKey = encryptText(cfg.adminApiKey);
        changed = true;
        console.log(`[ENCRYPT] ${site.id} (ghost) — adminApiKey shifrlanmoqda.`);
      }
    }

    // Webhook: secretKey
    if (site.platform_type === 'webhook' && cfg.secretKey) {
      if (isAlreadyEncrypted(cfg.secretKey)) {
        console.log(`[SKIP] ${site.id} (webhook) — secretKey allaqachon shifrlangan.`);
        skipped++;
      } else {
        newCfg.secretKey = encryptText(cfg.secretKey);
        changed = true;
        console.log(`[ENCRYPT] ${site.id} (webhook) — secretKey shifrlanmoqda.`);
      }
    }

    // Webflow token
    if (cfg.token) {
      if (isAlreadyEncrypted(cfg.token)) {
        console.log(`[SKIP] ${site.id} (webflow/webhook) — token allaqachon shifrlangan.`);
        skipped++;
      } else {
        newCfg.token = encryptText(cfg.token);
        changed = true;
        console.log(`[ENCRYPT] ${site.id} (webflow/webhook) — token shifrlanmoqda.`);
      }
    }

    if (!changed) continue;

    const { error: updateError } = await supabase
      .from('sites')
      .update({ adapter_config: newCfg })
      .eq('id', site.id);

    if (updateError) {
      console.error(`[ERROR] ${site.id} yangilashda xatolik:`, updateError.message);
      errors++;
    } else {
      updated++;
    }
  }

  console.log('\n══════════════════════════════════════════');
  console.log(`✅ Yangilandi : ${updated}`);
  console.log(`⏭  O'tkazildi : ${skipped}`);
  console.log(`❌ Xatolar   : ${errors}`);
  console.log('══════════════════════════════════════════\n');

  if (errors > 0) process.exit(1);
}

main().catch((err) => { console.error(err); process.exit(1); });
