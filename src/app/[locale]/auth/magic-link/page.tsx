'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmailFormSchema, EmailFormValues } from '@/lib/types/validations';
import { SupabaseSignInWithMagicLink } from '@/lib/API/Services/supabase/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/Form';
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle
} from '@/components/ui/Card';
import { Icons } from '@/components/Icons';
import Link from 'next/link';

export default function MagicLinkPage() {
  const t = useTranslations('auth');
  const { locale } = useParams() as { locale: string };
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const form = useForm<EmailFormValues>({ resolver: zodResolver(EmailFormSchema) });
  const { register, formState: { isSubmitting } } = form;

  const onSubmit = async (values: EmailFormValues) => {
    setErrorMessage('');
    const { error } = await SupabaseSignInWithMagicLink(values.email);
    if (error) { setErrorMessage(error.message); return; }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="md:w-96">
        <Card className="bg-background-light dark:bg-background-dark">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="rounded-full bg-[#FB3640]/10 p-4">
                <Icons.Mail className="h-8 w-8 text-[#FB3640]" />
              </div>
            </div>
            <CardTitle className="text-2xl">{t('magic_sent_title')}</CardTitle>
            <CardDescription>{t('magic_sent_desc')}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href={`/${locale}/auth/login`} className="text-sm text-[#FB3640] hover:text-[#FB3640]/80">
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
          <CardTitle className="text-2xl">{t('magic_title')}</CardTitle>
          <CardDescription>{t('magic_subtitle')}</CardDescription>
          {errorMessage && <div className="text-sm text-red-500 pt-2">{errorMessage}</div>}
        </CardHeader>
        <CardContent className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input type="text" placeholder={t('email')} {...register('email')} className="bg-background-light dark:bg-background-dark" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button disabled={isSubmitting} className="w-full" type="submit">
                {isSubmitting && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
                <Icons.Mail className="mr-2 h-4 w-4" />
                {t('magic_btn')}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col gap-1">
            <div className="text-left text-sm text-gray-500">
              <Link href={`/${locale}/auth/login`} className="text-[#FB3640] hover:text-[#FB3640]/80">
                {t('back_to_login')}
              </Link>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
