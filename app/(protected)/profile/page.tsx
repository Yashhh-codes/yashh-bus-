import React from 'react';
import { ProfileForm } from '@/features/profile/components/profile-form';

export default function ProfilePage() {
  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Your Profile</h1>
        <p className="text-slate-500">Manage account information and contact configurations.</p>
      </div>
      <ProfileForm />
    </div>
  );
}
export type { };
