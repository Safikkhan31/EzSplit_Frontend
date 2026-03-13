import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import EntryCard from '../components/EntryCard';
import Modal from '../components/Modal';
import './GroupDetail.css';

export default function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { getGroupById, getUserById } = useApp();
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  return (
    <div className="page">
      <Navbar
        showBack
        backTo="/"
        rightContent={
          <button
            className="settle-btn"
            onClick={() => navigate(`/group/${groupId}/settlement`)}
          >
            ⚖️ Settle Up
          </button>
        }
      />

      <div className="group-detail-header">
        <div>
          <div className="group-detail-title">{group.name}</div>
          {group.description && (
            <div className="group-detail-desc">{group.description}</div>
          )}
        </div>
      </div>

      <div className="group-detail-members">
        {group.members.map((memberId) => {
          const user = getUserById(memberId);
          return user ? (
            <div
              key={memberId}
              className="avatar"
              style={{ background: user.color }}
              title={user.name}
            >
              {user.name.charAt(0)}
            </div>
          ) : null;
        })}
      </div>

      <div className="section-title">Expenses</div>

      {group.entries.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💸</div>
          <div className="empty-state-text">
            No expenses yet. Add one to start tracking!
          </div>
        </div>
      ) : (
        <div className="group-detail-entries">
          {group.entries.map((entry, idx) => (
            <EntryCard key={entry.id || idx} entry={entry} />
          ))}
        </div>
      )}

      {/* FAB to add payment */}
      <button className="fab" onClick={() => setShowPaymentModal(true)}>
        +
      </button>

      {/* Payment mode modal */}
      {showPaymentModal && (
        <Modal title="Add Payment" onClose={() => setShowPaymentModal(false)}>
          <div className="modal-actions">
            <button
              className="modal-option"
              onClick={() => {
                setShowPaymentModal(false);
                navigate(`/group/${groupId}/add-payment?mode=cash`);
              }}
            >
              <div className="modal-option-icon">💵</div>
              Cash
            </button>
            <button
              className="modal-option"
              onClick={() => {
                setShowPaymentModal(false);
                navigate(`/group/${groupId}/add-payment?mode=online`);
              }}
            >
              <div className="modal-option-icon">💳</div>
              Online
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
