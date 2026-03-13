import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { computeSettlements } from '../utils/settle';
import Navbar from '../components/Navbar';
import './Settlement.css';

export default function Settlement() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { getGroupById, getUserById, settleGroup } = useApp();

  const group = getGroupById(groupId);

  if (!group) {
    return (
      <div className="page">
        <Navbar showBack backTo="/" />
        <div className="empty-state">
          <div className="empty-state-icon">❌</div>
          <div className="empty-state-text">Group not found</div>
        </div>
      </div>
    );
  }

  const transactions = computeSettlements(group.entries, group.members);

  const handleSettle = () => {
    settleGroup(groupId);
    navigate(`/group/${groupId}`);
  };

  return (
    <div className="page">
      <Navbar showBack backTo={`/group/${groupId}`} />

      <div className="settlement-header">
        <div className="settlement-title">⚖️ Settlement</div>
        <div className="settlement-subtitle">{group.name}</div>
      </div>

      {transactions.length === 0 ? (
        <div className="settlement-settled">
          <div className="settlement-settled-icon">🎉</div>
          <div className="settlement-settled-text">All settled up!</div>
          <div className="settlement-settled-sub">
            No pending transactions in this group.
          </div>
        </div>
      ) : (
        <>
          <div className="section-title">
            Minimum Transactions ({transactions.length})
          </div>

          {transactions.map((txn, idx) => {
            const fromUser = getUserById(txn.from);
            const toUser = getUserById(txn.to);
            return (
              <div key={idx} className="glass-card settlement-card">
                <div className="avatar" style={{ background: fromUser?.color }}>
                  {fromUser?.name?.charAt(0)}
                </div>
                <div className="settlement-arrow">
                  <div className="settlement-arrow-line">
                    {fromUser?.name} → {toUser?.name}
                  </div>
                  <div className="settlement-arrow-amount">
                    ₹{txn.amount.toLocaleString()}
                  </div>
                </div>
                <div className="avatar" style={{ background: toUser?.color }}>
                  {toUser?.name?.charAt(0)}
                </div>
              </div>
            );
          })}

          <div className="settlement-footer">
            <button className="btn btn-success btn-block" onClick={handleSettle}>
              ✓ Mark as Settled
            </button>
          </div>
        </>
      )}
    </div>
  );
}
