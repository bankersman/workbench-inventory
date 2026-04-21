import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchJson } from '../api';
import { PageBody, PageHero } from '../components/PageShell';

interface Project {
  id: number;
  name: string;
}

export function BomLineCreateScreen() {
  const { id } = useParams<{ id: string }>();
  const pid = id ? Number(id) : NaN;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [newItemId, setNewItemId] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newLineNotes, setNewLineNotes] = useState('');
  const [err, setErr] = useState<string | null>(null);

  const projectQ = useQuery({
    queryKey: ['project', pid],
    queryFn: () => fetchJson<Project>(`/projects/${pid}`),
    enabled: Number.isFinite(pid),
  });

  const addLine = useMutation({
    mutationFn: (body: { itemId: number; quantityRequired: number; notes?: string | null }) =>
      fetchJson(`/projects/${pid}/bom`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: async () => {
      setErr(null);
      await qc.invalidateQueries({ queryKey: ['project', pid] });
      await qc.invalidateQueries({ queryKey: ['project', pid, 'bom-availability'] });
      navigate(`/projects/${pid}`);
    },
    onError: (e: Error) => setErr(e.message),
  });

  if (!Number.isFinite(pid)) {
    return <p className="text-red-600">Invalid project</p>;
  }

  if (projectQ.isPending) {
    return (
      <section className="rounded-2xl border p-6">
        <p className="text-zinc-500">Loading…</p>
      </section>
    );
  }

  if (projectQ.isError || !projectQ.data) {
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

  const project = projectQ.data;

  return (
    <div>
      <PageHero>
        <p className="text-sm font-medium text-violet-700 dark:text-violet-400">
          <Link to={`/projects/${pid}`} className="hover:underline">
            ← {project.name}
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Add BOM line
        </h1>
      </PageHero>
      <PageBody>
        <form
          className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80"
          onSubmit={(e) => {
            e.preventDefault();
            const itemId = Number(newItemId);
            const qty = Number(newQty);
            if (!Number.isInteger(itemId) || itemId < 1) {
              setErr('Enter a valid item ID');
              return;
            }
            if (!Number.isFinite(qty) || qty < 1) {
              setErr('Enter a quantity of at least 1');
              return;
            }
            setErr(null);
            addLine.mutate({
              itemId,
              quantityRequired: Math.floor(qty),
              notes: newLineNotes.trim() || null,
            });
          }}
        >
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Item ID
            </label>
            <input
              className="mt-1 w-full max-w-xs rounded-xl border border-stone-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
              inputMode="numeric"
              value={newItemId}
              onChange={(e) => setNewItemId(e.target.value)}
              placeholder="e.g. 12"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Qty required
            </label>
            <input
              className="mt-1 w-full max-w-xs rounded-xl border border-stone-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
              inputMode="numeric"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Notes (optional)
            </label>
            <input
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
              value={newLineNotes}
              onChange={(e) => setNewLineNotes(e.target.value)}
            />
          </div>
          {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Link
              to={`/projects/${pid}`}
              className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 py-2 text-sm dark:border-zinc-600 dark:text-zinc-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={addLine.isPending}
              className="inline-flex min-h-11 items-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-violet-500"
            >
              {addLine.isPending ? 'Adding…' : 'Add line'}
            </button>
          </div>
        </form>
      </PageBody>
    </div>
  );
}
