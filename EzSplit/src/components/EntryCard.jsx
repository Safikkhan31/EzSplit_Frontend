import { useApp } from '../context/AppContext';
import './EntryCard.css';

export default function EntryCard({ entry }) {
  const { getUserById } = useApp();
  const payer = getUserById(entry.paidBy);

  return (
    <div className="glass-card entry-card">
      <div className={`entry-card-icon ${entry.mode}`}>
        {entry.mode === 'cash' ? '💵' : '💳'}
      </div>
      <div className="entry-card-info">
        <div className="entry-card-desc">{entry.description}</div>
        <div className="entry-card-meta">
          Paid by <strong>{payer?.name || 'Unknown'}</strong> · {entry.date} ·{' '}
          <span style={{ textTransform: 'capitalize' }}>{entry.splitType}</span> split
        </div>
      </div>
      <div className="entry-card-amount">
        <div className="entry-card-total">₹{entry.amount.toLocaleString()}</div>
        <div className="entry-card-split">{entry.mode}</div>
      </div>
    </div>
  );
}
