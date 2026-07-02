import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import PlatformDashboard from '@/legacy/PlatformDashboard';
import { PageProps } from '@/types/inertia';

interface Props extends PageProps {
  stats: { churches: number; members: number; subscriptions: number; revenue: number };
}

export default function PlatformIndex({ auth, activeChurch, churches, stats }: Props) {
  return (
    <AppLayout auth={auth} activeChurch={activeChurch} churches={churches}>
      <PlatformDashboard stats={stats} />
    </AppLayout>
  );
}
