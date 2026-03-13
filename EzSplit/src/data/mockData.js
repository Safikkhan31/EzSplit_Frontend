// ── Mock Data ────────────────────────────────────
// All IDs are simple strings for readability.
// Avatar colours are assigned per-user for consistent UI.

export const MOCK_SETTLEMENTS = [];
// All IDs are simple strings for readability.
// Avatar colours are assigned per-user for consistent UI.

export const CURRENT_USER_ID = 'u1';

export const MOCK_USERS = [
  { id: 'u1', name: 'You',           email: 'you@ezsplit.app',      color: '#6c5ce7' },
  { id: 'u2', name: 'Aarav Sharma',  email: 'aarav@ezsplit.app',    color: '#00b894' },
  { id: 'u3', name: 'Priya Patel',   email: 'priya@ezsplit.app',    color: '#e17055' },
  { id: 'u4', name: 'Rohan Gupta',   email: 'rohan@ezsplit.app',    color: '#0984e3' },
  { id: 'u5', name: 'Ananya Singh',  email: 'ananya@ezsplit.app',   color: '#fdcb6e' },
  { id: 'u6', name: 'Karan Mehta',   email: 'karan@ezsplit.app',    color: '#e84393' },
  { id: 'u7', name: 'Sneha Reddy',   email: 'sneha@ezsplit.app',    color: '#00cec9' },
  { id: 'u8', name: 'Vikram Joshi',  email: 'vikram@ezsplit.app',   color: '#ff7675' },
];

export const MOCK_GROUPS = [
  {
    id: 'g1',
    name: 'Goa Trip 🏖️',
    description: 'Beach vacation expenses',
    members: ['u1', 'u2', 'u3', 'u4'],
    entries: [
      {
        id: 'e1',
        description: 'Hotel booking',
        amount: 12000,
        paidBy: 'u1',
        splitType: 'equal',
        splits: { u1: 3000, u2: 3000, u3: 3000, u4: 3000 },
        mode: 'online',
        date: '2026-03-10',
      },
      {
        id: 'e2',
        description: 'Dinner at beach shack',
        amount: 3200,
        paidBy: 'u2',
        splitType: 'equal',
        splits: { u1: 800, u2: 800, u3: 800, u4: 800 },
        mode: 'cash',
        date: '2026-03-11',
      },
    ],
  },
  {
    id: 'g2',
    name: 'Flat Expenses 🏠',
    description: 'Monthly shared expenses',
    members: ['u1', 'u3', 'u5'],
    entries: [
      {
        id: 'e3',
        description: 'Electricity bill',
        amount: 2400,
        paidBy: 'u1',
        splitType: 'equal',
        splits: { u1: 800, u3: 800, u5: 800 },
        mode: 'online',
        date: '2026-03-05',
      },
    ],
  },
  {
    id: 'g3',
    name: 'Office Lunch 🍱',
    description: 'Daily lunch splits',
    members: ['u1', 'u2', 'u6', 'u7'],
    entries: [],
  },
];
