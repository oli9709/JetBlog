'use client';

import { useState } from 'react';
import { supabaseBrowser } from '@/lib/API/Services/init/supabase-browser';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmailFormSchema, EmailFormValues } from '@/lib/types/validations';
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
import { Link } from '@/i18n/navigation';
import { Icons } from '@/components/Icons';
import { useTranslations } from 'next-intl';

export default function ForgotPasswordPage() {
  const t = useTranslations('Auth');
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(EmailFormSchema)
  });

  const {
    setError,
    register,
    formState: { isSubmitting }
  } = form;

  const onSubmit = async (values: EmailFormValues) => {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: 'https://jetblog.app/auth/reset-password'
    });

    if (error) {
      setError('email', {
        type: 'root.serverError',
        message: t('forgotError')
      });
      return;
    }

    setSentEmail(values.email);
    setSent(true);
  };

  if (sent) {
    return (
      <div className="md:w-96">
        <Card className="bg-background-light dark:bg-background-dark">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="rounded-full bg-green-100 dark:bg-green-950/40 p-4">
                <Icons.Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">{t('forgotSentTitle')}</CardTitle>
            <CardDescription>
              <span className="font-semibold text-foreground">{sentEmail}</span> {t('forgotSentDesc1')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              {t('forgotSentDesc2')} <strong>{t('forgotSentDesc3')}</strong>{t('forgotSentDesc4')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('forgotSentSpam')}
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Link href="/auth/login" className="text-sm text-[#FB3640] hover:text-[#FB3640]/80 font-medium">
              {t('backLogin')}
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="md:w-96">
      <Card className="bg-background-light dark:bg-background-dark">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">{t('forgotTitle')}</CardTitle>
          <CardDescription>{t('forgotDescLong')}</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input
                        {...register('email')}
                        placeholder={t('email')}
                        type="email"
                        className="bg-background-light dark:bg-background-dark"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button disabled={isSubmitting} className="w-full">
                {isSubmitting && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
                {t('forgotBtn')}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="justify-center">
          <Link
            href="/auth/login"
            className="text-sm text-[#FB3640] hover:text-[#FB3640]/80"
          >
            {t('backLogin')}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
