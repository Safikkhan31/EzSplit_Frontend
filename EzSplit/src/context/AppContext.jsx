import { createContext, useContext, useState, useCallback } from 'react';
import { MOCK_USERS, MOCK_GROUPS, CURRENT_USER_ID } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [users] = useState(MOCK_USERS);
  const [groups, setGroups] = useState(MOCK_GROUPS);
  const currentUser = users.find((u) => u.id === CURRENT_USER_ID);

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

  // Create a new group
  const createGroup = useCallback((name, description, memberIds) => {
    const newGroup = {
      id: 'g' + Date.now(),
      name,
      description,
      members: [CURRENT_USER_ID, ...memberIds.filter((id) => id !== CURRENT_USER_ID)],
      entries: [],
    };
    setGroups((prev) => [newGroup, ...prev]);
    return newGroup;
  }, []);

  // Add an entry to a group
  const addEntry = useCallback((groupId, entry) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, entries: [...g.entries, { ...entry, id: 'e' + Date.now() }] }
          : g
      )
    );
  }, []);

  // Settle a group (clear all entries)
  const settleGroup = useCallback((groupId) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, entries: [] } : g))
    );
  }, []);

  // Record a direct payment (reduces debt in all groups)
  const recordPayment = useCallback((fromId, toId, amount) => {
    // For simplicity, we add a "settlement" entry to the first group
    // In production, this would be a separate API call
    console.log(`Payment recorded: ${fromId} → ${toId} : ₹${amount}`);
  }, []);

  const value = {
    users,
    groups,
    currentUser,
    getUserById,
    getGroupById,
    createGroup,
    addEntry,
    settleGroup,
    recordPayment,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
