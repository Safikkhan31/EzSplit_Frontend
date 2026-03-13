/**
 * Minimum Transactions Settlement Algorithm
 *
 * Given a list of entries, compute the minimum set of transactions
 * needed to settle all debts within a group.
 *
 * @param {Array} entries – Array of entry objects from group
 * @param {Array} memberIds – Array of member IDs in the group
 * @returns {Array} transactions – [{ from, to, amount }]
 */
export function computeSettlements(entries, memberIds) {
  // 1. Compute net balance for each member
  //    Positive = is owed money (creditor)
  //    Negative = owes money (debtor)
  const balances = {};
  memberIds.forEach((id) => (balances[id] = 0));

  entries.forEach((entry) => {
    const { paidBy, splits } = entry;
    const totalPaid = Object.values(splits).reduce((a, b) => a + b, 0);

    // The payer is credited the total amount
    balances[paidBy] = (balances[paidBy] || 0) + totalPaid;

    // Each member is debited their share
    Object.entries(splits).forEach(([memberId, share]) => {
      balances[memberId] = (balances[memberId] || 0) - share;
    });
  });

  // 2. Separate into creditors and debtors
  const creditors = []; // { id, amount } – positive
  const debtors = [];   // { id, amount } – negative (stored as positive for convenience)

  Object.entries(balances).forEach(([id, bal]) => {
    const rounded = Math.round(bal * 100) / 100;
    if (rounded > 0) creditors.push({ id, amount: rounded });
    else if (rounded < 0) debtors.push({ id, amount: -rounded });
  });

  // 3. Sort descending
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  // 4. Greedy matching
  const transactions = [];
  let i = 0;
  let j = 0;

  while (i < creditors.length && j < debtors.length) {
    const settle = Math.min(creditors[i].amount, debtors[j].amount);
    if (settle > 0) {
      transactions.push({
        from: debtors[j].id,
        to: creditors[i].id,
        amount: Math.round(settle * 100) / 100,
      });
    }
    creditors[i].amount -= settle;
    debtors[j].amount -= settle;

    if (creditors[i].amount < 0.01) i++;
    if (debtors[j].amount < 0.01) j++;
  }

  return transactions;
}

/**
 * Compute per-user net balances relative to a specific user.
 * Returns an array of { userId, amount } where positive means they owe the user.
 */
export function computeUserBalances(groups, userId) {
  const balances = {};

  groups.forEach((group) => {
    group.entries.forEach((entry) => {
      const { paidBy, splits } = entry;

      if (paidBy === userId) {
        // User paid — everyone else owes their share
        Object.entries(splits).forEach(([memberId, share]) => {
          if (memberId !== userId) {
            balances[memberId] = (balances[memberId] || 0) + share;
          }
        });
      } else if (splits[userId] !== undefined) {
        // Someone else paid — user owes their share
        balances[paidBy] = (balances[paidBy] || 0) - splits[userId];
      }
    });
  });

  return Object.entries(balances)
    .map(([userId, amount]) => ({
      userId,
      amount: Math.round(amount * 100) / 100,
    }))
    .filter((b) => Math.abs(b.amount) > 0.01);
}
