import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import ReportsCenter from '@/legacy/ReportsCenter';
import { PageProps } from '@/types/inertia';
import { ChurchEvent, Member, Transaction } from '@/types';

interface Props extends PageProps {
  transactions: Transaction[];
  members: Member[];
  events: ChurchEvent[];
}

export default function ReportsIndex({ auth, activeChurch, churches, transactions, members, events }: Props) {
  return (
    <AppLayout auth={auth} activeChurch={activeChurch} churches={churches}>
      <ReportsCenter transactions={transactions} members={members} events={events} />
    </AppLayout>
  );
}
