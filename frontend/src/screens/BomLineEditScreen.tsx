import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { fetchJson } from '../api';
import { PageBody, PageHero } from '../components/PageShell';

interface Project {
  id: number;
  name: string;
}

interface BomAvailabilityRow {
  line: {
    id: number;
    itemId: number;
    quantityRequired: number;
    quantityPulled: number;
    quantityInstalled: number;
    notes: string | null;
    item?: { id: number; name: string } | null;
  };
  stillNeeded: number;
}

export function BomLineEditScreen() {
  const { id, lineId } = useParams<{ id: string; lineId: string }>();
  const pid = id ? Number(id) : NaN;
  const lid = lineId ? Number(lineId) : NaN;
  const qc = useQueryClient();
  const navigate = useNavigate();

  const projectQ = useQuery({
    queryKey: ['project', pid],
    queryFn: () => fetchJson<Project>(`/projects/${pid}`),
    enabled: Number.isFinite(pid),
  });

  const bomQ = useQuery({
    queryKey: ['project', pid, 'bom-availability'],
    queryFn: () => fetchJson<BomAvailabilityRow[]>(`/projects/${pid}/bom/availability`),
    enabled: Number.isFinite(pid),
  });

  const lineRow = (bomQ.data ?? []).find((r) => r.line.id === lid);
  const lineEdit = lineRow?.line;

  const patchLine = useMutation({
    mutationFn: (args: { lineId: number; body: Record<string, unknown> }) =>
      fetchJson(`/projects/${pid}/bom/${args.lineId}`, {
        method: 'PATCH',
        body: JSON.stringify(args.body),
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['project', pid] });
      await qc.invalidateQueries({ queryKey: ['project', pid, 'bom-availability'] });
      navigate(`/projects/${pid}`);
    },
  });

  if (!Number.isFinite(pid) || !Number.isFinite(lid)) {
    return <p className="text-red-600">Invalid route</p>;
  }

  if (projectQ.isPending || bomQ.isPending) {
    return (
      <section className="rounded-2xl border p-6">
        <p className="text-zinc-500">Loading…</p>
      </section>
    );
  }

  if (projectQ.isError || !projectQ.data) {
    return (
      <section className="rounded-2xl border border-red-200 p-6">
        <p className="text-red-800">Project not found</p>
        <Link to="/projects" className="mt-4 inline-block text-violet-700">
          ← Projects
        </Link>
      </section>
    );
  }

  if (bomQ.isError || !lineEdit) {
    return (
      <section className="rounded-2xl border border-red-200 p-6">
        <p className="text-red-800">
          {bomQ.isError
            ? bomQ.error instanceof Error
              ? bomQ.error.message
              : 'BOM failed to load'
            : 'BOM line not found'}
        </p>
        <Link to={`/projects/${pid}`} className="mt-4 inline-block text-violet-700">
          ← {projectQ.data.name}
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
          Edit BOM line
        </h1>
        {lineEdit.item ? (
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Item:{' '}
            <Link
              className="font-medium text-violet-700 dark:text-violet-400"
              to={`/items/${lineEdit.item.id}`}
            >
              {lineEdit.item.name}
            </Link>
          </p>
        ) : (
          <p className="mt-2 text-zinc-600">Item #{lineEdit.itemId}</p>
        )}
      </PageHero>
      <PageBody>
        <form
          className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/80"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            patchLine.mutate({
              lineId: lineEdit.id,
              body: {
                quantityRequired: Number(fd.get('qtyReq')),
                quantityPulled: Number(fd.get('qtyPull')),
                quantityInstalled: Number(fd.get('qtyInst')),
                notes: String(fd.get('notes') ?? '').trim() || null,
              },
            });
          }}
        >
          <div>
            <label className="text-sm text-zinc-600 dark:text-zinc-400">Qty required</label>
            <input
              name="qtyReq"
              type="number"
              min={1}
              required
              className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-800"
              defaultValue={lineEdit.quantityRequired}
            />
          </div>
          <div className="mt-4">
            <label className="text-sm text-zinc-600 dark:text-zinc-400">Qty pulled</label>
            <input
              name="qtyPull"
              type="number"
              min={0}
              required
              className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-800"
              defaultValue={lineEdit.quantityPulled}
            />
          </div>
          <div className="mt-4">
            <label className="text-sm text-zinc-600 dark:text-zinc-400">Qty installed</label>
            <input
              name="qtyInst"
              type="number"
              min={0}
              required
              className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-800"
              defaultValue={lineEdit.quantityInstalled}
            />
          </div>
          <div className="mt-4">
            <label className="text-sm text-zinc-600 dark:text-zinc-400">Notes</label>
            <input
              name="notes"
              className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-800"
              defaultValue={lineEdit.notes ?? ''}
            />
          </div>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <Link
              to={`/projects/${pid}`}
              className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-4 py-2 text-sm dark:border-zinc-600 dark:text-zinc-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="inline-flex min-h-11 items-center rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-violet-500"
              disabled={patchLine.isPending}
            >
              {patchLine.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </PageBody>
    </div>
  );
}
