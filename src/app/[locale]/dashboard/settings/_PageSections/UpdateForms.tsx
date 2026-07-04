'use client';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/Form';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Icons } from '@/components/Icons';
import { toast } from 'react-toastify';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { SupabaseProfileUpdate } from '@/lib/API/Database/profile/mutations';
import { SupabaseUpdateEmail, SupabaseUpdatePassword } from '@/lib/API/Services/supabase/auth';

import {
  DisplayNameFormValues,
  DisplayNameFormSchema,
  EmailFormSchema,
  EmailFormValues,
  UpdatePasswordFormSchema,
  UpdatePasswordFormValues
} from '@/lib/types/validations';

import { User } from '@supabase/supabase-js';

interface UpdateDisplayNamePropsI {
  display_name: string;
  user: User;
}

export const UpdateDisplayName = ({ display_name, user }: UpdateDisplayNamePropsI) => {
  const form = useForm<DisplayNameFormValues>({
    resolver: zodResolver(DisplayNameFormSchema),
    defaultValues: {
      display_name
    }
  });

  const {
    setError,
    register,
    formState: { isSubmitting }
  } = form;

  const handleSubmit = async (data: DisplayNameFormValues) => {
    const id = user.id;
    const display_name = data.display_name;

    const props = { id, display_name };
    const { error } = await SupabaseProfileUpdate(props);

    if (error) {
      setError('display_name', {
        type: '"root.serverError',
        message: error.message
      });
      return;
    }

    toast.success('Yangilash yakunlandi');
  };

  return (
    <div className="mt-4 mb-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormMessage className="py-2" />
                <FormLabel>Ko'rinadigan ism</FormLabel>
                <FormControl>
                  <Input {...register('display_name')} className="bg-background-light dark:bg-background-dark" type="text" {...field} />
                </FormControl>
                <FormDescription>Bu sizning commonga ko'rinadigan ismingiz.</FormDescription>
              </FormItem>
            )}
          />
          <Button disabled={isSubmitting} className="mt-4">
            {isSubmitting && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
            Profilni yangilash
          </Button>
        </form>
      </Form>
    </div>
  );
};

interface UpdateEmailPropsI {
  email: string;
  customer: string;
}

export const UpdateEmail = ({ email, customer }: UpdateEmailPropsI) => {
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(EmailFormSchema),
    defaultValues: {
      email
    }
  });

  const {
    setError,
    register,
    formState: { isSubmitting }
  } = form;

  const handleSubmit = async (data: EmailFormValues) => {
    const email = data.email;
    const { error } = await SupabaseUpdateEmail(email);

    if (error) {
      setError('email', {
        type: 'root.serverError',
        message: error.message
      });
      return;
    }

    toast.success('Email yangilash yuborildi, tasdiqlash uchun emailni tekshiring');
  };

  return (
    <div className="mt-4 mb-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...register('email')} className="bg-background-light dark:bg-background-dark" type="text" {...field} />
                </FormControl>
                <FormDescription>Bu hisobingizga bog'langan email</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isSubmitting} className="mt-4">
            {isSubmitting && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
            Emailni yangilash
          </Button>
        </form>
      </Form>
    </div>
  );
};

export const UpdatePassword = () => {
  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(UpdatePasswordFormSchema),
    defaultValues: {
      password: ''
    }
  });

  const {
    register,
    setError,
    formState: { isSubmitting }
  } = form;

  const handleSubmit = async (data: UpdatePasswordFormValues) => {
    const { error } = await SupabaseUpdatePassword(data.password);

    if (error) {
      setError('password', {
        type: '"root.serverError',
        message: error.message
      });
      return;
    }

    toast.success('Yangilash yakunlandi');
  };

  return (
    <div className="mt-4 mb-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parol</FormLabel>
                <FormControl>
                  <Input {...register('password')} className="bg-background-light dark:bg-background-dark" type="text" {...field} />
                </FormControl>
                <FormDescription>Hisob parolini yangilash</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={isSubmitting} className="mt-4">
            {isSubmitting && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
            Parolni yangilash
          </Button>
        </form>
      </Form>
    </div>
  );
};
