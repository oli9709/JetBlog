'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/API/Services/init/supabase-browser';
import { zodResolver } from '@hookform/resolvers/zod';
import { authFormSchema, authFormValues } from '@/lib/types/validations';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import { Input } from '@/components/ui/Input';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/Card';
import Link from 'next/link';
import { Icons } from '@/components/Icons';

export default function SignupPage() {
  const t = useTranslations('auth');
  const te = useTranslations('errors');
  const { locale } = useParams() as { locale: string };
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<authFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: { email: '', password: '' }
  });

  const { register, reset, formState: { isSubmitting } } = form;

  const mapError = (msg: string): string => {
    if (msg.includes('already registered') || msg.includes('User already registered')) {
      return te('already_registered');
    }
    if (msg.includes('Password should be')) return te('password_too_short');
    return te('generic');
  };

  const onSubmit = async (values: authFormValues) => {
    setAuthError(null);
    const supabase = supabaseBrowser();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { emailRedirectTo: 'https://jet-blog-zeta.vercel.app/api/auth-callback' }
    });

    if (error) {
      reset({ email: values.email, password: '' });
      setAuthError(mapError(error.message));
      return;
    }

    if (!data.session) {
      router.push(`/${locale}/auth/verify-email?email=${encodeURIComponent(values.email)}`);
      return;
    }

    window.location.href = `/${locale}/dashboard/main`;
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://jet-blog-zeta.vercel.app/api/auth-callback',
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    });
    if (error) setAuthError(mapError(error.message));
  };

  return (
    <div className="md:w-96">
      <Card className="bg-background-light dark:bg-background-dark">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t('signup_title')}</CardTitle>
          <CardDescription>{t('signup_subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          {authError && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {authError}
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input {...register('email')} type="email" placeholder={t('email')} className="bg-background-light dark:bg-background-dark" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('password')}</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input className="bg-background-light dark:bg-background-dark" {...register('password')} type={showPassword ? 'text' : 'password'} placeholder={t('password')} {...field} />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 cursor-pointer">
                        {showPassword
                          ? <Icons.EyeOffIcon className="h-6 w-6" onClick={() => setShowPassword(false)} />
                          : <Icons.EyeIcon className="h-6 w-6" onClick={() => setShowPassword(true)} />}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button disabled={isSubmitting} className="w-full">
                {isSubmitting && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
                <Icons.Lock className="mr-2 h-4 w-4" />
                {t('signup_btn')}
              </Button>
            </form>
          </Form>
          <div className="space-y-4 mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">{t('or')}</span>
              </div>
            </div>
            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
              <Icons.Google /><span className="ml-2 font-semibold">{t('google')}</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-sm text-gray-500 w-full text-center">
            {t('have_account')}{' '}
            <Link href={`/${locale}/auth/login`} className="text-[#FB3640] hover:text-[#FB3640]/80 font-medium">{t('login_btn')}</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
