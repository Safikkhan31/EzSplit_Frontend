import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './GroupCard.css';

export default function GroupCard({ group }) {
  const navigate = useNavigate();
  const { getUserById } = useApp();

  const totalSpent = group.entries.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="glass-card group-card" onClick={() => navigate(`/group/${group.id}`)}>
      <div className="group-card-header">
        <div>
          <div className="group-card-name">{group.name}</div>
          {group.description && (
            <div className="group-card-desc">{group.description}</div>
          )}
        </div>
        <div className="group-card-members">
          {group.members.slice(0, 4).map((memberId) => {
            const user = getUserById(memberId);
            return user ? (
              <div
                key={memberId}
                className="avatar avatar-sm"
                style={{ background: user.color }}
                title={user.name}
              >
                {user.name.charAt(0)}
              </div>
            ) : null;
          })}
          {group.members.length > 4 && (
            <div className="avatar avatar-sm" style={{ background: 'var(--text-muted)' }}>
              +{group.members.length - 4}
            </div>
          )}
        </div>
      </div>

      <div className="group-card-footer">
        <div className="group-card-stat">
          <span>{group.members.length}</span> members
        </div>
        <div className="group-card-stat">
          <span>{group.entries.length}</span> entries
        </div>
        <div className="group-card-stat">
          Total: <span>₹{totalSpent.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
