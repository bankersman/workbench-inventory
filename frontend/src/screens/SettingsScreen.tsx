import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { apiBase, fetchJson, fetchNoContent } from '../api';
import { PageBody, PageHero, SectionCard } from '../components/PageShell';

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
  const qc = useQueryClient();
  const [err, setErr] = useState<string | null>(null);
  const [backup, setBackup] = useState<BackupStatus | null>(null);
  const [scanner, setScanner] = useState<ScannerStatus | null>(null);
  const [sidecar, setSidecar] = useState<{ ok: boolean } | null>(null);
  const [backupBusy, setBackupBusy] = useState(false);

  const [deleteRow, setDeleteRow] = useState<CategoryRow | null>(null);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);

  const categoriesQ = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchJson<CategoryRow[]>('/categories'),
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
    <div className="settings-screen text-left">
      <PageHero>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Settings
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Device backup, categories, scanner, and labels.
        </p>
      </PageHero>

      <PageBody>
        {err ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {err}
          </p>
        ) : null}

        <SectionCard title="Appearance">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Light and dark theme is toggled from the <strong>top bar</strong> (switch next to the
            repository link). Preference is still saved on this device.
          </p>
        </SectionCard>

        <SectionCard
          title="Categories"
          toolbar={
            <Link
              to="/settings/categories/new"
              className="inline-flex min-h-10 items-center rounded-lg bg-violet-600 px-3 text-sm font-medium text-white hover:bg-violet-700 dark:bg-violet-500"
            >
              New category
            </Link>
          }
        >
          <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
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
            <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 dark:divide-zinc-700 dark:border-zinc-700">
              {(categoriesQ.data ?? []).map((c) => (
                <li
                  key={c.id}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{c.name}</span>
                  <div className="flex gap-2">
                    <Link
                      to={`/settings/categories/${c.id}/edit`}
                      className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm font-medium text-zinc-800 dark:border-zinc-600 dark:text-zinc-200"
                    >
                      Rename
                    </Link>
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
        </SectionCard>

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

        <SectionCard title="Scanner">
          {scanner ? (
            <p className="text-zinc-800 dark:text-zinc-200">
              Hardware:{' '}
              {scanner.enabled ? (scanner.connected ? 'connected' : 'disconnected') : 'disabled'}{' '}
              (configure{' '}
              <code className="rounded bg-stone-100 px-1 dark:bg-zinc-800">SCANNER_PORT</code> on
              the server)
            </p>
          ) : (
            <p className="text-zinc-500 dark:text-zinc-400">Status unavailable</p>
          )}
        </SectionCard>

        <SectionCard title="Suppliers">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Mouser and TME keys are read from server environment: <code>MOUSER_API_KEY</code>,{' '}
            <code>TME_APP_KEY</code>, <code>TME_APP_SECRET</code>.
          </p>
        </SectionCard>

        <SectionCard title="Backup">
          {backup ? (
            <>
              <p className="text-zinc-800 dark:text-zinc-200">
                Last backup: {backup.lastBackup ?? 'never'}
              </p>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Directory: {backup.backupsDirectory}
              </p>
              <p className="mt-3">
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
        </SectionCard>

        <SectionCard title="Labels">
          <p className="text-zinc-800 dark:text-zinc-200">
            Sidecar: {sidecar ? (sidecar.ok ? 'reachable' : 'not ready') : 'unknown'} — set{' '}
            <code>LABEL_SIDECAR_URL</code> if needed.
          </p>
        </SectionCard>

        <SectionCard title="Command sheet">
          <p>
            <a href={`${apiBase()}/labels/command-sheet`} target="_blank" rel="noreferrer">
              Open printable command sheet
            </a>
          </p>
        </SectionCard>
      </PageBody>
    </div>
  );
}
