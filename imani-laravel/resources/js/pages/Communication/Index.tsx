import React from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import CommunicationCenter from '@/legacy/CommunicationCenter';
import { PageProps } from '@/types/inertia';
import { CommunicationLog, Member } from '@/types';

interface Props extends PageProps {
  logs: CommunicationLog[];
  members: Member[];
}

export default function CommunicationIndex({ auth, activeChurch, churches, logs, members }: Props) {
  return (
    <AppLayout auth={auth} activeChurch={activeChurch} churches={churches}>
      <CommunicationCenter
        members={members}
        logs={logs}
        currentUser={{ name: auth.user.name }}
        onSendBroadcast={(log) => router.post('/communication', log as never, { preserveScroll: true })}
      />
    </AppLayout>
  );
}
