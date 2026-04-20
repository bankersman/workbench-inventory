import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchJson, fetchNoContent } from '../api';

interface ItemDetail {
  id: number;
  name: string;
  description: string | null;
  quantity: number;
  unit: string;
  barcode: string | null;
  containerId: number;
  categoryId: number | null;
  minQty: number | null;
  reorderQty: number | null;
  notes: string | null;
  attributes: Record<string, string | number | null>;
  category?: { id: number; name: string } | null;
  container?: { id: number; barcode: string; name: string };
}

interface Availability {
  quantity: number;
  inWarehouse: number;
  totalReserved: number;
  effectivelyFree: number;
}

interface CategoryRow {
  id: number;
  name: string;
}

interface ContainerRow {
  id: number;
  barcode: string;
  name: string;
}

interface AdjustResult {
  previousQuantity: number;
  newQuantity: number;
  delta: number;
  reason: string;
}

export function ItemDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const itemId = id ? Number(id) : NaN;
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [delta, setDelta] = useState('0');
  const [reason, setReason] = useState('');
  const [adjustErr, setAdjustErr] = useState<string | null>(null);
  const [adjustSuccess, setAdjustSuccess] = useState<AdjustResult | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editBarcode, setEditBarcode] = useState('');
  const [editContainerId, setEditContainerId] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editMinQty, setEditMinQty] = useState('');
  const [editReorderQty, setEditReorderQty] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editErr, setEditErr] = useState<string | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  const itemQ = useQuery({
    queryKey: ['item', itemId],
    queryFn: () => fetchJson<ItemDetail>(`/items/${itemId}`),
    enabled: Number.isFinite(itemId),
  });

  const availQ = useQuery({
    queryKey: ['availability', itemId],
    queryFn: () => fetchJson<Availability>(`/availability/items/${itemId}`),
    enabled: Number.isFinite(itemId),
  });

  const categoriesQ = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchJson<CategoryRow[]>('/categories'),
  });

  const containersQ = useQuery({
    queryKey: ['containers'],
    queryFn: () => fetchJson<ContainerRow[]>('/containers'),
  });

  const invalidateItem = async () => {
    await qc.invalidateQueries({ queryKey: ['item', itemId] });
    await qc.invalidateQueries({ queryKey: ['availability', itemId] });
    await qc.invalidateQueries({ queryKey: ['items'] });
  };

  const adjustMut = useMutation({
    mutationFn: (body: { delta: number; reason: string }) =>
      fetchJson<{ previousQuantity: number; newQuantity: number; delta: number; reason: string }>(
        `/items/${itemId}/adjust-quantity`,
        { method: 'POST', body: JSON.stringify(body) },
      ),
    onSuccess: async (res) => {
      setAdjustErr(null);
      setAdjustSuccess({
        previousQuantity: res.previousQuantity,
        newQuantity: res.newQuantity,
        delta: res.delta,
        reason: res.reason,
      });
      setAdjustOpen(false);
      setDelta('0');
      setReason('');
      await invalidateItem();
    },
    onError: (e: Error) => setAdjustErr(e.message),
  });

  const patchMut = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      fetchJson<ItemDetail>(`/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      setEditErr(null);
      setEditOpen(false);
      await invalidateItem();
    },
    onError: (e: Error) => setEditErr(e.message),
  });

  const deleteMut = useMutation({
    mutationFn: () => fetchNoContent(`/items/${itemId}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['items'] });
      navigate('/items');
    },
    onError: (e: Error) => setDeleteErr(e.message),
  });

  const openEdit = () => {
    const d = itemQ.data;
    if (!d) {
      return;
    }
    setEditName(d.name);
    setEditDescription(d.description ?? '');
    setEditUnit(d.unit);
    setEditBarcode(d.barcode ?? '');
    setEditContainerId(String(d.containerId));
    setEditCategoryId(d.categoryId != null ? String(d.categoryId) : '');
    setEditMinQty(d.minQty != null ? String(d.minQty) : '');
    setEditReorderQty(d.reorderQty != null ? String(d.reorderQty) : '');
    setEditNotes(d.notes ?? '');
    setEditErr(null);
    setEditOpen(true);
  };

  const openAdjust = () => {
    setAdjustErr(null);
    setAdjustSuccess(null);
    setDelta('0');
    setReason('');
    setAdjustOpen(true);
  };

  if (itemQ.isPending) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white/80 p-6 dark:border-zinc-700 dark:bg-zinc-900/80">
        <p className="text-zinc-500">Loading…</p>
      </section>
    );
  }

  if (itemQ.isError || !itemQ.data) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50/90 p-6 dark:border-red-900 dark:bg-red-950/40">
        <p className="text-red-800 dark:text-red-200">
          {itemQ.error instanceof Error ? itemQ.error.message : 'Part not found'}
        </p>
        <Link
          to="/items"
          className="mt-4 inline-flex font-medium text-violet-700 dark:text-violet-400"
        >
          ← Parts
        </Link>
      </section>
    );
  }

  const item = itemQ.data;
  const avail = availQ.data;
  const categories = categoriesQ.data ?? [];
  const containers = containersQ.data ?? [];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {item.name}
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {item.quantity} {item.unit}
            </span>
            {item.barcode ? (
              <span className="ml-2 font-mono text-sm text-zinc-500 dark:text-zinc-400">
                {item.barcode}
              </span>
            ) : null}
          </p>
          {item.description ? (
            <p className="mt-2 max-w-prose text-zinc-700 dark:text-zinc-300">{item.description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openAdjust}
            className="inline-flex min-h-11 items-center rounded-xl bg-violet-600 px-4 font-medium text-white hover:bg-violet-700 dark:bg-violet-500"
          >
            Adjust quantity
          </button>
          <button
            type="button"
            onClick={openEdit}
            className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 font-medium text-zinc-800 dark:border-zinc-600 dark:text-zinc-200"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              setDeleteErr(null);
              setDeleteOpen(true);
            }}
            className="inline-flex min-h-11 items-center rounded-xl border border-red-300 px-4 font-medium text-red-800 dark:border-red-800 dark:text-red-200"
          >
            Delete
          </button>
        </div>
      </div>

      {adjustSuccess ? (
        <p
          className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
          role="status"
        >
          Updated count: <strong>{adjustSuccess.previousQuantity}</strong> →{' '}
          <strong>{adjustSuccess.newQuantity}</strong>
          {adjustSuccess.delta >= 0 ? ' (+' : ' ('}
          {adjustSuccess.delta}
          {adjustSuccess.delta >= 0 ? ')' : ')'} — {adjustSuccess.reason}
        </p>
      ) : null}

      <div className="rounded-2xl border border-stone-200 bg-white/90 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Availability
        </h2>
        {availQ.isPending ? (
          <p className="mt-2 text-zinc-500">Loading availability…</p>
        ) : availQ.isError ? (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {availQ.error instanceof Error ? availQ.error.message : 'Availability failed'}
          </p>
        ) : avail ? (
          <ul className="mt-3 space-y-1 text-zinc-800 dark:text-zinc-200">
            <li>
              In warehouse: <strong>{avail.inWarehouse}</strong>
            </li>
            <li>
              Reserved on BOMs: <strong>{avail.totalReserved}</strong>
            </li>
            <li>
              Free to assign: <strong>{avail.effectivelyFree}</strong>
            </li>
          </ul>
        ) : null}
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white/90 p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80">
        <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Location
        </h2>
        {item.container ? (
          <p className="mt-2">
            <Link
              className="font-medium text-violet-700 hover:underline dark:text-violet-400"
              to={`/containers/${item.container.id}`}
            >
              {item.container.name}
            </Link>
            <span className="ml-2 font-mono text-sm text-zinc-500 dark:text-zinc-400">
              {item.container.barcode}
            </span>
          </p>
        ) : (
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">Container #{item.containerId}</p>
        )}
        {item.category ? (
          <p className="mt-2 text-zinc-700 dark:text-zinc-300">Category: {item.category.name}</p>
        ) : null}
        {item.notes ? <p className="mt-2 text-zinc-700 dark:text-zinc-300">{item.notes}</p> : null}
      </div>

      {adjustOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="presentation"
          onClick={() => setAdjustOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            role="dialog"
            aria-labelledby="adj-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="adj-title" className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Adjust quantity
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Current on hand: <strong>{item.quantity}</strong> {item.unit}. Enter a positive or
              negative change (e.g. −2 after a count).
            </p>
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const r = reason.trim();
                if (!r) {
                  setAdjustErr('Reason is required');
                  return;
                }
                const d = Number(delta);
                if (!Number.isFinite(d) || !Number.isInteger(d)) {
                  setAdjustErr('Enter a whole number change');
                  return;
                }
                const next = item.quantity + d;
                if (next < 0) {
                  setAdjustErr('Result cannot be negative');
                  return;
                }
                setAdjustErr(null);
                adjustMut.mutate({ delta: d, reason: r });
              }}
            >
              <div>
                <label
                  htmlFor="adj-d"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Change (delta)
                </label>
                <input
                  id="adj-d"
                  type="number"
                  step={1}
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  value={delta}
                  onChange={(e) => setDelta(e.target.value)}
                />
                <p className="mt-1 text-xs text-zinc-500">
                  New total will be{' '}
                  <strong>
                    {item.quantity + (Number.isFinite(Number(delta)) ? Number(delta) : 0)}
                  </strong>{' '}
                  {item.unit}
                </p>
              </div>
              <div>
                <label
                  htmlFor="adj-r"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Reason
                </label>
                <input
                  id="adj-r"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Physical count, pull for build, …"
                />
              </div>
              {adjustErr ? (
                <p className="text-sm text-red-600 dark:text-red-400">{adjustErr}</p>
              ) : null}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-xl border border-stone-300 px-4 py-2 text-sm dark:border-zinc-600"
                  onClick={() => setAdjustOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustMut.isPending}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-sm text-white disabled:opacity-60"
                >
                  {adjustMut.isPending ? 'Saving…' : 'Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="presentation"
          onClick={() => setEditOpen(false)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-stone-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            role="dialog"
            aria-labelledby="edit-item-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="edit-item-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Edit part
            </h2>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = editName.trim();
                if (!trimmed) {
                  setEditErr('Name is required');
                  return;
                }
                if (editContainerId === '') {
                  setEditErr('Bin is required');
                  return;
                }
                const body: Record<string, unknown> = {
                  name: trimmed,
                  unit: editUnit.trim() || 'ea',
                  description: editDescription.trim() || null,
                  barcode: editBarcode.trim() || null,
                  notes: editNotes.trim() || null,
                  containerId: Number(editContainerId),
                  categoryId: editCategoryId === '' ? null : Number(editCategoryId),
                };
                const mn = editMinQty.trim();
                const rq = editReorderQty.trim();
                body.minQty = mn === '' ? null : Number(mn);
                body.reorderQty = rq === '' ? null : Number(rq);
                setEditErr(null);
                patchMut.mutate(body);
              }}
            >
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
                <input
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Unit</label>
                <input
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  value={editUnit}
                  onChange={(e) => setEditUnit(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Description
                </label>
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Bin</label>
                <select
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  value={editContainerId}
                  onChange={(e) => setEditContainerId(e.target.value)}
                >
                  {containers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.barcode})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Category
                </label>
                <select
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
                >
                  <option value="">— None —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Min qty
                  </label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    value={editMinQty}
                    onChange={(e) => setEditMinQty(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Reorder qty
                  </label>
                  <input
                    type="number"
                    className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                    value={editReorderQty}
                    onChange={(e) => setEditReorderQty(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Barcode
                </label>
                <input
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  value={editBarcode}
                  onChange={(e) => setEditBarcode(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Notes
                </label>
                <textarea
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
                  onClick={() => setEditOpen(false)}
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

      {deleteOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="presentation"
          onClick={() => setDeleteOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            role="dialog"
            aria-labelledby="del-item-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="del-item-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Delete this part?
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              This removes the catalog entry. If the database blocks it (for example BOM lines), you
              will see an error.
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
                {deleteMut.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-4">
        <Link
          to="/items"
          className="inline-flex min-h-11 items-center font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-400"
        >
          ← Parts
        </Link>
      </div>
    </section>
  );
}
