import React, { useState, useEffect, useRef } from 'react';
import styles from './PolicyUITab.module.css';

type PermittedApp = { packageName?: string; minVersion?: string };

interface Policy {
  name: string;
  version: string;
  screenCaptureDisabled: boolean;
  cameraDisabled: boolean;
  addUserDisabled: boolean;
  factoryResetDisabled: boolean;
  installAppsDisabled: boolean;
  mountPhysicalMediaDisabled: boolean;
  modifyAccountsDisabled: boolean;
  safeBootDisabled: boolean;
  uninstallAppsDisabled: boolean;
  vpnConfigDisabled: boolean;
  removeUserDisabled: boolean;
  shareLocationDisabled: boolean;
  unmuteMicrophoneDisabled: boolean;
  usbFileTransferDisabled: boolean;
  ensureVerifyAppsEnabled: boolean;
  installUnknownSourcesAllowed: boolean;
  debuggingFeaturesAllowed: boolean;
  usbMassStorageEnabled: boolean;
  passwordQuality: 'ANY' | 'NUMERIC' | 'ALPHANUMERIC' | 'COMPLEX';
  wifiConfigType: 'NONE' | 'WPA2' | 'WPA3';
  permittedApps: PermittedApp[];
}

const initialPolicy: Policy = {
  name: 'Default Policy',
  version: '1.0.0',
  screenCaptureDisabled: false,
  cameraDisabled: false,
  addUserDisabled: false,
  factoryResetDisabled: false,
  installAppsDisabled: false,
  mountPhysicalMediaDisabled: false,
  modifyAccountsDisabled: false,
  safeBootDisabled: false,
  uninstallAppsDisabled: false,
  vpnConfigDisabled: false,
  removeUserDisabled: false,
  shareLocationDisabled: false,
  unmuteMicrophoneDisabled: false,
  usbFileTransferDisabled: false,
  ensureVerifyAppsEnabled: false,
  installUnknownSourcesAllowed: false,
  debuggingFeaturesAllowed: false,
  usbMassStorageEnabled: false,
  passwordQuality: 'ANY',
  wifiConfigType: 'NONE',
  permittedApps: [],
};

const toggleFields: Array<keyof typeof initialPolicy> = [
  'screenCaptureDisabled',
  'cameraDisabled',
  'addUserDisabled',
  'factoryResetDisabled',
  'installAppsDisabled',
  'mountPhysicalMediaDisabled',
  'modifyAccountsDisabled',
  'safeBootDisabled',
  'uninstallAppsDisabled',
  'vpnConfigDisabled',
  'removeUserDisabled',
  'shareLocationDisabled',
  'unmuteMicrophoneDisabled',
  'usbFileTransferDisabled',
  'ensureVerifyAppsEnabled',
  'installUnknownSourcesAllowed',
  'debuggingFeaturesAllowed',
  'usbMassStorageEnabled',
];

const enumFields = [
  { key: 'passwordQuality', label: 'Password Quality', options: ['ANY', 'NUMERIC', 'ALPHANUMERIC', 'COMPLEX'] },
  { key: 'wifiConfigType', label: 'WiFi Config Type', options: ['NONE', 'WPA2', 'WPA3'] },
];

const listFields = [
  { key: 'permittedApps', label: 'Permitted Apps', itemFields: ['packageName', 'minVersion'] },
];

// ENUM OPTIONS (partial, extend as needed)
const enumOptions = {
  defaultPermissionPolicy: ['PROMPT', 'GRANT', 'DENY'],
  locationMode: ['LOCATION_MODE_UNSPECIFIED', 'HIGH_ACCURACY', 'SENSORS_ONLY', 'BATTERY_SAVING', 'OFF'],
  appAutoUpdatePolicy: ['AUTO_UPDATE_POLICY_UNSPECIFIED', 'NEVER', 'WI_FI_ONLY', 'ALWAYS'],
  encryptionPolicy: ['ENCRYPTION_POLICY_UNSPECIFIED', 'ENABLED_WITHOUT_PASSWORD', 'ENABLED_WITH_PASSWORD'],
  playStoreMode: ['WHITELIST', 'BLACKLIST', 'ALL_APPS'],
  autoDateAndTimeZone: ['AUTO_DATE_AND_TIME_ZONE_UNSPECIFIED', 'AUTOMATIC', 'MANUAL'],
  cameraAccess: ['CAMERA_ACCESS_UNSPECIFIED', 'CAMERA_ACCESS_ALLOWED', 'CAMERA_ACCESS_BLOCKED'],
  microphoneAccess: ['MICROPHONE_ACCESS_UNSPECIFIED', 'MICROPHONE_ACCESS_ALLOWED', 'MICROPHONE_ACCESS_BLOCKED'],
  credentialProviderPolicyDefault: ['CREDENTIAL_PROVIDER_POLICY_DEFAULT_UNSPECIFIED', 'ALLOW', 'DISALLOW'],
  printingPolicy: ['PRINTING_POLICY_UNSPECIFIED', 'ALLOW', 'DISALLOW'],
  assistContentPolicy: ['ASSIST_CONTENT_POLICY_UNSPECIFIED', 'ALLOW', 'DISALLOW'],
  preferentialNetworkService: ['PREFERENTIAL_NETWORK_SERVICE_UNSPECIFIED', 'CELLULAR', 'WIFI'],
  enterpriseDisplayNameVisibility: ['ENTERPRISE_DISPLAY_NAME_VISIBILITY_UNSPECIFIED', 'ALWAYS', 'NEVER'],
};

// LIST OF ENUMS/STRINGS (partial, extend as needed)
const listOfEnums = [
  { key: 'keyguardDisabledFeatures', label: 'Keyguard Disabled Features', options: ['FEATURE_UNSPECIFIED', 'CAMERA', 'NOTIFICATIONS', 'UNREDACTED_NOTIFICATIONS', 'TRUST_AGENTS', 'FINGERPRINT', 'REMOTE_INPUT', 'SAFE_BOOT', 'ALL_FEATURES'] },
  { key: 'stayOnPluggedModes', label: 'Stay On Plugged Modes', options: ['BATTERY_PLUGGED_MODE_UNSPECIFIED', 'AC', 'USB', 'WIRELESS'] },
  { key: 'androidDevicePolicyTracks', label: 'Android Device Policy Tracks', options: ['APP_TRACK_UNSPECIFIED', 'PRODUCTION', 'BETA', 'DEV'] },
  { key: 'wipeDataFlags', label: 'Wipe Data Flags', options: ['WIPE_DATA_FLAG_UNSPECIFIED', 'PRESERVE_RESET_PROTECTION_DATA', 'WIPE_EXTERNAL_STORAGE', 'WIPE_ESIM'] },
];

const listOfStrings = [
  { key: 'frpAdminEmails', label: 'FRP Admin Emails' },
  { key: 'accountTypesWithManagementDisabled', label: 'Account Types With Management Disabled' },
];

// LIST OF OBJECTS (partial, extend as needed)
const listOfObjects = [
  { key: 'applications', label: 'Applications', itemFields: ['packageName', 'installType', 'defaultPermissionPolicy'] },
  { key: 'persistentPreferredActivities', label: 'Persistent Preferred Activities', itemFields: ['receiverActivity', 'actions', 'categories'] },
  { key: 'choosePrivateKeyRules', label: 'Choose Private Key Rules', itemFields: ['packageNames', 'privateKeyAlias'] },
  { key: 'complianceRules', label: 'Compliance Rules', itemFields: ['name', 'condition', 'action'] },
  { key: 'passwordPolicies', label: 'Password Policies', itemFields: ['passwordQuality', 'minimumLength'] },
  { key: 'policyEnforcementRules', label: 'Policy Enforcement Rules', itemFields: ['name', 'enforcementType'] },
  { key: 'oncCertificateProviders', label: 'ONC Certificate Providers', itemFields: ['providerId', 'certificate'] },
  { key: 'setupActions', label: 'Setup Actions', itemFields: ['actionType', 'description'] },
];

const fieldLabels: Record<string, string> = {
  name: 'Name',
  version: 'Version',
  screenCaptureDisabled: 'Screen Capture Disabled',
  cameraDisabled: 'Camera Disabled',
  addUserDisabled: 'Add User Disabled',
  factoryResetDisabled: 'Factory Reset Disabled',
  installAppsDisabled: 'Install Apps Disabled',
  mountPhysicalMediaDisabled: 'Mount Physical Media Disabled',
  modifyAccountsDisabled: 'Modify Accounts Disabled',
  safeBootDisabled: 'Safe Boot Disabled',
  uninstallAppsDisabled: 'Uninstall Apps Disabled',
  vpnConfigDisabled: 'VPN Config Disabled',
  removeUserDisabled: 'Remove User Disabled',
  shareLocationDisabled: 'Share Location Disabled',
  unmuteMicrophoneDisabled: 'Unmute Microphone Disabled',
  usbFileTransferDisabled: 'USB File Transfer Disabled',
  ensureVerifyAppsEnabled: 'Ensure Verify Apps Enabled',
  installUnknownSourcesAllowed: 'Install Unknown Sources Allowed',
  debuggingFeaturesAllowed: 'Debugging Features Allowed',
  usbMassStorageEnabled: 'USB Mass Storage Enabled',
};

const infoTexts: Record<string, string> = {
  screenCaptureDisabled: 'Prevents users from taking screenshots or screen recordings.',
  cameraDisabled: 'Disables the device camera for all users.',
  addUserDisabled: 'Prevents adding new users to the device.',
  factoryResetDisabled: 'Prevents users from performing a factory reset.',
  installAppsDisabled: 'Blocks installation of new apps by users.',
  mountPhysicalMediaDisabled: 'Prevents mounting of external storage media.',
  modifyAccountsDisabled: 'Prevents modification of user accounts on the device.',
  safeBootDisabled: 'Prevents device from booting into safe mode.',
  uninstallAppsDisabled: 'Prevents users from uninstalling apps.',
  vpnConfigDisabled: 'Prevents configuration of VPNs on the device.',
  removeUserDisabled: 'Prevents removal of users from the device.',
  shareLocationDisabled: 'Disables location sharing features.',
  unmuteMicrophoneDisabled: 'Prevents users from unmuting the microphone.',
  usbFileTransferDisabled: 'Blocks file transfer over USB.',
  ensureVerifyAppsEnabled: 'Ensures Google Play Protect is enabled.',
  installUnknownSourcesAllowed: 'Allows installation of apps from unknown sources.',
  debuggingFeaturesAllowed: 'Allows use of developer debugging features.',
  usbMassStorageEnabled: 'Enables USB mass storage mode.',
};

// ToggleSwitch component
const ToggleSwitch: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <label className={styles.toggleSwitchWrapper}>
    <input
      type="checkbox"
      className={styles.toggleSwitch}
      checked={checked}
      onChange={onChange}
    />
    <span className={styles.toggleSlider} />
  </label>
);

const PolicyUITab: React.FC = () => {
  const [policy, setPolicy] = useState<Policy>(initialPolicy);
  const [openInfo, setOpenInfo] = useState<string | null>(null);
  const [showJson, setShowJson] = useState(false);
  const infoButtonRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  useEffect(() => {
    if (!openInfo) return;
    function handleClickOutside(event: MouseEvent) {
      if (!openInfo) return;
      const ref = infoButtonRefs.current[openInfo];
      if (ref && !ref.contains(event.target as Node)) {
        setOpenInfo(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openInfo]);

  const handleToggle = (key: keyof typeof initialPolicy) => {
    setPolicy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEnumChange = (key: string, value: string) => {
    setPolicy(prev => ({ ...prev, [key]: value }));
  };

  // Helper type for list field keys
  const permittedAppsKey = 'permittedApps' as const;

  type ListFieldKey = typeof permittedAppsKey;

  const handleListAdd = (key: ListFieldKey) => {
    setPolicy(prev => ({ ...prev, [key]: [...prev[key], {}] }));
  };

  const handleListRemove = (key: ListFieldKey, idx: number) => {
    setPolicy(prev => ({ ...prev, [key]: prev[key].filter((_, i) => i !== idx) }));
  };

  const handleListItemChange = (key: ListFieldKey, idx: number, field: string, value: string) => {
    setPolicy(prev => ({
      ...prev,
      [key]: prev[key].map((item, i) => i === idx ? { ...item, [field]: value } : item),
    }));
  };

  // Split toggles into two columns
  const half = Math.ceil(toggleFields.length / 2);
  const leftToggles = toggleFields.slice(0, half);
  const rightToggles = toggleFields.slice(half);

  // InfoButton with popup (on click)
  const InfoButton: React.FC<{ info: string; field: string }> = ({ info, field }) => (
    <span
      ref={el => (infoButtonRefs.current[field] = el)}
      className={styles.infoButton + (openInfo === field ? ' ' + styles.infoButtonActive : '')}
      tabIndex={0}
      onClick={e => {
        e.stopPropagation();
        setOpenInfo(openInfo === field ? null : field);
      }}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          setOpenInfo(openInfo === field ? null : field);
        }
      }}
      aria-label="Show info"
    >
      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-label="Info">
        <circle cx="10" cy="10" r="9" stroke="#b0b8c1" strokeWidth="2" fill="#f7fafd" />
        <text x="10" y="15" textAnchor="middle" fontSize="13" fill="#b0b8c1" fontWeight="bold">i</text>
      </svg>
      {openInfo === field && (
        <span className={`${styles.infoPopup} ${styles.infoPopupOpen}`}>
          {info}
        </span>
      )}
    </span>
  );

  return (
    <div className={styles.policyUiContainer}>
      <h2 className={styles.policyUiTitle}>Policy UI</h2>
      <h3 className={styles.policyUiContent} style={{ fontWeight: 600, fontSize: '1.3rem', marginBottom: '1.2rem', marginTop: '-1.2rem' }}>
        General policy settings
      </h3>
      <form className={styles.policyUiForm}>
        <div className={styles.topRow}>
          <div className={styles.formRow} style={{ borderBottom: 'none', flex: 1 }}>
            <label className={styles.formLabel}>{fieldLabels.name}</label>
            <input className={styles.formInput} value={policy.name} readOnly disabled />
          </div>
          <div className={styles.formRow} style={{ borderBottom: 'none', flex: 1 }}>
            <label className={styles.formLabel}>{fieldLabels.version}</label>
            <input className={styles.formInput} value={policy.version} readOnly disabled />
          </div>
        </div>
        <div style={{ display: 'flex', width: '100%', gap: '2vw' }}>
          <div className={styles.formColumn}>
            {leftToggles.map(key => (
              <div className={styles.formRow} key={key}>
                <label className={styles.formLabel}>{fieldLabels[key]}</label>
                <InfoButton info={infoTexts[key] || ''} field={key} />
                <ToggleSwitch
                  checked={policy[key] as boolean}
                  onChange={() => handleToggle(key)}
                />
              </div>
            ))}
          </div>
          <div className={styles.formColumn}>
            {rightToggles.map(key => (
              <div className={styles.formRow} key={key}>
                <label className={styles.formLabel}>{fieldLabels[key]}</label>
                <InfoButton info={infoTexts[key] || ''} field={key} />
                <ToggleSwitch
                  checked={policy[key] as boolean}
                  onChange={() => handleToggle(key)}
                />
              </div>
            ))}
          </div>
        </div>
        {/* Enum fields */}
        {enumFields.map(field => (
          <div className={styles.formRow} key={field.key}>
            <label className={styles.formLabel}>{field.label}</label>
            <select
              className={styles.formInput}
              value={policy[field.key as keyof Policy] as string}
              onChange={e => handleEnumChange(field.key, e.target.value)}
            >
              {field.options.map(opt => (
                <option value={opt} key={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
        {/* List fields */}
        {listFields.map(field => (
          <div key={field.key} style={{ width: '100%', margin: '1.2rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <span className={styles.formLabel}>{field.label}</span>
              <button type="button" style={{ marginLeft: 12 }} onClick={() => handleListAdd(field.key as ListFieldKey)}>Add</button>
            </div>
            {(policy[field.key as ListFieldKey] || []).map((item, idx) => (
              <div className={styles.formRow} key={idx} style={{ paddingLeft: 24 }}>
                {field.itemFields.map(fld => (
                  <input
                    key={fld}
                    className={styles.formInput}
                    style={{ width: 120, marginRight: 8 }}
                    placeholder={fld}
                    value={item[fld as keyof PermittedApp] || ''}
                    onChange={e => handleListItemChange(field.key as ListFieldKey, idx, fld, e.target.value)}
                  />
                ))}
                <button type="button" style={{ marginLeft: 8 }} onClick={() => handleListRemove(field.key as ListFieldKey, idx)}>Remove</button>
              </div>
            ))}
          </div>
        ))}
        {/* ENUM FIELDS (Android Management API) */}
        {Object.entries(enumOptions).map(([key, options]) => (
          <div className={styles.formRow} key={key}>
            <label className={styles.formLabel}>{key}</label>
            <select
              className={styles.formInput}
              value={policy[key as keyof typeof policy] as string || ''}
              onChange={e => setPolicy(prev => ({ ...prev, [key]: e.target.value }))}
            >
              <option value="" disabled>Select...</option>
              {(options as string[]).map(opt => (
                <option value={opt} key={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}

        {/* LIST OF ENUMS/STRINGS (Android Management API) */}
        {listOfEnums.map(field => (
          <div className={styles.formRow} key={field.key}>
            <label className={styles.formLabel}>{field.label}</label>
            <select
              className={styles.formInput}
              multiple
              value={policy[field.key as keyof typeof policy] as string[] || []}
              onChange={e => {
                const selected = Array.from(e.target.selectedOptions, o => o.value);
                setPolicy(prev => ({ ...prev, [field.key]: selected }));
              }}
            >
              {field.options.map(opt => (
                <option value={opt} key={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
        {listOfStrings.map(field => (
          <div className={styles.formRow} key={field.key}>
            <label className={styles.formLabel}>{field.label}</label>
            <input
              className={styles.formInput}
              type="text"
              value={''}
              placeholder="Add and press Enter"
              onKeyDown={e => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  setPolicy(prev => ({
                    ...prev,
                    [field.key]: [...(prev[field.key as keyof typeof policy] as string[] || []), e.currentTarget.value],
                  }));
                  e.currentTarget.value = '';
                }
              }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginLeft: 8 }}>
              {(policy[field.key as keyof typeof policy] as string[] || []).map((val, idx) => (
                <span key={idx} style={{ background: '#e3e7ed', borderRadius: 6, padding: '2px 8px', marginRight: 2 }}>
                  {val}
                  <button type="button" style={{ marginLeft: 4 }} onClick={() => {
                    setPolicy(prev => ({
                      ...prev,
                      [field.key]: (prev[field.key as keyof typeof policy] as string[]).filter((_, i) => i !== idx),
                    }));
                  }}>x</button>
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* LIST OF OBJECTS (Android Management API) */}
        {listOfObjects.map(field => (
          <div key={field.key} style={{ width: '100%', margin: '1.2rem 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
              <span className={styles.formLabel}>{field.label}</span>
              <button type="button" style={{ marginLeft: 12 }} onClick={() => setPolicy(prev => ({ ...prev, [field.key]: [...(prev[field.key as keyof typeof policy] as any[] || []), {}] }))}>Add</button>
            </div>
            {(policy[field.key as keyof typeof policy] as any[] || []).map((item, idx) => (
              <div className={styles.formRow} key={idx} style={{ paddingLeft: 24 }}>
                {field.itemFields.map(fld => (
                  <input
                    key={fld}
                    className={styles.formInput}
                    style={{ width: 120, marginRight: 8 }}
                    placeholder={fld}
                    value={item[fld] || ''}
                    onChange={e => setPolicy(prev => ({
                      ...prev,
                      [field.key]: (prev[field.key as keyof typeof policy] as any[]).map((it, i) => i === idx ? { ...it, [fld]: e.target.value } : it),
                    }))}
                  />
                ))}
                <button type="button" style={{ marginLeft: 8 }} onClick={() => setPolicy(prev => ({
                  ...prev,
                  [field.key]: (prev[field.key as keyof typeof policy] as any[]).filter((_, i) => i !== idx),
                }))}>Remove</button>
              </div>
            ))}
          </div>
        ))}
      </form>
      <button style={{ marginTop: 24 }} onClick={() => setShowJson(j => !j)}>
        {showJson ? 'Hide Policy JSON' : 'Show Policy JSON'}
      </button>
      {showJson && (
        <pre style={{ background: '#f7fafd', padding: 16, borderRadius: 8, marginTop: 12, fontSize: 15, overflowX: 'auto' }}>
          {JSON.stringify(policy, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default PolicyUITab;
