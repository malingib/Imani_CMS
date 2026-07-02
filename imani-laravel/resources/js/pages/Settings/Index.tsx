import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import Settings from '@/legacy/Settings';
import { PageProps } from '@/types/inertia';
import { UserRole } from '@/types';

interface Props extends PageProps {
  church: { name: string; email?: string; phone?: string; address?: string } | null;
  userRole: string;
}

export default function SettingsIndex({ auth, activeChurch, churches, church, userRole }: Props) {
  return (
    <AppLayout auth={auth} activeChurch={activeChurch} churches={churches}>
      <Settings currentUserRole={userRole as UserRole} />
    </AppLayout>
  );
}
