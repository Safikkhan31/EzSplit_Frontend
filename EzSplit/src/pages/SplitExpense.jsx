import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import SplitTabs from '../components/SplitTabs';
import { CURRENT_USER_ID } from '../data/mockData';
import './SplitExpense.css';

export default function SplitExpense() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { getGroupById, getUserById, addEntry } = useApp();

  const { amount = 0, description = '', mode = 'cash' } = location.state || {};
  const group = getGroupById(groupId);

  const [splits, setSplits] = useState({});
  const [splitType, setSplitType] = useState('equal');

  if (!group) {
    return (
      <div className="page">
        <Navbar showBack backTo={`/group/${groupId}`} />
        <div className="empty-state">
          <div className="empty-state-icon">❌</div>
          <div className="empty-state-text">Group not found</div>
        </div>
      </div>
    );
  }

  const members = React.useMemo(() => {
    return group.members.map((id) => getUserById(id)).filter(Boolean);
  }, [group.members, getUserById]);

  const handleSplitsChange = (newSplits, type) => {
    setSplits(newSplits);
    setSplitType(type);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddEntry = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const entry = {
      description: description || 'Untitled expense',
      amount: Number(amount),
      paidBy: CURRENT_USER_ID,
      splitType,
      splits,
      mode,
      date: new Date().toISOString().split('T')[0],
    };
    try {
      await addEntry(groupId, entry);
      navigate(`/group/${groupId}`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <Navbar showBack backTo={`/group/${groupId}/add-payment?mode=${mode}`} />

      <div className="split-expense-header">
        <div className="split-expense-amount">₹{Number(amount).toLocaleString()}</div>
        <div className="split-expense-subtitle">
          {description || 'Split this expense'} · <span style={{ textTransform: 'capitalize' }}>{mode}</span>
        </div>
      </div>

      <div className="section-title">Split Between</div>

      <SplitTabs
        members={members}
        totalAmount={Number(amount)}
        onSplitsChange={handleSplitsChange}
      />

      <div className="split-expense-footer">
        <button 
          className="btn btn-primary btn-block" 
          onClick={handleAddEntry}
          disabled={isSubmitting}
          style={{ opacity: isSubmitting ? 0.6 : 1 }}
        >
          {isSubmitting ? 'Adding...' : '✓ Add Entry'}
        </button>
      </div>
    </div>
  );
}
