export const dynamic = 'force-dynamic';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#000F08]">
      <div className="max-w-3xl mx-auto px-6 py-20">

        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-white mb-3">Terms and Conditions</h1>
          <p className="text-zinc-500 text-sm">So'nggi yangilanish: 22 May 2026 · O'zbekiston qonunchiligi asosida</p>
        </div>

        <div className="space-y-10 text-zinc-400 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Xizmatdan Foydalanish Shartlari</h2>
            <p>JetBlog.app (<span className="text-zinc-300">"Xizmat"</span>) dan foydalanish orqali siz ushbu shartlarni qabul qilasiz. Agar rozi bo'lmasangiz, xizmatdan foydalanmang.</p>
            <ul className="mt-4 space-y-2 list-disc list-inside text-zinc-500">
              <li>Foydalanuvchi kamida 18 yoshda bo'lishi kerak</li>
              <li>Hisob ma'lumotlari maxfiy saqlanishi shart</li>
              <li>Bitta foydalanuvchi faqat bitta hisob yuritishi mumkin</li>
              <li>Xizmat faqat qonuniy maqsadlarda ishlatilishi kerak</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Taqiqlangan Faoliyat</h2>
            <p>Quyidagi faoliyatlar qat'iyan taqiqlanadi:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-zinc-500">
              <li>Spam, dezinformatsiya yoki zararli kontent yaratish</li>
              <li>Boshqa foydalanuvchilarning ma'lumotlariga ruxsatsiz kirish</li>
              <li>Xizmatni reverse-engineer qilish yoki clone qilish</li>
              <li>API limitlarini chetlab o'tish yoki bot orqali haddan ziyod so'rov yuborish</li>
              <li>Muallif huquqini buzadigan kontent nashr etish</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. To'lov va Refund Siyosati</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/3 border border-white/8">
                <h3 className="text-white font-semibold text-sm mb-2">Kredit tizimi</h3>
                <p className="text-sm">JetBlog kredit asosida ishlaydi. Sotib olingan kreditlar qaytarilmaydi, lekin muddatsiz amal qiladi.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/3 border border-white/8">
                <h3 className="text-white font-semibold text-sm mb-2">Refund</h3>
                <p className="text-sm">Texnik nosozlik sababli ishlatilmagan kreditlar uchun <a href="mailto:support@jetblog.app" className="text-[#FB3640] hover:underline">support@jetblog.app</a> ga murojaat qiling. 7 kun ichida ko'rib chiqiladi.</p>
              </div>
              <div className="p-4 rounded-xl bg-white/3 border border-white/8">
                <h3 className="text-white font-semibold text-sm mb-2">Narx o'zgarishi</h3>
                <p className="text-sm">Narxlar 30 kun oldindan xabar berib o'zgartirilishi mumkin. Oldindan sotib olingan kreditlarga ta'sir qilmaydi.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Intellektual Mulk</h2>
            <p>JetBlog platformasi, uning kodi, dizayni va brendi JetBlog'ga tegishli va himoyalangan.</p>
            <p className="mt-3">AI orqali yaratilgan maqolalar <span className="text-zinc-300">sizga tegishli</span> — siz ularni istalgan maqsadda ishlata olasiz.</p>
            <p className="mt-3">Biroq yaratilgan kontent quyidagi cheklovlarga bo'ysunadi:</p>
            <ul className="mt-2 space-y-1 list-disc list-inside text-zinc-500">
              <li>Boshqa shaxslarning muallif huquqini buzmasligi kerak</li>
              <li>O'zbekiston qonunchiligi doirasida bo'lishi kerak</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Xizmat Cheklovlari va SLA</h2>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { plan: 'Free', sites: '1 sayt', kw: '10 kalit so\'z/oy', articles: '2 maqola/oy' },
                { plan: 'Starter', sites: '3 sayt', kw: '100 kalit so\'z/oy', articles: '20 maqola/oy' },
                { plan: 'Pro', sites: '10 sayt', kw: '500 kalit so\'z/oy', articles: '80 maqola/oy' },
                { plan: 'Agency', sites: 'Cheksiz', kw: 'Cheksiz', articles: '200 maqola/oy' },
              ].map(p => (
                <div key={p.plan} className="p-3 rounded-xl bg-white/3 border border-white/8">
                  <p className="text-[#FB3640] font-bold text-sm">{p.plan}</p>
                  <p className="text-zinc-500 text-xs mt-1">{p.sites}</p>
                  <p className="text-zinc-500 text-xs">{p.kw}</p>
                  <p className="text-zinc-500 text-xs">{p.articles}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm">Biz <span className="text-zinc-300">99% uptime</span> ga intilamiz, lekin kafolatlamaymiz. Rejalangan texnik ishlar oldindan e'lon qilinadi.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Javobgarlik Chegarasi</h2>
            <p>JetBlog quyidagilar uchun javobgar emas:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-zinc-500">
              <li>AI tomonidan yaratilgan kontentning aniqligi yoki SEO samarasi</li>
              <li>WordPress saytingizda yuzaga kelishi mumkin bo'lgan muammolar</li>
              <li>Uchinchi tomon API (Anthropic, OpenAI) ishlamay qolishi</li>
              <li>Bilvosita yo'qotishlar yoki daromad kamayi</li>
            </ul>
            <p className="mt-3">Maksimal javobgarlik chegara — oxirgi 3 oy ichida to'langan miqdor.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Hisob O'chirish</h2>
            <p>Siz istalgan vaqt hisobingizni o'chirishingiz mumkin. O'chirishdan so'ng:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside text-zinc-500">
              <li>Barcha ma'lumotlar 30 kun ichida yo'q qilinadi</li>
              <li>WordPress integratsiya avtomatik uziladi</li>
              <li>Qolgan kreditlar qaytarilmaydi</li>
            </ul>
            <p className="mt-3">JetBlog ham ushbu shartlarni buzgan foydalanuvchilarning hisobini ogohlantirmasdan o'chirish huquqini saqlab qoladi.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Qonunchilik va Jurisdiksiya</h2>
            <p>Ushbu shartlar <span className="text-zinc-300">O'zbekiston Respublikasi qonunchiligi</span> asosida tartibga solinadi. Nizolar avvalo muzokaralar orqali hal etiladi. Kerak bo'lsa — Toshkent shahar sudlari orqali.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. O'zgarishlar</h2>
            <p>Biz ushbu shartlarni istalgan vaqt yangilashimiz mumkin. Muhim o'zgarishlar haqida email orqali xabar beriladi. Xizmatdan foydalanishni davom ettirish yangi shartlarni qabul qilish deb hisoblanadi.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">10. Aloqa</h2>
            <div className="p-4 rounded-xl bg-[#FB3640]/8 border border-[#FB3640]/20">
              <p className="text-white font-semibold">JetBlog Support</p>
              <a href="mailto:support@jetblog.app" className="text-[#FB3640] text-sm hover:underline">support@jetblog.app</a>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
