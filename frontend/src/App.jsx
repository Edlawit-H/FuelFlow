import { Routes, Route } from 'react-router-dom';
import FuelFlowLanding from './pages/FuelFlowLanding';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UserDashboard from './pages/UserDashboard';

// Driver Pages
import DriverHome from './pages/DriverHome';
import DriverStation from './pages/DriverStation';
import MyQueue from './pages/MyQueue';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import QueueAdmin from './pages/QueueAdmin';
import AdminProfile from './pages/AdminProfile';
import TokenValidation from './pages/TokenValidation';
import CreateStation from './pages/CreateStation';

import './App.css';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<FuelFlowLanding />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/LoginPage" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/signup" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Driver */}
      <Route path="/user/dashboard" element={<UserDashboard />} />
      <Route path="/driver-home" element={<UserDashboard />} />
      <Route path="/driver" element={<DriverHome />} />
      <Route path="/driver/station/:id" element={<DriverStation />} />
      <Route path="/driver/join-confirm" element={<MyQueue />} />
      <Route path="/my-queue" element={<MyQueue />} />
      <Route path="/profile" element={<Profile />} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/manage-queue" element={<QueueAdmin />} />
      <Route path="/admin/profile" element={<AdminProfile />} />
      <Route path="/admin/token-validation" element={<TokenValidation />} />
      <Route path="/admin/create-station" element={<CreateStation />} />

      <Route path="*" element={<FuelFlowLanding />} />
    </Routes>
  );
}

export default App;