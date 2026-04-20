import { CommandPalette } from './CommandPalette';

import './App.css';

function App() {
  return (
    <div className="app-root">
      <section id="center" className="home-screen">
        <h1>Workbench Inventory</h1>
        <p className="home-hint">Scan or use the command button for touch-only flows.</p>
      </section>
      <CommandPalette />
    </div>
  );
}

export default App;
