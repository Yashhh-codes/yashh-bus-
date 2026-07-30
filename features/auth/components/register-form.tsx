'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/schemas/auth-schemas';
import { authService, RegisterInput } from '../services/auth-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound, Mail, User, Phone, ArrowRight, Loader2 } from 'lucide-react';

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
    }
  });

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      await authService.register(data);
      toast.success('Account created successfully!');
      router.push('/home');
    } catch (error: any) {
      console.error(error);
      let errorMessage = 'Failed to create account.';
      if (error.code === 'auth/email-already-in-use') errorMessage = 'This email is already in use.';
      if (error.code === 'auth/invalid-email') errorMessage = 'Invalid email address.';
      if (error.code === 'auth/weak-password') errorMessage = 'The password is too weak.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="border-slate-200/80 shadow-xl backdrop-blur-md bg-white/90">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-950">Create an Account</CardTitle>
          <CardDescription className="text-slate-500">
            Sign up to start booking your bus trips and track buses live.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10 focus-visible:ring-indigo-500"
                  {...register('fullName')}
                />
              </div>
              {errors.fullName && (
                <p className="text-xs text-red-500 font-medium">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="passenger@example.com"
                  className="pl-10 focus-visible:ring-indigo-500"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+94 77 123 4567"
                  className="pl-10 focus-visible:ring-indigo-500"
                  {...register('phoneNumber')}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-xs text-red-500 font-medium">{errors.phoneNumber.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 focus-visible:ring-indigo-500"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 font-medium">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10 focus-visible:ring-indigo-500"
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-md active:scale-98 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Sign Up
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-center gap-1 text-sm text-slate-500 pb-6">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            Sign In
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
