'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import Link from 'next/link';
import { Icons } from '@/components/Icons';

export default function AuthForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const router = useRouter();

  const form = useForm<authFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const {
    register,
    reset,
    setError,
    formState: { isSubmitting }
  } = form;

  const onSubmit = async (values: authFormValues) => {
    const supabase = supabaseBrowser()
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth-callback`
      }
    })

    if (error) {
      reset({ email: values.email, password: '' });
      setError('email', {
        type: 'root.serverError',
        message: error.message
      });
      setError('password', { type: 'root.serverError', message: '' });
      return;
    }

    if (data?.session) {
      router.refresh()
      router.push('/dashboard/main');
      return;
    }

    setSentEmail(values.email);
    setEmailSent(true);
  };

  const handleGoogleSignIn = async () => {
    const supabase = supabaseBrowser()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'https://jet-blog-zeta.vercel.app/api/auth-callback', queryParams: { access_type: 'offline', prompt: 'consent' } }
    })

    if (error) {
      setError('email', {
        type: 'root.serverError',
        message: error.message
      });
      setError('password', { type: 'root.serverError' });
      return;
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Email yuborilgandan keyin ko'rsatiladigan holat
  if (emailSent) {
    return (
      <div className="md:w-96">
        <Card className="bg-background-light dark:bg-background-dark">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Email manzilingizni tasdiqlang</CardTitle>
            <CardDescription>
              <span className="font-semibold">{sentEmail}</span> manziliga tasdiqlash xati yuborildi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Email xatingizdagi havolani bosing. Havolani bosganingizdan so&apos;ng avtomatik ravishda
              dashboardga yo&apos;naltirilasiz.
            </p>
            <p className="text-xs text-muted-foreground">
              Xat kelmadimi? Spam papkasini ham tekshirib ko&apos;ring.
            </p>
          </CardContent>
          <CardFooter>
            <div className="text-center text-sm text-gray-500 w-full">
              <button
                onClick={() => { setEmailSent(false); setSentEmail(''); }}
                className="text-indigo-600 hover:text-indigo-500 underline"
              >
                Qayta urinish
              </button>
              {' '}&mdash;{' '}
              <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-500">
                Kirish sahifasi
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="md:w-96">
      <Card className="bg-background-light dark:bg-background-dark">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Hisob yaratish</CardTitle>
          <CardDescription>
            JetBlog ga ro&apos;yxatdan o&apos;tish uchun email va parolingizni kiriting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormMessage />
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...register('email')}
                        placeholder="Email"
                        {...field}
                        className="bg-background-light dark:bg-background-dark"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parol</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          className="bg-background-light dark:bg-background-dark"
                          {...register('password')}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Parol"
                          {...field}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 cursor-pointer">
                          {showPassword ? (
                            <Icons.EyeOffIcon className="h-6 w-6" onClick={togglePasswordVisibility} />
                          ) : (
                            <Icons.EyeIcon className="h-6 w-6" onClick={togglePasswordVisibility} />
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button className="w-full">
                {isSubmitting && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
                <Icons.Lock className="mr-2 h-4 w-4" />
                Hisob yaratish
              </Button>
            </form>
          </Form>
          <div className="space-y-8 mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">yoki</span>
              </div>
            </div>
            <Button onClick={handleGoogleSignIn} variant="outline" className="w-full">
              <Icons.Google />
              <span className="ml-2 font-semibold">Google orqali kirish</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col w-full">
            <div className="text-center text-sm text-gray-500">
              Hisobingiz bormi?{' '}
              <Link href="/auth/login" className="leading-7 text-indigo-600 hover:text-indigo-500">
                Kirish
              </Link>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
