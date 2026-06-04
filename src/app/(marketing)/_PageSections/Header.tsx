import { Nav } from './NavBar';
import config from '@/lib/config/marketing';
import { MainLogoText } from '@/components/MainLogo';
import { ThemeDropDownMenu } from '../../../components/ThemeDropdown';
import { SupabaseSession } from '@/lib/API/Services/supabase/user';
import { ClientHeader } from './ClientHeader';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { HeaderAuthButton } from './HeaderAuthButton';

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
          <LocaleSwitcher />
          <ThemeDropDownMenu />
          <nav>
            <HeaderAuthButton hasSession={!!data?.session} />
          </nav>
        </div>
      </div>
    </ClientHeader>
  );
};
