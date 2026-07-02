import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import DemographicsAnalysis from '@/legacy/DemographicsAnalysis';
import { PageProps } from '@/types/inertia';
import { Member } from '@/types';

interface Props extends PageProps {
  members: Member[];
}

export default function AnalyticsIndex({ auth, activeChurch, churches, members }: Props) {
  return (
    <AppLayout auth={auth} activeChurch={activeChurch} churches={churches}>
      <DemographicsAnalysis members={members} />
    </AppLayout>
  );
}
