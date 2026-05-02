import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, BarChart2, Gauge, Plus,
  Settings, LogOut, Fuel, ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

const NAV_ITEMS = [
  { to: '/admin/dashboard',        icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
  { to: '/admin/manage-queue',     icon: <Users size={16} />,           label: 'Queue Admin' },
  { to: '/admin/analytics',        icon: <BarChart2 size={16} />,       label: 'Analytics' },
  { to: '/admin/token-validation', icon: <Gauge size={16} />,           label: 'Token Validation' },
  { to: '/admin/create-station',   icon: <Plus size={16} />,            label: 'Create Station' },
  { to: '/admin/profile',          icon: <Settings size={16} />,        label: 'Profile' },
];

/**
 * Shared layout wrapper for all admin sub-pages.
 * Provides sidebar navigation + consistent header with back button.
 *
 * Props:
 *   title       — page heading shown in the header
 *   backTo      — explicit back path (defaults to /admin/dashboard)
 *   backLabel   — label for the back button
 *   children    — page content
 */
export default function AdminLayout({ title, backTo = '/admin/dashboard', backLabel = 'Back to Dashboard', children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { t } = useLang();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 border-r border-slate-800 hidden lg:flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-slate-800">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <Fuel size={20} className="text-teal-400" />
            <span className="text-lg font-black text-teal-400 tracking-tighter">FuelFlow</span>
          </Link>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium uppercase tracking-widest">Control Center</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                {item.icon} {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 font-semibold hover:bg-red-900/20 rounded-lg transition text-sm"
          >
            <LogOut size={16} /> {t.logout || 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sub-page header */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(backTo)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-teal-400 transition text-sm font-semibold"
              aria-label={backLabel}
            >
              <ChevronLeft size={16} /> {backLabel}
            </button>
            {title && (
              <>
                <span className="text-slate-700">·</span>
                <h1 className="text-sm font-bold text-slate-200">{title}</h1>
              </>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition text-xs font-semibold"
          >
            <LogOut size={14} /> {t.logout || 'Logout'}
          </button>
        </header>

        {/* Page body */}
        <div className="flex-1 overflow-auto bg-slate-950">
          {children}
        </div>
      </div>
    </div>
  );
}
