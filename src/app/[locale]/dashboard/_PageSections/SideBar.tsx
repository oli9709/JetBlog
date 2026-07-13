'use client';

import { useState } from 'react';
import { Icons } from '@/components/Icons';
import { SideBarNav } from './SidebarNav';
import configuration from '@/lib/config/dashboard';
import { useTranslations } from 'next-intl';

const Sidebar = () => {
  const t = useTranslations('Dashboard');
  const [ isOpen, setOpen ] = useState(true);

  // Map hardcoded route titles → translation keys
  const titleMap: Record<string, string> = {
    'Bosh sahifa': t('navMain'),
    "Ulanishlar": t('navConnections'),
    "Kalit so'zlar": t('navKeywords'),
    "Kontent navbati": t('navContent'),
    "Brend ovozi": t('navBrandVoice'),
    "Sozlamalar": t('navSettings'),
  };

  const routes = configuration.routes.map((r) => ({
    ...r,
    title: titleMap[r.title] ?? r.title,
  }));

  return (
    <div
      className={`${
        !isOpen ? 'w-20' : 'w-48'
      } hidden  md:flex flex-col items-center transition-all duration-300 border-r h-screen sticky top-0 p-2 `}
    >
      <SideBarNav routes={routes} isOpen={isOpen} />
      <div className="mt-auto">
        <Icons.SidebarToggle className="cursor-pointer m-4" onClick={() => setOpen(!isOpen)} />
      </div>
    </div>
  );
};

export default Sidebar;
