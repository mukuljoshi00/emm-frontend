import React, { useEffect, useState } from 'react';
import { getAuthToken } from '../api';
import { useNavigate } from 'react-router-dom';
import DeviceList from './DeviceList';
import PolicyManagement from './PolicyManagement';

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

const Dashboard: React.FC = () => {
  const token = getAuthToken();
  const payload = token ? parseJwt(token) : null;
  const isSuperAdmin = payload?.role === 'SUPER_ADMIN';
  const [activeTab, setActiveTab] = useState(isSuperAdmin ? 'organizations' : 'enterprise');
  const [orgs, setOrgs] = useState<Organization[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    const token = getAuthToken();
    if (!token) {
      setError('No token found. Please login again.');
      setLoading(false);
      return;
    }
    const payload = parseJwt(token);
    const isSuperAdmin = payload?.role === 'SUPER_ADMIN';
    const headers = { Authorization: `Bearer ${token}` };
    fetch(isSuperAdmin ? 'http://localhost:8080/api/v1/orgs' : 'http://localhost:8080/api/v1/orgs/my', {
      headers: {
        ...headers,
        'Accept': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    })
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch organization(s)'))
      .then(data => setOrgs(isSuperAdmin ? data : [data]))
      .catch(err => setError(typeof err === 'string' ? err : err.message))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
      <header style={{
        background: '#fff',
        boxShadow: '0 2px 8px rgba(44,62,80,0.08)',
        padding: '1.2rem 2.5rem 1.2rem 2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <span style={{ fontWeight: 700, fontSize: 24, color: '#1976d2', letterSpacing: 1 }}>
            {isSuperAdmin ? 'Admin Dashboard' : 'Dashboard'}
          </span>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            {isSuperAdmin ? (
              <span style={{
                fontWeight: 600,
                fontSize: 18,
                color: '#1976d2',
                borderBottom: '3px solid #1976d2',
                paddingBottom: 6,
                cursor: 'pointer',
                background: 'none',
                outline: 'none',
              }}>Organizations</span>
            ) : (
              <>
                <span
                  onClick={() => setActiveTab('enterprise')}
                  style={{
                    fontWeight: 600,
                    fontSize: 18,
                    color: activeTab === 'enterprise' ? '#1976d2' : '#374151',
                    borderBottom: activeTab === 'enterprise' ? '3px solid #1976d2' : '3px solid transparent',
                    paddingBottom: 6,
                    cursor: 'pointer',
                    background: 'none',
                    outline: 'none',
                  }}
                >Enterprise</span>
                <span
                  onClick={() => setActiveTab('devices')}
                  style={{
                    fontWeight: 600,
                    fontSize: 18,
                    color: activeTab === 'devices' ? '#1976d2' : '#374151',
                    borderBottom: activeTab === 'devices' ? '3px solid #1976d2' : '3px solid transparent',
                    paddingBottom: 6,
                    cursor: 'pointer',
                    background: 'none',
                    outline: 'none',
                  }}
                >Devices</span>
                <span
                  onClick={() => setActiveTab('policies')}
                  style={{
                    fontWeight: 600,
                    fontSize: 18,
                    color: activeTab === 'policies' ? '#1976d2' : '#374151',
                    borderBottom: activeTab === 'policies' ? '3px solid #1976d2' : '3px solid transparent',
                    paddingBottom: 6,
                    cursor: 'pointer',
                    background: 'none',
                    outline: 'none',
                  }}
                >Policies</span>
                <span style={{
                  fontWeight: 600,
                  fontSize: 18,
                  color: '#374151',
                  borderBottom: '3px solid transparent',
                  paddingBottom: 6,
                  cursor: 'pointer',
                  background: 'none',
                  outline: 'none',
                }}>Users</span>
              </>
            )}
          </nav>
          <span style={{ marginLeft: '2rem', color: '#374151', fontSize: 15, fontWeight: 500, background: '#f3f4f6', borderRadius: 6, padding: '0.4rem 1rem' }}>
            Logged in as: {isSuperAdmin ? 'Super Admin' : (payload?.role || 'User')}
          </span>
        </div>
        <button onClick={handleLogout} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}>Logout</button>
      </header>
      <main style={{ maxWidth: 1000, margin: '2.5rem auto', background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(44,62,80,0.08)', padding: '2.5rem' }}>
        {loading && <p>Loading organization info...</p>}
        {error && !error.includes('Failed to fetch organization') && <p style={{color: 'red'}}>{error}</p>}
        {!loading && !error && orgs && orgs.length > 0 && activeTab === 'organizations' && (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
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
        )}
        {!loading && (!orgs || orgs.length === 0 || (error && error.includes('Failed to fetch organization'))) && (
          <div>
            <p style={{ color: '#888', textAlign: 'center', fontSize: 18, margin: '2rem 0' }}>No data found.</p>
          </div>
        )}
        {!isSuperAdmin && activeTab === 'devices' && orgs && orgs[0]?.enterpriseName && token && (
          <DeviceList enterpriseName={orgs[0].enterpriseName} token={token} />
        )}
        {!isSuperAdmin && activeTab === 'policies' && orgs && orgs[0]?.enterpriseName && token && (
          <PolicyManagement org={orgs[0]} token={token} />
        )}
        {!isSuperAdmin && activeTab === 'enterprise' && (
          <div>
            {loading && <p>Loading enterprise info...</p>}
            {error && <p style={{color: 'red'}}>{error}</p>}
            {!loading && !error && orgs && orgs.length > 0 && (
              <div>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
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
                        <td style={{ padding: '1rem', color: org.organizationStatus === 'ACTIVE' ? '#388e3c' : '#d32f2f', fontWeight: 600 }}>{org.organizationStatus || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!loading && !error && (!orgs || orgs.length === 0) && (
              <div>
                <p style={{ color: '#888', textAlign: 'center', fontSize: 18, margin: '2rem 0' }}>No data found.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
export {};
