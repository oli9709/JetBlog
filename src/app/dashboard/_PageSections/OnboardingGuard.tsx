'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function OnboardingGuard({
  onboardingCompleted,
  children,
}: {
  onboardingCompleted: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const isOnboardingRoute = pathname === '/dashboard/onboarding';
    
    // Agar tayyor bo'lmasa va u onboarding sahifasida bo'lmasa -> yo'naltirish
    if (!onboardingCompleted && !isOnboardingRoute) {
      router.replace('/dashboard/onboarding');
    }
  }, [onboardingCompleted, pathname, router, mounted]);

  // Agar mounting tugallanmagan bo'lsa yoki noto'g'ri joyda bo'lsa, children ni ko'rsatmasligi ham mumkin (optional),
  // lekin layout ichida children baribir render bo'ladi.
  
  return <>{children}</>;
}
