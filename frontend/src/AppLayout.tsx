import { NavLink, Outlet } from 'react-router-dom';

import { CommandPalette } from './CommandPalette';

function navClass({ isActive }: { isActive: boolean }): string {
  return isActive ? 'nav-item active' : 'nav-item';
}
import { StatusBar } from './StatusBar';
import { useCommandState } from './useCommandState';
import { useScanner } from './useScanner';

export function AppLayout() {
  const { state, dispatchLine, adjustQty } = useCommandState();
  useScanner((raw) => dispatchLine(raw));

  return (
    <div className="kiosk-root">
      <StatusBar
        state={state}
        onCancel={() => dispatchLine('CMD:CANCEL')}
        onConfirm={() => dispatchLine('CMD:CONFIRM')}
        onDecQty={() => adjustQty(-1)}
        onIncQty={() => adjustQty(1)}
      />
      <main className="kiosk-main">
        <Outlet />
      </main>
      <nav className="bottom-nav" aria-label="Main">
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
      <CommandPalette />
    </div>
  );
}
