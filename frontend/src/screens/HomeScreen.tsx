import { Link } from 'react-router-dom';

export function HomeScreen() {
  return (
    <section className="screen home-screen">
      <h1>Home</h1>
      <p className="screen-hint">Scan a barcode or use search from detail routes.</p>
      <nav className="quick-links" aria-label="Quick navigation">
        <Link className="quick-link" to="/inventory">
          Inventory
        </Link>
        <Link className="quick-link" to="/projects">
          Projects
        </Link>
      </nav>
    </section>
  );
}
