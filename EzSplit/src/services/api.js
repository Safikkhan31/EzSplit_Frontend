import { MOCK_USERS, MOCK_GROUPS, MOCK_SETTLEMENTS } from '../data/mockData';

const BASE_URL = 'http://10.68.10.42:8080';
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
 * Simulates a delayed mock response — ONLY used for non-auth data endpoints
 * when the backend is unavailable (groups, users, settlements).
 * Auth endpoints (login, signup, verify-otp) NEVER use this — they must
 * throw real errors so the UI can show them to the user.
 */
const simulateNetwork = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), 800);
  });
};

/**
 * Classifies a fetch error into a user-friendly message.
 * - Network/connection errors (backend down) → "Cannot connect to server"
 * - 401 Unauthorized                          → "Invalid credentials"
 * - 400 Bad Request                           → message from server body
 * - Everything else                           → generic fallback
 */
async function parseAuthError(res) {
  if (!res) {
    // res is undefined when the fetch itself threw (i.e. network error)
    return new Error('Cannot connect to server. Please make sure the backend is running.');
  }
  if (res.status === 401) {
    return new Error('Invalid username or password. Please try again.');
  }
  if (res.status === 400) {
    try {
      const body = await res.text();
      return new Error(body || 'Bad request. Please check your inputs.');
    } catch {
      return new Error('Bad request. Please check your inputs.');
    }
  }
  if (res.status === 409) {
    return new Error('An account with this email already exists.');
  }
  return new Error(`Server error (${res.status}). Please try again later.`);
}

// ─────────────────────────────────────────────
// AUTH ENDPOINTS  ← NO mock fallback here
// ─────────────────────────────────────────────

/**
 * Login — throws a descriptive Error on any failure.
 * The caller (AppContext.loginUser) re-throws so the UI can display it.
 */
export async function login(username, password) {
  let res;
  try {
    res = await fetch(`${AUTH_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
  } catch (networkError) {
    // fetch() itself threw → server is unreachable
    throw new Error('Cannot connect to server. Please make sure the backend is running.');
  }

  if (!res.ok) {
    throw await parseAuthError(res);
  }

  return await res.json(); // { jwt, userId, name }
}

/**
 * Signup — sends user details and triggers OTP email.
 * Throws on failure; never auto-succeeds.
 */
export async function signup(username, name, password) {
  let res;
  try {
    res = await fetch(`${AUTH_BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, name, password }),
    });
  } catch {
    throw new Error('Cannot connect to server. Please make sure the backend is running.');
  }

  if (!res.ok) {
    throw await parseAuthError(res);
  }

  return await res.text(); // "OTP sent to email"
}

/**
 * OTP Verification — verifies the 6-digit code.
 * Throws on failure; never auto-succeeds.
 */
export async function verifyOtp(username, name, password, otp) {
  let res;
  try {
    res = await fetch(`${AUTH_BASE_URL}/verify-otp?otp=${otp}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, name, password }),
    });
  } catch {
    throw new Error('Cannot connect to server. Please make sure the backend is running.');
  }

  if (!res.ok) {
    throw await parseAuthError(res);
  }

  return await res.json(); // { id, username, name }
}

// ─────────────────────────────────────────────
// DATA ENDPOINTS  ← mock fallback kept for dev
// ─────────────────────────────────────────────

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
    const res = await fetch(`${BASE_URL}/groups`, {
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

export async function createGroup(groupName, description, memberEmails) {
  const payload = {
    groupName,
    description,
    memberEmails,
  };

  try {
    const res = await fetch(`${BASE_URL}/groups`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create group');
    return await res.text(); // backend returns "Group created successfully"
  } catch (error) {
    console.warn('API POST /groups failed, simulating network.', error);
    return simulateNetwork('Group created successfully');
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