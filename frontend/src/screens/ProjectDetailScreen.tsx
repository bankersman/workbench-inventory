import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { apiBase, fetchJson, fetchNoContent } from '../api';
import { LabelSection } from '../components/LabelSection';
import { PageBody, PageHero, SectionCard } from '../components/PageShell';

interface Project {
  id: number;
  name: string;
  status: string;
  description: string | null;
  notes: string | null;
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
  itemAvailability: {
    itemId: number;
    quantity: number;
    inWarehouse: number;
    totalReserved: number;
    effectivelyFree: number;
  };
}

interface BomPreviewResult {
  matched: {
    name: string;
    quantity: number;
    itemId: number;
    ref?: string;
    notes?: string;
  }[];
  unmatched: { name: string; quantity: number }[];
}

export function ProjectDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const pid = id ? Number(id) : NaN;
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [importCsv, setImportCsv] = useState('');
  const [preview, setPreview] = useState<BomPreviewResult | null>(null);
  const [importOpen, setImportOpen] = useState(false);

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

  const invalidateProject = async () => {
    await qc.invalidateQueries({ queryKey: ['project', pid] });
    await qc.invalidateQueries({ queryKey: ['project', pid, 'bom-availability'] });
    await qc.invalidateQueries({ queryKey: ['projects'] });
  };

  const deleteProject = useMutation({
    mutationFn: () => fetchNoContent(`/projects/${pid}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['projects'] });
      navigate('/projects');
    },
  });

  const completeProject = useMutation({
    mutationFn: () => fetchNoContent(`/projects/${pid}/complete`, { method: 'POST' }),
    onSuccess: invalidateProject,
  });

  const removeLine = useMutation({
    mutationFn: (lineId: number) =>
      fetchNoContent(`/projects/${pid}/bom/${lineId}`, { method: 'DELETE' }),
    onSuccess: invalidateProject,
  });

  const previewImport = useMutation({
    mutationFn: (csv: string) =>
      fetchJson<BomPreviewResult>(`/projects/${pid}/bom/preview-import`, {
        method: 'POST',
        body: JSON.stringify({ csv }),
      }),
    onSuccess: (data) => setPreview(data),
  });

  const confirmImport = useMutation({
    mutationFn: (lines: { itemId: number; quantityRequired: number; notes?: string | null }[]) =>
      fetchJson(`/projects/${pid}/bom/confirm-import`, {
        method: 'POST',
        body: JSON.stringify({ lines }),
      }),
    onSuccess: async () => {
      setPreview(null);
      setImportCsv('');
      setImportOpen(false);
      await invalidateProject();
    },
  });

  if (!Number.isFinite(pid)) {
    return <p className="text-red-600">Invalid project</p>;
  }

  if (projectQ.isPending) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white/80 p-6 dark:border-zinc-700 dark:bg-zinc-900/80">
        <p className="text-zinc-500">Loading…</p>
      </section>
    );
  }

  if (projectQ.isError) {
    return (
      <section className="space-y-4">
        <p className="text-red-600 dark:text-red-400">
          {projectQ.error instanceof Error ? projectQ.error.message : 'Error'}
        </p>
        <Link to="/projects" className="text-violet-700 dark:text-violet-400">
          ← Projects
        </Link>
      </section>
    );
  }

  const project = projectQ.data!;
  const rows = bomQ.data ?? [];
  const bomErr = bomQ.isError
    ? bomQ.error instanceof Error
      ? bomQ.error.message
      : 'BOM failed to load'
    : null;

  const exportBom = `${apiBase()}/projects/${pid}/export/bom.csv`;
  const exportMissing = `${apiBase()}/projects/${pid}/export/missing.csv`;

  return (
    <div>
      <PageHero>
        <Link
          to="/projects"
          className="text-sm font-medium text-violet-700 hover:underline dark:text-violet-400"
        >
          ← Projects
        </Link>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {project.name}
          </h1>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/projects/${pid}/edit`}
              className="inline-flex min-h-11 items-center rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:text-zinc-200"
            >
              Edit details
            </Link>
            {project.status !== 'complete' ? (
              <button
                type="button"
                className="rounded-xl border border-stone-300 px-3 py-2 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:text-zinc-200"
                onClick={() => {
                  if (
                    window.confirm(
                      'Mark project complete? This will apply stock rules from pulled quantities (see PLAN).',
                    )
                  ) {
                    completeProject.mutate();
                  }
                }}
                disabled={completeProject.isPending}
              >
                Complete project
              </button>
            ) : null}
            <button
              type="button"
              className="rounded-xl border border-red-300 px-3 py-2 text-sm font-medium text-red-800 dark:border-red-800 dark:text-red-300"
              onClick={() => {
                if (
                  window.confirm('Delete this project and its BOM lines? This cannot be undone.')
                ) {
                  deleteProject.mutate();
                }
              }}
              disabled={deleteProject.isPending}
            >
              Delete project
            </button>
          </div>
        </div>
      </PageHero>

      <PageBody>
        <SectionCard title="Summary">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Status:{' '}
            <span className="font-medium text-zinc-800 dark:text-zinc-200">{project.status}</span>
          </p>
          {project.description ? (
            <p className="mt-2 text-zinc-700 dark:text-zinc-300">{project.description}</p>
          ) : null}
          {project.notes ? (
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{project.notes}</p>
          ) : null}
        </SectionCard>

        <SectionCard
          title="Exports"
          toolbar={
            <>
              <a
                href={exportBom}
                download
                className="inline-flex min-h-10 items-center rounded-lg border border-stone-300 bg-white px-3 text-sm font-medium text-violet-800 no-underline shadow-sm hover:bg-stone-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-violet-200 dark:hover:bg-zinc-700"
              >
                BOM CSV
              </a>
              <a
                href={exportMissing}
                download
                className="inline-flex min-h-10 items-center rounded-lg border border-stone-300 bg-white px-3 text-sm font-medium text-violet-800 no-underline shadow-sm hover:bg-stone-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-violet-200 dark:hover:bg-zinc-700"
              >
                Missing CSV
              </a>
            </>
          }
        >
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Download current BOM or missing-parts list for this project.
          </p>
        </SectionCard>

        <LabelSection entityType="project" entityId={pid} />

        <SectionCard
          title="Bill of materials"
          toolbar={
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/projects/${pid}/bom/new`}
                className="inline-flex min-h-10 items-center rounded-lg bg-violet-600 px-3 text-sm font-medium text-white hover:bg-violet-700 dark:bg-violet-500"
              >
                Add line
              </Link>
              <button
                type="button"
                className="inline-flex min-h-10 items-center rounded-lg border border-stone-300 bg-white px-3 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200"
                onClick={() => setImportOpen((o) => !o)}
              >
                {importOpen ? 'Hide import' : 'Import CSV'}
              </button>
            </div>
          }
        >
          {importOpen ? (
            <div className="mb-6 space-y-3 rounded-xl border border-dashed border-stone-300 p-4 dark:border-zinc-600">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Paste CSV with columns such as{' '}
                <code className="rounded bg-stone-100 px-1 dark:bg-zinc-800">name</code>,{' '}
                <code className="rounded bg-stone-100 px-1 dark:bg-zinc-800">qty</code>. Rows are
                matched to items by name.
              </p>
              <textarea
                className="min-h-[120px] w-full rounded-xl border border-stone-300 p-3 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-800"
                value={importCsv}
                onChange={(e) => setImportCsv(e.target.value)}
                placeholder="name,qty&#10;Resistor 10k,5"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-xl bg-stone-200 px-4 py-2 text-sm font-medium dark:bg-zinc-700"
                  onClick={() => previewImport.mutate(importCsv)}
                  disabled={previewImport.isPending || !importCsv.trim()}
                >
                  Preview
                </button>
              </div>
              {preview ? (
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-emerald-800 dark:text-emerald-300">
                    Matched: {preview.matched.length}
                  </p>
                  <ul className="list-inside list-disc text-zinc-600 dark:text-zinc-400">
                    {preview.matched.map((m, i) => (
                      <li key={i}>
                        {m.name} × {m.quantity} → item #{m.itemId}
                      </li>
                    ))}
                  </ul>
                  {preview.unmatched.length > 0 ? (
                    <>
                      <p className="font-medium text-amber-800 dark:text-amber-300">
                        Unmatched: {preview.unmatched.length}
                      </p>
                      <ul className="list-inside list-disc text-zinc-600 dark:text-zinc-400">
                        {preview.unmatched.map((u, i) => (
                          <li key={i}>
                            {u.name} × {u.quantity}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white dark:bg-violet-500"
                    disabled={preview.matched.length === 0 || confirmImport.isPending}
                    onClick={() =>
                      confirmImport.mutate(
                        preview.matched.map((m) => ({
                          itemId: m.itemId,
                          quantityRequired: m.quantity,
                          notes: m.notes ?? null,
                        })),
                      )
                    }
                  >
                    Add matched lines to BOM
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {bomQ.isPending ? <p className="text-sm text-zinc-500">Loading BOM…</p> : null}
          {bomErr ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
              {bomErr}
            </p>
          ) : null}

          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-zinc-700">
            <table className="min-w-full divide-y divide-stone-200 text-left text-sm dark:divide-zinc-700">
              <thead className="bg-stone-50 dark:bg-zinc-800/80">
                <tr>
                  <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">Item</th>
                  <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">Req</th>
                  <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">Pulled</th>
                  <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                    Installed
                  </th>
                  <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                    Still need
                  </th>
                  <th className="px-3 py-2 font-medium text-zinc-700 dark:text-zinc-300">
                    Free stock
                  </th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 bg-white dark:divide-zinc-800 dark:bg-zinc-900/60">
                {rows.map((row) => (
                  <tr key={row.line.id} className="hover:bg-stone-50/80 dark:hover:bg-zinc-800/50">
                    <td className="px-3 py-2">
                      {row.line.item ? (
                        <Link
                          className="font-medium text-violet-700 dark:text-violet-400"
                          to={`/items/${row.line.item.id}`}
                        >
                          {row.line.item.name}
                        </Link>
                      ) : (
                        <span className="text-zinc-500">Item #{row.line.itemId}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono">{row.line.quantityRequired}</td>
                    <td className="px-3 py-2 font-mono">{row.line.quantityPulled}</td>
                    <td className="px-3 py-2 font-mono">{row.line.quantityInstalled}</td>
                    <td className="px-3 py-2 font-mono">{row.stillNeeded}</td>
                    <td className="px-3 py-2 font-mono">{row.itemAvailability.effectivelyFree}</td>
                    <td className="whitespace-nowrap px-3 py-2">
                      <Link
                        className="text-violet-700 dark:text-violet-400"
                        to={`/projects/${pid}/bom/${row.line.id}/edit`}
                      >
                        Edit
                      </Link>{' '}
                      <button
                        type="button"
                        className="text-red-600 dark:text-red-400"
                        onClick={() => {
                          if (window.confirm('Remove this BOM line?')) {
                            removeLine.mutate(row.line.id);
                          }
                        }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </PageBody>
    </div>
  );
}
