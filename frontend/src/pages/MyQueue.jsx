import { useState, useEffect, useRef, useCallback } from 'react';
import {
  LayoutDashboard, Fuel, Users, User, Bell, Settings, Map, Calendar,
  MapPin, QrCode, PauseCircle, LogOut, CheckCircle2, AlertTriangle, RefreshCw,
  Wifi, WifiOff, Clock, ChevronRight,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationsPanel from '../components/NotificationsPanel';
import SettingsPanel from '../components/SettingsPanel';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';

const POLL_INTERVAL = 10000; // fallback only

const MyQueue = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const { user, logout } = useAuth();
  const { connected, joinStation, leaveStation, joinUserRoom, onQueueUpdate } = useSocket();
  const pollRef = useRef(null);
  const stationRoomRef = useRef(null);

  // Join personal user room for direct position pushes from backend
  useEffect(() => {
    if (user?.id) joinUserRoom(user.id);
  }, [user?.id, joinUserRoom]);

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leftQueue, setLeftQueue] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [pinRevealed, setPinRevealed] = useState(false);
  const [flash, setFlash] = useState(false); // visual flash on update

  const fetchStatus = useCallback(async () => {
    try {
      const data = await api.getMyStatus();
      setStatus((prev) => {
        // Flash animation when position changes
        if (prev?.entry?.position !== data?.entry?.position) {
          setFlash(true);
          setTimeout(() => setFlash(false), 600);
        }
        return data;
      });
      setLastUpdated(new Date());
    } catch { /* keep previous */ }
    finally { setLoading(false); }
  }, []);

  // Initial fetch
  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // Join station WebSocket room when we know which station we're at
  useEffect(() => {
    const stationId = status?.entry?.stationId;
    if (!stationId) return;

    // Leave old room if station changed
    if (stationRoomRef.current && stationRoomRef.current !== stationId) {
      leaveStation(stationRoomRef.current);
    }
    stationRoomRef.current = stationId;
    joinStation(stationId);

    return () => {
      if (stationRoomRef.current) leaveStation(stationRoomRef.current);
    };
  }, [status?.entry?.stationId, joinStation, leaveStation]);

  // WebSocket: primary real-time update
  useEffect(() => {
    const unsub = onQueueUpdate(() => fetchStatus(), 'my-queue');
    return unsub;
  }, [onQueueUpdate, fetchStatus]);

  // Polling: fallback only
  useEffect(() => {
    pollRef.current = setInterval(fetchStatus, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [fetchStatus]);

  const handleLeaveQueue = async () => {
    if (!window.confirm(t.leaveQueue + ' — This action cannot be undone.')) return;
    try {
      const entry = status?.entry;
      if (entry) await api.leaveQueue(entry.stationId, entry.fuelType);
      setLeftQueue(true);
      if (stationRoomRef.current) leaveStation(stationRoomRef.current);
      setTimeout(() => navigate('/user/dashboard'), 1500);
    } catch (err) { alert(err.message); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading queue status…</p>
        </div>
      </div>
    );
  }

  if (leftQueue || (status && !status.active)) {
    return (
      <div className="flex min-h-screen bg-slate-50 items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} className="text-teal-500" />
          </div>
          <p className="font-bold text-slate-800 text-lg">
            {status && !status.active ? 'You are not in any queue.' : 'You have left the queue.'}
          </p>
          <p className="text-slate-400 text-sm">Find a station to join a new queue.</p>
          <Link
            to="/user/dashboard"
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-teal-700 transition"
          >
            Browse Stations <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  const entry = status?.entry;
  const queue = status?.queue;
  const token = status?.token;
  const progress = entry ? Math.max(5, Math.round((1 / (entry.position || 1)) * 100)) : 0;
  const isNext = entry?.position === 1;
  const isNearTurn = entry?.position <= 3 && entry?.position > 1;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 hidden md:flex flex-col">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-teal-700">{t.appName}</h1>
          <p className="text-[10px] font-semibold text-slate-400 tracking-widest mt-1">QUEUE MANAGEMENT</p>
        </div>
        <nav className="space-y-1 flex-1">
          <NavItem icon={<LayoutDashboard size={18} />} label={t.dashboard} to="/user/dashboard" />
          <NavItem icon={<Fuel size={18} />} label={t.stations} to="/user/dashboard" />
          <NavItem icon={<Users size={18} />} label={t.myQueue} to="/my-queue" active />
          <NavItem icon={<Map size={18} />} label={t.mapView || 'Map'} to="/map" />
          <NavItem icon={<Calendar size={18} />} label={t.reserveSlot || 'Reserve'} to="/reservations" />
          <NavItem icon={<User size={18} />} label={t.profile} to="/profile" />
        </nav>
        <div className="border-t border-slate-100 pt-3">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 font-semibold hover:bg-red-50 rounded-xl transition text-sm">
            <LogOut size={16} /> {t.logout}
          </button>
        </div>
      </aside>

      <main className="flex-1 px-4 md:px-10 pb-10">
        {/* Header */}
        <header className="flex justify-between items-center py-4 border-b border-slate-200 mb-6">
          <div className="flex space-x-6 text-sm font-medium text-slate-500">
            <Link to="/user/dashboard" className="hover:text-teal-700">{t.dashboard}</Link>
            <Link to="/my-queue" className="text-teal-700 border-b-2 border-teal-700 pb-4">{t.myQueue}</Link>
            <Link to="/profile" className="hover:text-teal-700">{t.profile}</Link>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            {/* WebSocket status indicator */}
            <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${
              connected ? 'text-teal-600 border-teal-200 bg-teal-50' : 'text-slate-400 border-slate-200 bg-slate-50'
            }`}>
              {connected
                ? <><Wifi size={11} className="text-teal-500" /><span className="hidden sm:inline">{t.wsConnected || 'Live'}</span></>
                : <><WifiOff size={11} /><span className="hidden sm:inline">{t.wsDisconnected || 'Offline'}</span></>
              }
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'}`} />
            </div>
            <button onClick={fetchStatus} className="hover:text-teal-500 transition" aria-label="Refresh">
              <RefreshCw size={14} />
            </button>
            <button onClick={() => { setShowNotifications(true); setShowSettings(false); }}>
              <Bell size={20} className="hover:text-slate-600" />
            </button>
            <button onClick={() => { setShowSettings(true); setShowNotifications(false); }}>
              <Settings size={20} className="hover:text-slate-600" />
            </button>
            <button onClick={handleLogout} className="text-red-400 hover:text-red-600 transition" aria-label={t.logout}>
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Status Banners */}
        {queue?.isPaused && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 mb-4 animate-in slide-in-from-top">
            <div className="bg-amber-100 p-2 rounded-xl shrink-0"><PauseCircle size={20} className="text-amber-600" /></div>
            <div>
              <h4 className="font-bold text-amber-800 text-sm">Queue Paused</h4>
              <p className="text-amber-700 text-xs mt-0.5">The station has temporarily paused this queue. Your position is held.</p>
            </div>
          </div>
        )}

        {isNext && (
          <div className="bg-emerald-500 rounded-2xl p-4 flex items-center gap-3 mb-4 shadow-lg shadow-emerald-500/20">
            <div className="bg-white/20 p-2 rounded-xl shrink-0"><CheckCircle2 size={20} className="text-white" /></div>
            <div>
              <h4 className="font-bold text-white text-sm">It's Your Turn!</h4>
              <p className="text-emerald-100 text-xs mt-0.5">Proceed to the designated pump lane now.</p>
            </div>
          </div>
        )}

        {isNearTurn && !isNext && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-xl shrink-0"><Bell size={20} className="text-orange-600" /></div>
            <div>
              <h4 className="font-bold text-orange-800 text-sm">Almost Your Turn</h4>
              <p className="text-orange-700 text-xs mt-0.5">
                You are #{entry.position}. Estimated wait: {entry.estimatedWaitMinutes} min. Start heading to the station.
              </p>
            </div>
          </div>
        )}

        {!queue?.fuelAvailable && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 mb-4">
            <div className="bg-red-100 p-2 rounded-xl shrink-0"><AlertTriangle size={20} className="text-red-600" /></div>
            <div>
              <h4 className="font-bold text-red-800 text-sm">Fuel Unavailable</h4>
              <p className="text-red-700 text-xs mt-0.5">Supply is currently exhausted. The station will update when fuel is available.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Status Card */}
          <div className="lg:col-span-2 space-y-5">
            <div className={`bg-white border rounded-2xl p-6 shadow-sm transition-all duration-300 ${flash ? 'ring-2 ring-teal-400 ring-offset-2' : 'border-slate-200'}`}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">{t.queueStatus}</h2>
                  <p className="text-slate-500 text-sm flex items-center mt-1">
                    <MapPin size={14} className="mr-1 text-teal-600" />
                    {entry?.stationName || '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-300">
                    {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 border capitalize ${
                    entry?.fuelType === 'petrol'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-orange-50 text-orange-700 border-orange-200'
                  }`}>
                    <Fuel size={12} /> {entry?.fuelType || '—'}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <StatCard
                  label={t.currentPosition}
                  value={`#${String(entry?.position || 0).padStart(2, '0')}`}
                  color="teal"
                  large
                />
                <StatCard
                  label={t.peopleAhead}
                  value={`${Math.max(0, (entry?.position || 1) - 1)}`}
                  sub="vehicles"
                  color="slate"
                />
                <StatCard
                  label={t.estimatedWait}
                  value={queue?.isPaused ? '—' : `${entry?.estimatedWaitMinutes ?? 0}`}
                  sub={queue?.isPaused ? 'paused' : 'min'}
                  color={isNearTurn ? 'orange' : 'slate'}
                />
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-slate-600">{t.queueProgress}</span>
                  <span className="text-teal-600 font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${progress}%`,
                      background: isNext
                        ? 'linear-gradient(90deg, #10b981, #34d399)'
                        : isNearTurn
                        ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                        : 'linear-gradient(90deg, #14b8a6, #2dd4bf)',
                    }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {isNext ? 'Proceed to pump now' : `${Math.max(0, (entry?.position || 1) - 1)} vehicles ahead of you`}
                </p>
              </div>
            </div>

            {/* Journey Timeline */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                <Clock size={16} className="text-teal-500" /> Queue Timeline
              </h3>
              <div className="flex items-center gap-0">
                {[
                  { label: 'Joined', done: true, icon: '✓' },
                  { label: 'Waiting', done: entry?.position > 1, active: entry?.position > 1, icon: '⏳' },
                  { label: 'Near Turn', done: isNearTurn || isNext, active: isNearTurn, icon: '🔔' },
                  { label: 'Your Turn', done: isNext, active: isNext, icon: '⛽' },
                ].map((step, i, arr) => (
                  <div key={step.label} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                        step.done
                          ? 'bg-teal-500 border-teal-500 text-white'
                          : step.active
                          ? 'bg-amber-400 border-amber-400 text-white'
                          : 'bg-white border-slate-200 text-slate-300'
                      }`}>
                        {step.icon}
                      </div>
                      <span className={`text-[9px] font-bold mt-1 ${step.done || step.active ? 'text-slate-700' : 'text-slate-300'}`}>
                        {step.label}
                      </span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-4 ${step.done ? 'bg-teal-400' : 'bg-slate-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column — PIN + Actions */}
          <div className="space-y-5">
            {/* PIN Card */}
            {token && (
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 relative overflow-hidden shadow-xl">
                <div className="absolute -right-8 -top-8 w-28 h-28 bg-white/5 rounded-full" />
                <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-teal-500/10 rounded-full" />
                <p className="text-[10px] font-bold tracking-widest text-slate-400 mb-3 uppercase">
                  {t.yourSecretCode}
                </p>
                <div className="flex items-center gap-3 mb-5">
                  {pinRevealed ? (
                    <h2 className="text-4xl font-mono font-bold text-teal-400 tracking-widest">
                      {token.pinCode}
                    </h2>
                  ) : (
                    <h2 className="text-4xl font-mono font-bold text-slate-600 tracking-widest select-none">
                      ••••••
                    </h2>
                  )}
                  <button
                    onClick={() => setPinRevealed((v) => !v)}
                    className="text-slate-400 hover:text-teal-400 transition text-xs font-bold border border-slate-700 px-2 py-1 rounded-lg"
                  >
                    {pinRevealed ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="border-t border-slate-700 pt-4 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">Station</p>
                    <p className="text-xs font-semibold text-slate-300 truncate">{entry?.stationName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-500 uppercase font-bold">{t.estimatedWait}</p>
                    <p className="text-xs font-semibold text-slate-300">{entry?.estimatedWaitMinutes ?? 0} min</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <button className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95">
                <QrCode size={18} /> {t.scanAtPump}
              </button>
              <button
                onClick={handleLeaveQueue}
                className="w-full py-3 bg-white border border-red-200 text-red-500 font-semibold rounded-xl flex items-center justify-center gap-2 hover:bg-red-50 transition-all active:scale-95"
              >
                <LogOut size={18} /> {t.leaveQueue}
              </button>
              <p className="text-[10px] text-center text-slate-400">
                Leaving forfeits your current position permanently.
              </p>
            </div>

            {/* Quick Links */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Quick Actions</p>
              <Link to="/map" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition text-sm text-slate-600 font-medium">
                <span className="flex items-center gap-2"><Map size={15} className="text-teal-500" /> View on Map</span>
                <ChevronRight size={14} className="text-slate-300" />
              </Link>
              <Link to="/reservations" className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 transition text-sm text-slate-600 font-medium">
                <span className="flex items-center gap-2"><Calendar size={15} className="text-violet-500" /> Reserve Next Slot</span>
                <ChevronRight size={14} className="text-slate-300" />
              </Link>
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
  <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
    active ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-600 font-bold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
  }`}>
    {icon}<span className="text-sm">{label}</span>
  </Link>
);

const StatCard = ({ label, value, sub, color = 'slate', large = false }) => {
  const colors = {
    teal: 'text-teal-600',
    orange: 'text-orange-500',
    slate: 'text-slate-800',
  };
  return (
    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
      <p className={`font-bold ${large ? 'text-2xl' : 'text-xl'} ${colors[color]}`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
};

export default MyQueue;
