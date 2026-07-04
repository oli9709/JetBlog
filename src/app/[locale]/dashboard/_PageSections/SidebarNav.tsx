'use client';

import { Link } from '@/i18n/navigation';
import { Home } from 'lucide-react';
import { MainLogoIcon } from '@/components/MainLogo';
import { usePathname } from '@/i18n/navigation';
import { NavItemSidebar } from '@/lib/types/types';

import { Icons } from '@/components/Icons';

interface SideBarNavProps {
  isOpen: boolean;
  routes: NavItemSidebar[];
}

interface SidebarNavItemProps {
  isOpen: boolean;
  item: NavItemSidebar;
}

const SidebarNavItem = ({ item, isOpen }: SidebarNavItemProps) => {
  const pathname = usePathname();
  const resolved = item.icon && typeof item.icon === 'string'
    ? Icons[item.icon as keyof typeof Icons]
    : item.icon;
  const IconComp = (resolved && typeof resolved !== 'string' ? resolved : null) ?? Home;

  return (
    <div className="w-full">
      <Link key={item.title} href={item.link}>
        <span
          className={`flex items-center rounded-md p-4 text-sm space-x-2 font-medium
          ${!isOpen && 'justify-center'}
           ${
             item.link !== pathname
               ? 'hover:bg-[#FB3640]/10 hover:text-[#FB3640] text-zinc-400'
               : 'bg-[#FB3640]/10 border-l-2 border-[#FB3640] text-[#FB3640]'
           }`}
        >
          <IconComp className="h-4 w-4" />
          {isOpen && <span className="animate-fadeIn">{item.title}</span>}
        </span>
      </Link>
    </div>
  );
};

export function SideBarNav({ isOpen, routes }: SideBarNavProps) {
  return (
    <nav className="flex flex-col justify-center items-center w-full">
      <div className="mb-4 my-4 self-center">
        <MainLogoIcon />
      </div>
      {routes.map((item) => (
        <SidebarNavItem key={item.title} item={item} isOpen={isOpen} />
      ))}
    </nav>
  );
}
