import React from 'react';
import SecurityOverview from '@/legacy/SecurityOverview';
import { PageProps } from '@/types/inertia';

export default function SecurityPage(_props: PageProps) {
  return <SecurityOverview onBack={() => window.history.back()} />;
}
