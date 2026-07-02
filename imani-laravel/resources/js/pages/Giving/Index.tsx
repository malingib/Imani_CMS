import React from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import MyGiving from '@/legacy/MyGiving';
import { PageProps } from '@/types/inertia';
import { Member, Transaction } from '@/types';

interface Props extends PageProps {
  transactions: Transaction[];
  member: Member | null;
}

export default function GivingIndex({ auth, activeChurch, churches, transactions, member }: Props) {
  if (!member) {
    return (
      <AppLayout auth={auth} activeChurch={activeChurch} churches={churches}>
        <p className="p-10 text-slate-500">No member profile linked.</p>
      </AppLayout>
    );
  }
  return (
    <AppLayout auth={auth} activeChurch={activeChurch} churches={churches}>
      <MyGiving
        member={member}
        transactions={transactions}
        onGive={() => router.reload({ only: ['transactions'] })}
      />
    </AppLayout>
  );
}
