'use client';
import { Card, CardHeader, CardDescription, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('Auth');
  console.log('Error', error);

  return (
    <div>
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('errPageTitle')}</CardTitle>
            <CardDescription>{t('errPageDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => reset()} className="mt-4">
              {t('errPageBtn')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
