// src/pages/SettingsPage.jsx
// -------------------------------------------------------
// Settings placeholder page – enough UI to feel real,
// with a working "Reset All Data" action.
// -------------------------------------------------------
import { useState } from 'react';
import { Download, RotateCcw } from 'lucide-react';
import { api } from '../data/api';

export default function SettingsPage({ onResetData, onDataImported }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage(''); setError('');
    try {
      const data = JSON.parse(await file.text());
      const result = await api.importData(data);
      setMessage(`Imported ${result.imported} task(s) successfully.`);
      onDataImported();
    } catch (cause) {
      setError(cause instanceof SyntaxError ? 'The selected file is not valid JSON.' : cause.message);
    } finally {
      event.target.value = '';
    }
  }

  function handleExport() {
    window.location.assign(api.exportData());
    setMessage('Export requested. Your JSON download should begin shortly.');
  }

  return (
    <div className="page-content">
      <div className="page-section">
        <h2 className="section__title" style={{ marginBottom:'1rem' }}>Preferences</h2>

        {message && <p role="status" style={{ marginBottom: '1rem', color: 'var(--color-success)' }}>{message}</p>}
        {error && <p role="alert" style={{ marginBottom: '1rem', color: 'var(--color-danger)' }}>{error}</p>}
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          {/* Profile info */}
          <div className="form-group">
            <label>Display Name</label>
            <input type="text" defaultValue="Student" style={{ maxWidth: 320 }} />
          </div>

          <div className="form-group">
            <label>Email (for future notifications)</label>
            <input type="email" defaultValue="student@university.edu" style={{ maxWidth: 320 }} />
          </div>

          {/* Danger zone */}
          <div style={{ marginTop:'1.5rem', paddingTop:'1.5rem', borderTop:'1px solid var(--color-border)' }}>
            <h3 style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--color-danger)', marginBottom:'0.5rem' }}>
              Danger Zone
            </h3>
            <p style={{ fontSize:'0.8125rem', color:'var(--color-text-secondary)', marginBottom:'0.75rem' }}>
              Reset all tasks and subjects to the default sample data. This cannot be undone.
            </p>
            <button className="btn btn--danger" onClick={onResetData} style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem' }}>
              <RotateCcw size={16} />
              Reset All Data
            </button>
          </div>

          {/* Import zone */}
          <div style={{ marginTop:'1.5rem', paddingTop:'1.5rem', borderTop:'1px solid var(--color-border)' }}>
            <h3 style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--color-danger)', marginBottom:'0.5rem' }}>
              Import Zone
            </h3>
            <p style={{ fontSize:'0.8125rem', color:'var(--color-text-secondary)', marginBottom:'0.75rem' }}>
              Import data from a JSON file.
            </p>
            <input type="file" accept=".json" onChange={handleImport} />
          </div>

          {/* Export zone */}
          <div style={{ marginTop:'1.5rem', paddingTop:'1.5rem', borderTop:'1px solid var(--color-border)' }}>
            <h3 style={{ fontSize:'0.875rem', fontWeight:600, color:'var(--color-danger)', marginBottom:'0.5rem' }}>
              Export Zone
            </h3>
            <p style={{ fontSize:'0.8125rem', color:'var(--color-text-secondary)', marginBottom:'0.75rem' }}>
              Export data to a JSON file.
            </p>
            <button className="btn btn--success" onClick={handleExport} style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem' }}>
              <Download size={16} />
              Export Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
