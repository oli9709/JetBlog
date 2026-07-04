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

export default function ForgotPasswordPage() {
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
        message: "Xatolik yuz berdi. Email manzilingizni tekshiring."
      });
      return;
    }

    setSentEmail(values.email);
    setSent(true);
  };

  // Muvaffaqiyatli holat
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
            <CardTitle className="text-2xl">Xat yuborildi</CardTitle>
            <CardDescription>
              <span className="font-semibold text-foreground">{sentEmail}</span> manziliga
              parolni tiklash xati yuborildi.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Pochta qutingizni tekshiring va havolani bosing.
              Havola <strong>1 soat</strong> davomida amal qiladi.
            </p>
            <p className="text-xs text-muted-foreground">
              Xat kelmadimi? Spam papkasini ham tekshirib ko&apos;ring.
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Link href="/auth/login" className="text-sm text-[#FB3640] hover:text-[#FB3640]/80 font-medium">
              ← Kirish sahifasiga qaytish
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
          <CardTitle className="text-2xl">Parolni tiklash</CardTitle>
          <CardDescription>
            Email manzilingizni kiriting — parolni tiklash havolasi yuboramiz.
            Google orqali ro&apos;yxatdan o&apos;tgan bo&apos;lsangiz ham — email orqali parol o&apos;rnatishingiz mumkin.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...register('email')}
                        placeholder="Email"
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
                Tiklash havolasini yuborish
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="justify-center">
          <Link
            href="/auth/login"
            className="text-sm text-[#FB3640] hover:text-[#FB3640]/80"
          >
            ← Kirish sahifasiga qaytish
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
