import React, { useEffect, useState } from 'react';
import { getAuthToken } from '../api';
import { useNavigate } from 'react-router-dom';
import DeviceList from './DeviceList';
import PolicyManagement from './PolicyManagement';
import EnterpriseList from './EnterpriseList';
import { fetchOrgs, fetchMyOrg } from '../api/Api';
import styles from './Dashboard.module.css';

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
    (isSuperAdmin ? fetchOrgs(token) : fetchMyOrg(token))
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
    <div className={styles.dashboardRoot}>
      <header className={styles.header}>
        <span className={styles.brand}>
          {isSuperAdmin ? 'Admin Dashboard' : 'Dashboard'}
        </span>
        <nav className={styles.nav}>
          {isSuperAdmin ? (
            <span className={styles.tabSuperAdmin}>Organizations</span>
          ) : (
            <>
              <span
                onClick={() => setActiveTab('enterprise')}
                className={activeTab === 'enterprise' ? styles.tabActive : styles.tab}
              >Enterprise</span>
              <span
                onClick={() => setActiveTab('devices')}
                className={activeTab === 'devices' ? styles.tabActive : styles.tab}
              >Devices</span>
              <span
                onClick={() => setActiveTab('policies')}
                className={activeTab === 'policies' ? styles.tabActive : styles.tab}
              >Policies</span>
              <span className={styles.tab}>Users</span>
            </>
          )}
        </nav>
        <span className={styles.userInfo}>
          Logged in as: {isSuperAdmin ? 'Super Admin' : (payload?.role || 'User')}
        </span>
        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
      </header>
      <main>
        {isSuperAdmin || activeTab === 'enterprise' ? (
          <EnterpriseList isSuperAdmin={isSuperAdmin} activeTab={activeTab} />
        ) : null}
        {/* Devices and Policies tabs for non-superadmin */}
        {!isSuperAdmin && activeTab === 'devices' && orgs && orgs[0]?.enterpriseName && token && (
          <DeviceList enterpriseName={orgs[0].enterpriseName} token={token} />
        )}
        {!isSuperAdmin && activeTab === 'policies' && orgs && orgs[0]?.enterpriseName && token && (
          <PolicyManagement org={orgs[0]} token={token} />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
export {};
