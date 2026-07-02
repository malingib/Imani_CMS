import React from 'react';
import CompliancePortal from '@/legacy/CompliancePortal';
import { PageProps } from '@/types/inertia';

export default function CompliancePage(_props: PageProps) {
  return <CompliancePortal onBack={() => window.history.back()} />;
}
