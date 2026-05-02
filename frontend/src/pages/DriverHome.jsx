import { useState, useEffect, useRef } from 'react';
import { Search, Navigation, LayoutDashboard, Fuel, Users, User, Bell, Settings, Zap, LogOut, RefreshCw, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import NotificationsPanel from '../components/NotificationsPanel';
import SettingsPanel from '../components/SettingsPanel';

const POLL_INTERVAL = 30000;

export default function DriverHome() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { user, logout } = useAuth();

  const pollRef = useRef(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [fuelFilter, setFuelFilter] = useState('all');
  const [smartPickId, setSmartPickId] = useState(null);
  const [infoBanner, setInfoBanner] = useState(null);
  const [polling, setPolling] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [coords, setCoords] = useState(null);
  const [gpsError, setGpsError] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeQueue, setActiveQueue] = useState(null);

  const fetchStations = async (lat, lng) => {
    try {
      const params = {};
      if (lat && lng) { params.lat = lat; params.lng = lng; }
      const data = await api.listStations(params);
      setStations(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyStatus = async () => {
    try {
      const status = await api.getMyStatus();
      setActiveQueue(status.active ? status : null);
    } catch { setActiveQueue(null); }
  };

  useEffect(() => {
    fetchMyStatus();
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setCoords({ lat, lng });
        fetchStations(lat, lng);
      },
      () => {
        setGpsError(true);
        fetchStations();
      }
    );
  }, []);

  useEffect(() => {
    if (!polling) return;
    pollRef.current = setInterval(() => fetchStations(coords?.lat, coords?.lng), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [polling, coords]);

  const handleSmartPick = async () => {
    try {
      const params = {};
      if (coords) { params.lat = coords.lat; params.lng = coords.lng; }
      if (fuelFilter !== 'all') params.fuelType = fuelFilter;
      const results = await api.getRecommendations(params);
      if (results.length > 0) {
        const best = results[0];
        setSmartPickId(best.station._id);
        setInfoBanner({ title: t.smartPickResult, body: t.smartPickDesc });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNearMe = () => {
    if (!coords) {
      navigator.geolocation?.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setCoords({ lat, lng });
          fetchStations(lat, lng);
        },
        () => setGpsError(true)
      );
    } else {
      fetchStations(coords.lat, coords.lng);
    }
  };

  let displayed = [...stations];

  if (fuelFilter !== 'all') {
    displayed = displayed.filter(s =>
      s.queues?.some(q => q.fuelType === fuelFilter && q.fuelAvailable)
    );
  }

  if (search) {
    displayed = displayed.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase())
    );
  }

  if (smartPickId) {
    displayed = [
      ...displayed.filter(s => s._id === smartPickId),
      ...displayed.filter(s => s._id !== smartPickId),
    ];
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-extrabold text-teal-700 tracking-tight">{t.appName}</h1>
          <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1">QUEUE MANAGEMENT</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <SidebarLink icon={<LayoutDashboard size={20} />} label={t.dashboard} to="/user/dashboard" />
          <SidebarLink icon={<Fuel size={20} />} label={t.stations} to="/driver" active />
          <SidebarLink icon={<Users size={20} />} label={t.myQueue} to="/my-queue" />
          <SidebarLink icon={<User size={20} />} label={t.profile} to="/profile" />
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => { logout(); navigate('/login'); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 font-semibold hover:bg-red-50 rounded-xl transition text-sm">
            <LogOut size={18} /> {t.logout}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <button onClick={() => setPolling(v => !v)}
              className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border transition ${polling ? 'text-teal-600 border-teal-200 bg-teal-50' : 'text-slate-400 border-slate-200'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${polling ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'}`} />
              {t.pollingLive}
            </button>
            <button onClick={() => fetchStations(coords?.lat, coords?.lng)} className="text-slate-400 hover:text-teal-600 transition">
              <RefreshCw size={14} />
            </button>
            <span className="text-[10px] text-slate-300 hidden sm:block">
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => { setShowNotifications(true); setShowSettings(false); }} className="relative text-slate-400 hover:text-teal-600 transition">
              <Bell size={20} />
            </button>
            <button onClick={() => { setShowSettings(true); setShowNotifications(false); }} className="text-slate-400 hover:text-teal-600 transition">
              <Settings size={20} />
            </button>
            <Link to="/profile">
              <div className="w-9 h-9 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {user?.phone?.[0] || 'U'}
              </div>
            </Link>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-6">
          {activeQueue && (
            <div className="bg-teal-50 border border-teal-200 rounded-2xl px-5 py-3 flex items-center justify-between">
              <p className="text-sm font-bold text-teal-800">
                You are in queue at {activeQueue.entry?.stationName} — {activeQueue.entry?.fuelType} (Position #{activeQueue.entry?.position})
              </p>
              <Link to="/my-queue" className="text-teal-600 font-bold text-sm hover:underline">View →</Link>
            </div>
          )}

          {gpsError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-3 text-yellow-800 text-sm">
              Location unavailable — showing all stations sorted by name.
            </div>
          )}

          {infoBanner && (
            <div className="bg-teal-50 border border-teal-100 rounded-2xl px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-teal-800">{infoBanner.title}</p>
                <p className="text-xs text-teal-600">{infoBanner.body}</p>
              </div>
              <button onClick={() => { setInfoBanner(null); setSmartPickId(null); }} className="text-teal-400 hover:text-teal-600 ml-4">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input type="text" placeholder={t.searchPlaceholder} value={search}
                onChange={e => { setSearch(e.target.value); setSmartPickId(null); }}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition shadow-sm" />
            </div>
            <div className="flex gap-3">
              <button onClick={handleNearMe}
                className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition">
                <Navigation size={18} className="text-teal-500" /> {t.nearMe}
              </button>
              <button onClick={handleSmartPick}
                className="flex items-center gap-2 px-8 py-3.5 bg-teal-500 text-white rounded-2xl font-black shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition">
                <Zap size={18} fill="currentColor" /> {t.smartPick}
              </button>
            </div>
          </div>

          <div className="flex space-x-6 border-b border-slate-200 text-sm font-bold text-slate-400">
            {['all', 'petrol', 'diesel'].map(f => (
              <button key={f} onClick={() => setFuelFilter(f)}
                className={`pb-4 transition-colors border-b-2 capitalize ${fuelFilter === f ? 'text-teal-600 border-teal-600' : 'border-transparent hover:text-slate-600'}`}>
                {f === 'all' ? t.allStations : f === 'petrol' ? t.petrolOnly : t.dieselOnly}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 mb-4">{error}</p>
              <button onClick={() => fetchStations(coords?.lat, coords?.lng)} className="text-teal-600 font-bold hover:underline">Retry</button>
            </div>
          ) : displayed.length === 0 ? (
            <p className="text-center text-slate-400 py-20 text-sm">{t.noStations}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayed.map(station => (
                <div key={station._id} className="relative">
                  {smartPickId === station._id && (
                    <div className="absolute -top-2 left-3 z-10 bg-teal-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1">
                      <Zap size={9} fill="currentColor" /> {t.smartPickResult}
                    </div>
                  )}
                  <StationCard station={station} onView={() => navigate(`/driver/station/${station._id}`)} t={t} />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showNotifications && <NotificationsPanel onClose={() => setShowNotifications(false)} />}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}

function StationCard({ station, onView, t }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition">
      <div className="mb-4">
        <h3 className="font-bold text-slate-800 text-base">{station.name}</h3>
        <p className="text-slate-400 text-sm mt-0.5">{station.address}</p>
      </div>
      <div className="space-y-2 mb-5">
        {station.queues?.map(q => (
          <div key={q.fuelType} className="flex items-center justify-between text-sm">
            <span className="font-semibold capitalize text-slate-600">{q.fuelType}</span>
            {!q.fuelAvailable ? (
              <span className="text-red-500 font-bold text-xs bg-red-50 px-2 py-0.5 rounded-full">No Fuel</span>
            ) : q.isPaused ? (
              <span className="text-yellow-600 font-bold text-xs bg-yellow-50 px-2 py-0.5 rounded-full">Paused</span>
            ) : (
              <span className="text-teal-600 font-bold text-xs bg-teal-50 px-2 py-0.5 rounded-full">
                {q.queueLength} in queue · ~{q.estimatedWaitMinutes}min
              </span>
            )}
          </div>
        ))}
      </div>
      <button onClick={onView}
        className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition">
        {t.viewStation}
      </button>
    </div>
  );
}

function SidebarLink({ icon, label, active = false, to }) {
  return (
    <Link to={to} className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all ${active ? 'bg-teal-50 text-teal-700 font-bold' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}>
      {icon}<span className="text-sm">{label}</span>
    </Link>
  );
}
