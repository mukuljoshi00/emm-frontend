// ===========================================================================

import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';
import './PolicyManagement.css'; // Import the CSS file
import { fetchPolicy, updatePolicy } from '../api/Api';


interface PolicyManagementProps {
  org?: any;
  token?: string | null;
}

interface Application {
  defaultPermissionPolicy?: string;
  installType?: string;
  managedConfiguration?: { [key: string]: any };
  packageName: string;
  permissionGrants?: PermissionGrant[];
}

interface PermissionGrant {
  permission: string;
  policy: string;
}

interface PersistentPreferredActivity {
  actions: string[];
  categories: string[];
  receiverActivity: string;
}

interface PolicyData {
  advancedSecurityOverrides?: {
    developerSettings?: string;
    googlePlayProtectVerifyApps?: string;
    untrustedAppsPolicy?: string;
  };
  applications?: Application[];
  debuggingFeaturesAllowed?: boolean;
  defaultPermissionPolicy?: string;
  installUnknownSourcesAllowed?: boolean;
  ensureVerifyAppsEnabled?: boolean;
  name?: string;
  persistentPreferredActivities?: PersistentPreferredActivity[];
  playStoreMode?: string;
  statusReportingSettings?: {
    applicationReportsEnabled?: boolean;
    softwareInfoEnabled?: boolean;
  };
  version?: number;

  // 🔒 Additional Device Restriction Flags
  cameraDisabled?: boolean;
  addUserDisabled?: boolean;
  installAppsDisabled?: boolean;
  mountPhysicalMediaDisabled?: boolean;
  uninstallAppsDisabled?: boolean;
  removeUserDisabled?: boolean;
}


const PolicyManagement: React.FC<PolicyManagementProps> = ({ org, token }) => {
  const [policy, setPolicy] = useState<PolicyData>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    security: true,
    applications: true,
    permissions: true,
    activities: false,
    reporting: false
  });

  // Mock fetch function - replace with your actual API call
  // const fetchPolicyData = () => {
  //   if (!org || !org.enterpriseName || !token) return;
  //   setLoading(true);
  //   setError('');

  //   // Mock data for demonstration
  //   setTimeout(() => {
  //     const mockPolicy: PolicyData = {
  //       advancedSecurityOverrides: {
  //         developerSettings: "DEVELOPER_SETTINGS_ALLOWED",
  //         googlePlayProtectVerifyApps: "VERIFY_APPS_USER_CHOICE",
  //         untrustedAppsPolicy: "ALLOW_INSTALL_DEVICE_WIDE"
  //       },
  //       applications: [
  //         {
  //           defaultPermissionPolicy: "GRANT",
  //           installType: "AVAILABLE",
  //           managedConfiguration: {
  //             tracking_id: "XYZ123456789"
  //           },
  //           packageName: "com.example.locationtracker",
  //           permissionGrants: [
  //             {
  //               permission: "android.permission.ACCESS_FINE_LOCATION",
  //               policy: "GRANT"
  //             },
  //             {
  //               permission: "android.permission.ACCESS_COARSE_LOCATION",
  //               policy: "GRANT"
  //             }
  //           ]
  //         },
  //         {
  //           defaultPermissionPolicy: "GRANT",
  //           installType: "FORCE_INSTALLED",
  //           packageName: "com.spotify.music"
  //         }
  //       ],
  //       debuggingFeaturesAllowed: true,
  //       defaultPermissionPolicy: "PROMPT",
  //       installUnknownSourcesAllowed: true,
  //       name: "enterprises/LC02gl8uah/policies/policy1",
  //       persistentPreferredActivities: [
  //         {
  //           actions: ["android.intent.action.MAIN"],
  //           categories: ["android.intent.category.HOME", "android.intent.category.DEFAULT"],
  //           receiverActivity: "com.google.samples.apps.iosched.MainActivity"
  //         }
  //       ],
  //       playStoreMode: "BLACKLIST",
  //       statusReportingSettings: {
  //         applicationReportsEnabled: true,
  //         softwareInfoEnabled: true
  //       },
  //       version: 32
  //     };
  //     setPolicy(mockPolicy);
  //     setLoading(false);
  //   }, 1000);
  // };

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

  // Mock update call (ignore)
  // const handleUpdatePolicy = async () => {
  //   setUpdateLoading(true);
  //   setUpdateError('');
  //   setUpdateSuccess('');

  //   try {
  //     if (!org || !org.enterpriseName || !token) throw new Error('Missing organization or token');

  //     // Mock API call - replace with your actual updatePolicyLocal function
  //     await new Promise(resolve => setTimeout(resolve, 1500));

  //     setUpdateSuccess('Policy updated successfully!');
  //     fetchPolicyData();
  //   } catch (err: any) {
  //     setUpdateError(err.message || 'Failed to update policy');
  //   } finally {
  //     setUpdateLoading(false);
  //   }
  // };

  //TODO: Changes in format for update api call
  // const handleUpdatePolicy = async () => {
  // setUpdateLoading(true);
  // setUpdateError('');
  // setUpdateSuccess('');
  // try {
  //   if (!inputValue) throw new Error('Policy JSON cannot be empty');
  //   if (!org || !org.enterpriseName || !token) throw new Error('Missing organization or token');
  //   const parsed = JSON.parse(inputValue);
  //   // Ensure version is a string if present
  //   if (parsed && typeof parsed.version !== 'undefined') {
  //     parsed.version = String(parsed.version);
  //   }
  //   await updatePolicyLocal(org.enterpriseName, token, parsed);
  //   setUpdateSuccess('Policy updated successfully!');
  //   setShowInput(false);
  //   setInputValue('');
  //   fetchPolicyData(); // Refresh the policy after successful update
  // } catch (err: any) {
  //   setUpdateError(err.message || 'Failed to update policy');
  // } finally {
  //   setUpdateLoading(false);
  // }
  // };

  const handleUpdatePolicy = async () => {
    setUpdateLoading(true);
    setUpdateError('');
    setUpdateSuccess('');

    try {
      if (!org || !org.enterpriseName || !token) {
        throw new Error('Missing organization or token');
      }

      const policyToSend = { ...policy };

      // Optional: Ensure version is a string
      // if (policyToSend.version !== undefined) {
      //   policyToSend.version = String(policyToSend.version);
      // }
      console.log("PTO =>>>", policyToSend);

      await updatePolicy(org.enterpriseName, token, policyToSend);

      setUpdateSuccess('Policy updated successfully!');
      // setShowInput(false);
      fetchPolicyData(); // Refresh policy
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update policy');
    } finally {
      setUpdateLoading(false);
    }
  };

  const updatePolicyLocal = (path: string[], value: any) => {
    setPolicy(prev => {
      const newPolicy = { ...prev };
      let current: any = newPolicy;

      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }

      current[path[path.length - 1]] = value;
      return newPolicy;
    });
  };


  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const addApplication = () => {
    const newApp: Application = {
      packageName: '',
      installType: 'AVAILABLE',
      defaultPermissionPolicy: 'PROMPT'
    };

    setPolicy(prev => ({
      ...prev,
      applications: [...(prev.applications || []), newApp]
    }));
  };

  const removeApplication = (index: number) => {
    setPolicy(prev => ({
      ...prev,
      applications: prev.applications?.filter((_, i) => i !== index) || []
    }));
  };

  const addPermissionGrant = (appIndex: number) => {
    const newGrant: PermissionGrant = {
      permission: '',
      policy: 'PROMPT'
    };

    setPolicy(prev => {
      const newPolicy = { ...prev };
      if (!newPolicy.applications) newPolicy.applications = [];
      if (!newPolicy.applications[appIndex].permissionGrants) {
        newPolicy.applications[appIndex].permissionGrants = [];
      }
      newPolicy.applications[appIndex].permissionGrants!.push(newGrant);
      return newPolicy;
    });
  };

  const removePermissionGrant = (appIndex: number, grantIndex: number) => {
    setPolicy(prev => {
      const newPolicy = { ...prev };
      if (newPolicy.applications && newPolicy.applications[appIndex].permissionGrants) {
        newPolicy.applications[appIndex].permissionGrants =
          newPolicy.applications[appIndex].permissionGrants!.filter((_, i) => i !== grantIndex);
      }
      return newPolicy;
    });
  };

  if (!org || !org.enterpriseName) {
    return (
      <div className="text-center text-gray-500 text-lg mt-8">
        No enterprise found for this user.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading policy...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="policy-management-container">
      {/* Header */}
      <div className="policy-management-header">
        <h1 className="policy-management-title">Policy Management</h1>
        <button
          onClick={handleUpdatePolicy}
          disabled={updateLoading}
          className="policy-management-save-button"
        >
          <Save size={16} />
          {updateLoading ? 'Saving...' : 'Save Policy'}
        </button>
      </div>

      {/* Status Messages */}
      {updateError && (
        <div className="policy-management-error-message">
          {updateError}
        </div>
      )}
      {updateSuccess && (
        <div className="policy-management-success-message">
          {updateSuccess}
        </div>
      )}

      {/* Policy Name and Version */}
      <div className="policy-section">
        <div className="policy-grid-2-cols">
          <div>
            <label className="policy-label">Policy Name</label>
            <input
              type="text"
              value={policy.name || ''}
              onChange={(e) => updatePolicyLocal(['name'], e.target.value)}
              className="policy-input"
              placeholder="Policy name"
            />
          </div>
          <div>
            <label className="policy-label">Version</label>
            <input
              type="String"
              value={policy.version || 1}
              onChange={(e) => updatePolicyLocal(['version'], (e.target.value))}
              className="policy-input"
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="policy-section">
        <div
          className="policy-section-header"
          onClick={() => toggleSection('security')}
        >
          <h2 className="policy-section-title">Security Settings</h2>
          {expandedSections.security ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {expandedSections.security && (
          <div className="policy-section-content">
            {/* Basic Security */}
            <div className="policy-grid-2-cols">
              <div className="policy-checkbox-group">
                <label className="policy-label">Allow Debugging Features</label>
                <input
                  type="checkbox"
                  checked={policy.debuggingFeaturesAllowed || false}
                  onChange={(e) => updatePolicyLocal(['debuggingFeaturesAllowed'], e.target.checked)}
                  className="policy-checkbox"
                />
              </div>

              <div className="policy-checkbox-group">
                <label className="policy-label">Allow Unknown Sources</label>
                <input
                  type="checkbox"
                  checked={policy.installUnknownSourcesAllowed || false}
                  onChange={(e) => updatePolicyLocal(['installUnknownSourcesAllowed'], e.target.checked)}
                  className="policy-checkbox"
                />
              </div>
            </div>

            {/* Permission Policy */}
            <div className='policy-flex-column'>
              {/* Default Permission Policy Dropdown */}
              {policy?.defaultPermissionPolicy !== undefined && (
                <div className='policy-flex-row'>
                  <label className="policy-label">Default Permission Policy</label>
                  <select
                    value={policy.defaultPermissionPolicy || 'PROMPT'}
                    onChange={(e) => updatePolicyLocal(['defaultPermissionPolicy'], e.target.value)}
                    className="policy-select"
                  >
                    <option value="PROMPT">Prompt User</option>
                    <option value="GRANT">Grant All</option>
                    <option value="DENY">Deny All</option>
                  </select>
                </div>
              )}

              {policy?.cameraDisabled !== undefined && (
                <div className='policy-flex-row'>
                  <label className="policy-label">Camera Disabled</label>
                  <input
                    type="checkbox"
                    checked={policy.cameraDisabled}
                    onChange={(e) => updatePolicyLocal(['cameraDisabled'], e.target.checked)}
                  />
                </div>
              )}

              {policy?.addUserDisabled !== undefined && (
                <div className='policy-flex-row'>
                  <label className="policy-label">Add User Disabled</label>
                  <input
                    type="checkbox"
                    checked={policy.addUserDisabled}
                    onChange={(e) => updatePolicyLocal(['addUserDisabled'], e.target.checked)}
                  />
                </div>
              )}

              {policy?.installAppsDisabled !== undefined && (
                <div className='policy-flex-row'>
                  <label className="policy-label">Install Apps Disabled</label>
                  <input
                    type="checkbox"
                    checked={policy.installAppsDisabled}
                    onChange={(e) => updatePolicyLocal(['installAppsDisabled'], e.target.checked)}
                  />
                </div>
              )}

              {policy?.mountPhysicalMediaDisabled !== undefined && (
                <div className='policy-flex-row'>
                  <label className="policy-label">Mount Physical Media Disabled</label>
                  <input
                    type="checkbox"
                    checked={policy.mountPhysicalMediaDisabled}
                    onChange={(e) => updatePolicyLocal(['mountPhysicalMediaDisabled'], e.target.checked)}
                  />
                </div>
              )}

              {policy?.uninstallAppsDisabled !== undefined && (
                <div className='policy-flex-row'>
                  <label className="policy-label">Uninstall Apps Disabled</label>
                  <input
                    type="checkbox"
                    checked={policy.uninstallAppsDisabled}
                    onChange={(e) => updatePolicyLocal(['uninstallAppsDisabled'], e.target.checked)}
                  />
                </div>
              )}

              {policy?.removeUserDisabled !== undefined && (
                <div className='policy-flex-row'>
                  <label className="policy-label">Remove User Disabled</label>
                  <input
                    type="checkbox"
                    checked={policy.removeUserDisabled}
                    onChange={(e) => updatePolicyLocal(['removeUserDisabled'], e.target.checked)}
                  />
                </div>
              )}

              {policy?.ensureVerifyAppsEnabled !== undefined && (
                <div className='policy-flex-row'>
                  <label className="policy-label">Ensure Verify Apps Enabled</label>
                  <input
                    type="checkbox"
                    checked={policy.ensureVerifyAppsEnabled}
                    onChange={(e) => updatePolicyLocal(['ensureVerifyAppsEnabled'], e.target.checked)}
                  />
                </div>
              )}

              {policy?.installUnknownSourcesAllowed !== undefined && (
                <div className='policy-flex-row'>
                  <label className="policy-label">Install Unknown Sources Allowed</label>
                  <input
                    type="checkbox"
                    checked={policy.installUnknownSourcesAllowed}
                    onChange={(e) => updatePolicyLocal(['installUnknownSourcesAllowed'], e.target.checked)}
                  />
                </div>
              )}
            </div>


            {/* Play Store Mode */}
            <div className='policy-flex-row'>
              <label className="policy-label">Play Store Mode</label>
              <select
                value={policy.playStoreMode || 'WHITELIST'}
                onChange={(e) => updatePolicyLocal(['playStoreMode'], e.target.value)}
                className="policy-select"
              >
                <option value="WHITELIST">Whitelist</option>
                <option value="BLACKLIST">Blacklist</option>
              </select>
            </div>

            {/* Advanced Security Overrides */}
            <div className="policy-subsection">
              <h3 className="policy-subsection-title">Advanced Security Overrides</h3>
              <div className="policy-grid-3-cols">
                <div>
                  <label className="policy-label">Developer Settings</label>
                  <select
                    value={policy.advancedSecurityOverrides?.developerSettings || 'DEVELOPER_SETTINGS_USER_CHOICE'}
                    onChange={(e) => updatePolicyLocal(['advancedSecurityOverrides', 'developerSettings'], e.target.value)}
                    className="policy-select"
                  >
                    <option value="DEVELOPER_SETTINGS_USER_CHOICE">User Choice</option>
                    <option value="DEVELOPER_SETTINGS_ALLOWED">Allowed</option>
                    <option value="DEVELOPER_SETTINGS_DISABLED">Disabled</option>
                  </select>
                </div>

                <div>
                  <label className="policy-label">Play Protect</label>
                  <select
                    value={policy.advancedSecurityOverrides?.googlePlayProtectVerifyApps || 'VERIFY_APPS_USER_CHOICE'}
                    onChange={(e) => updatePolicyLocal(['advancedSecurityOverrides', 'googlePlayProtectVerifyApps'], e.target.value)}
                    className="policy-select"
                  >
                    <option value="VERIFY_APPS_USER_CHOICE">User Choice</option>
                    <option value="VERIFY_APPS_ENFORCE">Enforce</option>
                    <option value="VERIFY_APPS_DISABLED">Disabled</option>
                  </select>
                </div>

                <div>
                  <label className="policy-label">Untrusted Apps</label>
                  <select
                    value={policy.advancedSecurityOverrides?.untrustedAppsPolicy || 'DISALLOW_INSTALL'}
                    onChange={(e) => updatePolicyLocal(['advancedSecurityOverrides', 'untrustedAppsPolicy'], e.target.value)}
                    className="policy-select"
                  >
                    <option value="DISALLOW_INSTALL">Disallow Install</option>
                    <option value="ALLOW_INSTALL_DEVICE_WIDE">Allow Device Wide</option>
                    <option value="ALLOW_INSTALL_IN_PERSONAL_PROFILE_ONLY">Personal Profile Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Applications */}
      <div className="policy-section">
        <div
          className="policy-section-header"
          onClick={() => toggleSection('applications')}
        >
          <h2 className="policy-section-title">Applications</h2>
          {expandedSections.applications ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {expandedSections.applications && (
          <div className="policy-section-content">
            <div className="policy-section-toolbar">
              <span className="policy-info-text">
                {policy.applications?.length || 0} application(s) configured
              </span>
              <button
                onClick={addApplication}
                className="policy-add-button"
              >
                <Plus size={16} />
                Add Application
              </button>
            </div>

            <div className="policy-list-container">
              {policy.applications?.map((app, appIndex) => (
                <div key={appIndex} className="policy-list-item">
                  <div className="policy-list-item-header">
                    <h3 className="policy-list-item-title">Application {appIndex + 1}</h3>
                    <button
                      onClick={() => removeApplication(appIndex)}
                      className="policy-delete-button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="policy-grid-3-cols policy-margin-bottom">
                    <div>
                      <label className="policy-label">Package Name</label>
                      <input
                        type="text"
                        value={app.packageName}
                        onChange={(e) => {
                          const newApps = [...(policy.applications || [])];
                          newApps[appIndex].packageName = e.target.value;
                          updatePolicyLocal(['applications'], newApps);
                        }}
                        className="policy-input"
                        placeholder="com.example.app"
                      />
                    </div>

                    <div>
                      <label className="policy-label">Install Type</label>
                      <select
                        value={app.installType || 'AVAILABLE'}
                        onChange={(e) => {
                          const newApps = [...(policy.applications || [])];
                          newApps[appIndex].installType = e.target.value;
                          updatePolicyLocal(['applications'], newApps);
                        }}
                        className="policy-select"
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="FORCE_INSTALLED">Force Installed</option>
                        <option value="BLOCKED">Blocked</option>
                      </select>
                    </div>

                    <div>
                      <label className="policy-label">Default Permission Policy</label>
                      <select
                        value={app.defaultPermissionPolicy || 'PROMPT'}
                        onChange={(e) => {
                          const newApps = [...(policy.applications || [])];
                          newApps[appIndex].defaultPermissionPolicy = e.target.value;
                          updatePolicyLocal(['applications'], newApps);
                        }}
                        className="policy-select"
                      >
                        <option value="PROMPT">Prompt</option>
                        <option value="GRANT">Grant</option>
                        <option value="DENY">Deny</option>
                      </select>
                    </div>
                  </div>

                  {/* Permission Grants */}
                  <div className="policy-subsection">
                    <div className="policy-section-toolbar policy-margin-bottom">
                      <h4 className="policy-subsection-title-small">Permission Grants</h4>
                      <button
                        onClick={() => addPermissionGrant(appIndex)}
                        className="policy-add-small-button"
                      >
                        <Plus size={14} />
                        Add Permission
                      </button>
                    </div>

                    <div className="policy-list-container-small">
                      {app.permissionGrants?.map((grant, grantIndex) => (
                        <div key={grantIndex} className="policy-permission-grant-item">
                          <input
                            type="text"
                            value={grant.permission}
                            onChange={(e) => {
                              const newApps = [...(policy.applications || [])];
                              newApps[appIndex].permissionGrants![grantIndex].permission = e.target.value;
                              updatePolicyLocal(['applications'], newApps);
                            }}
                            className="policy-input-flex-1"
                            placeholder="android.permission.CAMERA"
                          />
                          <select
                            value={grant.policy}
                            onChange={(e) => {
                              const newApps = [...(policy.applications || [])];
                              newApps[appIndex].permissionGrants![grantIndex].policy = e.target.value;
                              updatePolicyLocal(['applications'], newApps);
                            }}
                            className="policy-select-small"
                          >
                            <option value="PROMPT">Prompt</option>
                            <option value="GRANT">Grant</option>
                            <option value="DENY">Deny</option>
                          </select>
                          <button
                            onClick={() => removePermissionGrant(appIndex, grantIndex)}
                            className="policy-delete-small-button"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Reporting */}
      <div className="policy-section">
        <div
          className="policy-section-header"
          onClick={() => toggleSection('reporting')}
        >
          <h2 className="policy-section-title">Status Reporting</h2>
          {expandedSections.reporting ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>

        {expandedSections.reporting && (
          <div className="policy-section-content">
            <div className="policy-grid-2-cols">
              <div className="policy-checkbox-group">
                <label className="policy-label">Application Reports Enabled</label>
                <input
                  type="checkbox"
                  checked={policy.statusReportingSettings?.applicationReportsEnabled || false}
                  onChange={(e) => updatePolicyLocal(['statusReportingSettings', 'applicationReportsEnabled'], e.target.checked)}
                  className="policy-checkbox"
                />
              </div>

              <div className="policy-checkbox-group">
                <label className="policy-label">Software Info Enabled</label>
                <input
                  type="checkbox"
                  checked={policy.statusReportingSettings?.softwareInfoEnabled || false}
                  onChange={(e) => updatePolicyLocal(['statusReportingSettings', 'softwareInfoEnabled'], e.target.checked)}
                  className="policy-checkbox"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {!policy && (
        <div className="policy-no-data">
          No policy data found.
        </div>
      )}
    </div>
  );
};

export default PolicyManagement;

