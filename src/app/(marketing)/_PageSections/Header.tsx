import { buttonVariants } from '@/components/ui/Button';
import Link from 'next/link';
import { cn } from '@/lib/utils/helpers';
import { Nav } from './NavBar';
import config from '@/lib/config/marketing';
import { MainLogoText } from '@/components/MainLogo';
import { ThemeDropDownMenu } from '../../../components/ThemeDropdown';
import { SupabaseSession } from '@/lib/API/Services/supabase/user';
import { ClientHeader } from './ClientHeader';

export const Header = async () => {
  const { routes } = config;
  const { data } = await SupabaseSession();

  return (
    <ClientHeader>
      <div className="flex items-center justify-between">
        <div className="group cursor-pointer">
          <div className="transition-transform duration-300 group-hover:scale-105">
            <MainLogoText />
          </div>
        </div>
        <Nav items={routes} />
        <div className="flex justify-center items-center gap-2">
          <ThemeDropDownMenu />
          <nav>
            {data?.session ? (
              <Link
                href="/dashboard/main"
                className={cn(
                  buttonVariants({ variant: 'secondary', size: 'sm' }),
                  'px-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full transition-all'
                )}
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className={cn(
                  buttonVariants({ variant: 'secondary', size: 'sm' }),
                  'px-6 bg-[#FB3640] hover:bg-[#FF6B6B] text-white font-semibold rounded-full transition-all shadow-md shadow-[#FB3640]/20'
                )}
              >
                Kirish
              </Link>
            )}
          </nav>
        </div>
      </div>
    </ClientHeader>
  );
};
