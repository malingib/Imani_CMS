import React from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import PlatformSettings from '@/legacy/PlatformSettings';
import { PageProps } from '@/types/inertia';

interface Props extends PageProps {
  flags: Record<string, boolean>;
}

export default function PlatformSettingsPage({ auth, activeChurch, churches, flags }: Props) {
  return (
    <AppLayout auth={auth} activeChurch={activeChurch} churches={churches}>
      <PlatformSettings
        flags={flags}
        onSave={(f) => router.put('/platform/settings', { flags: f }, { preserveScroll: true })}
      />
    </AppLayout>
  );
}
