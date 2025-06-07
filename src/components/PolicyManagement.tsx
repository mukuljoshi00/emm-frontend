import React, { useEffect, useState } from 'react';

interface PolicyManagementProps {
  org?: any;
  token?: string | null;
}

const PolicyManagement: React.FC<PolicyManagementProps> = ({ org, token }) => {
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!org || !org.enterpriseName || !token) return;
    setLoading(true);
    setError('');
    fetch(`http://localhost:8080/api/enterprise/policy/policy1?enterpriseName=${encodeURIComponent(org.enterpriseName)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    })
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch policy'))
      .then(data => setPolicy(data))
      .catch(err => setError(typeof err === 'string' ? err : err.message))
      .finally(() => setLoading(false));
  }, [org, token]);

  if (!org || !org.enterpriseName) {
    return <div style={{ color: '#888', textAlign: 'center', fontSize: 18, margin: '2rem 0' }}>No enterprise found for this user.</div>;
  }

  return (
    <div>
      {loading && <p>Loading policy...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {policy && Array.isArray(policy) ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '1.5rem' }}>
          {policy.map((item: any, idx: number) => (
            <div key={idx} style={{
              background: '#fff',
              borderRadius: 10,
              boxShadow: '0 2px 8px rgba(44,62,80,0.08)',
              padding: '2.5rem', // increased padding
              minWidth: 480,     // increased minWidth
              maxWidth: 700,     // increased maxWidth
              flex: '1 1 480px', // increased flex basis
              marginBottom: '1rem',
              overflowX: 'auto',
            }}>
              <pre style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: 8, fontSize: 16, overflowX: 'auto', margin: 0 }}>{JSON.stringify(item, null, 2)}</pre>
            </div>
          ))}
        </div>
      ) : policy ? (
        <div style={{
          background: '#fff',
          borderRadius: 10,
          boxShadow: '0 2px 8px rgba(44,62,80,0.08)',
          padding: '2.5rem', // increased padding
          minWidth: 480,     // increased minWidth
          maxWidth: 700,     // increased maxWidth
          margin: '1.5rem auto',
          overflowX: 'auto',
        }}>
          <pre style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: 8, fontSize: 16, overflowX: 'auto', margin: 0 }}>{JSON.stringify(policy, null, 2)}</pre>
        </div>
      ) : null}
      {!loading && !error && !policy && (
        <p style={{ color: '#888', textAlign: 'center', fontSize: 18, margin: '2rem 0' }}>No policy data found.</p>
      )}
      <button style={{
        marginTop: '2rem',
        background: '#1976d2',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        padding: '0.75rem 2rem',
        fontWeight: 600,
        fontSize: 16,
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
      }}>
        Update Policy
      </button>
    </div>
  );
};

export default PolicyManagement;