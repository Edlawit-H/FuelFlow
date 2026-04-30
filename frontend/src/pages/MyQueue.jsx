import { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard, Fuel, Users, User, Bell, Settings,
  MapPin, QrCode, PauseCircle, LogOut, CheckCircle2, AlertTriangle, RefreshCw,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationsPanel from '../components/NotificationsPanel';
import SettingsPanel from '../components/SettingsPanel';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const POLL_INTERVAL = 10000;

const MyQueue = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const { logout } = useAuth();
  const pollRef = useRef(null);

  const [status, setStatus] = useState(null); // API response
  const [loading, setLoading] = useState(true);
  const [leftQueue, setLeftQueue] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [polling, setPolling] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchStatus = async () => {
    try {
      const data = await api.getMyStatus();
      setStatus(data);
      setLastUpdated(new Date());
    } catch { /* keep previous */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStatus(); }, []);

  useEffect(() => {
    if (!polling) return;
    pollRef.current = setInterval(fetchStatus, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [polling]);

  const handleLeaveQueue = async () => {
    if (!window.confirm(t.leaveQueue + ' — This action cannot be undone.')) return;
    try {
      const entry = status?.entry;
      if (entry) await api.leaveQueue(entry.stationId, entry.fuelType);
      setLeftQueue(true);
      setTimeout(() => navigate('/user/dashboard'), 1500);
    } catch (err) { alert(err.message); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <p className="text-slate-400">Loading queue status…</p>
      </div>
    );
  }

  if (leftQueue || (status && !status.active)) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="text-center space-y-4">
          <CheckCircle2 size={48} className="text-teal-500 mx-auto" />
          <p className="font-bold text-slate-800">{status && !status.active ? 'You are not in any queue.' : 'You have left the queue.'}</p>
          <Link to="/user/dashboard" className="inline-block bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-teal-700 transition">
            Browse Stations
          </Link>
        </div>
      </div>
    );
  }

  const entry = status?.entry;
  const queue = status?.queue;
  const token = status?.token;
  const progress = entry ? Math.max(5, Math.round((1 / (entry.position || 1)) * 100)) : 0;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 p-6 hidden md:flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-teal-700">{t.appName}</h1>
          <p className="text-[10px] font-semibold text-slate-400 tracking-widest mt-1">QUEUE MANAGEMENT</p>
        </div>
        <nav className="space-y-1 flex-1">
          <NavItem icon={<LayoutDashboard size={18} />} label={t.dashboard} to="/user/dashboard" />
          <NavItem icon={<Fuel size={18} />} label={t.stations} to="/user/dashboard" />
          <NavItem icon={<Users size={18} />} label={t.myQueue} to="/my-queue" active />
          <NavItem icon={<MapPin size={18} />} label={t.driverHome} to="/driver" />
          <NavItem icon={<User size={18} />} label={t.profile} to="/profile" />
        </nav>
        <div className="border-t border-slate-100 pt-3">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 font-semibold hover:bg-red-50 rounded-xl transition text-sm">
            <LogOut size={16} /> {t.logout}
          </button>
        </div>
      </aside>

      <main className="flex-1 px-4 md:px-10">
        <header className="flex justify-between items-center py-4 border-b border-slate-200 mb-6">
          <div className="flex space-x-6 text-sm font-medium text-slate-500">
            <Link to="/user/dashboard" className="hover:text-teal-700">{t.dashboard}</Link>
            <Link to="/my-queue" className="text-teal-700 border-b-2 border-teal-700 pb-4">{t.myQueue}</Link>
            <Link to="/profile" className="hover:text-teal-700">{t.profile}</Link>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <button onClick={() => setPolling((v) => !v)}
              className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border transition ${polling ? 'text-teal-600 border-teal-200 bg-teal-50' : 'text-slate-400 border-slate-200'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${polling ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'}`} />
              {t.pollingLive}
            </button>
            <button onClick={fetchStatus}><RefreshCw size={14} className="hover:text-teal-500 transition" /></button>
            <button onClick={() => { setShowNotifications(true); setShowSettings(false); }}><Bell size={20} className="hover:text-slate-600" /></button>
            <button onClick={() => { setShowSettings(true); setShowNotifications(false); }}><Settings size={20} className="hover:text-slate-600" /></button>
            <button onClick={handleLogout} className="text-red-400 hover:text-red-600 transition" aria-label={t.logout}><LogOut size={20} /></button>
          </div>
        </header>

        {queue?.isPaused && (
          <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-start space-x-4 mb-4">
            <div className="bg-yellow-100 p-2 rounded-full"><PauseCircle size={20} className="text-yellow-600" /></div>
            <div>
              <h4 className="font-bold text-yellow-800 text-sm">Queue Paused</h4>
              <p className="text-yellow-700 text-sm">The station has paused this queue temporarily.</p>
            </div>
          </div>
        )}

        {entry?.position <= 3 && (
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start space-x-4 mb-8">
            <div className="bg-orange-100 p-2 rounded-full"><Bell size={20} className="text-orange-600" /></div>
            <div>
              <h4 className="font-bold text-orange-800 text-sm">Near turn</h4>
              <p className="text-orange-700 text-sm">Please prepare to enter. Your turn is in approximately {entry.estimatedWaitMinutes} minutes.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{t.queueStatus}</h2>
                  <p className="text-slate-500 text-sm flex items-center mt-1">
                    <MapPin size={14} className="mr-1 text-teal-600" /> {entry?.stationName || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-300">{lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center border border-blue-100 capitalize">
                    <Fuel size={14} className="mr-1" /> {entry?.fuelType || '—'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <StatItem label={t.currentPosition} value={`#${String(entry?.position || 0).padStart(2, '0')}`} highlight />
                <StatItem label={t.peopleAhead} value={`${Math.max(0, (entry?.position || 1) - 1)} Vehicles`} />
                <StatItem label={t.estimatedWait} value={queue?.isPaused ? 'Paused' : `${entry?.estimatedWaitMinutes ?? 0} min`} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-slate-700">{t.queueProgress}</span>
                  <span className="text-teal-600">{progress}% Complete</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {entry?.position === 1 && (
                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center space-x-4">
                  <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><CheckCircle2 size={24} /></div>
                  <div>
                    <p className="font-bold text-emerald-900 text-sm">Your Turn</p>
                    <p className="text-emerald-700 text-xs">Proceed to designated lane</p>
                  </div>
                </div>
              )}
              {!queue?.fuelAvailable && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center space-x-4">
                  <div className="bg-red-100 p-2 rounded-lg text-red-600"><AlertTriangle size={24} /></div>
                  <div>
                    <p className="font-bold text-red-900 text-sm">No fuel</p>
                    <p className="text-red-700 text-xs">Supply currently exhausted</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {token && (
              <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-xl">
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-slate-800 rounded-full opacity-50" />
                <p className="text-[10px] font-bold tracking-widest text-slate-400 mb-4">{t.yourSecretCode}</p>
                <h2 className="text-4xl font-mono font-bold text-teal-400 tracking-wider mb-6">{token.pinCode}</h2>
                <div className="border-t border-slate-700 pt-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">{t.estimatedWait}</span>
                    <span className="font-semibold text-slate-200">{entry?.estimatedWaitMinutes ?? 0} min</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <button className="w-full py-3 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors">
                <QrCode size={18} /><span>{t.scanAtPump}</span>
              </button>
              <button
                onClick={handleLeaveQueue}
                className="w-full py-3 bg-white border border-red-100 text-red-500 font-semibold rounded-xl flex items-center justify-center space-x-2 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} /><span>{t.leaveQueue}</span>
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-2">
                Leaving the queue will forfeit your current position.
              </p>
            </div>
          </div>
        </div>
      </main>

      {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
};

const NavItem = ({ icon, label, active = false, to }) => (
  <Link to={to} className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${active ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-700 font-bold' : 'text-slate-500 hover:bg-slate-50'}`}>
    {icon}<span className="text-sm">{label}</span>
  </Link>
);

const StatItem = ({ label, value, highlight = false }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 tracking-tighter mb-1 uppercase">{label}</p>
    <p className={`text-lg font-bold ${highlight ? 'text-teal-600' : 'text-slate-800'}`}>{value}</p>
  </div>
);

export default MyQueue;
