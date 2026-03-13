import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import CreateGroup from './pages/CreateGroup';
import GroupDetail from './pages/GroupDetail';
import AddPayment from './pages/AddPayment';
import SplitExpense from './pages/SplitExpense';
import Settlement from './pages/Settlement';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';

import { useApp } from './context/AppContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useApp();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const { loading } = useApp();

  if (loading) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ color: 'var(--text-dim)', fontSize: '1.2rem' }}>Loading data...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
      <Route path="/create-group" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
      <Route path="/group/:groupId" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
      <Route path="/group/:groupId/add-payment" element={<ProtectedRoute><AddPayment /></ProtectedRoute>} />
      <Route path="/group/:groupId/split" element={<ProtectedRoute><SplitExpense /></ProtectedRoute>} />
      <Route path="/group/:groupId/settlement" element={<ProtectedRoute><Settlement /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
