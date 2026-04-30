import { useState, useEffect, useRef, useCallback } from 'react';
import { LayoutDashboard, Fuel, Users, User, Settings, LogOut, Plus, Ban, RefreshCw, X, ClipboardList } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const POLL_INTERVAL = 8000;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const { user, logout } = useAuth();

  const pollRef = useRef(null);
  const [station, setStation] = useState(null);
  const [queues, setQueues] = useState({ petrol: null, diesel: null });
  const [entries, setEntries] = useState([]);
  const [polling, setPolling] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState([]);

  // Load admin's station
  useEffect(() => {
    api.listStations()
      .then((stations) => {
        const mine = stations.find((s) =>
          s.adminId === user?.id || s.adminId?.toString() === user?.id
        ) || stations[0];
        if (mine) setStation(mine);
      })
      .catch(() => {});
  }, [user]);

  const fetchQueueData = useCallback(async () => {
    if (!station) return;
    try {
      const fuelTypes = station.fuelTypes || ['petrol', 'diesel'];
      const results = {};
      const allEntries = [];
      for (const ft of fuelTypes) {
        try {
          const list = await api.getQueueList(station._id, ft);
          results[ft] = list;
          allEntries.push(...list.map((e) => ({ ...e, fuelType: ft })));
        } catch { results[ft] = []; }
      }
      setQueues(results);
      setEntries(allEntries);
      setLastUpdated(new Date());
    } catch { /* keep previous */ }
  }, [station]);

  useEffect(() => { fetchQueueData(); }, [fetchQueueData]);

  useEffect(() => {
    if (!polling || !station) return;
    pollRef.current = setInterval(fetchQueueData, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [polling, fetchQueueData, station]);

  const handleBan = async (entryId, fuelType) => {
    if (!window.confirm('Remove this session?')) return;
    try {
      await api.serveUser(station._id, fuelType, entryId);
      fetchQueueData();
    } catch (err) { alert(err.message); }
  };

  const handleToggleFuel = async (fuelType, current) => {
    try {
      await api.setFuelAvailability(station._id, fuelType, !current);
      fetchQueueData();
    } catch (err) { alert(err.message); }
  };

  const handleToggleQueue = async (fuelType, isPaused) => {
    try {
      if (isPaused) await api.resumeQueue(station._id, fuelType);
      else await api.pauseQueue(station._id, fuelType);
      fetchQueueData();
    } catch (err) { alert(err.message); }
  };

  const handleNewEntry = () => {
    // Navigate to QueueAdmin where manual entry is handled
    navigate('/admin/manage-queue');
  };

  const handleShowLogs = () => {
    // Build a simple log from current entries
    const logEntries = entries.map((e) => ({
      time: new Date(e.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pin: e.pinCode || '—',
      fuel: e.fuelType,
      position: e.position,
      elapsed: `${e.elapsedMinutes ?? 0} min`,
    }));
    setLogs(logEntries);
    setShowLogs(true);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  // Derive fuel card data from station queues
  const stationQueues = station?.queues || [];
  const petrolQ = stationQueues.find((q) => q.fuelType === 'petrol');
  const dieselQ = stationQueues.find((q) => q.fuelType === 'diesel');

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-6 text-xl font-bold text-[#10b981]">{t.appName}</div>
        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem to="/admin/dashboard" icon={<LayoutDashboard size={18} />} label={t.dashboard} active />
          <SidebarItem to="/admin/manage-queue" icon={<Users size={18} />} label={t.queueAdmin} />
          <SidebarItem to="/admin/token-validation" icon={<Fuel size={18} />} label="Token Validation" />
          <SidebarItem to="/admin/create-station" icon={<Plus size={18} />} label="Create Station" />
          <SidebarItem to="/admin/profile" icon={<Settings size={18} />} label={t.profile} />
        </nav>
        <div className="p-4 border-t border-slate-100"><StatusIndicator /></div>
      </aside>

      <main className="flex-1">
        <header className="bg-white border-b px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Fuel className="text-teal-600" size={20} />
              {station ? station.name : 'Loading…'}
            </div>
            <button
              onClick={() => setPolling((v) => !v)}
              className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border transition ${polling ? 'text-teal-600 border-teal-200 bg-teal-50' : 'text-slate-400 border-slate-200'}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${polling ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'}`} />
              {t.pollingLive}
            </button>
            <button onClick={fetchQueueData} className="text-slate-300 hover:text-teal-500 transition"><RefreshCw size={14} /></button>
            <span className="text-[10px] text-slate-300 hidden sm:block">{lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right mr-2">
              <p className="text-xs font-bold text-slate-900">{user?.phone || 'Admin'}</p>
              <p className="text-[10px] text-slate-400 uppercase">Station Admin</p>
            </div>
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700"><User size={18} /></div>
            <button onClick={handleLogout} aria-label={t.logout} className="text-red-400 hover:text-red-600 transition"><LogOut size={18} /></button>
          </div>
        </header>

        <div className="p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t.adminDashboard}</h1>
              <p className="text-slate-500 text-sm">Manage real-time queueing and fuel availability.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleShowLogs}
                className="bg-white border px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-slate-50 transition"
              >
                <ClipboardList size={14} /> Logs
              </button>
              <button
                onClick={handleNewEntry}
                className="bg-[#065f46] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-emerald-900 transition"
              >
                <Plus size={14} /> New Entry
              </button>
            </div>
          </div>

          {/* Fuel Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <FuelCard
              type="Petrol"
              sub="95 OCTANE"
              count={petrolQ?.queueLength ?? (queues.petrol?.length ?? '—')}
              fuelAvailable={petrolQ?.fuelAvailable ?? true}
              queueActive={!(petrolQ?.isPaused ?? false)}
              onToggleFuel={() => handleToggleFuel('petrol', petrolQ?.fuelAvailable ?? true)}
              onToggleQueue={() => handleToggleQueue('petrol', petrolQ?.isPaused ?? false)}
            />
            <FuelCard
              type="Diesel"
              sub="ULTRA LOW SULFUR"
              count={dieselQ?.queueLength ?? (queues.diesel?.length ?? '—')}
              fuelAvailable={dieselQ?.fuelAvailable ?? false}
              queueActive={!(dieselQ?.isPaused ?? true)}
              onToggleFuel={() => handleToggleFuel('diesel', dieselQ?.fuelAvailable ?? false)}
              onToggleQueue={() => handleToggleQueue('diesel', dieselQ?.isPaused ?? true)}
            />
          </div>

          {/* Active Sessions Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm">{t.activeSession}</h3>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{entries.length} ACTIVE</span>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b">
                <tr>
                  <th className="px-6 py-4">Position</th>
                  <th className="px-6 py-4">PIN Code</th>
                  <th className="px-6 py-4">Fuel Type</th>
                  <th className="px-6 py-4">Elapsed</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">No active sessions.</td></tr>
                ) : (
                  entries.map((e) => (
                    <tr key={e._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-bold text-slate-700">#{e.position}</td>
                      <td className="px-6 py-4 font-mono text-slate-600">{e.pinCode || '—'}</td>
                      <td className={`px-6 py-4 font-bold text-xs ${e.fuelType === 'petrol' ? 'text-emerald-500' : 'text-orange-500'}`}>{e.fuelType}</td>
                      <td className="px-6 py-4 text-slate-500">{e.elapsedMinutes ?? 0} min</td>
                      <td className="px-6 py-4">
                        <button onClick={() => handleBan(e._id, e.fuelType)} aria-label="Remove session" className="hover:text-red-600 transition">
                          <Ban size={16} className="text-red-400" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Logs Modal */}
      {showLogs && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowLogs(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-slate-800 flex items-center gap-2"><ClipboardList size={18} /> Session Logs</h2>
              <button onClick={() => setShowLogs(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="overflow-y-auto max-h-80">
              {logs.length === 0 ? (
                <p className="text-center text-slate-400 py-10 text-sm">No active sessions to log.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b">
                    <tr>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">PIN</th>
                      <th className="px-4 py-3">Fuel</th>
                      <th className="px-4 py-3">Pos</th>
                      <th className="px-4 py-3">Elapsed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {logs.map((l, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-500">{l.time}</td>
                        <td className="px-4 py-3 font-mono">{l.pin}</td>
                        <td className="px-4 py-3 capitalize">{l.fuel}</td>
                        <td className="px-4 py-3">#{l.position}</td>
                        <td className="px-4 py-3 text-slate-500">{l.elapsed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const SidebarItem = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer transition ${active ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500 hover:bg-slate-50'}`}>
    {icon} {label}
  </Link>
);

const FuelCard = ({ type, sub, count, fuelAvailable, queueActive, onToggleFuel, onToggleQueue }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-6">
      <div className="flex gap-4">
        <div className={`p-3 rounded-xl ${fuelAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}><Fuel size={24} /></div>
        <div>
          <h4 className="font-bold text-slate-800">{type}</h4>
          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{sub}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="text-2xl font-bold text-slate-800">{count}</span>
        <p className="text-[9px] text-slate-400 font-bold uppercase">Vehicles In Queue</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <StatusToggle label="Fuel Status" val={fuelAvailable ? 'Available' : 'No Fuel'} active={fuelAvailable} onToggle={onToggleFuel} />
      <StatusToggle label="Queue State" val={queueActive ? 'Active' : 'Paused'} active={queueActive} onToggle={onToggleQueue} />
    </div>
  </div>
);

const StatusToggle = ({ label, val, active, onToggle }) => (
  <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center border">
    <div>
      <p className="text-[9px] font-bold text-slate-400 uppercase">{label}</p>
      <p className={`text-xs font-bold ${active ? 'text-slate-700' : 'text-red-500'}`}>{val}</p>
    </div>
    <button type="button" onClick={onToggle} aria-label={`Toggle ${label}`}
      className={`w-8 h-4 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-teal-500 ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-0.5' : 'left-0.5'}`} />
    </button>
  </div>
);

const StatusIndicator = () => (
  <div className="bg-slate-50 p-3 rounded-lg">
    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">System Status</p>
    <div className="flex items-center gap-2 text-emerald-500 text-[11px] font-bold uppercase">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Operational
    </div>
  </div>
);

export default AdminDashboard;
