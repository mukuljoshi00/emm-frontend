import React, { useEffect, useState } from 'react';
import { fetchPolicy, updatePolicy } from '../api/Api';

interface PolicyManagementProps {
  org?: any;
  token?: string | null;
}

const PolicyManagement: React.FC<PolicyManagementProps> = ({ org, token }) => {
  const [policy, setPolicy] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInput, setShowInput] = useState<boolean | number>(false);
  const [inputValue, setInputValue] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  const fetchPolicyData = () => {
    if (!org || !org.enterpriseName || !token) return;
    setLoading(true);
    setError('');
    fetchPolicy(org.enterpriseName, token)
      .then(data => setPolicy(data))
      .catch(err => setError(typeof err === 'string' ? err : err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPolicyData();
  }, [org, token]);

  const handleUpdatePolicy = async () => {
    setUpdateLoading(true);
    setUpdateError('');
    setUpdateSuccess('');
    try {
      if (!inputValue) throw new Error('Policy JSON cannot be empty');
      if (!org || !org.enterpriseName || !token) throw new Error('Missing organization or token');
      const parsed = JSON.parse(inputValue);
      // Ensure version is a string if present
      if (parsed && typeof parsed.version !== 'undefined') {
        parsed.version = String(parsed.version);
      }
      await updatePolicy(org.enterpriseName, token, parsed);
      setUpdateSuccess('Policy updated successfully!');
      setShowInput(false);
      setInputValue('');
      fetchPolicyData(); // Refresh the policy after successful update
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update policy');
    } finally {
      setUpdateLoading(false);
    }
  };

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
              padding: '3.5rem 3.5rem 2.5rem 3.5rem',
              minWidth: 520,
              maxWidth: 900,
              flex: '1 1 520px',
              marginBottom: '1rem',
              overflowX: 'auto',
              position: 'relative',
            }}>
              {showInput === idx ? (
                <div style={{ marginBottom: 24, textAlign: 'left', maxWidth: 900 }}>
                  <textarea
                    value={inputValue}
                    onChange={e => setInputValue(e.target.value)}
                    rows={16}
                    style={{ width: '100%', fontSize: 15, fontFamily: 'monospace', padding: 12, borderRadius: 8, border: '1.5px solid #1976d2', background: '#f9fafb', marginBottom: 12 }}
                    placeholder='Paste or edit your policy JSON here'
                    disabled={updateLoading}
                  />
                  <div style={{ display: 'flex', gap: 16 }}>
                    <button
                      onClick={handleUpdatePolicy}
                      style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '0.6rem 1.5rem', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                      disabled={updateLoading}
                    >
                      {updateLoading ? 'Updating...' : 'Submit'}
                    </button>
                    <button
                      onClick={() => { setShowInput(false); setInputValue(''); setUpdateError(''); setUpdateSuccess(''); }}
                      style={{ background: '#e0e0e0', color: '#374151', border: 'none', borderRadius: 6, padding: '0.6rem 1.5rem', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                      disabled={updateLoading}
                    >
                      Cancel
                    </button>
                  </div>
                  {updateError && <div style={{ color: 'red', marginTop: 8 }}>{updateError}</div>}
                  {updateSuccess && <div style={{ color: '#388e3c', marginTop: 8 }}>{updateSuccess}</div>}
                </div>
              ) : (
                <>
                  <div style={{ paddingBottom: 24, paddingLeft: 8, paddingRight: 8 }}>
                    <button
                      style={{
                        background: '#1976d2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '0.75rem 2rem',
                        fontWeight: 600,
                        fontSize: 16,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
                      }}
                      onClick={() => {
                        setShowInput(idx);
                        setInputValue(JSON.stringify(item, null, 2));
                        setUpdateError('');
                        setUpdateSuccess('');
                      }}
                    >
                      Update Policy
                    </button>
                  </div>
                  <pre style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: 8, fontSize: 16, overflowX: 'auto', margin: 0 }}>{JSON.stringify(item, null, 2)}</pre>
                </>
              )}
            </div>
          ))}
        </div>
      ) : policy ? (
        <div style={{
          background: '#fff',
          borderRadius: 10,
          boxShadow: '0 2px 8px rgba(44,62,80,0.08)',
          padding: '3.5rem 3.5rem 2.5rem 3.5rem',
          minWidth: 520,
          maxWidth: 900,
          margin: '1.5rem auto',
          overflowX: 'auto',
          position: 'relative',
        }}>
          {showInput === true ? (
            <div style={{ marginBottom: 24, textAlign: 'left', maxWidth: 900 }}>
              <textarea
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                rows={16}
                style={{ width: '100%', fontSize: 15, fontFamily: 'monospace', padding: 12, borderRadius: 8, border: '1.5px solid #1976d2', background: '#f9fafb', marginBottom: 12 }}
                placeholder='Paste or edit your policy JSON here'
                disabled={updateLoading}
              />
              <div style={{ display: 'flex', gap: 16 }}>
                <button
                  onClick={handleUpdatePolicy}
                  style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '0.6rem 1.5rem', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                  disabled={updateLoading}
                >
                  {updateLoading ? 'Updating...' : 'Submit'}
                </button>
                <button
                  onClick={() => { setShowInput(false); setInputValue(''); setUpdateError(''); setUpdateSuccess(''); }}
                  style={{ background: '#e0e0e0', color: '#374151', border: 'none', borderRadius: 6, padding: '0.6rem 1.5rem', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}
                  disabled={updateLoading}
                >
                  Cancel
                </button>
              </div>
              {updateError && <div style={{ color: 'red', marginTop: 8 }}>{updateError}</div>}
              {updateSuccess && <div style={{ color: '#388e3c', marginTop: 8 }}>{updateSuccess}</div>}
            </div>
          ) : (
            <>
              <div style={{ paddingBottom: 24, paddingLeft: 8, paddingRight: 8 }}>
                <button
                  style={{
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '0.75rem 2rem',
                    fontWeight: 600,
                    fontSize: 16,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
                  }}
                  onClick={() => {
                    setShowInput(true);
                    setInputValue(JSON.stringify(policy, null, 2));
                    setUpdateError('');
                    setUpdateSuccess('');
                  }}
                >
                  Update Policy
                </button>
              </div>
              <pre style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: 8, fontSize: 16, overflowX: 'auto', margin: 0 }}>{JSON.stringify(policy, null, 2)}</pre>
            </>
          )}
        </div>
      ) : null}
      {!loading && !error && !policy && (
        <p style={{ color: '#888', textAlign: 'center', fontSize: 18, margin: '2rem 0' }}>No policy data found.</p>
      )}
    </div>
  );
};

export default PolicyManagement;