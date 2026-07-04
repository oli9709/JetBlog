'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import configuration from '@/lib/config/dashboard';
import { PlanI } from '@/lib/types/types';
import config from '@/lib/config/auth';
import { ErrorText } from '@/components/ErrorText';
interface SubscriptionExistsProps {
  price_id: string;
  status: string;
  period_ends: string;
}

const SubscriptionExists = ({ price_id, status, period_ends }: SubscriptionExistsProps) => {
  const { products } = configuration;
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPlan, setPlan] = useState<PlanI>({ name: '' });

  const matchSubscription = () => {
    const match: PlanI = products
      .map((product) => product.plans.find((x: PlanI) => x.price_id === price_id))
      .find((item) => !!item);

    if (!match) {
      setErrorMessage('Obuna turi noto\'g\'ri, iltimos qo\'llab-quvvatlash xizmatiga murojaat qiling');
      return;
    }

    setPlan(match);
  };

  useEffect(() => {
    matchSubscription();
  }, []);

  const router = useRouter();

  const goToPortal = async () => {
    router.push(config.redirects.toBilling);
  };

  return (
    <div className="mt-6">
      <Card className="bg-background-light dark:bg-background-dark">
        <CardHeader>
          <CardTitle>Obuna</CardTitle>
          <CardDescription>
            Obuna va to'lovni boshqarish uchun quyidagi tugmani bosing
          </CardDescription>
          <ErrorText errorMessage={errorMessage} />
        </CardHeader>
        <CardContent className="space-y-4">
          <h2 className="text-xl">
            Joriy tarif: <span className="font-bold">{currentPlan?.name}</span>
          </h2>
          <div>
            Holat: <span className="font-bold">{status}</span>
          </div>
          <div>
            To'lov:{' '}
            <span className="font-bold">
              ${currentPlan?.price}/{currentPlan?.interval}
            </span>
          </div>
          <div>
            To'lov davri tugaydi:{' '}
            <span className="font-bold">{new Date(period_ends).toLocaleDateString()}</span>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={goToPortal} className="mt-4">
            To'lov sahifasiga o'tish
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubscriptionExists;
