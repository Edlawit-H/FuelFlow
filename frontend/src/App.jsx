import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';

// Public pages
import FuelFlowLanding from './pages/FuelFlowLanding';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// Driver pages
import UserDashboard from './pages/UserDashboard';
import DriverHome from './pages/DriverHome';
import DriverStation from './pages/DriverStation';
import MyQueue from './pages/MyQueue';
import Profile from './pages/Profile';
import MapView from './pages/MapView';
import ReservationPage from './pages/ReservationPage';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import QueueAdmin from './pages/QueueAdmin';
import AdminProfile from './pages/AdminProfile';
import TokenValidation from './pages/TokenValidation';
import CreateStation from './pages/CreateStation';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

import './App.css';

function App() {
  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────────────────────── */}
      <Route path="/" element={<FuelFlowLanding />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Auth pages — redirect away if already logged in */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/LoginPage" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
      <Route path="/signup" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* ── Driver (authenticated, role: user) ─────────────────────────── */}
      <Route path="/user/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
      <Route path="/driver-home"    element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
      <Route path="/driver"         element={<ProtectedRoute role="user"><DriverHome /></ProtectedRoute>} />
      <Route path="/driver/station/:id" element={<ProtectedRoute role="user"><DriverStation /></ProtectedRoute>} />
      <Route path="/driver/join-confirm" element={<ProtectedRoute role="user"><MyQueue /></ProtectedRoute>} />
      <Route path="/my-queue"       element={<ProtectedRoute role="user"><MyQueue /></ProtectedRoute>} />
      <Route path="/profile"        element={<ProtectedRoute role="user"><Profile /></ProtectedRoute>} />
      <Route path="/map"            element={<ProtectedRoute><MapView /></ProtectedRoute>} />
      <Route path="/reservations"   element={<ProtectedRoute role="user"><ReservationPage /></ProtectedRoute>} />

      {/* ── Admin (authenticated, role: station_admin) ──────────────────── */}
      <Route path="/admin/dashboard"        element={<ProtectedRoute role="station_admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/manage-queue"     element={<ProtectedRoute role="station_admin"><QueueAdmin /></ProtectedRoute>} />
      <Route path="/admin/profile"          element={<ProtectedRoute role="station_admin"><AdminProfile /></ProtectedRoute>} />
      <Route path="/admin/token-validation" element={<ProtectedRoute role="station_admin"><TokenValidation /></ProtectedRoute>} />
      <Route path="/admin/create-station"   element={<ProtectedRoute role="station_admin"><CreateStation /></ProtectedRoute>} />
      <Route path="/admin/analytics"        element={<ProtectedRoute role="station_admin"><AnalyticsDashboard /></ProtectedRoute>} />

      {/* ── Fallback ────────────────────────────────────────────────────── */}
      <Route path="*" element={<FuelFlowLanding />} />
    </Routes>
  );
}

export default App;
