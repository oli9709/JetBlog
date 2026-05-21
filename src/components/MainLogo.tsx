import siteConfig from '@/lib/config/site';
import Link from 'next/link';
import Image from 'next/image';

export const MainLogoText = () => {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/fighter-jet-svgrepo-com.svg"
        alt="JetBlog"
        width={24}
        height={24}
        style={{ filter: 'invert(27%) sepia(96%) saturate(1800%) hue-rotate(334deg) brightness(105%) contrast(105%)' }}
      />
      <span className="font-bold hidden md:inline-block">{siteConfig.alt_name}</span>
    </Link>
  );
};

export const MainLogoIcon = () => {
  return (
    <Link href="/" className="flex items-center justify-center w-6 h-6">
      <Image
        src="/fighter-jet-svgrepo-com.svg"
        alt="JetBlog"
        width={24}
        height={24}
        style={{ filter: 'invert(27%) sepia(96%) saturate(1800%) hue-rotate(334deg) brightness(105%) contrast(105%)' }}
      />
    </Link>
  );
};
