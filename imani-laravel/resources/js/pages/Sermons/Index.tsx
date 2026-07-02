import React from 'react';
import { router } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import SermonHistory from '@/legacy/SermonHistory';
import AISermonAssistant from '@/legacy/AISermonAssistant';
import { PageProps } from '@/types/inertia';
import { Sermon } from '@/types';

interface Props extends PageProps {
  sermons: Sermon[];
}

export default function SermonsIndex({ auth, activeChurch, churches, sermons }: Props) {
  return (
    <AppLayout auth={auth} activeChurch={activeChurch} churches={churches}>
      <div className="space-y-8">
        <AISermonAssistant />
        <SermonHistory events={[]} />
      </div>
    </AppLayout>
  );
}
