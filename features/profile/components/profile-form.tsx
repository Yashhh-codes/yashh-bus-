'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/providers/auth-provider';
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { User, Phone, Mail, Loader2, Save } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^(?:\+94|0)?7[0-9]{8}$/, 'Invalid format. Use 07XXXXXXXX or +947XXXXXXXX').or(z.literal('')),
});

type ProfileInput = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      phone: '',
    }
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          reset({
            name: data.displayName || user.displayName || '',
            phone: data.phoneNumber || '',
          });
        } else {
          reset({
            name: user.displayName || '',
            phone: '',
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user, reset]);

  const onSubmit = async (data: ProfileInput) => {
    if (!user) return;
    setSubmitting(true);
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: data.name
        });
      }

      const docRef = doc(db, 'users', user.uid);
      await setDoc(docRef, {
        displayName: data.name,
        phoneNumber: data.phone,
        email: user.email,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      toast.success('Profile details saved successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-md mx-auto py-6">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <Card className="border-slate-200/80 shadow-md bg-white w-full max-w-md mx-auto">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-slate-950 font-bold text-lg">Update Profile</CardTitle>
        <CardDescription className="text-slate-500 text-xs">Maintain your personal transit contact details.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email (Readonly) */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
              <Mail className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
              Email Address
            </Label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full pl-3 pr-3 py-2.5 border border-slate-200 rounded-xl bg-slate-50 text-slate-500 text-sm focus:outline-none cursor-not-allowed font-medium"
            />
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
              <User className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
              Full Name
            </Label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              className="w-full pl-3 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              {...register('name')}
            />
            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
              <Phone className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
              Phone Number
            </Label>
            <input
              type="text"
              placeholder="e.g. 0771234567"
              className="w-full pl-3 pr-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              {...register('phone')}
            />
            {errors.phone && <p className="text-xs text-red-500 font-medium">{errors.phone.message}</p>}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.98] py-5 mt-4"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
export type { };
