import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchJson, fetchNoContent } from '../api';
import { LabelSection } from '../components/LabelSection';
import { PageBody, PageHero, SectionCard } from '../components/PageShell';

interface ContainerDetail {
  id: number;
  barcode: string;
  name: string;
  storageUnitId: number | null;
  projectId: number | null;
  notes: string | null;
  storageUnit: { id: number; barcode: string; name: string } | null;
  project: { id: number; name: string; status: string } | null;
}

export function ContainerDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const cid = id ? Number(id) : NaN;
  const qc = useQueryClient();
  const navigate = useNavigate();

  const containerQ = useQuery({
    queryKey: ['container', cid],
    queryFn: () => fetchJson<ContainerDetail>(`/containers/${cid}`),
    enabled: Number.isFinite(cid),
  });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  const data = containerQ.data;

  const deleteMut = useMutation({
    mutationFn: () => fetchNoContent(`/containers/${cid}`, { method: 'DELETE' }),
    onSuccess: async () => {
      const prev = qc.getQueryData<ContainerDetail>(['container', cid]);
      const back = prev?.storageUnitId;
      await qc.invalidateQueries({ queryKey: ['storage-units'] });
      await qc.invalidateQueries({ queryKey: ['storage-unit'] });
      await qc.removeQueries({ queryKey: ['container', cid] });
      if (back != null) {
        navigate(`/storage-units/${back}`);
      } else {
        navigate('/inventory');
      }
    },
    onError: (e: Error) => setDeleteErr(e.message),
  });

  if (containerQ.isPending) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white/80 p-6 dark:border-zinc-700 dark:bg-zinc-900/80">
        <p className="text-zinc-500 dark:text-zinc-400">Loading…</p>
      </section>
    );
  }

  if (containerQ.isError || !data) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50/90 p-6 dark:border-red-900 dark:bg-red-950/40">
        <p className="text-red-800 dark:text-red-200">
          {containerQ.error instanceof Error ? containerQ.error.message : 'Container not found'}
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
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/containers/${cid}/edit`}
              className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 font-medium text-zinc-800 hover:bg-stone-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              Edit bin
            </Link>
            <button
              type="button"
              onClick={() => {
                setDeleteErr(null);
                setDeleteOpen(true);
              }}
              className="inline-flex min-h-11 items-center rounded-xl border border-red-300 px-4 font-medium text-red-800 hover:bg-red-50 dark:border-red-800 dark:text-red-200 dark:hover:bg-red-950/40"
            >
              Delete bin
            </button>
          </div>
        </div>
      </PageHero>

      <PageBody>
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/items?containerId=${data.id}`}
            className="inline-flex min-h-11 items-center rounded-xl border border-violet-300 bg-violet-50 px-4 font-medium text-violet-900 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-100"
          >
            Parts in this bin
          </Link>
          <Link
            to={`/items/new?containerId=${data.id}`}
            className="inline-flex min-h-11 items-center rounded-xl bg-violet-600 px-4 font-medium text-white hover:bg-violet-700 dark:bg-violet-500"
          >
            Add part here
          </Link>
        </div>

        <SectionCard title="Location">
          {data.storageUnit ? (
            <p className="text-zinc-900 dark:text-zinc-100">
              Storage:{' '}
              <Link
                className="font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-400"
                to={`/storage-units/${data.storageUnit.id}`}
              >
                {data.storageUnit.name}
              </Link>
              <span className="ml-2 font-mono text-sm text-zinc-500 dark:text-zinc-400">
                {data.storageUnit.barcode}
              </span>
            </p>
          ) : (
            <p className="text-zinc-600 dark:text-zinc-400">Not assigned to a storage area.</p>
          )}
          {data.project ? (
            <p className="mt-2 text-zinc-900 dark:text-zinc-100">
              Linked project:{' '}
              <Link
                className="font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-400"
                to={`/projects/${data.project.id}`}
              >
                {data.project.name}
              </Link>
              <span className="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                {data.project.status}
              </span>
            </p>
          ) : (
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">No project link.</p>
          )}
          {data.notes ? (
            <p className="mt-3 text-zinc-700 dark:text-zinc-300">{data.notes}</p>
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
              aria-labelledby="del-bin-title"
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                id="del-bin-title"
                className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
              >
                Delete this bin?
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                You can only delete a bin if <strong>no parts</strong> are stored in it. If delete
                fails, move or remove stock first.
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
                  {deleteMut.isPending ? 'Deleting…' : 'Delete bin'}
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <LabelSection entityType="container" entityId={data.id} />

        <div className="flex flex-wrap gap-4">
          {data.storageUnit ? (
            <Link
              to={`/storage-units/${data.storageUnit.id}`}
              className="inline-flex min-h-11 items-center font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-400"
            >
              ← {data.storageUnit.name}
            </Link>
          ) : (
            <Link
              to="/inventory"
              className="inline-flex min-h-11 items-center font-medium text-violet-700 underline-offset-4 hover:underline dark:text-violet-400"
            >
              ← Inventory
            </Link>
          )}
        </div>
      </PageBody>
    </div>
  );
}
