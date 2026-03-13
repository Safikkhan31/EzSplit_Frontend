import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import './CreateGroup.css';

export default function CreateGroup() {
  const navigate = useNavigate();
  const { users, currentUser, createGroup } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [search, setSearch] = useState('');

  // Filter users: exclude current user and already-selected, match search
  const filteredUsers = users.filter(
    (u) =>
      u.id !== currentUser.id &&
      !selectedMembers.includes(u.id) &&
      u.name.toLowerCase().includes(search.toLowerCase())
  );

  const addMember = (userId) => {
    setSelectedMembers((prev) => [...prev, userId]);
    setSearch('');
  };

  const removeMember = (userId) => {
    setSelectedMembers((prev) => prev.filter((id) => id !== userId));
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    createGroup(name.trim(), description.trim(), selectedMembers);
    navigate('/');
  };

  const getUserById = (id) => users.find((u) => u.id === id);

  return (
    <div className="page">
      <Navbar showBack backTo="/" />

      <h2 style={{ marginBottom: 4, fontSize: '1.4rem', fontWeight: 800 }}>Create Group</h2>
      <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: 24 }}>
        Set up a new expense group
      </p>

      <div className="create-group-form">
        <div className="create-group-field">
          <label className="input-label">Group Name</label>
          <input
            className="input-field"
            placeholder="e.g. Trip to Goa 🏖️"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="create-group-field">
          <label className="input-label">Description (optional)</label>
          <input
            className="input-field"
            placeholder="What's this group for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="create-group-field">
          <label className="input-label">Add Members</label>
          <input
            className="input-field"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <div className="create-group-search-results">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="create-group-search-item"
                  onClick={() => addMember(user.id)}
                >
                  <div className="avatar avatar-sm" style={{ background: user.color }}>
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>{user.email}</div>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div style={{ padding: 14, textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                  No users found
                </div>
              )}
            </div>
          )}

          {selectedMembers.length > 0 && (
            <div className="create-group-chips">
              {selectedMembers.map((id) => {
                const user = getUserById(id);
                return (
                  <div key={id} className="chip">
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: user?.color,
                        display: 'inline-block',
                      }}
                    />
                    {user?.name}
                    <button className="chip-remove" onClick={() => removeMember(id)}>
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="create-group-footer">
        <button
          className="btn btn-primary btn-block"
          disabled={!name.trim()}
          onClick={handleCreate}
          style={{ opacity: name.trim() ? 1 : 0.5 }}
        >
          Create Group
        </button>
      </div>
    </div>
  );
}
