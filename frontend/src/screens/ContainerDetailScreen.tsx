import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { fetchJson } from '../api';

interface ContainerDetail {
  id: number;
  barcode: string;
  name: string;
  storageUnitId: number | null;
  projectId: number | null;
  notes: string | null;
  storageUnit: { id: number; barcode: string; name: string } | null;
  project: { id: number; name: string; status: string } | null;
}

export function ContainerDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ContainerDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    void fetchJson<ContainerDetail>(`/containers/${id}`)
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
      {data.storageUnit ? (
        <p>
          Storage unit:{' '}
          <Link to={`/storage-units/${data.storageUnit.id}`}>{data.storageUnit.name}</Link>
        </p>
      ) : null}
      {data.project ? (
        <p>
          Project: <Link to={`/projects/${data.project.id}`}>{data.project.name}</Link> (
          {data.project.status})
        </p>
      ) : null}
      <Link to="/inventory">← Back</Link>
    </section>
  );
}
