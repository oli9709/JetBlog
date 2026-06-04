'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/API/Services/init/supabase-browser';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icons } from '@/components/Icons';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [cooldown, setCooldown] = useState(0);

  // Qayta yuborish tugmasini 60 soniya blok qilish
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email || cooldown > 0) return;
    setStatus('sending');

    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: 'https://jet-blog-zeta.vercel.app/api/auth-callback'
      }
    });

    if (error) {
      setStatus('error');
    } else {
      setStatus('sent');
      setCooldown(60);
    }
  };

  return (
    <div className="md:w-96">
      <Card className="bg-background-light dark:bg-background-dark">
        <CardHeader className="space-y-1 text-center">
          {/* Envelope icon */}
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-[#FB3640]/10 p-4">
              <Icons.Mail className="h-8 w-8 text-[#FB3640]" />
            </div>
          </div>
          <CardTitle className="text-2xl">Emailingizni tasdiqlang</CardTitle>
          <CardDescription>
            {email ? (
              <>
                <span className="font-semibold text-foreground">{email}</span>
                {' '}manziliga tasdiqlash xati yubordik.
              </>
            ) : (
              'Email manzilingizga tasdiqlash xati yubordik.'
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Pochta qutingizni tekshiring va havolani bosing.
            Havolani bosganingizdan so&apos;ng avtomatik ravishda
            dashboardga yo&apos;naltirilasiz.
          </p>
          <p className="text-xs text-muted-foreground">
            Xat kelmadimi? Spam yoki Junk papkasini ham tekshirib ko&apos;ring.
          </p>

          {/* Resend status */}
          {status === 'sent' && (
            <div className="rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 px-4 py-2 text-sm text-green-700 dark:text-green-400">
              Xat qayta yuborildi ✓
            </div>
          )}
          {status === 'error' && (
            <div className="rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-2 text-sm text-red-700 dark:text-red-400">
              Yuborishda xatolik. Biroz kuting va qayta urinib ko&apos;ring.
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={status === 'sending' || cooldown > 0}
          >
            {status === 'sending' ? (
              <><Icons.Spinner className="mr-2 h-4 w-4 animate-spin" /> Yuborilmoqda...</>
            ) : cooldown > 0 ? (
              `Qayta yuborish (${cooldown}s)`
            ) : (
              'Xatni qayta yuborish'
            )}
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 text-sm text-gray-500 text-center">
          <div>
            <Link href="/auth/signup" className="text-[#FB3640] hover:text-[#FB3640]/80">
              ← Ro&apos;yxatdan o&apos;tishga qaytish
            </Link>
          </div>
          <div>
            Hisobingiz bormi?{' '}
            <Link href="/auth/login" className="text-[#FB3640] hover:text-[#FB3640]/80 font-medium">
              Tizimga kirish
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
