import React, { useEffect, useState, useRef } from 'react';
import { fetchDevices, fetchEnrollmentToken, fetchDeviceLocation } from '../api/Api';
import { API_BASE_URL } from '../api/baseUrl';
import styles from './DeviceList.module.css';

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
  const [fabPressed, setFabPressed] = useState(false);
  const [showQrSuccess, setShowQrSuccess] = useState(false);
  const [deviceLocations, setDeviceLocations] = useState<Record<string, { latitude: number; longitude: number } | null>>({});
  const [locationLoading, setLocationLoading] = useState<Record<string, boolean>>({});
  const [locationVisible, setLocationVisible] = useState<Record<string, boolean>>({});
  const qrTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enterpriseName || !token) return;
    setLoading(true);
    setError('');
    fetchDevices(enterpriseName, token)
      .then(data => setDevices(Array.isArray(data) ? data : []))
      .catch(err => setError(typeof err === 'string' ? err : err.message))
      .finally(() => setLoading(false));
  }, [enterpriseName, token]);

  useEffect(() => {
    if (!devices) return;
    // Fetch location for each device serial number
    devices.forEach(device => {
      const serial = device.hardwareInfo && device.hardwareInfo.serialNumber;
      if (serial) {
        fetchDeviceLocation(serial).then(loc => {
          // Normalize location object to { latitude, longitude } or null
          let normalizedLoc: { latitude: number; longitude: number } | null = null;
          if (loc && typeof (loc as any).latitude === 'number' && typeof (loc as any).longitude === 'number') {
            normalizedLoc = { latitude: (loc as any).latitude, longitude: (loc as any).longitude };
          } else if (loc && typeof (loc as any).lat === 'number' && typeof (loc as any).long === 'number') {
            normalizedLoc = { latitude: (loc as any).lat, longitude: (loc as any).long };
          }
          setDeviceLocations(prev => ({ ...prev, [serial]: normalizedLoc }));
        });
      }
    });
    // Debug: log the full deviceLocations object after each devices update
    console.log('Current deviceLocations state:', deviceLocations);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devices]);

  const handleAddDevice = async () => {
    setFabPressed(true);
    setTimeout(() => setFabPressed(false), 180); // Animation duration
    setQrLoading(true);
    setQrError('');
    setQrCode(null);
    setShowQrSuccess(false);
    try {
      const blob = await fetchEnrollmentToken(enterpriseName, token, 'policy1');
      if (blob.type.startsWith('image/')) {
        setQrCode(URL.createObjectURL(blob));
        setShowQrSuccess(true);
        if (qrTimeoutRef.current) clearTimeout(qrTimeoutRef.current);
        qrTimeoutRef.current = setTimeout(() => setShowQrSuccess(false), 1800);
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
    <div className={styles.deviceListRoot}>
      <div className={styles.deviceListContainer}>
        <div className={styles.deviceListHeader} style={{ paddingTop: 24, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 className={styles.deviceListTitle} style={{ paddingTop: 8, textAlign: 'left', margin: 0 }}>Devices</h3>
          <button
            className={`${styles.addDeviceBtn} ${fabPressed ? styles.fabPressed : ''}`}
            onClick={handleAddDevice}
            disabled={qrLoading}
            aria-label="Add Device"
          >
            <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', userSelect: 'none', letterSpacing: 0.5, fontFamily: 'Inter, Roboto, "Segoe UI", Arial, sans-serif' }}>Add Device</span>
            {/* Ripple effect */}
            <span className={styles.fabRipple} />
          </button>
        </div>
        {qrError && <p style={{ color: '#b3261e', fontWeight: 500 }}>{qrError}</p>}
        {qrCode && (
          <div style={{ margin: '2rem 0', textAlign: 'center', position: 'relative' }}>
            {showQrSuccess && (
              <div className={styles.qrSuccessCheck} style={{ position: 'absolute', left: 0, right: 0, top: '-60px', margin: '0 auto', width: 48, zIndex: 2, display: 'flex', justifyContent: 'center' }}>
                <svg width="48" height="48" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="22" fill="#00c853" opacity="0.15" />
                  <circle cx="24" cy="24" r="20" fill="#00c853" opacity="0.25" />
                  <path d="M16 25l6 6 10-12" fill="none" stroke="#00c853" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
            <img src={qrCode} alt="Enrollment QR Code" style={{ maxWidth: 320, maxHeight: 320, marginBottom: 16, borderRadius: 16, boxShadow: '0 2px 12px #6750a422' }} />
            <div style={{ color: '#49454f', fontSize: 18, marginTop: 8, fontWeight: 500 }}>
              Please scan this QR from your device to register it with the organization.
            </div>
          </div>
        )}
        {loading && <p style={{ color: '#49454f', fontWeight: 500 }}>Loading devices...</p>}
        {error && <p style={{ color: '#b3261e', fontWeight: 500 }}>{error}</p>}
        {devices && devices.length > 0 ? (
          <div className={styles.deviceListCards}>
            {devices.map((device, idx) => {
              // Get model and brand from hardwareInfo if available
              let model = device.model || '-';
              let brand = '';
              if (device.hardwareInfo && typeof device.hardwareInfo === 'object') {
                if (device.hardwareInfo.model) model = device.hardwareInfo.model;
                if (device.hardwareInfo.brand) brand = device.hardwareInfo.brand;
              }
              const modelDisplay = brand ? `${brand} ${model}` : model;
              return (
                <div key={device.id || idx} className={styles.deviceCard}>
                  {/* Accent Bar */}
                  <div className={styles.accentBar} />
                  {/* Header Section */}
                  <div className={styles.deviceCardHeader}>
                    <span className={styles.deviceCardHeaderTitle}>
                      <span className={styles.deviceCardHeaderDevice}>devices</span>
                      <span className={styles.deviceCardHeaderModel}>{modelDisplay}</span>
                    </span>
                    <span className={styles.deviceCardHeaderStatus}>
                      <span className={styles.deviceCardHeaderStatusDot}>●</span>
                      {device.state || '-'}
                    </span>
                  </div>
                  {/* Info Section */}
                  <div className={styles.deviceCardInfo}>
                    <div className={styles.deviceCardInfoLabel}>
                      Serial Number: <span className={styles.deviceCardInfoValue}>{device.hardwareInfo && device.hardwareInfo.serialNumber ? device.hardwareInfo.serialNumber : '-'}</span>
                    </div>
                    <div className={styles.deviceCardInfoLabel}>
                      Last Policy Sync: <span className={styles.deviceCardInfoValue}>{device.lastPolicySyncTime ? new Date(device.lastPolicySyncTime).toLocaleString() : '-'}</span>
                    </div>
                    <div className={styles.deviceCardInfoLabel}>
                      Last Status Report: <span className={styles.deviceCardInfoValue}>{device.lastStatusReportTime ? new Date(device.lastStatusReportTime).toLocaleString() : '-'}</span>
                    </div>
                    <div className={styles.deviceCardInfoLabel}>
                      Ownership: <span className={styles.deviceCardInfoValue}>{device.ownership || '-'}</span>
                    </div>
                    <div className={styles.deviceCardInfoLabel}>
                      Policy Name: <span className={styles.deviceCardInfoValue}>{device.policyName || '-'}</span>
                    </div>
                    <div className={styles.deviceCardInfoLabel}>
                      Location: <span className={styles.deviceCardInfoValue}>
                        {(() => {
                          const serial = device.hardwareInfo && device.hardwareInfo.serialNumber;
                          return (
                            <>
                              <button
                                className={styles.locationIconBtn}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 6, verticalAlign: 'middle' }}
                                title="Show on Map"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  if (!serial) return;
                                  setLocationLoading(prev => ({ ...prev, [serial]: true }));
                                  try {
                                    // Always fetch the latest location from the API
                                    const apiLoc = await fetchDeviceLocation(serial);
                                    let normalizedLoc: { latitude: number; longitude: number } | null = null;
                                    if (apiLoc && typeof (apiLoc as any).latitude === 'number' && typeof (apiLoc as any).longitude === 'number') {
                                      normalizedLoc = { latitude: (apiLoc as any).latitude, longitude: (apiLoc as any).longitude };
                                    } else if (apiLoc && typeof (apiLoc as any).lat === 'number' && typeof (apiLoc as any).long === 'number') {
                                      normalizedLoc = { latitude: (apiLoc as any).lat, longitude: (apiLoc as any).long };
                                    }
                                    setDeviceLocations(prev => ({ ...prev, [serial]: normalizedLoc }));
                                    setLocationVisible(prev => ({ ...prev, [serial]: true }));
                                    if (normalizedLoc && typeof normalizedLoc.latitude === 'number' && typeof normalizedLoc.longitude === 'number') {
                                      const url = `https://www.google.com/maps?q=${normalizedLoc.latitude},${normalizedLoc.longitude}`;
                                      window.open(url, '_blank');
                                    } else {
                                      alert('Location not available.');
                                    }
                                  } finally {
                                    setLocationLoading(prev => ({ ...prev, [serial]: false }));
                                  }
                                }}
                                disabled={locationLoading[serial]}
                              >
                                {/* Map pin icon */}
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#388e3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 10.5a8.38 8.38 0 0 1-1.9 5.4c-1.5 2-4.1 4.6-6.1 6.1-2-1.5-4.6-4.1-6.1-6.1A8.38 8.38 0 0 1 3 10.5 8.5 8.5 0 0 1 12 2a8.5 8.5 0 0 1 9 8.5z" />
                                  <circle cx="12" cy="10.5" r="3.5" />
                                </svg>
                              </button>
                              {locationLoading[serial] && <span style={{ marginLeft: 8, color: '#009688', fontSize: 12 }}>Loading...</span>}
                              {locationVisible[serial] && deviceLocations[serial] && (() => {
                                const loc = deviceLocations[serial];
                                if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
                                  return (
                                    <span style={{ marginLeft: 8, color: '#009688', fontSize: 13, fontWeight: 500 }}>
                                      {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                                    </span>
                                  );
                                }
                                return null;
                              })()}
                            </>
                          );
                        })()}
                      </span>
                    </div>
                    {/* Link Location Button Section - only show if location is empty and place just below location text */}
                    {(() => {
                      const serial = device.hardwareInfo && device.hardwareInfo.serialNumber;
                      const loc = deviceLocations[serial];
                      // Only show if location is truly missing (null or not a number)
                      const hasLocation = loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number';
                      if (!hasLocation) {
                        // Extract only the enterpriseId from device.name (format: 'enterprises/{enterpriseId}/devices/{deviceId}')
                        let enterpriseId = '';
                        if (typeof device.name === 'string') {
                          const match = device.name.match(/enterprises\/([^/]+)/);
                          if (match) {
                            enterpriseId = match[1];
                          }
                        }
                        return (
                          <div style={{ marginTop: 2, marginBottom: 0, display: 'flex', justifyContent: 'flex-start' }}>
                            <button
                              className={styles.addDeviceBtn}
                              style={{ fontSize: 12, padding: '1px 4px', borderRadius: 4, fontWeight: 600, backgroundColor: '#1976d2', color: '#fff', border: 'none', minWidth: 0, marginLeft: 0, lineHeight: 1.2 }}
                              onClick={async () => {
                                try {
                                  const res = await fetch(`${API_BASE_URL}/enterprise/latest-enrolled-device?enterpriseName=enterprises%2F${encodeURIComponent(enterpriseId)}`,
                                    { method: 'POST' });
                                  if (!res.ok) throw new Error('Failed to link location');
                                  alert('Location linked successfully');
                                  // Immediately refetch and update the device location for this serial
                                  const apiLoc = await fetchDeviceLocation(serial);
                                  let normalizedLoc: { latitude: number; longitude: number } | null = null;
                                  if (apiLoc && typeof (apiLoc as any).latitude === 'number' && typeof (apiLoc as any).longitude === 'number') {
                                    normalizedLoc = { latitude: (apiLoc as any).latitude, longitude: (apiLoc as any).longitude };
                                  } else if (apiLoc && typeof (apiLoc as any).lat === 'number' && typeof (apiLoc as any).long === 'number') {
                                    normalizedLoc = { latitude: (apiLoc as any).lat, longitude: (apiLoc as any).long };
                                  }
                                  setDeviceLocations(prev => ({ ...prev, [serial]: normalizedLoc }));
                                } catch (err: any) {
                                  alert('Failed to link location: ' + (err.message || err));
                                }
                              }}
                              type="button"
                            >
                              Link Location
                            </button>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                  {/* Software Info Section */}
                  {device.softwareInfo && Array.isArray(device.softwareInfo) && device.softwareInfo.length > 0 && (
                    <div style={{ marginBottom: 14, animation: 'fadeInUp 1.3s' }}>
                      <div className={styles.deviceCardTableTitle}>Software Info</div>
                      <table className={styles.deviceCardTable}>
                        <thead>
                          <tr>
                            <th className={styles.deviceCardTableTh}>Package</th>
                            <th className={styles.deviceCardTableTh}>Version</th>
                            <th className={styles.deviceCardTableTh}>State</th>
                          </tr>
                        </thead>
                        <tbody>
                          {device.softwareInfo.map((sw: any, i: number) => (
                            <tr key={i}>
                              <td className={styles.deviceCardTableTd}>{sw.packageName || '-'}</td>
                              <td className={styles.deviceCardTableTd}>{sw.version || '-'}</td>
                              <td className={styles.deviceCardTableTd}>{sw.state || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {/* Application Reports Section */}
                  {device.applicationReports && Array.isArray(device.applicationReports) && device.applicationReports.length > 0 && (
                    (() => {
                      const userFacingApps = device.applicationReports.filter((app: any) => app.userFacingType === 'USER_FACING');
                      if (userFacingApps.length === 0) return null;
                      return (
                        <div style={{ marginBottom: 12, animation: 'fadeInUp 1.4s' }}>
                          <div className={styles.deviceCardAppTitle}>User Facing Applications</div>
                          <table className={styles.deviceCardAppTable}>
                            <thead>
                              <tr>
                                <th className={styles.deviceCardAppTh}>Display Name</th>
                                <th className={styles.deviceCardAppTh}>State</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userFacingApps.map((app: any, i: number) => (
                                <tr key={i}>
                                  <td className={styles.deviceCardAppTd}>{app.displayName || '-'}</td>
                                  <td className={styles.deviceCardAppTd}>{app.state || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()
                  )}
                  {/* Unlink Device Button Section */}
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className={styles.addDeviceBtn}
                      style={{ fontSize: 13, padding: '4px 12px', borderRadius: 6, fontWeight: 600, backgroundColor: '#b3261e', color: '#fff', border: 'none', minWidth: 0, marginLeft: 0, lineHeight: 1.2 }}
                      onClick={async () => {
                        // Parse enterpriseId and deviceId from device.name (format: 'enterprises/{enterpriseId}/devices/{deviceId}')
                        let enterpriseId = '';
                        let deviceId = '';
                        if (typeof device.name === 'string') {
                          const match = device.name.match(/enterprises\/(.+?)\/devices\/(.+)/);
                          if (match) {
                            enterpriseId = match[1];
                            deviceId = match[2];
                          }
                        }
                        if (!enterpriseId || !deviceId) {
                          alert('Missing enterprise or device ID');
                          return;
                        }
                        if (!window.confirm('Are you sure you want to unlink this device?')) return;
                        try {
                          const res = await fetch(`${API_BASE_URL}/enterprise/${encodeURIComponent(enterpriseId)}/${encodeURIComponent(deviceId)}`, {
                            method: 'DELETE',
                          });
                          if (!res.ok) throw new Error('Failed to unlink device');
                          alert('Device unlinked successfully');
                          setDevices(devices => devices ? devices.filter(d => d.id !== device.id) : devices);
                        } catch (err: any) {
                          alert('Failed to unlink device: ' + (err.message || err));
                        }
                      }}
                      type="button"
                    >
                      Unlink Device
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (!loading && !error && (
          <p className={styles.deviceListNoDevices}>No devices found.</p>
        ))}
      </div>
    </div>
  );
};

export default DeviceList;

export {};