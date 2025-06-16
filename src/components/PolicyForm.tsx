import React, { useState } from 'react';

const PolicyForm: React.FC = () => {
  const [authEnabled, setAuthEnabled] = useState(false);

  return (
    <form style={{
      maxWidth: 400,
      margin: '2rem auto',
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 2px 12px rgba(44,62,80,0.10)',
      padding: '2rem',
      fontFamily: 'Roboto, Arial, sans-serif',
    }}>
      <h2 style={{
        fontSize: '1.5rem',
        fontWeight: 700,
        color: '#1976d2',
        marginBottom: 24,
        letterSpacing: 0.5,
      }}>Settings</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <label htmlFor="auth-toggle" style={{ fontSize: '1.1rem', color: '#263238', fontWeight: 500 }}>
          Enable Authentication
        </label>
        <input
          id="auth-toggle"
          type="checkbox"
          checked={authEnabled}
          onChange={e => setAuthEnabled(e.target.checked)}
          style={{ width: 32, height: 32, accentColor: '#1976d2', cursor: 'pointer' }}
        />
      </div>
    </form>
  );
};

export default PolicyForm;