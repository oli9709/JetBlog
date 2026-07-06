import { redirect } from 'next/navigation';
import { getLocale } from 'next-intl/server';

export default async function DocsPage() {
  const locale = await getLocale();
  redirect(`/${locale}/docs/quick-start`);
}
