'use client';

import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

interface OnboardingClientProps {
  userId: string;
  initialStep?: 1 | 2 | 3 | 4;
}

export default function OnboardingClient({ userId, initialStep = 1 }: OnboardingClientProps) {
  return <OnboardingFlow userId={userId} initialStep={initialStep} />;
}
