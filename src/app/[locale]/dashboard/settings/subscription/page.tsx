export const dynamic = 'force-dynamic';

import { SupabaseUser } from '@/lib/API/Services/supabase/user';
import { GetProfileByUserId } from '@/lib/API/Database/profile/queries';
import { redirect } from 'next/navigation';
import config from '@/lib/config/auth';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/Card';
import { Link } from '@/i18n/navigation';

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Bepul',
  STARTER: 'Starter — $19/oy',
  PRO: 'Pro — $49/oy',
  AGENCY: 'Agency — $99/oy'
};

export default async function Subscription() {
  let user: Awaited<ReturnType<typeof SupabaseUser>>;
  try {
    user = await SupabaseUser();
  } catch {
    redirect(config.redirects.requireAuth);
  }

  const profile = await GetProfileByUserId(user.id);
  const profileData = profile?.data?.[0];
  const plan = profileData?.plan ?? 'FREE';
  const credits = profileData?.credits_remaining ?? 0;
  const planLabel = PLAN_LABELS[plan] ?? plan;

  return (
    <div className="mt-6">
      <Card className="bg-background-light dark:bg-background-dark">
        <CardHeader>
          <CardTitle>Obuna va Kreditlar</CardTitle>
          <CardDescription>
            Joriy rejangiz va qolgan AI maqola kreditlaringiz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-xl">
            Joriy reja: <span className="font-bold">{planLabel}</span>
          </div>
          <div>
            Qolgan kreditlar: <span className="font-bold">{credits.toLocaleString()}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Har bir AI SEO maqola generatsiyasi 1 kredit sarflaydi. Rejangizni yuksaltirish
            yoki kredit to&apos;ldirish uchun Billing sahifasiga o&apos;ting.
          </p>
        </CardContent>
        <div className="p-6 pt-0">
          <Link
            href={config.redirects.toBilling}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Billing sahifasiga o&apos;tish
          </Link>
        </div>
      </Card>
    </div>
  );
}
