import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Fuel, Users, Settings, LogOut, Plus,
  BarChart2, RefreshCw, PauseCircle, PlayCircle, CheckCircle2,
  UserX, Trash2, Bell, Wifi, WifiOff, AlertTriangle, Clock,
  TrendingUp, Zap, ChevronDown, ChevronUp, Activity, Gauge,
  Info, X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';

// ─── Constants ───────────────────────────────────────────────────────────────
const POLL_INTERVAL = 10000; // 10 s fallback polling
const FUEL_TYPES = ['petrol', 'diesel'];

// ─── Colour helpers ───────────────────────────────────────────────────────────
function queueStatusColor(isPaused, fuelAvailable) {
  if (!fuelAvailable) return { dot: 'bg-red-500',    badge: 'bg-red-900/40 text-red-300 border-red-700',       label: 'NO FUEL' };
  if (isPaused)       return { dot: 'bg-amber-400',  badge: 'bg-amber-900/40 text-amber-300 border-amber-700', label: 'PAUSED'  };
  return               { dot: 'bg-emerald-400', badge: 'bg-emerald-900/40 text-emerald-300 border-emerald-700', label: 'ACTIVE'  };
}

function congestionColor(level) {
  if (level === 'high')   return 'bg-red-900/40 text-red-300 border-red-700';
  if (level === 'medium') return 'bg-amber-900/40 text-amber-300 border-amber-700';
  return 'bg-emerald-900/40 text-emerald-300 border-emerald-700';
}

function waitColor(mins) {
  if (mins >= 20) return 'text-red-400 font-bold';
  if (mins >= 10) return 'text-amber-400 font-semibold';
  return 'text-emerald-400';
}

// ─── SidebarItem ─────────────────────────────────────────────────────────────
const SidebarItem = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active
        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
    }`}
  >
    {icon} {label}
  </Link>
);

// ─── FuelCard ─────────────────────────────────────────────────────────────────
const FuelCard = ({ fuelType, queue, isPaused, fuelAvailable, onTogglePause, onToggleFuel }) => {
  const { dot, badge, label } = queueStatusColor(isPaused, fuelAvailable);
  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Fuel size={16} className="text-teal-400" />
          <span className="text-sm font-bold text-slate-200 capitalize">{fuelType}</span>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge}`}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${dot} animate-pulse`} />
        <span className="text-2xl font-black text-white">{queue.length}</span>
        <span className="text-xs text-slate-400">in queue</span>
      </div>
      <div className="flex gap-2 mt-1">
        <StatusToggle
          active={!isPaused && fuelAvailable}
          onLabel="Pause"
          offLabel="Resume"
          onIcon={<PauseCircle size={12} />}
          offIcon={<PlayCircle size={12} />}
          onClick={onTogglePause}
          disabled={!fuelAvailable}
        />
        <StatusToggle
          active={fuelAvailable}
          onLabel="Fuel On"
          offLabel="No Fuel"
          onIcon={<Zap size={12} />}
          offIcon={<Zap size={12} />}
          onClick={onToggleFuel}
          variant="fuel"
        />
      </div>
    </div>
  );
};

// ─── StatusToggle ─────────────────────────────────────────────────────────────
const StatusToggle = ({ active, onLabel, offLabel, onIcon, offIcon, onClick, disabled, variant }) => {
  const base = 'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all flex-1 justify-center';
  let cls;
  if (variant === 'fuel') {
    cls = active
      ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700 hover:bg-emerald-800/50'
      : 'bg-red-900/40 text-red-300 border-red-700 hover:bg-red-800/50';
  } else {
    cls = active
      ? 'bg-amber-900/40 text-amber-300 border-amber-700 hover:bg-amber-800/50'
      : 'bg-teal-900/40 text-teal-300 border-teal-700 hover:bg-teal-800/50';
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${cls} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {active ? onIcon : offIcon}
      {active ? onLabel : offLabel}
    </button>
  );
};

// ─── StatusIndicator ─────────────────────────────────────────────────────────
const StatusIndicator = ({ connected }) => (
  <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${
    connected
      ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700'
      : 'bg-slate-700/60 text-slate-400 border-slate-600'
  }`}>
    {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
    {connected ? 'LIVE' : 'POLLING'}
  </div>
);

// ─── Alert type config ────────────────────────────────────────────────────────
const ALERT_CFG = {
  turn_soon:       { icon: <Zap size={13} />,           cls: 'text-teal-400 bg-teal-900/30'    },
  leave_now:       { icon: <Clock size={13} />,          cls: 'text-blue-400 bg-blue-900/30'    },
  queue_paused:    { icon: <AlertTriangle size={13} />,  cls: 'text-amber-400 bg-amber-900/30'  },
  fuel_available:  { icon: <Fuel size={13} />,           cls: 'text-emerald-400 bg-emerald-900/30' },
  congestion_high: { icon: <AlertTriangle size={13} />,  cls: 'text-red-400 bg-red-900/30'      },
  no_show_warning: { icon: <AlertTriangle size={13} />,  cls: 'text-red-400 bg-red-900/30'      },
  default:         { icon: <Info size={13} />,           cls: 'text-slate-400 bg-slate-700/40'  },
};

// ─── LogsModal ────────────────────────────────────────────────────────────────
const LogsModal = ({ logs, onClose }) => (
  <>
    <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} />
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h3 className="font-bold text-slate-200 flex items-center gap-2">
            <Activity size={16} className="text-teal-400" /> Action Logs
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {logs.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No actions logged yet.</p>
          ) : (
            [...logs].reverse().map((log, i) => (
              <div key={i} className="flex items-start gap-3 text-sm">
                <span className="text-slate-500 font-mono text-[10px] mt-0.5 shrink-0 w-16">{log.time}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                  log.type === 'serve'   ? 'bg-emerald-900/50 text-emerald-400' :
                  log.type === 'noshow' ? 'bg-red-900/50 text-red-400' :
                  log.type === 'remove' ? 'bg-orange-900/50 text-orange-400' :
                  'bg-slate-700 text-slate-400'
                }`}>{log.type.toUpperCase()}</span>
                <span className="text-slate-300">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useLang();
  const { connected, joinStation, leaveStation, onQueueUpdate } = useSocket();

  const [station, setStation]               = useState(null);
  const [activeFuel, setActiveFuel]         = useState('petrol');
  const [queues, setQueues]                 = useState({ petrol: [], diesel: [] });
  const [paused, setPaused]                 = useState({ petrol: false, diesel: false });
  const [fuelAvail, setFuelAvail]           = useState({ petrol: true, diesel: true });
  const [serveTime, setServeTime]           = useState(5);
  const [analytics, setAnalytics]           = useState(null);
  const [peakHours, setPeakHours]           = useState([]);
  const [efficiency, setEfficiency]         = useState(0);
  const [peakHour, setPeakHour]             = useState(null);
  const [alerts, setAlerts]                 = useState([]);
  const [alertsExpanded, setAlertsExpanded] = useState(true);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');
  const [lastUpdated, setLastUpdated]       = useState(new Date());
  const [showLogs, setShowLogs]             = useState(false);
  const [logs, setLogs]                     = useState([]);
  const [refreshing, setRefreshing]         = useState(false);
  const pollRef = useRef(null);

  const addLog = useCallback((type, message) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [...prev.slice(-99), { type, message, time }]);
  }, []);

  // Load station
  useEffect(() => {
    api.listStations()
      .then((stations) => {
        const mine = stations.find(
          (s) => s.adminId === user?.id || s.adminId?.toString() === user?.id
        ) || stations[0];
        if (mine) {
          setStation(mine);
          const avail = {};
          const paus  = {};
          (mine.fuelTypes || FUEL_TYPES).forEach((ft) => {
            avail[ft] = mine[`${ft}Available`] !== false;
            paus[ft]  = false;
          });
          setFuelAvail(avail);
          setPaused(paus);
          if (mine.fuelTypes?.[0]) setActiveFuel(mine.fuelTypes[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  // Fetch all queues
  const fetchQueues = useCallback(async (silent = false) => {
    if (!station?._id) return;
    if (!silent) setRefreshing(true);
    try {
      const results = await Promise.allSettled(
        (station.fuelTypes || FUEL_TYPES).map((ft) =>
          api.getQueueList(station._id, ft).then((data) => ({ ft, data }))
        )
      );
      const next = {};
      results.forEach((r) => {
        if (r.status === 'fulfilled') {
          const { ft, data } = r.value;
          next[ft] = Array.isArray(data) ? data : [];
        }
      });
      setQueues((prev) => ({ ...prev, ...next }));
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      if (!err.message?.includes('404')) setError(err.message);
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, [station]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    if (!station?._id) return;
    try {
      const [analyticsData, peaks] = await Promise.all([
        api.getStationAnalytics(station._id, 7),
        api.getPeakHours(station._id, activeFuel, 7),
      ]);
      setAnalytics(analyticsData);
      setPeakHours(peaks);
      const totals = analyticsData.reduce(
        (acc, r) => ({ joins: acc.joins + r.totalJoins, served: acc.served + r.totalServed }),
        { joins: 0, served: 0 }
      );
      setEfficiency(totals.joins > 0 ? Math.round((totals.served / totals.joins) * 100) : 0);
      if (peaks.length > 0) {
        const top = peaks.reduce((a, b) => (b.avgJoins > a.avgJoins ? b : a));
        setPeakHour(top.hour);
      }
    } catch { /* keep previous */ }
  }, [station, activeFuel]);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      const data = await api.getMyAlerts();
      setAlerts(Array.isArray(data) ? data.slice(0, 20) : []);
    } catch { /* graceful */ }
  }, []);

  // Initial load
  useEffect(() => {
    if (!station) return;
    fetchQueues();
    fetchAnalytics();
    fetchAlerts();
  }, [station]); // eslint-disable-line react-hooks/exhaustive-deps

  // WebSocket subscription with debounced onQueueUpdate
  useEffect(() => {
    if (!station?._id) return;
    joinStation(station._id);
    const unsub = onQueueUpdate(() => fetchQueues(true), 'admin-dashboard');
    return () => {
      leaveStation(station._id);
      unsub();
    };
  }, [station, joinStation, leaveStation, onQueueUpdate, fetchQueues]);

  // Polling fallback at 10 s
  useEffect(() => {
    if (!station?._id) return;
    pollRef.current = setInterval(() => fetchQueues(true), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [station, fetchQueues]);

  // Actions
  const handleServe = async (ft, entryId, pin) => {
    try {
      await api.serveUser(station._id, ft, entryId);
      addLog('serve', `Served PIN ${pin || entryId} on ${ft}`);
      fetchQueues(true);
    } catch (err) { setError(err.message); }
  };

  const handleNoShow = async (ft, entryId, pin) => {
    try {
      await api.removeNoShow(station._id, ft, entryId);
      addLog('noshow', `No-show PIN ${pin || entryId} on ${ft}`);
      fetchQueues(true);
    } catch (err) { setError(err.message); }
  };

  const handleRemove = async (ft, entryId, pin) => {
    if (!window.confirm(`Remove PIN ${pin || entryId} from queue?`)) return;
    try {
      await api.removeNoShow(station._id, ft, entryId);
      addLog('remove', `Removed PIN ${pin || entryId} from ${ft}`);
      fetchQueues(true);
    } catch (err) { setError(err.message); }
  };

  const handleTogglePause = async (ft) => {
    try {
      if (paused[ft]) await api.resumeQueue(station._id, ft);
      else            await api.pauseQueue(station._id, ft);
      setPaused((prev) => ({ ...prev, [ft]: !prev[ft] }));
      addLog('control', `${paused[ft] ? 'Resumed' : 'Paused'} ${ft} queue`);
      fetchQueues(true);
    } catch (err) { setError(err.message); }
  };

  const handleToggleFuel = async (ft) => {
    const next = !fuelAvail[ft];
    try {
      await api.setFuelAvailability(station._id, ft, next);
      setFuelAvail((prev) => ({ ...prev, [ft]: next }));
      addLog('control', `${ft} fuel set to ${next ? 'AVAILABLE' : 'NO FUEL'}`);
    } catch (err) { setError(err.message); }
  };

  const handleMarkAlertRead = async (id) => {
    try {
      await api.markAlertRead(id);
      setAlerts((prev) => prev.map((a) => a._id === id ? { ...a, read: true } : a));
    } catch { /* graceful */ }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  // Derived
  const fuelTypes    = station?.fuelTypes || FUEL_TYPES;
  const activeQueue  = queues[activeFuel] || [];
  const unreadAlerts = alerts.filter((a) => !a.read).length;

  const analyticsTotals = (analytics || []).reduce(
    (acc, r) => ({
      joins:   acc.joins   + r.totalJoins,
      served:  acc.served  + r.totalServed,
      noShows: acc.noShows + r.totalNoShows,
      avgWait: acc.avgWait + r.avgWaitMinutes,
    }),
    { joins: 0, served: 0, noShows: 0, avgWait: 0 }
  );
  if ((analytics || []).length > 0)
    analyticsTotals.avgWait = Math.round(analyticsTotals.avgWait / analytics.length);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-slate-950 items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Loading control center…</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">

      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 border-r border-slate-800 hidden lg:flex flex-col shrink-0">
        <div className="px-6 py-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Fuel size={20} className="text-teal-400" />
            <span className="text-lg font-black text-teal-400 tracking-tighter">FuelFlow</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5 font-medium uppercase tracking-widest">Control Center</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <SidebarItem to="/admin/dashboard"        icon={<LayoutDashboard size={16} />} label={t.dashboard}    active />
          <SidebarItem to="/admin/manage-queue"     icon={<Users size={16} />}           label={t.queueAdmin} />
          <SidebarItem to="/admin/analytics"        icon={<BarChart2 size={16} />}       label="Analytics" />
          <SidebarItem to="/admin/token-validation" icon={<Gauge size={16} />}           label="Token Validation" />
          <SidebarItem to="/admin/create-station"   icon={<Plus size={16} />}            label="Create Station" />
          <SidebarItem to="/admin/profile"          icon={<Settings size={16} />}        label={t.profile} />
        </nav>
        {station && (
          <div className="px-4 py-3 mx-3 mb-3 bg-slate-800/60 rounded-xl border border-slate-700">
            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Active Station</p>
            <p className="text-sm font-bold text-slate-200 truncate">{station.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{station.address}</p>
          </div>
        )}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 font-semibold hover:bg-red-900/20 rounded-lg transition text-sm"
          >
            <LogOut size={16} /> {t.logout}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Dark header */}
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={18} className="text-teal-400" />
            <h1 className="font-bold text-slate-100 text-sm">
              {t.adminDashboard}
              {station && <span className="text-slate-400 font-normal ml-2">— {station.name}</span>}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <StatusIndicator connected={connected} />
            <span className="text-[10px] text-slate-500 hidden sm:block">
              Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <button
              onClick={() => fetchQueues()}
              className={`p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition ${refreshing ? 'animate-spin text-teal-400' : ''}`}
              title="Refresh"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => setAlertsExpanded((v) => !v)}
              className="relative p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition"
              title="Alerts"
            >
              <Bell size={15} />
              {unreadAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadAlerts > 9 ? '9+' : unreadAlerts}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowLogs(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Action Logs"
            >
              <Activity size={15} />
            </button>
            <div className="w-7 h-7 bg-teal-700 rounded-full flex items-center justify-center text-teal-200 text-xs font-bold">
              {user?.phone?.slice(-2) || 'A'}
            </div>
          </div>
        </header>

        {/* Error banner */}
        {error && (
          <div className="mx-6 mt-4 bg-red-900/30 border border-red-700 rounded-xl px-4 py-3 text-red-300 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-200"><X size={14} /></button>
          </div>
        )}

        {/* Body grid */}
        <div className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-3 gap-6 overflow-auto">

          {/* Left column (spans 2) */}
          <div className="xl:col-span-2 flex flex-col gap-6">

            {/* Station Control Panel */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Gauge size={15} className="text-teal-400" /> {t.stationControl}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{t.serveTime}:</span>
                  <button
                    onClick={() => setServeTime((v) => Math.max(1, v - 1))}
                    className="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs font-bold transition"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold text-teal-300 w-8 text-center">{serveTime}m</span>
                  <button
                    onClick={() => setServeTime((v) => Math.min(60, v + 1))}
                    className="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 flex items-center justify-center text-xs font-bold transition"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fuelTypes.map((ft) => (
                  <FuelCard
                    key={ft}
                    fuelType={ft}
                    queue={queues[ft] || []}
                    isPaused={paused[ft]}
                    fuelAvailable={fuelAvail[ft]}
                    onTogglePause={() => handleTogglePause(ft)}
                    onToggleFuel={() => handleToggleFuel(ft)}
                  />
                ))}
              </div>
            </section>

            {/* Live Queue Table */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
              <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Activity size={15} className="text-teal-400" /> {t.liveQueue}
                  </h2>
                  <div className="flex gap-1 ml-2">
                    {fuelTypes.map((ft) => (
                      <button
                        key={ft}
                        onClick={() => setActiveFuel(ft)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border transition capitalize ${
                          activeFuel === ft
                            ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                            : 'text-slate-500 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        {ft}
                        <span className={`ml-1.5 text-[9px] px-1 py-0.5 rounded-full ${activeFuel === ft ? 'bg-teal-500/30' : 'bg-slate-700'}`}>
                          {(queues[ft] || []).length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                {paused[activeFuel] && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-900/30 border border-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <PauseCircle size={10} /> PAUSED
                  </span>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-800/60 border-b border-slate-700 text-[10px] uppercase font-bold text-slate-500">
                    <tr>
                      <th className="px-5 py-3">#</th>
                      <th className="px-5 py-3">{t.pin}</th>
                      <th className="px-5 py-3">{t.eta}</th>
                      <th className="px-5 py-3">{t.elapsed}</th>
                      <th className="px-5 py-3">Congestion</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {activeQueue.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-slate-600 text-sm">
                          Queue is empty for {activeFuel}.
                        </td>
                      </tr>
                    ) : (
                      activeQueue.map((entry, idx) => {
                        const congestion = entry.congestionLevel || (idx < 3 ? 'low' : idx < 7 ? 'medium' : 'high');
                        return (
                          <tr key={entry._id} className="hover:bg-slate-800/40 transition group">
                            <td className="px-5 py-3">
                              <span className="font-black text-slate-300">#{entry.position ?? idx + 1}</span>
                            </td>
                            <td className="px-5 py-3">
                              <span className="font-mono text-teal-300 text-xs bg-teal-900/30 px-2 py-0.5 rounded">
                                {entry.pinCode || '—'}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span className={waitColor(entry.estimatedWaitMinutes ?? 0)}>
                                {entry.estimatedWaitMinutes ?? 0} min
                              </span>
                            </td>
                            <td className="px-5 py-3 text-slate-500 text-xs">
                              {entry.elapsedMinutes ?? 0} min
                            </td>
                            <td className="px-5 py-3">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${congestionColor(congestion)}`}>
                                {congestion.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition">
                                <button
                                  onClick={() => handleServe(activeFuel, entry._id, entry.pinCode)}
                                  disabled={paused[activeFuel] || !fuelAvail[activeFuel]}
                                  title={t.confirmServe}
                                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                                    paused[activeFuel] || !fuelAvail[activeFuel]
                                      ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                                      : 'bg-emerald-900/40 text-emerald-300 border-emerald-700 hover:bg-emerald-800/60'
                                  }`}
                                >
                                  <CheckCircle2 size={12} /> {t.serve}
                                </button>
                                <button
                                  onClick={() => handleNoShow(activeFuel, entry._id, entry.pinCode)}
                                  title={t.confirmNoShow}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border bg-amber-900/30 text-amber-300 border-amber-700 hover:bg-amber-800/50 transition"
                                >
                                  <UserX size={12} /> {t.noShow}
                                </button>
                                <button
                                  onClick={() => handleRemove(activeFuel, entry._id, entry.pinCode)}
                                  title={t.removeUser}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border bg-red-900/30 text-red-400 border-red-800 hover:bg-red-900/50 transition"
                                >
                                  <Trash2 size={12} /> {t.removeUser}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">

            {/* Analytics Mini-Panel */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <TrendingUp size={15} className="text-violet-400" /> {t.analyticsTitle}
                </h2>
                <Link to="/admin/analytics" className="text-[10px] text-teal-400 hover:text-teal-300 font-bold transition">
                  Full View
                </Link>
              </div>
              <div className="p-5 space-y-4">
                {/* Efficiency score */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-slate-400">{t.efficiency}</span>
                    <span className={`text-lg font-black ${efficiency >= 80 ? 'text-emerald-400' : efficiency >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                      {efficiency}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${efficiency >= 80 ? 'bg-emerald-500' : efficiency >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${efficiency}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-600 mt-1">Served / Joins — last 7 days</p>
                </div>
                {/* KPI grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">{t.totalServed}</p>
                    <p className="text-xl font-black text-emerald-400 mt-0.5">{analyticsTotals.served}</p>
                  </div>
                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">{t.totalJoins}</p>
                    <p className="text-xl font-black text-blue-400 mt-0.5">{analyticsTotals.joins}</p>
                  </div>
                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">{t.avgWait}</p>
                    <p className="text-xl font-black text-violet-400 mt-0.5">{analyticsTotals.avgWait}m</p>
                  </div>
                  <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700">
                    <p className="text-[10px] text-slate-500 uppercase font-bold">{t.peakHour}</p>
                    <p className="text-xl font-black text-amber-400 mt-0.5">
                      {peakHour !== null ? `${peakHour}:00` : '—'}
                    </p>
                  </div>
                </div>
                {/* Mini bar chart */}
                {peakHours.length > 0 && (
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Peak Hours ({activeFuel})</p>
                    <div className="flex items-end gap-0.5 h-16">
                      {peakHours.map((h) => {
                        const maxJ = Math.max(...peakHours.map((x) => x.avgJoins), 1);
                        const pct  = Math.max(4, (h.avgJoins / maxJ) * 100);
                        const isNow = h.hour === new Date().getHours();
                        return (
                          <div key={h.hour} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                            <div
                              className={`w-full rounded-t-sm transition-all ${isNow ? 'bg-teal-500' : 'bg-slate-700 group-hover:bg-violet-500/60'}`}
                              style={{ height: `${pct}%` }}
                            />
                            {h.hour % 6 === 0 && (
                              <span className="text-[7px] text-slate-600">{h.hour}</span>
                            )}
                            <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 border border-slate-700">
                              {h.hour}:00 — {h.avgJoins} avg
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Alerts Panel */}
            <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setAlertsExpanded((v) => !v)}
                className="w-full px-5 py-3 border-b border-slate-800 flex items-center justify-between hover:bg-slate-800/40 transition"
              >
                <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Bell size={15} className="text-amber-400" />
                  {t.alertsTitle}
                  {unreadAlerts > 0 && (
                    <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadAlerts}
                    </span>
                  )}
                </h2>
                {alertsExpanded
                  ? <ChevronUp size={14} className="text-slate-500" />
                  : <ChevronDown size={14} className="text-slate-500" />
                }
              </button>
              {alertsExpanded && (
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800">
                  {alerts.length === 0 ? (
                    <div className="px-5 py-8 text-center text-slate-600 text-sm">
                      <Bell size={24} className="mx-auto mb-2 opacity-30" />
                      No alerts.
                    </div>
                  ) : (
                    alerts.map((alert) => {
                      const cfg = ALERT_CFG[alert.type] || ALERT_CFG.default;
                      return (
                        <div
                          key={alert._id}
                          onClick={() => !alert.read && handleMarkAlertRead(alert._id)}
                          className={`px-4 py-3 flex items-start gap-3 cursor-pointer hover:bg-slate-800/40 transition ${!alert.read ? 'bg-amber-900/10' : ''}`}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${cfg.cls}`}>
                            {cfg.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-snug ${!alert.read ? 'font-semibold text-slate-200' : 'text-slate-500'}`}>
                              {alert.message}
                            </p>
                            <p className="text-[10px] text-slate-600 mt-0.5">
                              {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {alert.stationId?.name && ` · ${alert.stationId.name}`}
                            </p>
                          </div>
                          {!alert.read && <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0 mt-1.5" />}
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </section>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/admin/manage-queue"
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 hover:border-teal-600/50 hover:bg-slate-800/60 transition group"
              >
                <Users size={18} className="text-teal-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-300">Queue Admin</span>
                <span className="text-[10px] text-slate-600">Full queue management</span>
              </Link>
              <Link
                to="/admin/analytics"
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 hover:border-violet-600/50 hover:bg-slate-800/60 transition group"
              >
                <BarChart2 size={18} className="text-violet-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-300">Analytics</span>
                <span className="text-[10px] text-slate-600">7-day breakdown</span>
              </Link>
              <Link
                to="/admin/token-validation"
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 hover:border-blue-600/50 hover:bg-slate-800/60 transition group"
              >
                <Gauge size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-300">Token Validation</span>
                <span className="text-[10px] text-slate-600">Validate driver PINs</span>
              </Link>
              <Link
                to="/admin/create-station"
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 hover:border-emerald-600/50 hover:bg-slate-800/60 transition group"
              >
                <Plus size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-slate-300">Create Station</span>
                <span className="text-[10px] text-slate-600">Add a new station</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Modal */}
      {showLogs && <LogsModal logs={logs} onClose={() => setShowLogs(false)} />}
    </div>
  );
}