import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { LabelSection } from '../components/LabelSection';
import { apiBase, fetchJson } from '../api';

interface Project {
  id: number;
  name: string;
  status: string;
}

interface BomLine {
  id: number;
  quantityRequired: number;
  quantityPulled: number;
  quantityInstalled: number;
  item?: { id: number; name: string };
}

export function ProjectDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [bom, setBom] = useState<BomLine[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    void Promise.all([
      fetchJson<Project>(`/projects/${id}`),
      fetchJson<BomLine[]>(`/projects/${id}/bom`),
    ])
      .then(([p, b]) => {
        setProject(p);
        setBom(b);
      })
      .catch((e: Error) => setErr(e.message));
  }, [id]);

  if (err) {
    return (
      <section className="screen">
        <p className="error">{err}</p>
        <Link to="/projects">Back</Link>
      </section>
    );
  }
  if (!project) {
    return (
      <section className="screen">
        <p>Loading…</p>
      </section>
    );
  }

  const exportHref = `${apiBase()}/projects/${id}/export/bom.csv`;

  return (
    <section className="screen">
      <h1>{project.name}</h1>
      <p className="meta">{project.status}</p>
      <p>
        <a href={exportHref} download>
          Export BOM CSV
        </a>
      </p>
      {id ? <LabelSection entityType="project" entityId={Number(id)} /> : null}
      <h2>BOM</h2>
      <ul className="detail-list">
        {bom.map((line) => (
          <li key={line.id}>
            {line.item ? <Link to={`/items/${line.item.id}`}>{line.item.name}</Link> : 'Item'}:{' '}
            {line.quantityRequired} req / {line.quantityPulled} pulled / {line.quantityInstalled}{' '}
            installed
          </li>
        ))}
      </ul>
      <Link to="/projects">← Projects</Link>
    </section>
  );
}
