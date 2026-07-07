import React from 'react';
import ReactDOM from 'react-dom/client';
import ErrorBoundary from './src/lib/ErrorBoundary';
import App from './components/App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Could not find root element');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
