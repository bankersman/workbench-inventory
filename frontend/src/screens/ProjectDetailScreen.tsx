import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { apiBase, fetchJson, fetchNoContent } from '../api';
import { LabelSection } from '../components/LabelSection';

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

const STATUSES = ['draft', 'active', 'hibernating', 'complete', 'archived'] as const;

export function ProjectDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const pid = id ? Number(id) : NaN;
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [editingProject, setEditingProject] = useState(false);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<string>('draft');
  const [editDescription, setEditDescription] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const [newItemId, setNewItemId] = useState('');
  const [newQty, setNewQty] = useState('1');
  const [newLineNotes, setNewLineNotes] = useState('');

  const [lineEdit, setLineEdit] = useState<BomAvailabilityRow['line'] | null>(null);

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

  const patchProject = useMutation({
    mutationFn: (
      body: Partial<{
        name: string;
        status: string;
        description: string | null;
        notes: string | null;
      }>,
    ) =>
      fetchJson<Project>(`/projects/${pid}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: async () => {
      setEditingProject(false);
      await invalidateProject();
    },
  });

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

  const addLine = useMutation({
    mutationFn: (body: { itemId: number; quantityRequired: number; notes?: string | null }) =>
      fetchJson(`/projects/${pid}/bom`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: async () => {
      setNewItemId('');
      setNewQty('1');
      setNewLineNotes('');
      await invalidateProject();
    },
  });

  const patchLine = useMutation({
    mutationFn: (args: { lineId: number; body: Record<string, unknown> }) =>
      fetchJson(`/projects/${pid}/bom/${args.lineId}`, {
        method: 'PATCH',
        body: JSON.stringify(args.body),
      }),
    onSuccess: async () => {
      setLineEdit(null);
      await invalidateProject();
    },
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

  const startEdit = () => {
    setEditName(project.name);
    setEditStatus(project.status);
    setEditDescription(project.description ?? '');
    setEditNotes(project.notes ?? '');
    setEditingProject(true);
  };

  const exportBom = `${apiBase()}/projects/${pid}/export/bom.csv`;
  const exportMissing = `${apiBase()}/projects/${pid}/export/missing.csv`;

  return (
    <section className="space-y-8">
      <div>
        <Link
          to="/projects"
          className="text-sm font-medium text-violet-700 hover:underline dark:text-violet-400"
        >
          ← Projects
        </Link>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {project.name}
          </h1>
          <div className="flex flex-wrap gap-2">
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
      </div>

      {editingProject ? (
        <form
          className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/80"
          onSubmit={(e) => {
            e.preventDefault();
            patchProject.mutate({
              name: editName.trim() || project.name,
              status: editStatus,
              description: editDescription.trim() || null,
              notes: editNotes.trim() || null,
            });
          }}
        >
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
            <input
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Status</label>
            <select
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Description
            </label>
            <textarea
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
              rows={2}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes</label>
            <textarea
              className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800"
              rows={2}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white dark:bg-violet-500"
              disabled={patchProject.isPending}
            >
              Save
            </button>
            <button
              type="button"
              className="rounded-xl border px-4 py-2 text-sm dark:border-zinc-600"
              onClick={() => setEditingProject(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-stone-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900/80">
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
          <button
            type="button"
            className="mt-3 text-sm font-medium text-violet-700 dark:text-violet-400"
            onClick={startEdit}
          >
            Edit details
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-sm">
        <a
          href={exportBom}
          download
          className="font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-400"
        >
          Export BOM CSV
        </a>
        <a
          href={exportMissing}
          download
          className="font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-400"
        >
          Export missing CSV
        </a>
      </div>

      <LabelSection entityType="project" entityId={pid} />

      <div>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            Bill of materials
          </h2>
          <button
            type="button"
            className="text-sm font-medium text-violet-700 dark:text-violet-400"
            onClick={() => setImportOpen((o) => !o)}
          >
            {importOpen ? 'Hide import' : 'Import CSV'}
          </button>
        </div>

        {importOpen ? (
          <div className="mb-6 space-y-3 rounded-2xl border border-dashed border-stone-300 p-4 dark:border-zinc-600">
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

        <div className="overflow-x-auto rounded-2xl border border-stone-200 dark:border-zinc-700">
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
                  <td className="px-3 py-2 whitespace-nowrap">
                    <button
                      type="button"
                      className="text-violet-700 dark:text-violet-400"
                      onClick={() => setLineEdit(row.line)}
                    >
                      Edit
                    </button>{' '}
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

        <form
          className="mt-4 flex flex-col gap-3 rounded-2xl border border-stone-200 p-4 dark:border-zinc-700 sm:flex-row sm:flex-wrap sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            const itemId = Number(newItemId);
            const qty = Number(newQty);
            if (!Number.isInteger(itemId) || itemId < 1) {
              return;
            }
            if (!Number.isFinite(qty) || qty < 1) {
              return;
            }
            addLine.mutate({
              itemId,
              quantityRequired: Math.floor(qty),
              notes: newLineNotes.trim() || null,
            });
          }}
        >
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Item ID
            </label>
            <input
              className="mt-1 w-32 rounded-lg border border-stone-300 px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-800"
              inputMode="numeric"
              value={newItemId}
              onChange={(e) => setNewItemId(e.target.value)}
              placeholder="e.g. 12"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Qty required
            </label>
            <input
              className="mt-1 w-24 rounded-lg border border-stone-300 px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-800"
              inputMode="numeric"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
            />
          </div>
          <div className="min-w-[8rem] flex-1">
            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Notes (optional)
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-stone-300 px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-800"
              value={newLineNotes}
              onChange={(e) => setNewLineNotes(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white dark:bg-violet-500"
            disabled={addLine.isPending}
          >
            Add line
          </button>
        </form>
      </div>

      {lineEdit ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="presentation"
          onClick={() => setLineEdit(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            role="dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold dark:text-zinc-50">Edit BOM line</h3>
            <form
              className="mt-4 space-y-3"
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
                  className="mt-1 w-full rounded-lg border px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-800"
                  defaultValue={lineEdit.quantityRequired}
                />
              </div>
              <div>
                <label className="text-sm text-zinc-600 dark:text-zinc-400">Qty pulled</label>
                <input
                  name="qtyPull"
                  type="number"
                  min={0}
                  required
                  className="mt-1 w-full rounded-lg border px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-800"
                  defaultValue={lineEdit.quantityPulled}
                />
              </div>
              <div>
                <label className="text-sm text-zinc-600 dark:text-zinc-400">Qty installed</label>
                <input
                  name="qtyInst"
                  type="number"
                  min={0}
                  required
                  className="mt-1 w-full rounded-lg border px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-800"
                  defaultValue={lineEdit.quantityInstalled}
                />
              </div>
              <div>
                <label className="text-sm text-zinc-600 dark:text-zinc-400">Notes</label>
                <input
                  name="notes"
                  className="mt-1 w-full rounded-lg border px-2 py-1.5 dark:border-zinc-600 dark:bg-zinc-800"
                  defaultValue={lineEdit.notes ?? ''}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-xl border px-4 py-2 dark:border-zinc-600"
                  onClick={() => setLineEdit(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-violet-600 px-4 py-2 text-white dark:bg-violet-500"
                  disabled={patchLine.isPending}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
