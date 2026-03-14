import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import './CreateGroup.css';

export default function CreateGroup() {
  const navigate = useNavigate();
  const { createGroup } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [memberEmails, setMemberEmails] = useState([]);
  const [emailInput, setEmailInput] = useState('');
  const [emailError, setEmailError] = useState('');

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const addEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (memberEmails.includes(email)) {
      setEmailError('This email is already added');
      return;
    }
    setMemberEmails((prev) => [...prev, email]);
    setEmailInput('');
    setEmailError('');
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEmail();
    }
  };

  const removeEmail = (email) => {
    setMemberEmails((prev) => prev.filter((e) => e !== email));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createGroup(name.trim(), description.trim(), memberEmails);
      navigate('/');
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

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
          <label className="input-label">Add Members by Email</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input-field"
              placeholder="member@example.com"
              value={emailInput}
              onChange={(e) => { setEmailInput(e.target.value); setEmailError(''); }}
              onKeyDown={handleEmailKeyDown}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={addEmail}
              style={{ padding: '0 18px', whiteSpace: 'nowrap' }}
            >
              Add
            </button>
          </div>
          {emailError && (
            <div style={{ color: '#e17055', fontSize: '0.82rem', marginTop: 6 }}>{emailError}</div>
          )}

          {memberEmails.length > 0 && (
            <div className="create-group-chips">
              {memberEmails.map((email) => (
                <div key={email} className="chip">
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      background: '#6c5ce7',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      color: '#fff',
                      fontWeight: 700,
                    }}
                  >
                    {email.charAt(0).toUpperCase()}
                  </span>
                  {email}
                  <button className="chip-remove" onClick={() => removeEmail(email)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="create-group-footer">
        <button
          className="btn btn-primary btn-block"
          disabled={!name.trim() || isSubmitting}
          onClick={handleCreate}
          style={{ opacity: name.trim() && !isSubmitting ? 1 : 0.5 }}
        >
          {isSubmitting ? 'Creating...' : 'Create Group'}
        </button>
      </div>
    </div>
  );
}
