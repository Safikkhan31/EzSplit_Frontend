import { useState, useEffect } from 'react';
import MemberRow from './MemberRow';
import './SplitTabs.css';

const TABS = ['equal', 'custom', 'percentage'];

export default function SplitTabs({ members, totalAmount, onSplitsChange }) {
  const [activeTab, setActiveTab] = useState('equal');
  const [customAmounts, setCustomAmounts] = useState({});
  const [percentages, setPercentages] = useState({});

  // Initialize custom/percentage on mount
  useEffect(() => {
    const perPerson = Math.round((totalAmount / members.length) * 100) / 100;
    const initCustom = {};
    const initPct = {};
    const eachPct = Math.round((100 / members.length) * 100) / 100;
    members.forEach((m) => {
      initCustom[m.id] = perPerson;
      initPct[m.id] = eachPct;
    });
    setCustomAmounts(initCustom);
    setPercentages(initPct);
  }, [members, totalAmount]);

  // Compute splits based on active tab
  useEffect(() => {
    let splits = {};

    if (activeTab === 'equal') {
      const perPerson = Math.round((totalAmount / members.length) * 100) / 100;
      members.forEach((m) => (splits[m.id] = perPerson));
    } else if (activeTab === 'custom') {
      splits = { ...customAmounts };
    } else {
      members.forEach((m) => {
        splits[m.id] = Math.round(((percentages[m.id] || 0) / 100) * totalAmount * 100) / 100;
      });
    }

    onSplitsChange(splits, activeTab);
  }, [activeTab, customAmounts, percentages, members, totalAmount]);

  const computedTotal = () => {
    if (activeTab === 'equal') return totalAmount;
    if (activeTab === 'custom')
      return Object.values(customAmounts).reduce((s, v) => s + (Number(v) || 0), 0);
    return Object.values(percentages).reduce((s, v) => s + (Number(v) || 0), 0);
  };

  const remaining = () => {
    if (activeTab === 'percentage') return 100 - computedTotal();
    return totalAmount - computedTotal();
  };

  const rem = remaining();
  const isValid = Math.abs(rem) < 0.01;

  return (
    <div className="split-tabs">
      <div className="split-tab-header">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`split-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="split-tab-content">
        {activeTab === 'equal' && (
          <>
            <div className="split-summary">
              <span className="split-summary-label">Per person</span>
              <span className="split-summary-value">
                ₹{(totalAmount / members.length).toFixed(2)}
              </span>
            </div>
            {members.map((member) => (
              <MemberRow
                key={member.id}
                user={member}
                rightContent={
                  <span className="amount" style={{ fontSize: '0.95rem' }}>
                    ₹{(totalAmount / members.length).toFixed(2)}
                  </span>
                }
              />
            ))}
          </>
        )}

        {activeTab === 'custom' && (
          <>
            {members.map((member) => (
              <MemberRow
                key={member.id}
                user={member}
                rightContent={
                  <input
                    type="number"
                    className="member-row-input"
                    value={customAmounts[member.id] ?? ''}
                    onChange={(e) =>
                      setCustomAmounts((prev) => ({
                        ...prev,
                        [member.id]: Number(e.target.value) || 0,
                      }))
                    }
                    placeholder="₹0"
                  />
                }
              />
            ))}
            <div className={`split-remaining ${isValid ? 'valid' : 'invalid'}`}>
              {isValid ? '✓ Amounts match total' : `₹${Math.abs(rem).toFixed(2)} ${rem > 0 ? 'remaining' : 'over'}`}
            </div>
          </>
        )}

        {activeTab === 'percentage' && (
          <>
            {members.map((member) => (
              <MemberRow
                key={member.id}
                user={member}
                rightContent={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <input
                      type="number"
                      className="member-row-input"
                      value={percentages[member.id] ?? ''}
                      onChange={(e) =>
                        setPercentages((prev) => ({
                          ...prev,
                          [member.id]: Number(e.target.value) || 0,
                        }))
                      }
                      placeholder="0"
                    />
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>%</span>
                  </div>
                }
              />
            ))}
            <div className={`split-remaining ${isValid ? 'valid' : 'invalid'}`}>
              {isValid ? '✓ Percentages total 100%' : `${Math.abs(rem).toFixed(1)}% ${rem > 0 ? 'remaining' : 'over'}`}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
