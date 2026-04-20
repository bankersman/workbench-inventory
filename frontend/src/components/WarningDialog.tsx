export function WarningDialog(props: {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const { open, message, onConfirm, onCancel } = props;
  if (!open) {
    return null;
  }
  return (
    <div className="warning-overlay" role="dialog" aria-modal="true" aria-labelledby="warn-title">
      <div className="warning-card">
        <h2 id="warn-title">Confirm</h2>
        <p>{message}</p>
        <div className="warning-actions">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
