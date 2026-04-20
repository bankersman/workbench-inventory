import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchJson } from '../api';

interface StorageUnitDetail {
  id: number;
  barcode: string;
  name: string;
  parentId: number | null;
  notes: string | null;
  containers: { id: number; barcode: string; name: string }[];
}

export function StorageUnitDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<StorageUnitDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    void fetchJson<StorageUnitDetail>(`/storage-units/${id}`)
      .then(setData)
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
  if (!data) {
    return (
      <section className="screen">
        <p>Loading…</p>
      </section>
    );
  }

  return (
    <section className="screen">
      <h1>{data.name}</h1>
      <p className="meta">{data.barcode}</p>
      <h2>Containers</h2>
      <ul className="detail-list">
        {data.containers.map((c) => (
          <li key={c.id}>
            <Link to={`/containers/${c.id}`}>{c.name}</Link>{' '}
            <span className="meta">{c.barcode}</span>
          </li>
        ))}
      </ul>
      <Link to="/inventory">← Back</Link>
    </section>
  );
}
