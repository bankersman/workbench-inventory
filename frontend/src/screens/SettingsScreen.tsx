import { useEffect, useState } from 'react';

import { apiBase, fetchJson } from '../api';

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
    <section className="screen settings-screen">
      <h1>Settings</h1>
      {err ? <p className="error">{err}</p> : null}

      <section>
        <h2>Categories</h2>
        <ul className="detail-list">
          {categories.map((c) => (
            <li key={c.id}>{c.name}</li>
          ))}
        </ul>
        <p className="muted">Manage categories via the API or future editor.</p>
      </section>

      <section>
        <h2>Scanner</h2>
        {scanner ? (
          <p>
            Hardware:{' '}
            {scanner.enabled ? (scanner.connected ? 'connected' : 'disconnected') : 'disabled'}{' '}
            (configure <code>SCANNER_PORT</code> on the server)
          </p>
        ) : (
          <p className="muted">Status unavailable</p>
        )}
      </section>

      <section>
        <h2>Suppliers</h2>
        <p className="muted">
          Mouser and TME keys are read from server environment: <code>MOUSER_API_KEY</code>,{' '}
          <code>TME_APP_KEY</code>, <code>TME_APP_SECRET</code>.
        </p>
      </section>

      <section>
        <h2>Backup</h2>
        {backup ? (
          <>
            <p>Last backup: {backup.lastBackup ?? 'never'}</p>
            <p className="muted">Directory: {backup.backupsDirectory}</p>
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
          <p className="muted">Loading…</p>
        )}
      </section>

      <section>
        <h2>Labels</h2>
        <p>
          Sidecar: {sidecar ? (sidecar.ok ? 'reachable' : 'not ready') : 'unknown'} — set{' '}
          <code>LABEL_SIDECAR_URL</code> if needed.
        </p>
      </section>

      <section>
        <h2>Command sheet</h2>
        <p>
          <a href={`${apiBase()}/labels/command-sheet`} target="_blank" rel="noreferrer">
            Open printable command sheet
          </a>
        </p>
      </section>
    </section>
  );
}
