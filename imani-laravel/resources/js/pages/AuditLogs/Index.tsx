import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import AuditLogs from '@/legacy/AuditLogs';
import { PageProps } from '@/types/inertia';
import { AuditLog } from '@/types';

interface Props extends PageProps {
  auditLogs: AuditLog[];
}

export default function AuditLogsIndex({ auth, activeChurch, churches, auditLogs }: Props) {
  return (
    <AppLayout auth={auth} activeChurch={activeChurch} churches={churches}>
      <AuditLogs logs={auditLogs} />
    </AppLayout>
  );
}
