import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchJson, fetchNoContent } from '../api';
import { LabelSection } from '../components/LabelSection';
import { PageBody, PageHero, SectionCard } from '../components/PageShell';

interface StorageUnitDetail {
  id: number;
  barcode: string;
  name: string;
  parentId: number | null;
  notes: string | null;
  containers: { id: number; barcode: string; name: string }[];
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

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  const data = unitQ.data;

  const deleteMut = useMutation({
    mutationFn: () => fetchNoContent(`/storage-units/${suId}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['storage-units'] });
      navigate('/inventory');
    },
    onError: (e: Error) => setDeleteErr(e.message),
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

  return (
    <div>
      <PageHero>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              {data.name}
            </h1>
            <p className="mt-1 font-mono text-sm text-zinc-500 dark:text-zinc-400">
              {data.barcode}
            </p>
            {data.notes ? (
              <p className="mt-2 max-w-prose text-zinc-700 dark:text-zinc-300">{data.notes}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/storage-units/${suId}/edit`}
              className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 font-medium text-zinc-800 transition hover:bg-stone-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Edit area
            </Link>
            <Link
              to={`/storage-units/${suId}/containers/new`}
              className="inline-flex min-h-11 items-center rounded-xl bg-violet-600 px-4 font-medium text-white shadow-sm hover:bg-violet-700 dark:bg-violet-500"
            >
              New bin
            </Link>
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
      </PageHero>

      <PageBody>
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
              <h2
                id="del-su-title"
                className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
              >
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

        <SectionCard title="Bins here">
          {data.containers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
              No bins yet. Use <strong>New bin</strong> to add one.
            </p>
          ) : (
            <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 dark:divide-zinc-700 dark:border-zinc-700">
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
        </SectionCard>

        <LabelSection entityType="storage-unit" entityId={data.id} />

        <Link
          to="/inventory"
          className="inline-flex min-h-11 items-center font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-400"
        >
          ← Inventory
        </Link>
      </PageBody>
    </div>
  );
}
