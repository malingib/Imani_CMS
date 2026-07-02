import React from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import Billing from '@/legacy/Billing';
import { PageProps } from '@/types/inertia';

interface Invoice {
  id: string;
  churchId: string;
  amount: number;
  status: string;
  dueDate?: string;
}

interface Props extends PageProps {
  tier: string;
  churchName: string;
  monthlyAmount: number;
  paidUntil?: string | null;
  billingPhone?: string | null;
  subscriptionStatus: string;
  pendingInvoices: Invoice[];
}

export default function BillingIndex({
  auth,
  activeChurch,
  churches,
  tier,
  churchName,
  monthlyAmount,
  paidUntil,
  billingPhone,
  subscriptionStatus,
  pendingInvoices,
}: Props) {
  return (
    <AppLayout auth={auth} activeChurch={activeChurch} churches={churches}>
      <Billing
        tier={tier}
        churchName={churchName}
        monthlyAmount={monthlyAmount}
        paidUntil={paidUntil}
        billingPhone={billingPhone}
        subscriptionStatus={subscriptionStatus}
        pendingInvoices={pendingInvoices}
        onPaymentComplete={() => router.reload()}
      />
    </AppLayout>
  );
}
