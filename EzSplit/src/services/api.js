import { CURRENT_USER_ID, MOCK_USERS, MOCK_GROUPS, MOCK_SETTLEMENTS } from '../data/mockData';

const BASE_URL = 'http://localhost:8080';
const API_BASE_URL = `${BASE_URL}/api`;
const AUTH_BASE_URL = `${BASE_URL}/auth`;

/**
 * Token Management
 */
export function setToken(token) {
  localStorage.setItem('jwt', token);
}

export function getToken() {
  return localStorage.getItem('jwt');
}

export function removeToken() {
  localStorage.removeItem('jwt');
}

function getAuthHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * API Service
 * Assumes a structure for a Node.js/PostgreSQL backend or similar.
 */

// Temporarily simulate network delay and return mock data if fetch fails
// This is added so the app doesn't break entirely if no backend is running yet.
const simulateNetwork = (data, shouldFail = false) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error('Network Error'));
      else resolve(data);
    }, 800);
  });
};

/**
 * Auth Endpoints
 */
export async function login(username, password) {
  try {
    const res = await fetch(`${AUTH_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Login failed');
    return await res.json();
  } catch (error) {
    console.warn('API POST /auth/login failed, simulating network.', error);
    // Simulate successful login
    return simulateNetwork({ jwt: 'mock-jwt-token-123', userId: CURRENT_USER_ID, name: MOCK_USERS[0].name });
  }
}

export async function signup(username, name, password) {
  try {
    const res = await fetch(`${AUTH_BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, name, password }),
    });
    if (!res.ok) throw new Error('Signup failed');
    return await res.text();
  } catch (error) {
    console.warn('API POST /auth/signup failed, simulating network.', error);
    return simulateNetwork('OTP sent to email');
  }
}

export async function verifyOtp(username, name, password, otp) {
  try {
    const res = await fetch(`${AUTH_BASE_URL}/verify-otp?otp=${otp}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, name, password }),
    });
    if (!res.ok) throw new Error('OTP verification failed');
    return await res.json();
  } catch (error) {
    console.warn('API POST /auth/verify-otp failed, simulating network.', error);
    return simulateNetwork({ id: CURRENT_USER_ID, username, name });
  }
}

export async function fetchUsers() {
  try {
    const res = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  } catch (error) {
    console.warn('API /users failed, falling back to mock data.', error);
    return simulateNetwork(MOCK_USERS);
  }
}

export async function fetchGroups() {
  try {
    const res = await fetch(`${API_BASE_URL}/groups`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch groups');
    return await res.json();
  } catch (error) {
    console.warn('API /groups failed, falling back to mock data.', error);
    return simulateNetwork(MOCK_GROUPS);
  }
}

export async function fetchSettlements() {
  try {
    const res = await fetch(`${API_BASE_URL}/settlements`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch settlements');
    return await res.json();
  } catch (error) {
    console.warn('API /settlements failed, falling back to mock data.', error);
    return simulateNetwork(MOCK_SETTLEMENTS);
  }
}

export async function createGroup(name, description, memberIds) {
  const payload = {
    name,
    description,
    members: [CURRENT_USER_ID, ...memberIds.filter((id) => id !== CURRENT_USER_ID)],
  };

  try {
    const res = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create group');
    return await res.json();
  } catch (error) {
    console.warn('API POST /groups failed, simulating network.', error);
    const newGroup = {
      id: 'g' + Date.now(),
      name: payload.name,
      description: payload.description,
      members: payload.members,
      entries: [],
    };
    return simulateNetwork(newGroup);
  }
}

export async function addEntry(groupId, entryPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/groups/${groupId}/entries`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(entryPayload),
    });
    if (!res.ok) throw new Error('Failed to add entry');
    return await res.json();
  } catch (error) {
    console.warn(`API POST /groups/${groupId}/entries failed, simulating network.`, error);
    const newEntry = { ...entryPayload, id: 'e' + Date.now(), isSettled: false };
    return simulateNetwork(newEntry);
  }
}

export async function settleGroup(groupId, computedTransactions, entryIdsToMark) {
  try {
    const res = await fetch(`${API_BASE_URL}/groups/${groupId}/settle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ transactions: computedTransactions, entryIds: entryIdsToMark }),
    });
    if (!res.ok) throw new Error('Failed to settle group');
    return await res.json();
  } catch (error) {
    console.warn(`API POST /groups/${groupId}/settle failed, simulating network.`, error);
    // Return the transactions so frontend can append them to local state
    return simulateNetwork({ transactions: computedTransactions, entryIds: entryIdsToMark });
  }
}

export async function recordPayment(fromId, toId, amount) {
  const payload = { fromId, toId, amount };
  try {
    const res = await fetch(`${API_BASE_URL}/payments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to record payment');
    return await res.json();
  } catch (error) {
    console.warn('API POST /payments failed, simulating network.', error);
    return simulateNetwork({ success: true, payload });
  }
}
