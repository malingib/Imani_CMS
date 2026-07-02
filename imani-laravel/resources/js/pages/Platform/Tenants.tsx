import React from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import TenantsList from '@/legacy/TenantsList';
import { PageProps } from '@/types/inertia';

interface ChurchRow {
  id: string;
  name: string;
  slug: string;
  tier: string;
  status: string;
  memberCount?: number;
}

interface Props extends PageProps {
  churches: ChurchRow[];
}

export default function TenantsPage({ auth, activeChurch, churches }: Props) {
  return (
    <AppLayout auth={auth} activeChurch={activeChurch} churches={churches}>
      <TenantsList
        churches={churches}
        onCreateChurch={(data) => router.post('/platform/tenants', data as never, { preserveScroll: true })}
        onSelectChurch={(id) => router.post('/platform/church-switch', { churchId: id })}
      />
    </AppLayout>
  );
}
