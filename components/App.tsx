import React, { Suspense } from 'react';
import { BrowserRouter, Link, useLocation } from 'react-router-dom';
import { ChurchProvider, useChurch } from '../src/lib/church-context';
import { AppProvider, useApp } from '../src/lib/AppProvider';
import AppRoutes from './AppRoutes';
import ProjectsManagement from './ProjectsManagement';

function ProjectsRoute() {
  const { currentUser, addToast } = useApp();
  const { activeChurchId } = useChurch();
  const location = useLocation();

  if (!currentUser || location.pathname !== '/projects') return <AppRoutes />;

  const churchId = activeChurchId ?? currentUser.churchId ?? '';
  const canManage = ['SUPER_ADMIN', 'ADMIN', 'PASTOR'].includes(currentUser.role);

  if (!churchId) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 shadow-sm text-center max-w-md">
          <h1 className="text-xl font-black text-slate-900">No church selected</h1>
          <p className="text-slate-500 mt-2">Select a church before managing projects.</p>
          <Link to="/dashboard" className="inline-block mt-6 px-5 py-3 rounded-2xl bg-brand-primary text-white font-black">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-5">
          <Link to="/dashboard" className="text-xs font-black text-brand-primary hover:underline">← Back to dashboard</Link>
        </div>
        <ProjectsManagement
          churchId={churchId}
          currentUserId={currentUser.id}
          canManage={canManage}
          addToast={addToast}
        />
      </div>
    </div>
  );
}

function AppWithProjectShortcut() {
  const { currentUser } = useApp();
  const location = useLocation();

  if (currentUser && location.pathname !== '/projects') {
    return (
      <>
        <AppRoutes />
        {['SUPER_ADMIN', 'ADMIN', 'PASTOR', 'TREASURER'].includes(currentUser.role) && (
          <Link
            to="/projects"
            className="fixed bottom-5 right-5 z-[55] px-4 py-3 rounded-2xl bg-brand-primary text-white text-xs font-black shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-transform"
          >
            Projects & Giving
          </Link>
        )}
      </>
    );
  }

  return <ProjectsRoute />;
}

export default function App() {
  return (
    <BrowserRouter>
      <ChurchProvider churchId={null}>
        <AppProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <AppWithProjectShortcut />
          </Suspense>
        </AppProvider>
      </ChurchProvider>
    </BrowserRouter>
  );
}
