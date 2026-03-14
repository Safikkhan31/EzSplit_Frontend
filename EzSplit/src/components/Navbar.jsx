import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Navbar.css';
import { useState } from 'react';

export default function Navbar({ title = 'EzSplit', showBack = false, backTo, rightContent }) {
  const navigate = useNavigate();
  const { currentUser, getRandomColor } = useApp();


  return (
    <nav className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {showBack ? (
          <button className="navbar-back" onClick={() => (backTo ? navigate(backTo) : navigate(-1))}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Back
          </button>
        ) : (
          <h1 className="navbar-title">{title}</h1>
        )}
      </div>

      <div className="navbar-actions">
        {rightContent}
        {!showBack && (
          <button className="navbar-profile" onClick={() => navigate('/profile')}>
            <div
              className="avatar"
              style={{ background: getRandomColor() }}
            >
              {currentUser.name.charAt(0)}
            </div>
          </button>
        )}
      </div>
    </nav>
  );
}
