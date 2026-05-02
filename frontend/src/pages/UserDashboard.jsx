import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell, CircleUserRound, Fuel, LayoutDashboard,
  LocateFixed, Map, Search, Settings, User, Users, Zap, X, LogOut, RefreshCw, Brain, Calendar,
} from 'lucide-react';
import StationCard from '../components/StationCard';
import NotificationsPanel from '../components/NotificationsPanel';
import SettingsPanel from '../components/SettingsPanel';
import AIInsightsPanel from '../components/AIInsightsPanel';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';

const POLL_INTERVAL = 15000;

function stationToCard(s) {
  // queues array comes from the backend's getStation/listStations summary
  const findQueue = (ft) => s.queues?.find((q) => q.fuelType === ft);
  const fuelStatus = (ft) => {
    const q = findQueue(ft);
    if (!s.fuelTypes?.includes(ft)) return null; // station doesn't offer this fuel
    if (!q) return 'AVAILABLE (0 MIN)'; // queue exists but no summary yet
    if (!q.fuelAvailable) return 'NO FUEL';
    if (q.isPaused) return 'PAUSED';
    return `AVAILABLE (${q.estimatedWaitMinutes ?? 0} MIN)`;
  };
  return {
    id: s._id,
    name: s.name,
    address: s.address,
    distance: s.distanceKm ? `${s.distanceKm.toFixed(1)} KM` : '—',
    distanceNum: s.distanceKm || 999,
    petrolStatus: fuelStatus('petrol') ?? 'NO FUEL',
    dieselStatus: fuelStatus('diesel') ?? 'NO FUEL',
    petrolWait: (() => { const q = findQueue('petrol'); return q?.fuelAvailable && !q?.isPaused ? q.estimatedWaitMinutes : null; })(),
    dieselWait: (() => { const q = findQueue('diesel'); return q?.fuelAvailable && !q?.isPaused ? q.estimatedWaitMinutes : null; })(),
    fuelTypes: s.fuelTypes || [],
  };
}

const UserDashboard = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const { logout } = useAuth();
  const { connected, onQueueUpdate } = useSocket();
  const pollRef = useRef(null);

  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [polling, setPolling] = useState(true);
  const [activeTab, setActiveTab] = useState('allStations');
  const [search, setSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [smartPickId, setSmartPickId] = useState(null);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [infoBanner, setInfoBanner] = useState(null);

  const TABS = [
    { key: 'allStations', label: t.allStations },
    { key: 'petrolOnly', label: t.petrolOnly },
    { key: 'dieselOnly', label: t.dieselOnly },
    { key: 'hours24', label: t.hours24 },
  ];

  const fetchStations = useCallback(async () => {
    try {
      const data = await api.listStations();
      setStations(data.map(stationToCard));
      setLastUpdated(new Date());
    } catch {
      // keep previous data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStations(); }, [fetchStations]);

  // WebSocket: refresh when any station queue updates
  useEffect(() => {
    const unsub = onQueueUpdate(() => fetchStations());
    return unsub;
  }, [onQueueUpdate, fetchStations]);

  useEffect(() => {
    if (!polling) return;
    pollRef.current = setInterval(fetchStations, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [polling, fetchStations]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleSmartPick = async () => {
    try {
      const recs = await api.getRecommendations();
      if (!recs.length) return;
      const best = recs[0];
      const card = stationToCard({ ...best.station, distanceKm: best.distanceKm, queues: best.station.queues });
      setSmartPickId(best.station._id);
      setNearMeActive(false);
      setActiveTab('allStations');
      setSearch('');
      setInfoBanner({ title: t.smartPickResult, body: t.smartPickDesc });
      // ensure the best station is in the list
      setStations((prev) => {
        const exists = prev.find((s) => s.id === best.station._id);
        return exists ? prev : [card, ...prev];
      });
    } catch {
      // fallback: pick locally
      const withWait = stations
        .map((s) => ({ ...s, minWait: [s.petrolWait, s.dieselWait].filter((w) => w !== null).reduce((a, b) => Math.min(a, b), Infinity) }))
        .filter((s) => s.minWait < Infinity)
        .sort((a, b) => a.minWait - b.minWait);
      if (!withWait.length) return;
      setSmartPickId(withWait[0].id);
      setInfoBanner({ title: t.smartPickResult, body: t.smartPickDesc });
    }
  };

  const handleNearMe = () => {
    setNearMeActive((v) => !v);
    setSmartPickId(null);
    setInfoBanner(nearMeActive ? null : { title: t.nearMeResult, body: t.nearMeDesc });
  };

  let displayed = [...stations];
  if (smartPickId) {
    displayed = [...displayed.filter((s) => s.id === smartPickId), ...displayed.filter((s) => s.id !== smartPickId)];
  }
  if (nearMeActive) displayed = [...displayed].sort((a, b) => a.distanceNum - b.distanceNum);
  displayed = displayed.filter((s) => {
    if (activeTab === 'petrolOnly') return s.petrolStatus.includes('AVAILABLE');
    if (activeTab === 'dieselOnly') return s.dieselStatus.includes('AVAILABLE');
    return true;
  });
  displayed = displayed.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.address.toLowerCase().includes(search.toLowerCase())
  );

  const unreadCount = 2;

  return (
    <div className="min-h-screen bg-[#edf3f2] flex">
      <aside className="hidden md:flex w-60 bg-white border-r border-slate-200 flex-col">
        <div className="px-6 py-5 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-teal-600">{t.appName}</h1>
        </div>
        <nav className="px-3 py-4 space-y-1 flex-1">
          <NavItem label={t.dashboard} icon={<LayoutDashboard size={16} />} to="/user/dashboard" active />
          <NavItem label={t.stations} icon={<Fuel size={16} />} to="/user/dashboard" />
          <NavItem label={t.myQueue} icon={<Users size={16} />} to="/my-queue" />
          <NavItem label={t.driverHome} icon={<LocateFixed size={16} />} to="/driver" />
          <NavItem label="Map View" icon={<Map size={16} />} to="/map" />
          <NavItem label="Reservations" icon={<Calendar size={16} />} to="/reservations" />
          <NavItem label={t.profile} icon={<User size={16} />} to="/profile" />
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 font-semibold hover:bg-red-50 rounded-xl transition text-sm">
            <LogOut size={16} /> {t.logout}
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPolling((v) => !v)}
              className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border transition ${polling ? 'text-teal-600 border-teal-200 bg-teal-50' : 'text-slate-400 border-slate-200 bg-slate-50'}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${polling ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'}`} />
              {t.pollingLive}
            </button>
            <button onClick={fetchStations} className="text-slate-400 hover:text-teal-600 transition"><RefreshCw size={14} /></button>
            <span className="text-[10px] text-slate-300 hidden sm:block">{lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => { setShowNotifications(true); setShowSettings(false); }} className="relative text-slate-500 hover:text-teal-600 transition" aria-label={t.notifications}>
              <Bell size={18} />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
            </button>
            <button onClick={() => { setShowSettings(true); setShowNotifications(false); }} className="text-slate-500 hover:text-teal-600 transition" aria-label={t.settings}><Settings size={18} /></button>
            <button onClick={() => setShowAI(true)} className="text-slate-500 hover:text-violet-600 transition" aria-label="AI Insights" title="AI Insights">
              <Brain size={18} />
            </button>
            <Link to="/profile" className="text-teal-600" aria-label={t.profile}><CircleUserRound size={20} /></Link>
            <button onClick={handleLogout} className="text-red-400 hover:text-red-600 transition md:hidden" aria-label={t.logout}><LogOut size={18} /></button>
          </div>
        </header>

        <div className="p-5 md:p-6">
          {infoBanner && (
            <div className="mb-4 bg-teal-50 border border-teal-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-teal-800">{infoBanner.title}</p>
                <p className="text-xs text-teal-600">{infoBanner.body}</p>
              </div>
              <button onClick={() => { setInfoBanner(null); setSmartPickId(null); setNearMeActive(false); }} className="text-teal-400 hover:text-teal-600 ml-4"><X size={16} /></button>
            </div>
          )}

          <div className="bg-white/35 border border-slate-200 rounded-xl p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder={t.searchPlaceholder} value={search}
                  onChange={(e) => { setSearch(e.target.value); setSmartPickId(null); }}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/20" />
              </div>
              <div className="flex gap-2">
                <button onClick={handleNearMe} className={`px-4 py-2.5 text-sm rounded-lg border font-semibold flex items-center gap-2 transition ${nearMeActive ? 'bg-teal-50 border-teal-400 text-teal-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                  <LocateFixed size={16} className="text-teal-600" /> {t.nearMe}
                </button>
                <button onClick={handleSmartPick} className="px-4 py-2.5 text-sm rounded-lg bg-[#14b8a6] text-white font-semibold hover:bg-teal-600 transition flex items-center gap-2">
                  <Zap size={15} fill="currentColor" /> {t.smartPick}
                </button>
              </div>
            </div>

            <div className="mt-4 border-b border-slate-200">
              <div className="flex flex-wrap gap-6 text-sm">
                {TABS.map((tab) => (
                  <TabButton key={tab.key} label={tab.label} active={activeTab === tab.key}
                    onClick={() => { setActiveTab(tab.key); setSmartPickId(null); }} />
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {loading ? (
                <p className="col-span-3 text-center text-slate-400 py-10 text-sm">Loading stations…</p>
              ) : displayed.length > 0 ? (
                displayed.map((station) => (
                  <div key={station.id} className="relative">
                    {smartPickId === station.id && (
                      <div className="absolute -top-2 left-3 z-10 bg-teal-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                        <Zap size={9} fill="currentColor" /> {t.smartPickResult}
                      </div>
                    )}
                    <StationCard name={station.name} address={station.address} distance={station.distance}
                      petrolStatus={station.petrolStatus} dieselStatus={station.dieselStatus}
                      onViewStation={() => navigate(`/driver/station/${station.id}`)} />
                  </div>
                ))
              ) : (
                <p className="col-span-3 text-center text-slate-400 py-10 text-sm">{t.noStations}</p>
              )}
            </div>
          </div>

          <div className="fixed bottom-5 right-5">
            <button
              onClick={() => navigate('/map')}
              className="w-12 h-12 bg-[#14b8a6] rounded-full text-white shadow-lg flex items-center justify-center hover:bg-teal-600 transition" aria-label="Map view">
              <Map size={20} />
            </button>
          </div>
        </div>
      </main>

      {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showAI && <AIInsightsPanel onClose={() => setShowAI(false)} />}
    </div>
  );
};

const NavItem = ({ to, label, icon, active }) => (
  <Link to={to} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${active ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-600' : 'text-slate-600 hover:bg-slate-100'}`}>
    {icon}<span>{label}</span>
  </Link>
);

const TabButton = ({ label, active, onClick }) => (
  <button onClick={onClick} className={`pb-3 text-sm font-semibold border-b-2 transition ${active ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
    {label}
  </button>
);

export default UserDashboard;
