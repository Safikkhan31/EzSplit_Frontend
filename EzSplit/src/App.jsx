import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateGroup from './pages/CreateGroup';
import GroupDetail from './pages/GroupDetail';
import AddPayment from './pages/AddPayment';
import SplitExpense from './pages/SplitExpense';
import Settlement from './pages/Settlement';
import Profile from './pages/Profile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/create-group" element={<CreateGroup />} />
      <Route path="/group/:groupId" element={<GroupDetail />} />
      <Route path="/group/:groupId/add-payment" element={<AddPayment />} />
      <Route path="/group/:groupId/split" element={<SplitExpense />} />
      <Route path="/group/:groupId/settlement" element={<Settlement />} />
      <Route path="/profile" element={<Profile />} />
    </Routes>
  );
}

export default App;
