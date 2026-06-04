'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/API/Services/init/supabase-browser';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmailFormSchema, EmailFormValues } from '@/lib/types/validations';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import { Input } from '@/components/ui/Input';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/Card';
import Link from 'next/link';
import { Icons } from '@/components/Icons';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth');
  const { locale } = useParams() as { locale: string };

  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const form = useForm<EmailFormValues>({ resolver: zodResolver(EmailFormSchema) });
  const { setError, register, formState: { isSubmitting } } = form;

  const onSubmit = async (values: EmailFormValues) => {
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: 'https://jet-blog-zeta.vercel.app/auth/reset-password'
    });

    if (error) {
      setError('email', { type: 'root.serverError', message: error.message });
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
            <CardTitle className="text-2xl">{t('forgot_sent_title')}</CardTitle>
            <CardDescription>
              <span className="font-semibold text-foreground">{sentEmail}</span>{' '}
              {t('forgot_sent_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">{t('forgot_sent_hint')}</p>
            <p className="text-xs text-muted-foreground">{t('forgot_sent_spam')}</p>
          </CardContent>
          <CardFooter className="justify-center">
            <Link href={`/${locale}/auth/login`} className="text-sm text-[#FB3640] hover:text-[#FB3640]/80 font-medium">
              {t('back_to_login')}
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
          <CardTitle className="text-2xl">{t('forgot_title')}</CardTitle>
          <CardDescription>{t('forgot_subtitle')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input {...register('email')} placeholder={t('email')} type="email" className="bg-background-light dark:bg-background-dark" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button disabled={isSubmitting} className="w-full">
                {isSubmitting && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
                {t('forgot_btn')}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <Link href={`/${locale}/auth/login`} className="text-sm text-[#FB3640] hover:text-[#FB3640]/80">
            {t('back_to_login')}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
