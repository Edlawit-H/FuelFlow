import { Routes, Route } from 'react-router-dom';
import FuelFlowLanding from './pages/FuelFlowLanding';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import UserDashboard from './pages/UserDashboard';

// Driver Pages
import DriverHome from './pages/DriverHome';
import DriverStation from './pages/DriverStation'; // From image_d9866e

import MyQueue from './pages/MyQueue';       
    // From image_d98a4a

// Admin Pages
import AdminDashboard from './pages/AdminDashboard'; // From image_d995d1
import QueueAdmin from './pages/QueueAdmin';         // From image_d98978
import AdminProfile from './pages/AdminProfile';     // From image_d98d54
import Profile from './pages/Profile';

import './App.css';

function App() {
  return (
    <Routes>
      {/* 1. Public Entry */}
      <Route path="/" element={<FuelFlowLanding />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/LoginPage" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/signup" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* 2. Driver Flow (Mobile Styled) */}
      <Route path="/user/dashboard" element={<UserDashboard />} />
      <Route path="/driver-home" element={<UserDashboard />} />
      <Route path="/driver" element={<DriverHome />} />
      <Route path="/driver/station/:id" element={<DriverStation />} />
      <Route path="/driver/join-confirm" element={<MyQueue />} />
      <Route path="/my-queue" element={<MyQueue />} />
      <Route path="/profile" element={<Profile />} />

      {/* 3. Admin Flow (Desktop Styled with Sidebar) */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/manage-queue" element={<QueueAdmin />} />
      <Route path="/admin/profile" element={<AdminProfile />} />
      <Route path="*" element={<FuelFlowLanding />} />
    </Routes>
  );
}

export default App;