'use client';

import { useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useTranslations } from 'next-intl';

const AuthRequired = () => {
  const t = useTranslations('Auth');
  const router = useRouter();

  return (
    <Card className="bg-background-light dark:bg-background-dark">
      <CardHeader>
        <CardTitle>{t('authRequired')}</CardTitle>
        <CardDescription>{t('authRequiredDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="ghost" onClick={() => router.push('/auth/login')}>
          {t('goLogin')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AuthRequired;
