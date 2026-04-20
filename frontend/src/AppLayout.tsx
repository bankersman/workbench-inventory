import { NavLink, Outlet } from 'react-router-dom';

import { AppFooter } from './components/AppFooter';
import { CommandPalette } from './CommandPalette';
import { StatusBar } from './StatusBar';
import { useCommandState } from './useCommandState';
import { useScanner } from './useScanner';

function navClass({ isActive }: { isActive: boolean }): string {
  return [
    'flex min-h-12 flex-1 items-center justify-center rounded-xl px-2 text-center text-sm font-medium transition-colors',
    isActive
      ? 'bg-violet-100 text-violet-900 dark:bg-violet-950/80 dark:text-violet-100'
      : 'text-zinc-600 hover:bg-stone-200/80 dark:text-zinc-400 dark:hover:bg-zinc-800/80',
  ].join(' ');
}

export function AppLayout() {
  const { state, dispatchLine, adjustQty, inactiveWarn } = useCommandState();
  useScanner((raw) => dispatchLine(raw));

  return (
    <div className="flex min-h-svh flex-col">
      <StatusBar
        state={state}
        onCancel={() => dispatchLine('CMD:CANCEL')}
        onConfirm={() => dispatchLine('CMD:CONFIRM')}
        onDecQty={() => adjustQty(-1)}
        onIncQty={() => adjustQty(1)}
      />
      {inactiveWarn ? (
        <div
          className="sticky top-0 z-[34] bg-amber-900 px-3 py-2.5 text-center text-sm font-semibold text-amber-50"
          role="status"
        >
          Returning to idle in a few seconds…
        </div>
      ) : null}
      <main className="flex flex-1 flex-col overflow-y-auto px-4 pb-32 pt-4 text-left">
        <div className="mx-auto w-full max-w-3xl flex-1">
          <Outlet />
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 z-30 flex flex-col pb-[env(safe-area-inset-bottom)]">
        <AppFooter />
        <nav
          className="flex min-h-14 justify-around gap-1 border-t border-stone-200/90 bg-white/95 px-1 pt-1 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95"
          aria-label="Main"
        >
          <NavLink className={navClass} to="/" end>
            Home
          </NavLink>
          <NavLink className={navClass} to="/inventory">
            Inventory
          </NavLink>
          <NavLink className={navClass} to="/projects">
            Projects
          </NavLink>
          <NavLink className={navClass} to="/order">
            Order
          </NavLink>
          <NavLink className={navClass} to="/settings">
            Settings
          </NavLink>
        </nav>
      </div>
      <CommandPalette />
    </div>
  );
}
