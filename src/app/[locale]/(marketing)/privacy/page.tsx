export const dynamic = 'force-dynamic';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#000F08]">
      <div className="max-w-3xl mx-auto px-6 py-20">

        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-white mb-3">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm">So'nggi yangilanish: 22 May 2026</p>
        </div>

        <div className="space-y-10 text-zinc-400 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Ma'lumot Yig'ish</h2>
            <p>JetBlog.app xizmatidan foydalanish jarayonida biz quyidagi ma'lumotlarni yig'amiz:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-zinc-500">
              <li><span className="text-zinc-300">Email manzil</span> — ro'yxatdan o'tish va tizimga kirish uchun</li>
              <li><span className="text-zinc-300">WordPress sayt URL</span> — integratsiya uchun</li>
              <li><span className="text-zinc-300">WordPress Application Password</span> — AES-256-GCM bilan shifrlangan holda saqlanadi</li>
              <li><span className="text-zinc-300">Kalit so'zlar va maqolalar</span> — xizmat funksionalligi uchun</li>
              <li><span className="text-zinc-300">Foydalanish statistikasi</span> — xizmatni yaxshilash uchun</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Ma'lumotdan Foydalanish</h2>
            <p>Yig'ilgan ma'lumotlar faqat quyidagi maqsadlarda ishlatiladi:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-zinc-500">
              <li>AI orqali SEO maqolalar yaratish va WordPress ga yuklash</li>
              <li>Hisob va obuna boshqaruvi</li>
              <li>Texnik qo'llab-quvvatlash va muammo hal qilish</li>
              <li>Xizmat yangiliklari haqida xabar berish (faqat rozi bo'lganlar uchun)</li>
            </ul>
            <p className="mt-3">Biz sizning ma'lumotlaringizni <strong className="text-white">hech qachon uchinchi tomonlarga sotmaymiz</strong>.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Uchinchi Tomon Xizmatlar</h2>
            <p>JetBlog quyidagi uchinchi tomon xizmatlardan foydalanadi:</p>
            <div className="mt-4 space-y-3">
              {[
                { name: 'Supabase', desc: 'Ma\'lumotlar bazasi va autentifikatsiya', link: 'https://supabase.com/privacy' },
                { name: 'Anthropic (Claude AI)', desc: 'Maqola generatsiya', link: 'https://www.anthropic.com/privacy' },
                { name: 'OpenAI (DALL-E 3)', desc: 'Muqova rasmlar yaratish', link: 'https://openai.com/privacy' },
                { name: 'Vercel', desc: 'Hosting va deployment', link: 'https://vercel.com/legal/privacy-policy' },
              ].map(s => (
                <div key={s.name} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FB3640] mt-2 shrink-0" />
                  <div>
                    <span className="text-white font-semibold text-sm">{s.name}</span>
                    <span className="text-zinc-500 text-sm"> — {s.desc}. </span>
                    <a href={s.link} target="_blank" rel="noopener noreferrer" className="text-[#FB3640] text-xs hover:underline">Privacy Policy ↗</a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Cookie Policy</h2>
            <p>Biz minimal miqdorda cookie fayllardan foydalanamiz:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-zinc-500">
              <li><span className="text-zinc-300">Sessiya cookie</span> — tizimga kirishni saqlash uchun (Supabase auth token)</li>
              <li><span className="text-zinc-300">Preference cookie</span> — til va tema sozlamalarini saqlash uchun</li>
            </ul>
            <p className="mt-3">Reklama yoki tracking cookie ishlatilmaydi.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Ma'lumot Xavfsizligi</h2>
            <p>Sizning ma'lumotlaringiz himoyalash uchun:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-zinc-500">
              <li>WordPress parollar <span className="text-zinc-300">AES-256-GCM</span> bilan shifrlangan</li>
              <li>Barcha aloqa <span className="text-zinc-300">HTTPS/TLS</span> orqali amalga oshiriladi</li>
              <li>Ma'lumotlar bazasi <span className="text-zinc-300">Row Level Security (RLS)</span> bilan himoyalangan</li>
              <li>Supabase SOC 2 Type II sertifikatiga ega</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Foydalanuvchi Huquqlari</h2>
            <p>Siz quyidagi huquqlarga egasiz:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-zinc-500">
              <li>O'z ma'lumotlaringizga kirish va ko'rish</li>
              <li>Noto'g'ri ma'lumotlarni tahrirlash</li>
              <li>Hisobingizni va barcha ma'lumotlarni o'chirish</li>
              <li>Ma'lumotlarni eksport qilish (JSON formatida)</li>
            </ul>
            <p className="mt-3">Ushbu huquqlardan foydalanish uchun <a href="mailto:support@jetblog.app" className="text-[#FB3640] hover:underline">support@jetblog.app</a> ga murojaat qiling.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Ma'lumotlarni Saqlash Muddati</h2>
            <p>Ma'lumotlaringiz hisob faol ekan saqlanadi. Hisob o'chirilganda barcha ma'lumotlar 30 kun ichida butunlay o'chiriladi.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Aloqa</h2>
            <p>Maxfiylik siyosati bo'yicha savol yoki muammolaringiz bo'lsa:</p>
            <div className="mt-3 p-4 rounded-xl bg-[#FB3640]/8 border border-[#FB3640]/20">
              <p className="text-white font-semibold">JetBlog Support</p>
              <a href="mailto:support@jetblog.app" className="text-[#FB3640] text-sm hover:underline">support@jetblog.app</a>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
