import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sahifa topilmadi — JetBlog',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      {/* Raqam */}
      <p className="text-[120px] md:text-[160px] font-extrabold leading-none text-transparent bg-clip-text bg-gradient-to-br from-[#FB3640] to-[#FF6B6B] select-none">
        404
      </p>

      <h1 className="mt-2 text-2xl md:text-3xl font-bold text-foreground">
        Sahifa topilmadi
      </h1>
      <p className="mt-3 text-muted-foreground max-w-md">
        Siz qidirgan sahifa mavjud emas yoki ko&apos;chirilgan bo&apos;lishi mumkin.
      </p>

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FB3640] hover:bg-[#e02d36] text-white font-semibold transition-colors"
        >
          ← Bosh sahifaga
        </Link>
        <Link
          href="/dashboard/main"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border hover:bg-accent text-foreground font-semibold transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
