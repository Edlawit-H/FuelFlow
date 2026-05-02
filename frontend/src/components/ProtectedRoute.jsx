import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route and enforces authentication + optional role check.
 *
 * Usage:
 *   <ProtectedRoute>                        — any authenticated user
 *   <ProtectedRoute role="station_admin">   — admins only
 *   <ProtectedRoute role="user">            — drivers only
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still resolving token from localStorage — show spinner, render nothing else
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in → send to login, remember where they were going
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wrong role → redirect BEFORE rendering children (prevents API calls firing)
  if (role && user.role !== role) {
    const dest = user.role === 'station_admin' ? '/admin/dashboard' : '/user/dashboard';
    return <Navigate to={dest} replace />;
  }

  return children;
}
