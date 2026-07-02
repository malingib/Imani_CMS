import React from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import InvitationsManager from '@/legacy/InvitationsManager';
import { PageProps } from '@/types/inertia';

interface Props extends PageProps {
  invitations: Array<Record<string, unknown>>;
  churches: Array<{ id: string; name: string }>;
}

export default function InvitationsPage({ auth, activeChurch, churches, invitations }: Props) {
  return (
    <AppLayout auth={auth} activeChurch={activeChurch} churches={churches}>
      <InvitationsManager
        invitations={invitations as never[]}
        churches={churches.map((c) => ({ id: c.id, name: c.name }))}
        onSendInvite={(data) => router.post('/platform/invitations', data as never, { preserveScroll: true })}
      />
    </AppLayout>
  );
}
