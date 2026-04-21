import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchJson } from '../api';
import { PageBody, PageHero } from '../components/PageShell';

interface StorageUnitDetail {
  id: number;
  barcode: string;
  name: string;
  parentId: number | null;
  notes: string | null;
}

interface SuListRow {
  id: number;
  barcode: string;
  name: string;
}

function StorageUnitEditForm({
  suId,
  data,
  parentOptions,
}: {
  suId: number;
  data: StorageUnitDetail;
  parentOptions: SuListRow[];
}) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [editName, setEditName] = useState(data.name);
  const [editNotes, setEditNotes] = useState(data.notes ?? '');
  const [editParentId, setEditParentId] = useState(
    data.parentId != null ? String(data.parentId) : '',
  );
  const [editErr, setEditErr] = useState<string | null>(null);

  const patchMut = useMutation({
    mutationFn: (body: { name?: string; notes?: string | null; parentId?: number | null }) =>
      fetchJson<StorageUnitDetail>(`/storage-units/${suId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      setEditErr(null);
      await qc.invalidateQueries({ queryKey: ['storage-unit', suId] });
      await qc.invalidateQueries({ queryKey: ['storage-units'] });
      navigate(`/storage-units/${suId}`);
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
          parentId: editParentId === '' ? null : Number(editParentId),
        });
      }}
    >
      <div>
        <label
          htmlFor="edit-su-name"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Name
        </label>
        <input
          id="edit-su-name"
          className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
        />
      </div>
      <div className="mt-4">
        <label
          htmlFor="edit-su-parent"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Inside (optional)
        </label>
        <select
          id="edit-su-parent"
          className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          value={editParentId}
          onChange={(e) => setEditParentId(e.target.value)}
        >
          <option value="">— Top level —</option>
          {parentOptions.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4">
        <label
          htmlFor="edit-su-notes"
          className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Notes
        </label>
        <textarea
          id="edit-su-notes"
          rows={2}
          className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
          value={editNotes}
          onChange={(e) => setEditNotes(e.target.value)}
        />
      </div>
      {editErr ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{editErr}</p> : null}
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <Link
          to={`/storage-units/${suId}`}
          className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium dark:border-zinc-600 dark:text-zinc-200"
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

export function StorageUnitEditScreen() {
  const { id } = useParams<{ id: string }>();
  const suId = id ? Number(id) : NaN;

  const unitQ = useQuery({
    queryKey: ['storage-unit', suId],
    queryFn: () => fetchJson<StorageUnitDetail>(`/storage-units/${suId}`),
    enabled: Number.isFinite(suId),
  });

  const unitsListQ = useQuery({
    queryKey: ['storage-units'],
    queryFn: () => fetchJson<SuListRow[]>('/storage-units'),
  });

  const data = unitQ.data;

  if (!Number.isFinite(suId)) {
    return <p className="text-red-600">Invalid storage unit</p>;
  }

  if (unitQ.isPending) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white/80 p-6 dark:border-zinc-700 dark:bg-zinc-900/80">
        <p className="text-zinc-500">Loading…</p>
      </section>
    );
  }

  if (unitQ.isError || !data) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50/90 p-6 dark:border-red-900 dark:bg-red-950/40">
        <p className="text-red-800 dark:text-red-200">
          {unitQ.error instanceof Error ? unitQ.error.message : 'Not found'}
        </p>
        <Link to="/inventory" className="mt-4 inline-block text-violet-700 dark:text-violet-400">
          ← Inventory
        </Link>
      </section>
    );
  }

  const allUnits = unitsListQ.data ?? [];
  const parentOptions = allUnits.filter((u) => u.id !== data.id);

  return (
    <div>
      <PageHero>
        <p className="text-sm font-medium text-violet-700 dark:text-violet-400">
          <Link to={`/storage-units/${suId}`} className="hover:underline">
            ← {data.name}
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Edit storage area
        </h1>
        <p className="mt-1 font-mono text-sm text-zinc-500 dark:text-zinc-400">{data.barcode}</p>
      </PageHero>
      <PageBody>
        <StorageUnitEditForm
          key={unitQ.dataUpdatedAt}
          suId={suId}
          data={data}
          parentOptions={parentOptions}
        />
      </PageBody>
    </div>
  );
}
