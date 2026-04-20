import { useEffect, useState } from 'react';

type EntityType = 'container' | 'storage-unit' | 'project';

export function LabelSection(props: { entityType: EntityType; entityId: number }) {
  const { entityType, entityId } = props;
  const [template, setTemplate] = useState(
    entityType === 'storage-unit'
      ? 'storage-unit'
      : entityType === 'project'
        ? 'project-bin'
        : 'bin-standard',
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const preview = async () => {
    setErr(null);
    setBusy(true);
    setPreviewUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    try {
      const res = await fetch('/api/labels/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'image/png' },
        body: JSON.stringify({ entityType, entityId, template }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const blob = await res.blob();
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const print = async () => {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch('/api/labels/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ entityType, entityId, template }),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="label-section">
      <h2>Label</h2>
      <label className="label-row">
        Template{' '}
        <select value={template} onChange={(e) => setTemplate(e.target.value)}>
          {entityType === 'container' ? (
            <>
              <option value="bin-standard">bin-standard</option>
              <option value="bin-compact">bin-compact</option>
            </>
          ) : null}
          {entityType === 'storage-unit' ? (
            <option value="storage-unit">storage-unit</option>
          ) : null}
          {entityType === 'project' ? <option value="project-bin">project-bin</option> : null}
        </select>
      </label>
      <div className="label-actions">
        <button type="button" onClick={() => void preview()} disabled={busy}>
          {busy ? '…' : 'Preview PNG'}
        </button>
        <button type="button" onClick={() => void print()} disabled={busy}>
          Send to printer
        </button>
      </div>
      {err ? <p className="error">{err}</p> : null}
      {previewUrl ? (
        <p>
          <img src={previewUrl} alt="Label preview" className="label-preview" />
        </p>
      ) : null}
    </section>
  );
}
