import { Outlet } from 'react-router-dom';

import { AppHeader } from './components/AppHeader';
import { CommandPalette } from './CommandPalette';
import { StatusBar } from './StatusBar';
import { useCommandState } from './useCommandState';
import { useScanner } from './useScanner';

export function AppLayout() {
  const { state, dispatchLine, adjustQty, inactiveWarn } = useCommandState();
  useScanner((raw) => dispatchLine(raw));

  return (
    <div className="flex min-h-svh flex-col">
      <div className="sticky top-0 z-[36] border-b border-stone-200/90 bg-white/95 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95">
        <StatusBar
          state={state}
          onCancel={() => dispatchLine('CMD:CANCEL')}
          onConfirm={() => dispatchLine('CMD:CONFIRM')}
          onDecQty={() => adjustQty(-1)}
          onIncQty={() => adjustQty(1)}
        />
        {inactiveWarn ? (
          <div
            className="bg-amber-900 px-3 py-2.5 text-center text-sm font-semibold text-amber-50"
            role="status"
          >
            Returning to idle in a few seconds…
          </div>
        ) : null}
        <AppHeader />
      </div>
      <main
        id="main-content"
        className="flex flex-1 flex-col overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 text-left"
        tabIndex={-1}
      >
        <div className="mx-auto w-full max-w-3xl flex-1">
          <Outlet />
        </div>
      </main>
      <CommandPalette />
    </div>
  );
}
