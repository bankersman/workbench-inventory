import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchJson } from '../api';

interface ItemDetail {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  barcode: string | null;
  containerId: number;
  category?: { id: number; name: string } | null;
  container?: { id: number; barcode: string; name: string };
}

interface Availability {
  quantity: number;
  inWarehouse: number;
  totalReserved: number;
  effectivelyFree: number;
}

export function ItemDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ItemDetail | null>(null);
  const [avail, setAvail] = useState<Availability | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    void Promise.all([
      fetchJson<ItemDetail>(`/items/${id}`),
      fetchJson<Availability>(`/availability/items/${id}`),
    ])
      .then(([item, a]) => {
        setData(item);
        setAvail(a);
      })
      .catch((e: Error) => setErr(e.message));
  }, [id]);

  if (err) {
    return (
      <section className="screen">
        <p className="error">{err}</p>
        <Link to="/inventory">Back</Link>
      </section>
    );
  }
  if (!data || !avail) {
    return (
      <section className="screen">
        <p>Loading…</p>
      </section>
    );
  }

  return (
    <section className="screen">
      <h1>{data.name}</h1>
      <p className="meta">
        {data.unit} • on hand {data.quantity}
        {data.barcode ? ` • ${data.barcode}` : ''}
      </p>
      <h2>Availability</h2>
      <ul className="detail-list">
        <li>In warehouse: {avail.inWarehouse}</li>
        <li>Reserved (BOM): {avail.totalReserved}</li>
        <li>Effectively free: {avail.effectivelyFree}</li>
      </ul>
      <p>
        <Link to={`/containers/${data.containerId}`}>Open container</Link>
      </p>
      <Link to="/inventory">← Back</Link>
    </section>
  );
}
