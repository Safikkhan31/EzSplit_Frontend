import './MemberRow.css';

export default function MemberRow({ user, rightContent, onClick }) {
  return (
    <div className="member-row" onClick={onClick} style={onClick ? { cursor: 'pointer' } : undefined}>
      <div className="avatar" style={{ background: user.color }}>
        {user.name.charAt(0)}
      </div>
      <div className="member-row-info">
        <div className="member-row-name">{user.name}</div>
        {user.email && <div className="member-row-email">{user.email}</div>}
      </div>
      {rightContent && <div className="member-row-right">{rightContent}</div>}
    </div>
  );
}
