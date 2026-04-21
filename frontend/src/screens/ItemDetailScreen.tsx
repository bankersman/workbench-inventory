import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchJson, fetchNoContent } from '../api';
import { PageBody, PageHero, SectionCard } from '../components/PageShell';

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

export function ItemDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const itemId = id ? Number(id) : NaN;
  const qc = useQueryClient();
  const navigate = useNavigate();

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

  const deleteMut = useMutation({
    mutationFn: () => fetchNoContent(`/items/${itemId}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['items'] });
      navigate('/items');
    },
    onError: (e: Error) => setDeleteErr(e.message),
  });

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

  return (
    <div>
      <PageHero>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {item.name}
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
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
              <p className="mt-2 max-w-prose text-zinc-700 dark:text-zinc-300">
                {item.description}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/items/${itemId}/adjust`}
              className="inline-flex min-h-11 items-center rounded-xl bg-violet-600 px-4 font-medium text-white hover:bg-violet-700 dark:bg-violet-500"
            >
              Adjust quantity
            </Link>
            <Link
              to={`/items/${itemId}/edit`}
              className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 font-medium text-zinc-800 dark:border-zinc-600 dark:text-zinc-200"
            >
              Edit
            </Link>
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
      </PageHero>

      <PageBody>
        <SectionCard title="Availability">
          {availQ.isPending ? (
            <p className="text-zinc-500">Loading availability…</p>
          ) : availQ.isError ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              {availQ.error instanceof Error ? availQ.error.message : 'Availability failed'}
            </p>
          ) : avail ? (
            <ul className="space-y-2 text-zinc-800 dark:text-zinc-200">
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
        </SectionCard>

        <SectionCard title="Location & notes">
          {item.container ? (
            <p>
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
            <p className="text-zinc-600 dark:text-zinc-400">Container #{item.containerId}</p>
          )}
          {item.category ? (
            <p className="mt-2 text-zinc-700 dark:text-zinc-300">Category: {item.category.name}</p>
          ) : null}
          {item.notes ? (
            <p className="mt-2 text-zinc-700 dark:text-zinc-300">{item.notes}</p>
          ) : null}
        </SectionCard>

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
                This removes the catalog entry. If the database blocks it (for example BOM lines),
                you will see an error.
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

        <Link
          to="/items"
          className="inline-flex min-h-11 items-center font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-400"
        >
          ← Parts
        </Link>
      </PageBody>
    </div>
  );
}
