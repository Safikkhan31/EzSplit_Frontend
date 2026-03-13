import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { computeUserBalances } from '../utils/settle';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import './Profile.css';

export default function Profile() {
  const { currentUser, settlements, getUserById, recordPayment, logoutUser } = useApp();
  const [payModal, setPayModal] = useState(null); // { userId, amount }
  const navigate = useNavigate();

  // Derive consolidated balances directly from persistent settlements
  const balances = settlements
    .filter((s) => s.from === currentUser.id || s.to === currentUser.id)
    .map((s) => {
      const isOwed = s.to === currentUser.id;
      return {
        userId: isOwed ? s.from : s.to,
        amount: isOwed ? s.amount : -s.amount,
      };
    });

  const totalOwed = balances.filter((b) => b.amount > 0).reduce((s, b) => s + b.amount, 0);
  const totalOwe = balances.filter((b) => b.amount < 0).reduce((s, b) => s + Math.abs(b.amount), 0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePay = async () => {
    if (payModal && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await recordPayment(currentUser.id, payModal.userId, Math.abs(payModal.amount));
        setPayModal(null);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="page">
      <Navbar showBack backTo="/" />

      <div className="profile-hero">
        <div className="avatar avatar-xl" style={{ background: currentUser.color }}>
          {currentUser.name.charAt(0)}
        </div>
        <div className="profile-name">{currentUser.name}</div>
        <div className="profile-email">{currentUser.email}</div>

        <div className="profile-stats">
          <div className="glass-card profile-stat-card">
            <div className="profile-stat-value amount-positive">₹{totalOwed.toLocaleString()}</div>
            <div className="profile-stat-label">You're owed</div>
          </div>
          <div className="glass-card profile-stat-card">
            <div className="profile-stat-value amount-negative">₹{totalOwe.toLocaleString()}</div>
            <div className="profile-stat-label">You owe</div>
          </div>
        </div>
      </div>

      <div className="section-title">Balances</div>

      {balances.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✨</div>
          <div className="empty-state-text">All clear! No pending balances.</div>
        </div>
      ) : (
        <div className="profile-balance-list">
          {balances.map((balance) => {
            const user = getUserById(balance.userId);
            const isPositive = balance.amount > 0;
            return (
              <div
                key={balance.userId}
                className="glass-card profile-balance-item"
                onClick={() => {
                  if (balance.amount < 0) {
                    setPayModal({ userId: balance.userId, amount: balance.amount });
                  }
                }}
              >
                <div className="avatar" style={{ background: user?.color }}>
                  {user?.name?.charAt(0)}
                </div>
                <div className="profile-balance-info">
                  <div className="profile-balance-name">{user?.name}</div>
                  <div className="profile-balance-detail">
                    {isPositive ? 'owes you' : 'you owe'}
                  </div>
                </div>
                <div className={`profile-balance-amount ${isPositive ? 'amount-positive' : 'amount-negative'}`}>
                  ₹{Math.abs(balance.amount).toLocaleString()}
                </div>
                {balance.amount < 0 && (
                  <span className="badge badge-red" style={{ fontSize: '0.7rem' }}>Pay</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: '32px', padding: '0 24px' }}>
        <button 
          className="btn btn-outline btn-block" 
          onClick={() => {
            logoutUser();
            navigate('/login');
          }}
          style={{ borderColor: 'var(--danger-color)', color: 'var(--danger-color)' }}
        >
          Sign Out
        </button>
      </div>

      {/* Pay Modal */}
      {payModal && (
        <Modal title="Pay Debt" onClose={() => setPayModal(null)}>
          <div className="pay-modal-amount amount-negative">
            ₹{Math.abs(payModal.amount).toLocaleString()}
          </div>
          <div className="pay-modal-info">
            Pay <strong>{getUserById(payModal.userId)?.name}</strong> to clear your debt
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setPayModal(null)}>
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              style={{ flex: 1, opacity: isSubmitting ? 0.6 : 1 }} 
              onClick={handlePay}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
