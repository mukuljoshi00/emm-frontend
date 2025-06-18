// src/api/Api.tsx
import { Employee } from '../components/EmployeeCard';
import { API_BASE_URL } from './baseUrl';

export async function fetchDevices(enterpriseName: string, token: string) {
  const res = await fetch(`${API_BASE_URL}/enterprise/devices?enterpriseName=${encodeURIComponent(enterpriseName)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
    credentials: 'include',
    mode: 'cors',
  });
  if (!res.ok) throw new Error('Failed to fetch devices');
  return res.json();
}

export async function fetchEnrollmentToken(enterpriseName: string, token: string, policyName = 'policy1') {
  const res = await fetch(`${API_BASE_URL}/device/onboard?enterpriseId=${encodeURIComponent(enterpriseName)}&policyName=${encodeURIComponent(policyName)}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'image/png',
    },
    credentials: 'include',
    mode: 'cors',
  });
  if (!res.ok) throw new Error('Failed to get QR code');
  return res.blob();
}

export async function fetchOrgs(token: string) {
  const res = await fetch(`${API_BASE_URL}/v1/orgs`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
    credentials: 'include',
    mode: 'cors',
  });
  if (!res.ok) throw new Error('Failed to fetch organization(s)');
  return res.json();
}

export async function fetchMyOrg(token: string) {
  const res = await fetch(`${API_BASE_URL}/v1/orgs/my`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
    credentials: 'include',
    mode: 'cors',
  });
  if (!res.ok) throw new Error('Failed to fetch organization(s)');
  return res.json();
}

export async function fetchPolicy(enterpriseName: string, token: string) {
  const res = await fetch(`${API_BASE_URL}/enterprise/policy/policy1?enterpriseName=${encodeURIComponent(enterpriseName)}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    },
    credentials: 'include',
    mode: 'cors',
  });
  if (!res.ok) throw new Error('Failed to fetch policy');
  return res.json();
}

export async function updatePolicy(enterpriseName: string, token: string, policy: any) {
  const res = await fetch(`${API_BASE_URL}/enterprise/declare/policy?enterpriseName=${encodeURIComponent(enterpriseName)}&policyId=policy1`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(policy),
    credentials: 'include',
    mode: 'cors',
  });
  if (!res.ok) throw new Error('Failed to update policy');
  return res;
}

// Fetch device location by serial number
export async function fetchDeviceLocation(serialNumber: string): Promise<{ lat: number; long: number } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/location/${serialNumber}`);
    if (!response.ok) return null;
    const data = await response.json();
    console.log('fetchDeviceLocation API raw response:', data);
     // Log the raw API response
    if (!data || typeof data !== 'object') {
      console.error('Invalid response format:', data);
      return null;
    }      
    if (typeof data.latitude === 'number' && typeof data.longitude === 'number') {
      return { lat: data.latitude, long: data.longitude };
    }
    return null;
  } catch (err) {
    console.error('fetchDeviceLocation error:', err);
    return null;
  }
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    throw new Error('Invalid email or password');
  }
  return response.json();
}


export async function fetchEmployee(): Promise<Employee[]> {
  const response = await fetch(`${API_BASE_URL}/employee/all`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch employees');
  }

  return await response.json();
}
// Add more API functions here as needed, e.g. for login, organizations, policies, etc.
