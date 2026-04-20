import { useEffect, useState } from 'react';

import { apiBase, fetchJson } from '../api';
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
  const [err, setErr] = useState<string | null>(null);
  const [backup, setBackup] = useState<BackupStatus | null>(null);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [scanner, setScanner] = useState<ScannerStatus | null>(null);
  const [sidecar, setSidecar] = useState<{ ok: boolean } | null>(null);
  const [backupBusy, setBackupBusy] = useState(false);

  useEffect(() => {
    void fetchJson<BackupStatus>('/backup/status')
      .then(setBackup)
      .catch((e: Error) => setErr(e.message));
    void fetchJson<CategoryRow[]>('/categories')
      .then(setCategories)
      .catch(() => setCategories([]));
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

      <section>
        <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">Categories</h2>
        <ul className="list-inside list-disc space-y-1 text-zinc-800 dark:text-zinc-200">
          {categories.map((c) => (
            <li key={c.id}>{c.name}</li>
          ))}
        </ul>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Manage categories via the API or future editor.
        </p>
      </section>

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
