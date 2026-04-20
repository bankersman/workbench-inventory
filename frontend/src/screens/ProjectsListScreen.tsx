import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { fetchJson } from '../api';

interface ProjectRow {
  id: number;
  name: string;
  status: string;
}

export function ProjectsListScreen() {
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void fetchJson<ProjectRow[]>('/projects')
      .then(setRows)
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
      <h1>Projects</h1>
      <ul className="detail-list">
        {rows.map((p) => (
          <li key={p.id}>
            <Link to={`/projects/${p.id}`}>{p.name}</Link> <span className="meta">{p.status}</span>
          </li>
        ))}
      </ul>
      <Link to="/">← Home</Link>
    </section>
  );
}
