import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchJson } from '../api';
import { PageBody, PageHero } from '../components/PageShell';

interface StorageUnitDetail {
  id: number;
  name: string;
}

export function ContainerCreateScreen() {
  const { id } = useParams<{ id: string }>();
  const suId = id ? Number(id) : NaN;
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [newBinName, setNewBinName] = useState('');
  const [newBinNotes, setNewBinNotes] = useState('');
  const [binErr, setBinErr] = useState<string | null>(null);

  const unitQ = useQuery({
    queryKey: ['storage-unit', suId],
    queryFn: () => fetchJson<StorageUnitDetail>(`/storage-units/${suId}`),
    enabled: Number.isFinite(suId),
  });

  const createContainerMut = useMutation({
    mutationFn: (body: { name: string; notes?: string | null; storageUnitId: number }) =>
      fetchJson<{ id: number }>('/containers', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async (row) => {
      setBinErr(null);
      await qc.invalidateQueries({ queryKey: ['storage-unit', suId] });
      await qc.invalidateQueries({ queryKey: ['storage-units'] });
      navigate(`/containers/${row.id}`);
    },
    onError: (e: Error) => setBinErr(e.message),
  });

  if (!Number.isFinite(suId)) {
    return <p className="text-red-600">Invalid storage unit</p>;
  }

  if (unitQ.isPending) {
    return (
      <section className="rounded-2xl border border-stone-200 p-6 dark:border-zinc-700">
        <p className="text-zinc-500">Loading…</p>
      </section>
    );
  }

  if (unitQ.isError || !unitQ.data) {
    return (
      <section className="rounded-2xl border border-red-200 p-6 dark:border-red-900">
        <p className="text-red-800">
          {unitQ.error instanceof Error ? unitQ.error.message : 'Not found'}
        </p>
        <Link to="/inventory" className="mt-4 inline-block text-violet-700">
          ← Inventory
        </Link>
      </section>
    );
  }

  const unit = unitQ.data;

  return (
    <div>
      <PageHero>
        <p className="text-sm font-medium text-violet-700 dark:text-violet-400">
          <Link to={`/storage-units/${suId}`} className="hover:underline">
            ← {unit.name}
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          New bin
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Creates a container with a barcode in this storage area.
        </p>
      </PageHero>
      <PageBody>
        <form
          className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = newBinName.trim();
            if (!trimmed) {
              setBinErr('Name is required');
              return;
            }
            const n = newBinNotes.trim();
            createContainerMut.mutate({
              name: trimmed,
              notes: n || null,
              storageUnitId: suId,
            });
          }}
        >
          <div>
            <label
              htmlFor="bin-name"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Name
            </label>
            <input
              id="bin-name"
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              value={newBinName}
              onChange={(e) => setNewBinName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="mt-4">
            <label
              htmlFor="bin-notes"
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Notes
            </label>
            <textarea
              id="bin-notes"
              rows={2}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              value={newBinNotes}
              onChange={(e) => setNewBinNotes(e.target.value)}
            />
          </div>
          {binErr ? <p className="mt-3 text-sm text-red-600">{binErr}</p> : null}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Link
              to={`/storage-units/${suId}`}
              className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 py-2 text-sm dark:border-zinc-600 dark:text-zinc-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createContainerMut.isPending}
              className="inline-flex min-h-11 items-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-violet-500"
            >
              {createContainerMut.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </PageBody>
    </div>
  );
}
