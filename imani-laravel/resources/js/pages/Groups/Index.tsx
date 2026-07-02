import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import GroupsManagement from '@/legacy/GroupsManagement';
import { PageProps } from '@/types/inertia';
import { Member } from '@/types';

interface Props extends PageProps {
  members: Member[];
}

export default function GroupsIndex({ auth, activeChurch, churches, members }: Props) {
  return (
    <AppLayout auth={auth} activeChurch={activeChurch} churches={churches}>
      <GroupsManagement members={members} />
    </AppLayout>
  );
}
