import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchJson } from '../api';
import { PageBody, PageHero } from '../components/PageShell';

interface ContainerDetail {
  id: number;
  barcode: string;
  name: string;
  storageUnitId: number | null;
  projectId: number | null;
  notes: string | null;
}

function ContainerEditForm({
  cid,
  data,
  projects,
  units,
}: {
  cid: number;
  data: ContainerDetail;
  projects: { id: number; name: string; status: string }[];
  units: { id: number; barcode: string; name: string }[];
}) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [editName, setEditName] = useState(data.name);
  const [editNotes, setEditNotes] = useState(data.notes ?? '');
  const [editStorageId, setEditStorageId] = useState(
    data.storageUnitId != null ? String(data.storageUnitId) : '',
  );
  const [editProjectId, setEditProjectId] = useState(
    data.projectId != null ? String(data.projectId) : '',
  );
  const [editErr, setEditErr] = useState<string | null>(null);

  const invalidateRelated = async () => {
    await qc.invalidateQueries({ queryKey: ['container', cid] });
    await qc.invalidateQueries({ queryKey: ['storage-units'] });
    await qc.invalidateQueries({ queryKey: ['storage-unit'] });
  };

  const patchMut = useMutation({
    mutationFn: (body: {
      name?: string;
      notes?: string | null;
      storageUnitId?: number | null;
      projectId?: number | null;
    }) =>
      fetchJson<ContainerDetail>(`/containers/${cid}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      setEditErr(null);
      await invalidateRelated();
      navigate(`/containers/${cid}`);
    },
    onError: (e: Error) => setEditErr(e.message),
  });

  return (
    <form
      className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80"
      onSubmit={(e) => {
        e.preventDefault();
        const trimmed = editName.trim();
        if (!trimmed) {
          setEditErr('Name is required');
          return;
        }
        patchMut.mutate({
          name: trimmed,
          notes: editNotes.trim() || null,
          storageUnitId: editStorageId === '' ? null : Number(editStorageId),
          projectId: editProjectId === '' ? null : Number(editProjectId),
        });
      }}
    >
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
        <input
          className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
        />
      </div>
      <div className="mt-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Storage area</label>
        <select
          className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          value={editStorageId}
          onChange={(e) => setEditStorageId(e.target.value)}
        >
          <option value="">— Unassigned —</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Linked project
        </label>
        <select
          className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          value={editProjectId}
          onChange={(e) => setEditProjectId(e.target.value)}
        >
          <option value="">— None —</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.status})
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes</label>
        <textarea
          rows={2}
          className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          value={editNotes}
          onChange={(e) => setEditNotes(e.target.value)}
        />
      </div>
      {editErr ? <p className="mt-3 text-sm text-red-600">{editErr}</p> : null}
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Link
          to={`/containers/${cid}`}
          className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 py-2 text-sm dark:border-zinc-600 dark:text-zinc-200"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={patchMut.isPending}
          className="inline-flex min-h-11 items-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-violet-500"
        >
          {patchMut.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export function ContainerEditScreen() {
  const { id } = useParams<{ id: string }>();
  const cid = id ? Number(id) : NaN;

  const containerQ = useQuery({
    queryKey: ['container', cid],
    queryFn: () => fetchJson<ContainerDetail>(`/containers/${cid}`),
    enabled: Number.isFinite(cid),
  });

  const projectsQ = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchJson<{ id: number; name: string; status: string }[]>('/projects'),
  });

  const unitsQ = useQuery({
    queryKey: ['storage-units'],
    queryFn: () => fetchJson<{ id: number; barcode: string; name: string }[]>('/storage-units'),
  });

  const data = containerQ.data;

  if (!Number.isFinite(cid)) {
    return <p className="text-red-600">Invalid container</p>;
  }

  if (containerQ.isPending) {
    return (
      <section className="rounded-2xl border p-6 dark:border-zinc-700">
        <p className="text-zinc-500">Loading…</p>
      </section>
    );
  }

  if (containerQ.isError || !data) {
    return (
      <section className="rounded-2xl border border-red-200 p-6">
        <p className="text-red-800">
          {containerQ.error instanceof Error ? containerQ.error.message : 'Not found'}
        </p>
        <Link to="/inventory" className="mt-4 inline-block text-violet-700">
          ← Inventory
        </Link>
      </section>
    );
  }

  const projects = projectsQ.data ?? [];
  const units = unitsQ.data ?? [];

  return (
    <div>
      <PageHero>
        <p className="text-sm font-medium text-violet-700 dark:text-violet-400">
          <Link to={`/containers/${cid}`} className="hover:underline">
            ← {data.name}
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Edit bin
        </h1>
        <p className="mt-1 font-mono text-sm text-zinc-500">{data.barcode}</p>
      </PageHero>
      <PageBody>
        <ContainerEditForm
          key={containerQ.dataUpdatedAt}
          cid={cid}
          data={data}
          projects={projects}
          units={units}
        />
      </PageBody>
    </div>
  );
}
