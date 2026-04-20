import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import App from './App.tsx';
import { AppErrorBoundary } from './AppErrorBoundary.tsx';
import { WarningProvider } from './useWarning.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppErrorBoundary>
        <WarningProvider>
          <App />
        </WarningProvider>
      </AppErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);
