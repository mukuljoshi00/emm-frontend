import React, { useEffect, useState } from 'react';

interface DeviceListProps {
  enterpriseName: string;
  token: string;
}

const DeviceList: React.FC<DeviceListProps> = ({ enterpriseName, token }) => {
  const [devices, setDevices] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrError, setQrError] = useState('');
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    if (!enterpriseName || !token) return;
    setLoading(true);
    setError('');
    fetch(`http://localhost:8080/api/enterprise/devices?enterpriseName=${encodeURIComponent(enterpriseName)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
      credentials: 'include',
      mode: 'cors',
    })
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch devices'))
      .then(data => setDevices(Array.isArray(data) ? data : []))
      .catch(err => setError(typeof err === 'string' ? err : err.message))
      .finally(() => setLoading(false));
  }, [enterpriseName, token]);

  const handleAddDevice = async () => {
    setQrLoading(true);
    setQrError('');
    setQrCode(null);
    try {
      const res = await fetch(`http://localhost:8080/api/enterprise/enrollment-token?enterpriseName=${encodeURIComponent(enterpriseName)}&policyName=policy1`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'image/png',
        },
        credentials: 'include',
        mode: 'cors',
      });
      if (!res.ok) throw new Error('Failed to get QR code');
      const blob = await res.blob();
      if (blob.type.startsWith('image/')) {
        setQrCode(URL.createObjectURL(blob));
      } else {
        setQrError('No QR code image received');
      }
    } catch (err: any) {
      setQrError(err.message || 'Failed to get QR code');
    } finally {
      setQrLoading(false);
    }
  };

  if (!enterpriseName) return null;

  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3 style={{ color: '#1976d2', margin: 0 }}>Devices</h3>
        <button
          style={{
            background: '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '0.6rem 1.5rem',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)'
          }}
          onClick={handleAddDevice}
          disabled={qrLoading}
        >
          {qrLoading ? 'Generating...' : '+ Add Device'}
        </button>
      </div>
      {qrError && <p style={{ color: 'red' }}>{qrError}</p>}
      {qrCode && (
        <div style={{ margin: '2rem 0', textAlign: 'center' }}>
          <img src={qrCode} alt="Enrollment QR Code" style={{ maxWidth: 320, maxHeight: 320, marginBottom: 16, borderRadius: 8, boxShadow: '0 2px 8px rgba(44,62,80,0.08)' }} />
          <div style={{ color: '#374151', fontSize: 17, marginTop: 8 }}>
            Please scan this QR from your device to register it with the organization.
          </div>
        </div>
      )}
      {loading && <p>Loading devices...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {devices && devices.length > 0 ? (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '1.5rem' }}>
          {devices.map((device, idx) => (
            <div key={device.id || idx} style={{
              background: '#fff',
              borderRadius: 10,
              boxShadow: '0 2px 8px rgba(44,62,80,0.08)',
              padding: '2.5rem',
              minWidth: 480,
              maxWidth: 700,
              flex: '1 1 480px',
              marginBottom: '1rem',
              overflowX: 'auto',
            }}>
              <div style={{
                borderBottom: '1px solid #e0e0e0',
                marginBottom: 16,
                paddingBottom: 10,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 24,
                fontWeight: 600,
                fontSize: 18,
                color: '#1976d2',
              }}>
                <span>Model: {device.model || '-'}</span>
                <span style={{ color: '#374151', fontWeight: 400, fontSize: 15 }}>
                  Enrollment Time: {device.enrollmentTime ? new Date(device.enrollmentTime).toLocaleString() : '-'}
                </span>
              </div>
              <pre style={{ background: '#f3f4f6', padding: '1.5rem', borderRadius: 8, fontSize: 16, overflowX: 'auto', margin: 0 }}>{JSON.stringify(device, null, 2)}</pre>
            </div>
          ))}
        </div>
      ) : (!loading && !error && (
        <p style={{ color: '#888', textAlign: 'left', fontSize: 18, margin: '2rem 0' }}>No devices found.</p>
      ))}
    </div>
  );
};

export default DeviceList;

export {};