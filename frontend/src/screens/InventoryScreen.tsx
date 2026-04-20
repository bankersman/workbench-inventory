import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { fetchJson } from '../api';

interface SuRow {
  id: number;
  barcode: string;
  name: string;
}

export function InventoryScreen() {
  const [units, setUnits] = useState<SuRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void fetchJson<SuRow[]>('/storage-units')
      .then(setUnits)
      .catch((e: Error) => setErr(e.message));
  }, []);

  if (err) {
    return (
      <section className="screen">
        <p className="error">{err}</p>
      </section>
    );
  }

  return (
    <section className="screen">
      <h1>Inventory</h1>
      <h2>Storage units</h2>
      <ul className="detail-list">
        {units.map((u) => (
          <li key={u.id}>
            <Link to={`/storage-units/${u.id}`}>{u.name}</Link>{' '}
            <span className="meta">{u.barcode}</span>
          </li>
        ))}
      </ul>
      <Link to="/">← Home</Link>
    </section>
  );
}
