import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ChurchProvider } from '../src/lib/church-context';
import { AppProvider } from '../src/lib/AppProvider';
import AppRoutes from './AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <ChurchProvider churchId={null}>
        <AppProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <AppRoutes />
          </Suspense>
        </AppProvider>
      </ChurchProvider>
    </BrowserRouter>
  );
}
