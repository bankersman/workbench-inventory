import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchJson, fetchNoContent } from '../api';
import { LabelSection } from '../components/LabelSection';

interface StorageUnitDetail {
  id: number;
  barcode: string;
  name: string;
  parentId: number | null;
  notes: string | null;
  containers: { id: number; barcode: string; name: string }[];
}

interface SuListRow {
  id: number;
  barcode: string;
  name: string;
}

export function StorageUnitDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const suId = id ? Number(id) : NaN;
  const qc = useQueryClient();
  const navigate = useNavigate();

  const unitQ = useQuery({
    queryKey: ['storage-unit', suId],
    queryFn: () => fetchJson<StorageUnitDetail>(`/storage-units/${suId}`),
    enabled: Number.isFinite(suId),
  });

  const unitsListQ = useQuery({
    queryKey: ['storage-units'],
    queryFn: () => fetchJson<SuListRow[]>('/storage-units'),
  });

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editParentId, setEditParentId] = useState<string>('');
  const [editErr, setEditErr] = useState<string | null>(null);

  const [containerOpen, setContainerOpen] = useState(false);
  const [newBinName, setNewBinName] = useState('');
  const [newBinNotes, setNewBinNotes] = useState('');
  const [binErr, setBinErr] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  const data = unitQ.data;

  const invalidate = async () => {
    await qc.invalidateQueries({ queryKey: ['storage-unit', suId] });
    await qc.invalidateQueries({ queryKey: ['storage-units'] });
  };

  const patchMut = useMutation({
    mutationFn: (body: { name?: string; notes?: string | null; parentId?: number | null }) =>
      fetchJson<StorageUnitDetail>(`/storage-units/${suId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      setEditErr(null);
      setEditing(false);
      await invalidate();
    },
    onError: (e: Error) => setEditErr(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: () => fetchNoContent(`/storage-units/${suId}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['storage-units'] });
      navigate('/inventory');
    },
    onError: (e: Error) => setDeleteErr(e.message),
  });

  const createContainerMut = useMutation({
    mutationFn: (body: { name: string; notes?: string | null; storageUnitId: number }) =>
      fetchJson<{ id: number }>('/containers', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    onSuccess: async (row) => {
      setBinErr(null);
      setContainerOpen(false);
      setNewBinName('');
      setNewBinNotes('');
      await invalidate();
      navigate(`/containers/${row.id}`);
    },
    onError: (e: Error) => setBinErr(e.message),
  });

  if (unitQ.isPending) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white/80 p-6 dark:border-zinc-700 dark:bg-zinc-900/80">
        <p className="text-zinc-500 dark:text-zinc-400">Loading…</p>
      </section>
    );
  }

  if (unitQ.isError || !data) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50/90 p-6 dark:border-red-900 dark:bg-red-950/40">
        <p className="text-red-800 dark:text-red-200">
          {unitQ.error instanceof Error ? unitQ.error.message : 'Storage unit not found'}
        </p>
        <Link
          to="/inventory"
          className="mt-4 inline-flex min-h-11 items-center font-medium text-violet-700 dark:text-violet-400"
        >
          ← Back to inventory
        </Link>
      </section>
    );
  }

  const allUnits = unitsListQ.data ?? [];
  const parentOptions = allUnits.filter((u) => u.id !== data.id);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {data.name}
          </h1>
          <p className="mt-1 font-mono text-sm text-zinc-500 dark:text-zinc-400">{data.barcode}</p>
          {data.notes ? (
            <p className="mt-2 max-w-prose text-zinc-700 dark:text-zinc-300">{data.notes}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              if (!data) {
                return;
              }
              setEditName(data.name);
              setEditNotes(data.notes ?? '');
              setEditParentId(data.parentId != null ? String(data.parentId) : '');
              setEditErr(null);
              setEditing(true);
            }}
            className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 font-medium text-zinc-800 transition hover:bg-stone-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            Edit area
          </button>
          <button
            type="button"
            onClick={() => {
              setBinErr(null);
              setContainerOpen(true);
            }}
            className="inline-flex min-h-11 items-center rounded-xl bg-violet-600 px-4 font-medium text-white shadow-sm hover:bg-violet-700 dark:bg-violet-500"
          >
            New bin
          </button>
          <button
            type="button"
            onClick={() => {
              setDeleteErr(null);
              setDeleteOpen(true);
            }}
            className="inline-flex min-h-11 items-center rounded-xl border border-red-300 px-4 font-medium text-red-800 hover:bg-red-50 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950/40"
          >
            Delete area
          </button>
        </div>
      </div>

      {editing ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="presentation"
          onClick={() => setEditing(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            role="dialog"
            aria-labelledby="edit-su-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="edit-su-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Edit storage area
            </h2>
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = editName.trim();
                if (!trimmed) {
                  setEditErr('Name is required');
                  return;
                }
                const body: {
                  name: string;
                  notes: string | null;
                  parentId: number | null;
                } = {
                  name: trimmed,
                  notes: editNotes.trim() || null,
                  parentId: editParentId === '' ? null : Number(editParentId),
                };
                patchMut.mutate(body);
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
              <div>
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
              <div>
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
              {editErr ? <p className="text-sm text-red-600 dark:text-red-400">{editErr}</p> : null}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-xl border border-stone-300 px-4 py-2 text-sm dark:border-zinc-600"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={patchMut.isPending}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-sm text-white disabled:opacity-60"
                >
                  {patchMut.isPending ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {containerOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="presentation"
          onClick={() => setContainerOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            role="dialog"
            aria-labelledby="new-bin-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="new-bin-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              New bin in {data.name}
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Creates a container here with an automatic barcode.
            </p>
            <form
              className="mt-4 space-y-4"
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
                  storageUnitId: suId,
                  ...(n ? { notes: n } : {}),
                });
              }}
            >
              <div>
                <label
                  htmlFor="bin-name"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Bin name
                </label>
                <input
                  id="bin-name"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  value={newBinName}
                  onChange={(e) => setNewBinName(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
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
              {binErr ? <p className="text-sm text-red-600 dark:text-red-400">{binErr}</p> : null}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-xl border border-stone-300 px-4 py-2 text-sm dark:border-zinc-600"
                  onClick={() => setContainerOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createContainerMut.isPending}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-sm text-white disabled:opacity-60"
                >
                  {createContainerMut.isPending ? 'Creating…' : 'Create bin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="presentation"
          onClick={() => setDeleteOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            role="dialog"
            aria-labelledby="del-su-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="del-su-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Delete this storage area?
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Bins in this area will be <strong>unassigned</strong> from this shelf (they are not
              deleted). Child areas become top-level. This cannot be undone.
            </p>
            {deleteErr ? (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{deleteErr}</p>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-stone-300 px-4 py-2 text-sm dark:border-zinc-600"
                onClick={() => setDeleteOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteMut.isPending}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60"
                onClick={() => {
                  setDeleteErr(null);
                  deleteMut.mutate();
                }}
              >
                {deleteMut.isPending ? 'Deleting…' : 'Delete area'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">Bins here</h2>
        {data.containers.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-stone-300 p-6 text-center text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
            No bins yet. Tap <strong>New bin</strong> to add one.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:divide-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/80">
            {data.containers.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/containers/${c.id}`}
                  className="flex min-h-14 flex-col gap-0.5 px-4 py-3 transition hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-zinc-800/80"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{c.name}</span>
                  <span className="font-mono text-sm text-zinc-500 dark:text-zinc-400">
                    {c.barcode}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <LabelSection entityType="storage-unit" entityId={data.id} />

      <Link
        to="/inventory"
        className="inline-flex min-h-11 items-center font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-400"
      >
        ← Inventory
      </Link>
    </section>
  );
}
