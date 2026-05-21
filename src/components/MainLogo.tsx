import siteConfig from '@/lib/config/site';
import Link from 'next/link';
import Image from 'next/image';

const JET_FILTER =
  'invert(27%) sepia(96%) saturate(1800%) hue-rotate(334deg) brightness(105%) contrast(105%)';

export const MainLogoText = () => {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <Image
        src="/fighter-jet-svgrepo-com.svg"
        alt="JetBlog"
        width={32}
        height={32}
        className="transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_8px_rgba(251,54,64,0.8)]"
        style={{ filter: JET_FILTER }}
      />
      <span className="text-2xl font-bold hidden md:inline-block tracking-tight">
        {siteConfig.alt_name}
      </span>
    </Link>
  );
};

export const MainLogoIcon = () => {
  return (
    <Link href="/" className="flex items-center justify-center group">
      <Image
        src="/fighter-jet-svgrepo-com.svg"
        alt="JetBlog"
        width={32}
        height={32}
        className="transition-all duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_8px_rgba(251,54,64,0.8)]"
        style={{ filter: JET_FILTER }}
      />
    </Link>
  );
};
