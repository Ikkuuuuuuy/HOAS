import React from 'react';
import { useToast } from '../../context/ToastContext';

const icons: Record<string, string> = {
  success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span style={{ fontSize: '1.2rem', flex: 'none' }}>{icons[toast.type]}</span>
          <div style={{ flex: 1 }}>
            <div className="toast-title">{toast.title}</div>
            {toast.message && <div className="toast-body">{toast.message}</div>}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px', fontSize: '1rem' }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
