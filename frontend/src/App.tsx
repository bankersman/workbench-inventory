import { useState } from 'react';

import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';

import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Workbench Inventory</h1>
          <p>
            Kiosk UI will live here. Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
            .
          </p>
        </div>
        <button className="counter" type="button" onClick={() => setCount((c) => c + 1)}>
          Count is {count}
        </button>
      </section>
    </>
  );
}

export default App;
