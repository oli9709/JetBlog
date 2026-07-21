'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { UserNav } from './UserNav';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { usePathname } from '@/i18n/navigation';
import configuration from '@/lib/config/dashboard';
import { MobileNav } from '@/components/MobileNav';

interface HeaderProps {
  display_name: string;
  email: string;
  avatar_url: string;
  plan: string;
  credits_remaining: number;
  role?: string;
}

const Header = ({ display_name, email, avatar_url, plan, credits_remaining, role }: HeaderProps) => {
  const isAdmin = role === 'admin' || role === 'super_admin';
  const [headerText, setHeaderText] = useState('');
  const pathname = usePathname().split('/');
  const { routes } = configuration;

  useEffect(() => {
    if (pathname.includes('main')) {
      setHeaderText('Dashboard');
    } else if (pathname.includes('connections')) {
      setHeaderText('Connections');
    } else if (pathname.includes('keywords')) {
      setHeaderText('Keywords');
    } else if (pathname.includes('content')) {
      setHeaderText('Content Queue');
    } else if (pathname.includes('brand-voice')) {
      setHeaderText('Brand Voice');
    } else if (pathname.includes('settings')) {
      setHeaderText('Settings');
    } else {
      setHeaderText('Dashboard');
    }
  }, [pathname]);

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="mr-8">
          <MobileNav items={routes} />
        </div>
        <div className="hidden md:inline-block text-lg ml-3">{headerText}</div>
        <div className="ml-auto flex items-center space-x-4">
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#FB3640]/10 hover:bg-[#FB3640]/20 text-[#FF6B6B] border border-[#FB3640]/30 transition-colors"
              title="Admin panel"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
          <LanguageSwitcher />
          <UserNav
            avatar_url={avatar_url}
            display_name={display_name}
            email={email}
            plan={plan}
            credits_remaining={credits_remaining}
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
