import React from 'react';
import { Link } from '@inertiajs/react';
import PrivacyPolicy from '@/legacy/PrivacyPolicy';
import { PageProps } from '@/types/inertia';

export default function PrivacyPage(props: PageProps) {
  return <PrivacyPolicy onBack={() => window.history.back()} />;
}
