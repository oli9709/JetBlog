'use client';

import { useEffect, useState } from 'react';
import { UserNav } from './UserNav';
import { usePathname } from 'next/navigation';
import configuration from '@/lib/config/dashboard';
import { MobileNav } from '@/components/MobileNav';

interface HeaderProps {
  display_name: string;
  email: string;
  avatar_url: string;
  plan: string;
  credits_remaining: number;
}

const Header = ({ display_name, email, avatar_url, plan, credits_remaining }: HeaderProps) => {
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
