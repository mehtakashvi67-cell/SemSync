// src/components/ConfirmDialog.jsx
// -------------------------------------------------------
// Simple confirmation dialog for destructive actions.
// -------------------------------------------------------
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="confirm-dialog">
          <AlertTriangle size={40} color="#dc2626" style={{ marginBottom: '1rem' }} />
          <p className="confirm-dialog__text">{message}</p>
          <div className="confirm-dialog__actions">
            <button className="btn btn--secondary" onClick={onCancel}>Cancel</button>
            <button className="btn btn--danger" onClick={onConfirm}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
