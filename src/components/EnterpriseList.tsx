import React, { useEffect, useState } from 'react';
import { getAuthToken } from '../api';
import { fetchOrgs, fetchMyOrg } from '../api/Api';

interface Organization {
  id: string;
  name: string;
  enterpriseId: string;
  status: string;
  cloudProjectId?: string;
  enterpriseName?: string;
  organizationStatus?: string;
}

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

const EnterpriseList: React.FC<{ isSuperAdmin: boolean; activeTab: string; }> = ({ isSuperAdmin, activeTab }) => {
  const token = getAuthToken();
  const [orgs, setOrgs] = useState<Organization[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    if (!token) {
      setError('No token found. Please login again.');
      setLoading(false);
      return;
    }
    const payload = parseJwt(token);
    const isSuperAdmin = payload?.role === 'SUPER_ADMIN';
    (isSuperAdmin ? fetchOrgs(token) : fetchMyOrg(token))
      .then(data => setOrgs(isSuperAdmin ? data : [data]))
      .catch(err => setError(typeof err === 'string' ? err : err.message))
      .finally(() => setLoading(false));
  }, [activeTab, token]);

  if (loading) return <p>Loading organization info...</p>;
  if (error && !error.includes('Failed to fetch organization')) return <p style={{color: 'red'}}>{error}</p>;

  if (!loading && !error && orgs && orgs.length > 0 && activeTab === 'organizations') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(44,62,80,0.13)', padding: '2.5rem 3.5rem', minWidth: 480, maxWidth: 1200, width: '100%' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f3f4f6' }}>
                <th style={{ textAlign: 'left', padding: '1rem', color: '#1976d2', fontSize: 16, fontWeight: 700, borderBottom: '2px solid #e0e0e0' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: '#1976d2', fontSize: 16, fontWeight: 700, borderBottom: '2px solid #e0e0e0' }}>ID</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: '#1976d2', fontSize: 16, fontWeight: 700, borderBottom: '2px solid #e0e0e0' }}>Enterprise ID</th>
                <th style={{ textAlign: 'left', padding: '1rem', color: '#1976d2', fontSize: 16, fontWeight: 700, borderBottom: '2px solid #e0e0e0' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map(org => (
                <tr key={org.id} style={{ borderBottom: '1px solid #e0e0e0', background: '#fff' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{org.name}</td>
                  <td style={{ padding: '1rem', color: '#374151' }}>{org.id}</td>
                  <td style={{ padding: '1rem', color: '#374151' }}>{org.enterpriseId}</td>
                  <td style={{ padding: '1rem', color: org.status === 'ACTIVE' ? '#388e3c' : '#d32f2f', fontWeight: 600 }}>{org.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!loading && (!orgs || orgs.length === 0 || (error && error.includes('Failed to fetch organization')))) {
    return (
      <div>
        <p style={{ color: '#888', textAlign: 'center', fontSize: 18, margin: '2rem 0' }}>No data found.</p>
      </div>
    );
  }

  // Enterprise tab for non-superadmin
  if (!isSuperAdmin && activeTab === 'enterprise') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(44,62,80,0.13)', padding: '2.5rem 3.5rem', minWidth: 480, maxWidth: 1200, width: '100%' }}>
          {loading && <p>Loading enterprise info...</p>}
          {error && <p style={{color: 'red'}}>{error}</p>}
          {!loading && !error && orgs && orgs.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#1976d2', fontSize: 16, fontWeight: 700, borderBottom: '2px solid #e0e0e0' }}>Name</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#1976d2', fontSize: 16, fontWeight: 700, borderBottom: '2px solid #e0e0e0' }}>ID</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#1976d2', fontSize: 16, fontWeight: 700, borderBottom: '2px solid #e0e0e0' }}>Cloud Project ID</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#1976d2', fontSize: 16, fontWeight: 700, borderBottom: '2px solid #e0e0e0' }}>Enterprise Name</th>
                  <th style={{ textAlign: 'left', padding: '1rem', color: '#1976d2', fontSize: 16, fontWeight: 700, borderBottom: '2px solid #e0e0e0' }}>Organization Status</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map(org => (
                  <tr key={org.id} style={{ borderBottom: '1px solid #e0e0e0', background: '#fff' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{org.name}</td>
                    <td style={{ padding: '1rem', color: '#374151' }}>{org.id}</td>
                    <td style={{ padding: '1rem', color: '#374151' }}>{org.cloudProjectId || '-'}</td>
                    <td style={{ padding: '1rem', color: '#374151' }}>{org.enterpriseName || '-'}</td>
                    <td style={{ padding: '1rem', color: org.organizationStatus === 'ACTIVE' ? '#1976d2' : '#1976d2', fontWeight: 600 }}>{org.organizationStatus || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && !error && (!orgs || orgs.length === 0) && (
            <div>
              <p style={{ color: '#888', textAlign: 'center', fontSize: 18, margin: '2rem 0' }}>No data found.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default EnterpriseList;