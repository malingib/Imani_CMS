import React from 'react';
import AppLayout from '@/layouts/AppLayout';
import BillingOverview from '@/legacy/BillingOverview';
import { PageProps } from '@/types/inertia';

interface Props extends PageProps {
  subscriptions: Array<Record<string, unknown>>;
  invoices: Array<Record<string, unknown>>;
}

export default function PlatformBillingPage({ auth, activeChurch, churches, subscriptions, invoices }: Props) {
  return (
    <AppLayout auth={auth} activeChurch={activeChurch} churches={churches}>
      <BillingOverview subscriptions={subscriptions as never[]} invoices={invoices as never[]} />
    </AppLayout>
  );
}
