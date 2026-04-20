import { NavLink, Outlet } from 'react-router-dom';

import { CommandPalette } from './CommandPalette';
import { StatusBar } from './StatusBar';
import { useCommandState } from './useCommandState';
import { useScanner } from './useScanner';

function navClass({ isActive }: { isActive: boolean }): string {
  return isActive ? 'nav-item active' : 'nav-item';
}

export function AppLayout() {
  const { state, dispatchLine, adjustQty, inactiveWarn } = useCommandState();
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
      {inactiveWarn ? (
        <div className="inactivity-toast" role="status">
          Returning to idle in a few seconds…
        </div>
      ) : null}
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
