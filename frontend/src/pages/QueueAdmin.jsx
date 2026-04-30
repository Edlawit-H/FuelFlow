import { useState, useEffect, useRef, useCallback } from 'react';
import { UserX, CheckCircle2, PauseCircle, PlayCircle, Plus, LogOut, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const POLL_INTERVAL = 8000;

const QueueAdmin = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const { user, logout } = useAuth();

  const pollRef = useRef(null);
  const [station, setStation] = useState(null);
  const [fuelType, setFuelType] = useState('petrol');
  const [queue, setQueue] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [polling, setPolling] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState('');

  // Load station
  useEffect(() => {
    api.listStations()
      .then((stations) => {
        const mine = stations.find((s) =>
          s.adminId === user?.id || s.adminId?.toString() === user?.id
        ) || stations[0];
        if (mine) {
          setStation(mine);
          setFuelType(mine.fuelTypes?.[0] || 'petrol');
        }
      })
      .catch(() => {});
  }, [user]);

  const fetchQueue = useCallback(async () => {
    if (!station?._id) return;
    try {
      const data = await api.getQueueList(station._id, fuelType);
      setQueue(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      // 404 just means no entries yet — not a real error
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setQueue([]);
        setError('');
      } else {
        setError(err.message);
      }
    }
  }, [station, fuelType]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  useEffect(() => {
    if (!polling) return;
    pollRef.current = setInterval(fetchQueue, POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [polling, fetchQueue]);

  const handleServeNow = async (entryId) => {
    try {
      await api.serveUser(station._id, fuelType, entryId);
      fetchQueue();
    } catch (err) { setError(err.message); }
  };

  const handleNoShow = async (entryId) => {
    try {
      await api.removeNoShow(station._id, fuelType, entryId);
      fetchQueue();
    } catch (err) { setError(err.message); }
  };

  const handleTogglePause = async () => {
    try {
      if (isPaused) await api.resumeQueue(station._id, fuelType);
      else await api.pauseQueue(station._id, fuelType);
      setIsPaused((v) => !v);
      fetchQueue();
    } catch (err) { setError(err.message); }
  };

  // Manual entry: navigate to station detail or show a prompt
  const handleManualEntry = () => {
    const pin = prompt('Enter driver PIN code for manual entry:');
    if (pin) alert(`Manual entry for PIN ${pin.toUpperCase()} noted. In production this would call the backend.`);
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">{t.queueAdmin} — {station?.name || '…'}</h1>
          <div className="flex items-center gap-3 mt-2">
            {/* Fuel type selector */}
            {station?.fuelTypes?.map((ft) => (
              <button key={ft} onClick={() => setFuelType(ft)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition capitalize ${fuelType === ft ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-slate-600 border-slate-200 hover:border-teal-400'}`}>
                {ft}
              </button>
            ))}
            <button onClick={() => setPolling((v) => !v)}
              className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border transition ${polling ? 'text-teal-600 border-teal-200 bg-teal-50' : 'text-slate-400 border-slate-200'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${polling ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'}`} />
              {t.pollingLive}
            </button>
            <button onClick={fetchQueue} className="text-slate-300 hover:text-teal-500 transition"><RefreshCw size={13} /></button>
            <span className="text-[10px] text-slate-400">{lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleTogglePause}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition ${isPaused ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
            {isPaused ? <PlayCircle size={16} /> : <PauseCircle size={16} />}
            {isPaused ? 'Resume Queue' : 'Pause Queue'}
          </button>
          <button onClick={handleManualEntry}
            className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-teal-800 transition">
            <Plus size={16} /> Manual Entry
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border border-red-100 text-red-400 hover:bg-red-50 transition">
            <LogOut size={16} /> {t.logout}
          </button>
        </div>
      </div>

      {isPaused && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800 text-sm font-semibold flex items-center gap-2">
          <PauseCircle size={16} /> Queue is currently paused. No new entries are being served.
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-100 rounded-xl p-3 text-red-600 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-400">
            <tr>
              <th className="p-5">Position</th>
              <th className="p-5">PIN Code</th>
              <th className="p-5">Wait Time</th>
              <th className="p-5">Elapsed</th>
              <th className="p-5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {queue.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-400 text-sm">Queue is empty.</td></tr>
            ) : (
              queue.map((entry) => (
                <tr key={entry._id} className="hover:bg-slate-50">
                  <td className="p-5 font-bold">#{entry.position}</td>
                  <td className="p-5 font-mono">{entry.pinCode || '—'}</td>
                  <td className="p-5">
                    <span className={entry.estimatedWaitMinutes <= 5 ? 'text-orange-600 font-bold' : ''}>
                      {entry.estimatedWaitMinutes ?? 0} mins
                    </span>
                  </td>
                  <td className="p-5 text-slate-500">{entry.elapsedMinutes ?? 0} min</td>
                  <td className="p-5 flex gap-2">
                    <button onClick={() => handleServeNow(entry._id)} disabled={isPaused}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition ${isPaused ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-teal-700 text-white hover:bg-teal-800'}`}>
                      <CheckCircle2 size={14} /> SERVE NOW
                    </button>
                    <button onClick={() => handleNoShow(entry._id)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition">
                      <UserX size={14} /> NO-SHOW
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QueueAdmin;
