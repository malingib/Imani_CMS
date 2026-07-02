import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import MemberPortal from '@/legacy/MemberPortal';
import { PageProps } from '@/types/inertia';
import { ChurchEvent, Member, Transaction } from '@/types';

interface Props extends PageProps {
  member: Member | null;
  transactions: Transaction[];
  events: ChurchEvent[];
}

export default function PortalIndex({ auth, activeChurch, churches, member, transactions, events }: Props) {
  if (!member) {
    return (
      <AppLayout auth={auth} activeChurch={activeChurch} churches={churches}>
        <p className="p-10 text-slate-500">No member profile linked to this account.</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout auth={auth} activeChurch={activeChurch} churches={churches}>
      <MemberPortal
        member={member}
        transactions={transactions}
        events={events}
        activities={[]}
        onNavigate={() => {}}
        onUpdateProfile={() => {}}
        onRSVP={() => {}}
      />
    </AppLayout>
  );
}
