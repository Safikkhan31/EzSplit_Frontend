import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import GroupCard from '../components/GroupCard';
import './Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { groups, currentUser } = useApp();

  // Only show groups the current user is a member of
  const myGroups = groups.filter((g) => g.members.includes(currentUser.id));

  return (
    <div className="page">
      <Navbar />

      <button className="home-create-btn" onClick={() => navigate('/create-group')}>
        <div className="home-create-btn-icon">+</div>
        Create New Group
      </button>

      <div className="section-title">Your Groups</div>

      {myGroups.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-text">
            No groups yet. Create one to start splitting expenses!
          </div>
        </div>
      ) : (
        <div className="home-group-list">
          {myGroups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
