import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Prevents authenticated users from accessing login/signup.
 * Redirects them to their role-appropriate dashboard instead.
 */
export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    const dest = user.role === 'station_admin' ? '/admin/dashboard' : '/user/dashboard';
    return <Navigate to={dest} replace />;
  }

  return children;
}
