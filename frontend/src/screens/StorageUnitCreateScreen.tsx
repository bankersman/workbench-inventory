import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { fetchJson } from '../api';
import { PageBody, PageHero } from '../components/PageShell';

interface SuRow {
  id: number;
  barcode: string;
  name: string;
}

export function StorageUnitCreateScreen() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [createErr, setCreateErr] = useState<string | null>(null);

  const unitsQ = useQuery({
    queryKey: ['storage-units'],
    queryFn: () => fetchJson<SuRow[]>('/storage-units'),
  });

  const createMut = useMutation({
    mutationFn: (body: { name: string; notes?: string | null; parentId?: number | null }) =>
      fetchJson<SuRow>('/storage-units', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async (row) => {
      setCreateErr(null);
      await qc.invalidateQueries({ queryKey: ['storage-units'] });
      navigate(`/storage-units/${row.id}`);
    },
    onError: (e: Error) => setCreateErr(e.message),
  });

  const units = unitsQ.data ?? [];

  return (
    <div>
      <PageHero>
        <p className="text-sm font-medium text-violet-700 dark:text-violet-400">
          <Link to="/inventory" className="hover:underline">
            ← Inventory
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          New storage area
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          A shelf, wall, or zone. You get a scannable barcode automatically.
        </p>
      </PageHero>
      <PageBody>
        <form
          className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80"
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = name.trim();
            if (!trimmed) {
              setCreateErr('Name is required');
              return;
            }
            const n = notes.trim();
            const body: { name: string; notes?: string | null; parentId?: number | null } = {
              name: trimmed,
            };
            if (n) {
              body.notes = n;
            }
            if (parentId !== '') {
              body.parentId = Number(parentId);
            }
            createMut.mutate(body);
          }}
        >
          <div>
            <label
              htmlFor="su-name"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Name
            </label>
            <input
              id="su-name"
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="mt-4">
            <label
              htmlFor="su-parent"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Inside (optional)
            </label>
            <select
              id="su-parent"
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">— Top level —</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <label
              htmlFor="su-notes"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Notes
            </label>
            <textarea
              id="su-notes"
              rows={2}
              className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-zinc-900 shadow-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
            />
          </div>
          {createErr ? (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{createErr}</p>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Link
              to="/inventory"
              className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:text-zinc-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMut.isPending}
              className="inline-flex min-h-11 items-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60 dark:bg-violet-500"
            >
              {createMut.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </PageBody>
    </div>
  );
}
