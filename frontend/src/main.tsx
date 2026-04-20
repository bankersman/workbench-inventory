import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import App from './App.tsx';
import { AppErrorBoundary } from './AppErrorBoundary.tsx';
import { queryClient } from './queryClient';
import { ThemeProvider } from './theme/ThemeProvider.tsx';
import { WarningProvider } from './useWarning.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppErrorBoundary>
            <WarningProvider>
              <App />
            </WarningProvider>
          </AppErrorBoundary>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
