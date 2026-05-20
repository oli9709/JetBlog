import { Header } from './_PageSections/Header';
import { LayoutProps } from '@/lib/types/types';
import Footer from '@/components/Footer';

export default async function MarketingLayout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
    </div>
  );
}
