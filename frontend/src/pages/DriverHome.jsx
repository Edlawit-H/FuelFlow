import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Navigation, LayoutDashboard,
  Fuel, Users, User, Bell, Settings, Zap, Map, X, LogOut, RefreshCw,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StationCard from '../components/StationCard';
import NotificationsPanel from '../components/NotificationsPanel';
import SettingsPanel from '../components/SettingsPanel';
import { useLang } from '../context/LanguageContext';

const STATION_POOL = [
  { name: 'Central Plaza Station', address: '122 Main St, Downtown', distance: '0.8 KM', distanceNum: 0.8, petrolWait: 4, dieselWait: null, id: 'central-plaza' },
  { name: 'Northside Hub', address: '85 Expressway Ave', distance: '2.4 KM', distanceNum: 2.4, petrolWait: null, dieselWait: 0, id: 'northside-hub' },
  { name: 'Metro Gas & Oil', address: 'Circular Road, Sector 4', distance: '3.1 KM', distanceNum: 3.1, petrolWait: 12, dieselWait: 8, id: 'metro-gas' },
];

function buildStations(pool) {
  return pool.map((s) => ({
    ...s,
    petrolStatus: s.petrolWait === null ? (Math.random() > 0.7 ? 'NO FUEL' : 'PAUSED') : `AVAILABLE (${s.petrolWait} MIN)`,
    dieselStatus: s.dieselWait === null ? (Math.random() > 0.7 ? 'NO FUEL' : 'PAUSED') : `AVAILABLE (${s.dieselWait} MIN)`,
  }));
}

const POLL_INTERVAL = 15000;

const DriverHome = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const pollRef = useRef(null);
  const [stations, setStations] = useState(() => buildStations(STATION_POOL));
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [polling, setPolling] = useState(true);

  const [activeTab, setActiveTab] = useState('allStations');
  const [search, setSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [smartPickId, setSmartPickId] = useState(null);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [infoBanner, setInfoBanner] = useState(null);

  const TABS = [
    { key: 'allStations', label: t.allStations },
    { key: 'petrolOnly', label: t.petrolOnly },
    { key: 'dieselOnly', label: t.dieselOnly },
    { key: 'hours24', label: t.hours24 },
  ];

  useEffect(() => {
    if (!polling) return;
    pollRef.current = setInterval(() => {
      setStations(buildStations(STATION_POOL));
      setLastUpdated(new Date());
    }, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [polling]);

  const handleManualRefresh = () => {
    setStations(buildStations(STATION_POOL));
    setLastUpdated(new Date());
  };

  const handleLogout = () => navigate('/login');

  const handleSmartPick = () => {
    const withWait = stations
      .map((s) => {
        const waits = [s.petrolWait, s.dieselWait].filter((w) => w !== null);
        return { ...s, minWait: waits.length ? Math.min(...waits) : Infinity };
      })
      .filter((s) => s.minWait < Infinity)
      .sort((a, b) => a.minWait - b.minWait);

    if (!withWait.length) return;
    const best = withWait[0];
    setSmartPickId(best.id);
    setNearMeActive(false);
    setActiveTab('allStations');
    setSearch('');
    setInfoBanner({ title: t.smartPickResult, body: t.smartPickDesc });
  };

  const handleNearMe = () => {
    setNearMeActive((v) => !v);
    setSmartPickId(null);
    setInfoBanner(nearMeActive ? null : { title: t.nearMeResult, body: t.nearMeDesc });
  };

  let displayed = [...stations];

  if (smartPickId) {
    displayed = [
      ...displayed.filter((s) => s.id === smartPickId),
      ...displayed.filter((s) => s.id !== smartPickId),
    ];
  }

  if (nearMeActive) {
    displayed = [...displayed].sort((a, b) => a.distanceNum - b.distanceNum);
  }

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
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-extrabold text-teal-700 tracking-tight">{t.appName}</h1>
          <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1">QUEUE MANAGEMENT</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <SidebarLink icon={<LayoutDashboard size={20} />} label={t.dashboard} to="/user/dashboard" />
          <SidebarLink icon={<Fuel size={20} />} label={t.stations} to="/user/dashboard" />
          <SidebarLink icon={<Users size={20} />} label={t.queueAdmin} to="/admin/manage-queue" />
          <SidebarLink icon={<Navigation size={20} />} label={t.driverHome} to="/driver" active />
          <SidebarLink icon={<User size={20} />} label={t.profile} to="/profile" />
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 font-semibold hover:bg-red-50 rounded-xl transition text-sm"
          >
            <LogOut size={18} /> {t.logout}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          {/* Polling indicator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPolling((v) => !v)}
              className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border transition ${
                polling ? 'text-teal-600 border-teal-200 bg-teal-50' : 'text-slate-400 border-slate-200 bg-slate-50'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${polling ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'}`} />
              {t.pollingLive}
            </button>
            <button onClick={handleManualRefresh} className="text-slate-400 hover:text-teal-600 transition">
              <RefreshCw size={14} />
            </button>
            <span className="text-[10px] text-slate-300 hidden sm:block">
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex items-center space-x-5">
            <button
              onClick={() => { setShowNotifications(true); setShowSettings(false); }}
              className="relative text-slate-400 hover:text-teal-600 transition"
              aria-label={t.notifications}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setShowSettings(true); setShowNotifications(false); }}
              className="text-slate-400 hover:text-teal-600 transition"
              aria-label={t.settings}
            >
              <Settings size={20} />
            </button>
            <Link to="/profile">
              <div className="w-9 h-9 bg-teal-600 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white">
                <User size={18} />
              </div>
            </Link>
            <button onClick={handleLogout} className="text-red-400 hover:text-red-600 transition lg:hidden" aria-label={t.logout}>
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-6">
          {/* Info Banner */}
          {infoBanner && (
            <div className="bg-teal-50 border border-teal-100 rounded-2xl px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-teal-800">{infoBanner.title}</p>
                <p className="text-xs text-teal-600">{infoBanner.body}</p>
              </div>
              <button onClick={() => { setInfoBanner(null); setSmartPickId(null); setNearMeActive(false); }} className="text-teal-400 hover:text-teal-600 ml-4">
                <X size={16} />
              </button>
            </div>
          )}

          {/* Search Row */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSmartPickId(null); }}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all shadow-sm"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleNearMe}
                className={`flex items-center justify-center space-x-2 px-6 py-3.5 rounded-2xl font-bold shadow-sm transition-all border ${
                  nearMeActive
                    ? 'bg-teal-50 border-teal-400 text-teal-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Navigation size={18} className="text-teal-500" />
                <span>{t.nearMe}</span>
              </button>
              <button
                onClick={handleSmartPick}
                className="flex items-center justify-center space-x-2 px-8 py-3.5 bg-teal-500 text-white rounded-2xl font-black shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all active:scale-95"
              >
                <Zap size={18} fill="currentColor" />
                <span>{t.smartPick}</span>
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-8 border-b border-slate-200 text-sm font-bold text-slate-400">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setSmartPickId(null); }}
                className={`pb-4 transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? 'text-teal-600 border-teal-600'
                    : 'border-transparent hover:text-slate-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Station Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayed.length > 0 ? (
              displayed.map((station) => (
                <div key={station.id} className="relative">
                  {smartPickId === station.id && (
                    <div className="absolute -top-2 left-3 z-10 bg-teal-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                      <Zap size={9} fill="currentColor" /> {t.smartPickResult}
                    </div>
                  )}
                  <StationCard
                    name={station.name}
                    address={station.address}
                    distance={station.distance}
                    petrolStatus={station.petrolStatus}
                    dieselStatus={station.dieselStatus}
                    onViewStation={() => navigate(`/driver/station/${station.id}`)}
                  />
                </div>
              ))
            ) : (
              <p className="col-span-3 text-center text-slate-400 py-10 text-sm">{t.noStations}</p>
            )}
          </div>
        </div>

        {/* Floating Map Button */}
        <button className="fixed bottom-8 right-8 w-16 h-16 bg-teal-500 text-white rounded-2xl shadow-2xl shadow-teal-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
          <Map size={28} />
        </button>
      </main>

      {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
};

const SidebarLink = ({ icon, label, active = false, to }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${
      active ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-700 font-bold' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
    }`}
  >
    {icon}
    <span className="text-sm tracking-tight">{label}</span>
  </Link>
);

export default DriverHome;
