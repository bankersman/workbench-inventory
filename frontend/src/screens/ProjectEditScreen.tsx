import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchJson } from '../api';
import { PageBody, PageHero } from '../components/PageShell';

interface Project {
  id: number;
  name: string;
  status: string;
  description: string | null;
  notes: string | null;
}

const STATUSES = ['draft', 'active', 'hibernating', 'complete', 'archived'] as const;

function ProjectEditForm({ pid, data }: { pid: number; data: Project }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [editName, setEditName] = useState(data.name);
  const [editStatus, setEditStatus] = useState(data.status);
  const [editDescription, setEditDescription] = useState(data.description ?? '');
  const [editNotes, setEditNotes] = useState(data.notes ?? '');
  const [editErr, setEditErr] = useState<string | null>(null);

  const patchProject = useMutation({
    mutationFn: (
      body: Partial<{
        name: string;
        status: string;
        description: string | null;
        notes: string | null;
      }>,
    ) =>
      fetchJson<Project>(`/projects/${pid}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      setEditErr(null);
      await qc.invalidateQueries({ queryKey: ['project', pid] });
      await qc.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/projects/${pid}`);
    },
    onError: (e: Error) => setEditErr(e.message),
  });

  return (
    <form
      className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80"
      onSubmit={(e) => {
        e.preventDefault();
        patchProject.mutate({
          name: editName.trim() || data.name,
          status: editStatus,
          description: editDescription.trim() || null,
          notes: editNotes.trim() || null,
        });
      }}
    >
      <div>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
        <input
          className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
        />
      </div>
      <div className="mt-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
        <select
          className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
          value={editStatus}
          onChange={(e) => setEditStatus(e.target.value)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
        <textarea
          className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
          rows={2}
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
        />
      </div>
      <div className="mt-4">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes</label>
        <textarea
          className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
          rows={2}
          value={editNotes}
          onChange={(e) => setEditNotes(e.target.value)}
        />
      </div>
      {editErr ? <p className="mt-3 text-sm text-red-600">{editErr}</p> : null}
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Link
          to={`/projects/${pid}`}
          className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 py-2 text-sm dark:border-zinc-600 dark:text-zinc-200"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={patchProject.isPending}
          className="inline-flex min-h-11 items-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-violet-500"
        >
          {patchProject.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}

export function ProjectEditScreen() {
  const { id } = useParams<{ id: string }>();
  const pid = id ? Number(id) : NaN;

  const projectQ = useQuery({
    queryKey: ['project', pid],
    queryFn: () => fetchJson<Project>(`/projects/${pid}`),
    enabled: Number.isFinite(pid),
  });

  const data = projectQ.data;

  if (!Number.isFinite(pid)) {
    return <p className="text-red-600">Invalid project</p>;
  }

  if (projectQ.isPending) {
    return (
      <section className="rounded-2xl border p-6 dark:border-zinc-700">
        <p className="text-zinc-500">Loading…</p>
      </section>
    );
  }

  if (projectQ.isError || !data) {
    return (
      <section className="rounded-2xl border border-red-200 p-6">
        <p className="text-red-800">
          {projectQ.error instanceof Error ? projectQ.error.message : 'Not found'}
        </p>
        <Link to="/projects" className="mt-4 inline-block text-violet-700">
          ← Projects
        </Link>
      </section>
    );
  }

  return (
    <div>
      <PageHero>
        <p className="text-sm font-medium text-violet-700 dark:text-violet-400">
          <Link to={`/projects/${pid}`} className="hover:underline">
            ← {data.name}
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Edit project
        </h1>
      </PageHero>
      <PageBody>
        <ProjectEditForm key={projectQ.dataUpdatedAt} pid={pid} data={data} />
      </PageBody>
    </div>
  );
}
