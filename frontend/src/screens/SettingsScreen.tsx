import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { apiBase, fetchJson, fetchNoContent } from '../api';
import { useTheme } from '../theme/useTheme';

interface BackupStatus {
  lastBackup: string | null;
  backupsDirectory: string;
  databasePath: string;
  databaseExists: boolean;
}

interface CategoryRow {
  id: number;
  name: string;
}

interface ScannerStatus {
  enabled: boolean;
  connected: boolean;
}

export function SettingsScreen() {
  const { theme, setTheme } = useTheme();
  const qc = useQueryClient();
  const [err, setErr] = useState<string | null>(null);
  const [backup, setBackup] = useState<BackupStatus | null>(null);
  const [scanner, setScanner] = useState<ScannerStatus | null>(null);
  const [sidecar, setSidecar] = useState<{ ok: boolean } | null>(null);
  const [backupBusy, setBackupBusy] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [createErr, setCreateErr] = useState<string | null>(null);

  const [editRow, setEditRow] = useState<CategoryRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editErr, setEditErr] = useState<string | null>(null);

  const [deleteRow, setDeleteRow] = useState<CategoryRow | null>(null);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  const categoriesQ = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchJson<CategoryRow[]>('/categories'),
  });

  const createCat = useMutation({
    mutationFn: (name: string) =>
      fetchJson<CategoryRow>('/categories', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
    onSuccess: async () => {
      setCreateErr(null);
      setCreateOpen(false);
      setNewCatName('');
      await qc.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (e: Error) => setCreateErr(e.message),
  });

  const patchCat = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      fetchJson<CategoryRow>(`/categories/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      }),
    onSuccess: async () => {
      setEditErr(null);
      setEditRow(null);
      await qc.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (e: Error) => setEditErr(e.message),
  });

  const deleteCat = useMutation({
    mutationFn: (id: number) => fetchNoContent(`/categories/${id}`, { method: 'DELETE' }),
    onSuccess: async () => {
      setDeleteErr(null);
      setDeleteRow(null);
      await qc.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (e: Error) => setDeleteErr(e.message),
  });

  useEffect(() => {
    void fetchJson<BackupStatus>('/backup/status')
      .then(setBackup)
      .catch((e: Error) => setErr(e.message));
    void fetchJson<ScannerStatus>('/scanner/status')
      .then(setScanner)
      .catch(() => setScanner(null));
    void fetch(`${apiBase()}/labels/sidecar-status`)
      .then((r) => r.json() as Promise<{ ok: boolean }>)
      .then(setSidecar)
      .catch(() => setSidecar(null));
  }, []);

  const runBackup = async () => {
    setBackupBusy(true);
    setErr(null);
    try {
      await fetchJson('/backup/run', { method: 'POST' });
      const s = await fetchJson<BackupStatus>('/backup/status');
      setBackup(s);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBackupBusy(false);
    }
  };

  const downloadDb = `${apiBase()}/backup/download`;

  return (
    <section className="settings-screen space-y-8 text-left">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Settings
      </h1>
      {err ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {err}
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">Appearance</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Choose light or dark theme. Preference is saved on this device.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={
              theme === 'light'
                ? 'rounded-xl border-2 border-violet-500 bg-violet-50 px-4 py-2 font-medium text-violet-900 dark:bg-violet-950/50 dark:text-violet-100'
                : 'rounded-xl border border-stone-300 bg-white px-4 py-2 font-medium text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100'
            }
          >
            Light
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={
              theme === 'dark'
                ? 'rounded-xl border-2 border-violet-500 bg-violet-50 px-4 py-2 font-medium text-violet-900 dark:bg-violet-950/50 dark:text-violet-100'
                : 'rounded-xl border border-stone-300 bg-white px-4 py-2 font-medium text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100'
            }
          >
            Dark
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">Categories</h2>
          <button
            type="button"
            onClick={() => {
              setCreateErr(null);
              setNewCatName('');
              setCreateOpen(true);
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-violet-600 px-4 font-medium text-white hover:bg-violet-700 dark:bg-violet-500"
          >
            New category
          </button>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Group parts for search and filters. Names should be short and clear (e.g. “Fasteners”).
        </p>
        {categoriesQ.isPending ? (
          <p className="text-zinc-500">Loading categories…</p>
        ) : categoriesQ.isError ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {categoriesQ.error instanceof Error ? categoriesQ.error.message : 'Failed to load'}
          </p>
        ) : (categoriesQ.data ?? []).length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-zinc-500 dark:border-zinc-600 dark:text-zinc-400">
            No categories yet.
          </p>
        ) : (
          <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white dark:divide-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/80">
            {(categoriesQ.data ?? []).map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{c.name}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:text-zinc-200"
                    onClick={() => {
                      setEditErr(null);
                      setEditName(c.name);
                      setEditRow(c);
                    }}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-sm font-medium text-red-800 dark:border-red-800 dark:text-red-200"
                    onClick={() => {
                      setDeleteErr(null);
                      setDeleteRow(c);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {createOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="presentation"
          onClick={() => setCreateOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            role="dialog"
            aria-labelledby="new-cat-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="new-cat-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              New category
            </h2>
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const t = newCatName.trim();
                if (!t) {
                  setCreateErr('Name is required');
                  return;
                }
                createCat.mutate(t);
              }}
            >
              <div>
                <label
                  htmlFor="cat-name"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Category name
                </label>
                <input
                  id="cat-name"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  autoFocus
                />
              </div>
              {createErr ? (
                <p className="text-sm text-red-600 dark:text-red-400">{createErr}</p>
              ) : null}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-xl border border-stone-300 px-4 py-2 text-sm dark:border-zinc-600"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCat.isPending}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-sm text-white disabled:opacity-60"
                >
                  {createCat.isPending ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editRow ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="presentation"
          onClick={() => setEditRow(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            role="dialog"
            aria-labelledby="edit-cat-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="edit-cat-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Rename category
            </h2>
            <form
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const t = editName.trim();
                if (!t) {
                  setEditErr('Name is required');
                  return;
                }
                patchCat.mutate({ id: editRow.id, name: t });
              }}
            >
              <div>
                <label
                  htmlFor="cat-edit-name"
                  className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Category name
                </label>
                <input
                  id="cat-edit-name"
                  className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              {editErr ? <p className="text-sm text-red-600 dark:text-red-400">{editErr}</p> : null}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="rounded-xl border border-stone-300 px-4 py-2 text-sm dark:border-zinc-600"
                  onClick={() => setEditRow(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={patchCat.isPending}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-sm text-white disabled:opacity-60"
                >
                  {patchCat.isPending ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteRow ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="presentation"
          onClick={() => setDeleteRow(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
            role="dialog"
            aria-labelledby="del-cat-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="del-cat-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-50"
            >
              Delete “{deleteRow.name}”?
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Parts in this category will lose the category link (they are not deleted). If the
              database blocks delete, you will see an error.
            </p>
            {deleteErr ? (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{deleteErr}</p>
            ) : null}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                className="rounded-xl border border-stone-300 px-4 py-2 text-sm dark:border-zinc-600"
                onClick={() => setDeleteRow(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteCat.isPending}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-60"
                onClick={() => {
                  setDeleteErr(null);
                  deleteCat.mutate(deleteRow.id);
                }}
              >
                {deleteCat.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">Scanner</h2>
        {scanner ? (
          <p>
            Hardware:{' '}
            {scanner.enabled ? (scanner.connected ? 'connected' : 'disconnected') : 'disabled'}{' '}
            (configure <code>SCANNER_PORT</code> on the server)
          </p>
        ) : (
          <p className="text-zinc-500 dark:text-zinc-400">Status unavailable</p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">Suppliers</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Mouser and TME keys are read from server environment: <code>MOUSER_API_KEY</code>,{' '}
          <code>TME_APP_KEY</code>, <code>TME_APP_SECRET</code>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">Backup</h2>
        {backup ? (
          <>
            <p>Last backup: {backup.lastBackup ?? 'never'}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Directory: {backup.backupsDirectory}
            </p>
            <p>
              <button type="button" onClick={() => void runBackup()} disabled={backupBusy}>
                {backupBusy ? 'Running…' : 'Backup now'}
              </button>{' '}
              <a href={downloadDb} download>
                Download current database
              </a>
            </p>
          </>
        ) : (
          <p className="text-zinc-500 dark:text-zinc-400">Loading…</p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">Labels</h2>
        <p>
          Sidecar: {sidecar ? (sidecar.ok ? 'reachable' : 'not ready') : 'unknown'} — set{' '}
          <code>LABEL_SIDECAR_URL</code> if needed.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">Command sheet</h2>
        <p>
          <a href={`${apiBase()}/labels/command-sheet`} target="_blank" rel="noreferrer">
            Open printable command sheet
          </a>
        </p>
      </section>
    </section>
  );
}
