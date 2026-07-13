'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/API/Services/init/supabase-browser';
import { zodResolver } from '@hookform/resolvers/zod';
import { authFormSchema, authFormValues } from '@/lib/types/validations';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import { Input } from '@/components/ui/Input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/Card';
import { Link, useRouter } from '@/i18n/navigation';
import { Icons } from '@/components/Icons';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const mapAuthError = (message: string): string => {
    if (message.includes('Email not confirmed')) return t('errEmailNotConfirmed');
    if (message.includes('Invalid login credentials') || message.includes('invalid_credentials'))
      return t('errInvalidCredentials');
    if (message.includes('Too many requests') || message.includes('rate limit'))
      return t('errTooManyRequests');
    if (message.includes('User not found')) return t('errUserNotFound');
    return t('errDefault');
  };

  const form = useForm<authFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: { email: '', password: '' }
  });

  const {
    register,
    reset,
    formState: { isSubmitting }
  } = form;

  const onSubmit = async (values: authFormValues) => {
    setAuthError(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password
    });

    if (error) {
      reset({ email: values.email, password: '' });
      setAuthError(mapAuthError(error.message));
      return;
    }

    router.push('/dashboard/main');
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://jetblog.app/api/auth-callback',
        queryParams: { access_type: 'offline', prompt: 'consent' }
      }
    });

    if (error) {
      setAuthError(mapAuthError(error.message));
    }
  };

  return (
    <div className="md:w-96">
      <Card className="bg-background-light dark:bg-background-dark">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t('loginTitle')}</CardTitle>
          <CardDescription>{t('loginDesc')}</CardDescription>
        </CardHeader>

        <CardContent>
          {authError && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {authError}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input
                        {...register('email')}
                        type="text"
                        placeholder={t('email')}
                        className="bg-background-light dark:bg-background-dark"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('password')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="bg-background-light dark:bg-background-dark"
                          {...register('password')}
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('password')}
                          {...field}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 cursor-pointer">
                          {showPassword ? (
                            <Icons.EyeOffIcon className="h-6 w-6" onClick={() => setShowPassword(false)} />
                          ) : (
                            <Icons.EyeIcon className="h-6 w-6" onClick={() => setShowPassword(true)} />
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <div className="mb-6 text-xs">
                  <Link
                    href="/auth/forgot-password"
                    className="text-[#FB3640] hover:text-[#FB3640]/80 underline"
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
                <Button disabled={isSubmitting} className="w-full">
                  {isSubmitting && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
                  <Icons.Mail className="mr-2 h-4 w-4" />
                  {t('loginBtn')}
                </Button>
              </div>
            </form>
          </Form>

          <div className="space-y-4 mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">{t('or')}</span>
              </div>
            </div>
            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
              <Icons.Google />
              <span className="ml-2 font-semibold">{t('googleBtn')}</span>
            </Button>
          </div>
        </CardContent>

        <CardFooter>
          <div className="flex flex-col w-full gap-1">
            <div className="text-left text-sm text-gray-500">
              <Link href="/auth/magic-link" className="text-[#FB3640] hover:text-[#FB3640]/80">
                {t('magicLink')}
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              {t('noAccount')}{' '}
              <Link href="/auth/signup" className="text-[#FB3640] hover:text-[#FB3640]/80 font-medium">
                {t('signupLink')}
              </Link>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
