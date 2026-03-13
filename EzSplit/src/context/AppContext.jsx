import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CURRENT_USER_ID } from '../data/mockData';
import * as api from '../services/api';
import { computeSettlements } from '../utils/settle';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(!!api.getToken());
  const [currentUserId, setCurrentUserId] = useState(localStorage.getItem('userId') || null);

  // Initial Data Fetch
  useEffect(() => {
    async function initData() {
      setLoading(true);
      try {
        const [fetchedUsers, fetchedGroups, fetchedSettlements] = await Promise.all([
          api.fetchUsers(),
          api.fetchGroups(),
          api.fetchSettlements()
        ]);
        setUsers(fetchedUsers);
        setGroups(fetchedGroups);
        setSettlements(fetchedSettlements);
      } catch (err) {
        console.error('Failed to init data:', err);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      initData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // We explicitly cast both to strings to ensure matching since the custom backend returns Long (Number), 
  // whereas the mock data uses 'u1'.
  const currentUser = users.find((u) => String(u.id) === String(currentUserId));

  // Get user by ID
  const getUserById = useCallback(
    (id) => users.find((u) => u.id === id),
    [users]
  );

  // Get group by ID
  const getGroupById = useCallback(
    (id) => groups.find((g) => g.id === id),
    [groups]
  );

  // Create a new group asynchronously
  const createGroup = useCallback(async (name, description, memberIds) => {
    try {
      const newGroup = await api.createGroup(name, description, memberIds);
      setGroups((prev) => [newGroup, ...prev]);
      return newGroup;
    } catch (err) {
      console.error('Failed to create group:', err);
      throw err;
    }
  }, []);

  // Add an entry asynchronously
  const addEntry = useCallback(async (groupId, entry) => {
    try {
      const newEntry = await api.addEntry(groupId, entry);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === groupId
            ? { ...g, entries: [...g.entries, newEntry] }
            : g
        )
      );
      return newEntry;
    } catch (err) {
      console.error('Failed to add entry:', err);
      throw err;
    }
  }, []);

  // Settle a group asynchronously
  const settleGroup = useCallback(async (groupId) => {
    try {
      const group = groups.find((g) => g.id === groupId);
      if (!group) return;

      const unsettledEntries = group.entries.filter((e) => !e.isSettled);
      if (unsettledEntries.length === 0) return;

      const entryIdsToMark = unsettledEntries.map((e) => e.id);
      
      // Calculate minimum transactions
      const computedTransactions = computeSettlements(unsettledEntries, group.members);
      
      // Persist to "backend"
      const result = await api.settleGroup(groupId, computedTransactions, entryIdsToMark);

      // 1. Mark group's local entries as settled
      setGroups((prev) =>
        prev.map((g) => {
          if (g.id !== groupId) return g;
          return {
            ...g,
            entries: g.entries.map((req) => 
              entryIdsToMark.includes(req.id) ? { ...req, isSettled: true } : req
            )
          };
        })
      );

      // 2. Add the new minimum transactions to the persistent `settlements` pool
      setSettlements((prev) => {
        const next = [...prev];
        result.transactions.forEach((txn) => {
          // See if there's already a debt from debtor to creditor
          const existing = next.find(s => s.from === txn.from && s.to === txn.to);
          if (existing) {
            existing.amount += txn.amount;
          } else {
            next.push({ id: 's' + Date.now() + Math.random(), ...txn });
          }
        });
        return next;
      });

    } catch (err) {
      console.error('Failed to settle group:', err);
      throw err;
    }
  }, [groups]);

  // Record a direct payment asynchronously
  const recordPayment = useCallback(async (fromId, toId, amount) => {
    try {
      await api.recordPayment(fromId, toId, amount);
      console.log(`Async Payment recorded: ${fromId} → ${toId} : ₹${amount}`);
      
      setSettlements((prev) => {
        return prev.map((s) => {
          if (s.from === fromId && s.to === toId) {
            return { ...s, amount: Math.max(0, s.amount - amount) };
          }
          return s;
        }).filter(s => s.amount > 0.01);
      });
      
    } catch (err) {
      console.error('Failed to record payment:', err);
      throw err;
    }
  }, []);

  // Auth Methods
  const loginUser = useCallback(async (username, password) => {
    try {
      const { jwt, userId } = await api.login(username, password);
      api.setToken(jwt);
      localStorage.setItem('userId', userId);
      setCurrentUserId(userId);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error('Failed to login:', err);
      throw err;
    }
  }, []);

  const registerUser = useCallback(async (username, name, password) => {
    return await api.signup(username, name, password);
  }, []);

  const verifyAndLogin = useCallback(async (username, name, password, otp) => {
    try {
      // Backend returns User object without JWT in verify, so we just log them in after verifying
      await api.verifyOtp(username, name, password, otp);
      return await loginUser(username, password);
    } catch (err) {
      console.error('Failed to verify OTP:', err);
      throw err;
    }
  }, [loginUser]);

  const logoutUser = useCallback(() => {
    api.removeToken();
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setCurrentUserId(null);
    setUsers([]);
    setGroups([]);
    setSettlements([]);
  }, []);

  const value = {
    isAuthenticated,
    users,
    groups,
    settlements,
    currentUser,
    loading,
    getUserById,
    getGroupById,
    createGroup,
    addEntry,
    settleGroup,
    recordPayment,
    loginUser,
    registerUser,
    verifyAndLogin,
    logoutUser,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
