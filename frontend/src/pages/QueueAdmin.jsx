import { useState, useEffect, useRef, useCallback } from 'react';
import { UserX, CheckCircle2, PauseCircle, PlayCircle, Plus, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';
import AdminLayout from '../components/AdminLayout';

const POLL_INTERVAL = 8000;

const QueueAdmin = () => {
  const { t } = useLang();
  const { user } = useAuth();
  const { connected, joinStation, leaveStation, onQueueUpdate } = useSocket();

  const pollRef = useRef(null);
  const [station, setStation] = useState(null);
  const [fuelType, setFuelType] = useState('petrol');
  const [queue, setQueue] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [polling, setPolling] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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

  const fetchQueue = useCallback(async (silent = false) => {
    if (!station?._id) return;
    if (!silent) setRefreshing(true);
    try {
      const data = await api.getQueueList(station._id, fuelType);
      setQueue(Array.isArray(data) ? data : []);
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      if (err.message?.includes('404') || err.message?.includes('not found')) {
        setQueue([]);
        setError('');
      } else {
        setError(err.message);
      }
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, [station, fuelType]);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);

  // WebSocket: join station room + subscribe
  useEffect(() => {
    if (!station?._id) return;
    joinStation(station._id);
    const unsub = onQueueUpdate(() => fetchQueue(true), 'queue-admin');
    return () => {
      leaveStation(station._id);
      unsub();
    };
  }, [station, joinStation, leaveStation, onQueueUpdate, fetchQueue]);

  // Polling fallback
  useEffect(() => {
    if (!polling) return;
    pollRef.current = setInterval(() => fetchQueue(true), POLL_INTERVAL);
    return () => clearInterval(pollRef.current);
  }, [polling, fetchQueue]);

  const handleServeNow = async (entryId) => {
    try {
      await api.serveUser(station._id, fuelType, entryId);
      fetchQueue(true);
    } catch (err) { setError(err.message); }
  };

  const handleNoShow = async (entryId) => {
    try {
      await api.removeNoShow(station._id, fuelType, entryId);
      fetchQueue(true);
    } catch (err) { setError(err.message); }
  };

  const handleTogglePause = async () => {
    try {
      if (isPaused) await api.resumeQueue(station._id, fuelType);
      else await api.pauseQueue(station._id, fuelType);
      setIsPaused((v) => !v);
      fetchQueue(true);
    } catch (err) { setError(err.message); }
  };

  const handleManualEntry = () => {
    const pin = prompt('Enter driver PIN code for manual entry:');
    if (pin) alert(`Manual entry for PIN ${pin.toUpperCase()} noted.`);
  };

  return (
    <AdminLayout title="Queue Admin" backTo="/admin/dashboard" backLabel="Back to Dashboard">
      <div className="p-6 space-y-6">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-100">
              {t.queueAdmin} — <span className="text-teal-400">{station?.name || '…'}</span>
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {/* Fuel type tabs */}
              {station?.fuelTypes?.map((ft) => (
                <button
                  key={ft}
                  onClick={() => setFuelType(ft)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition capitalize ${
                    fuelType === ft
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                      : 'text-slate-500 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {ft}
                  <span className={`ml-1.5 text-[9px] px-1 py-0.5 rounded-full ${fuelType === ft ? 'bg-teal-500/30' : 'bg-slate-700'}`}>
                    {fuelType === ft ? queue.length : '—'}
                  </span>
                </button>
              ))}

              {/* Live indicator */}
              <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full border ${
                connected
                  ? 'text-teal-400 border-teal-700 bg-teal-900/30'
                  : 'text-slate-500 border-slate-700'
              }`}>
                {connected ? <Wifi size={10} /> : <WifiOff size={10} />}
                {connected ? 'Live' : 'Polling'}
                <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-teal-500 animate-pulse' : 'bg-slate-600'}`} />
              </div>

              <button
                onClick={() => fetchQueue()}
                className={`text-slate-500 hover:text-teal-400 transition ${refreshing ? 'animate-spin text-teal-400' : ''}`}
                aria-label="Refresh"
              >
                <RefreshCw size={13} />
              </button>
              <span className="text-[10px] text-slate-600">
                {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleTogglePause}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold border transition ${
                isPaused
                  ? 'bg-emerald-900/30 border-emerald-700 text-emerald-300 hover:bg-emerald-900/50'
                  : 'bg-amber-900/30 border-amber-700 text-amber-300 hover:bg-amber-900/50'
              }`}
            >
              {isPaused ? <PlayCircle size={16} /> : <PauseCircle size={16} />}
              {isPaused ? 'Resume Queue' : 'Pause Queue'}
            </button>
            <button
              onClick={handleManualEntry}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-teal-700 text-white hover:bg-teal-600 transition border border-teal-600"
            >
              <Plus size={16} /> Manual Entry
            </button>
          </div>
        </div>

        {/* Paused banner */}
        {isPaused && (
          <div className="bg-amber-900/20 border border-amber-700 rounded-xl p-4 text-amber-300 text-sm font-semibold flex items-center gap-2">
            <PauseCircle size={16} /> Queue is currently paused. No new entries are being served.
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-xl p-3 text-red-400 text-sm">{error}</div>
        )}

        {/* Queue table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 capitalize">{fuelType} Queue</h2>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-900/30 border border-blue-800 px-2 py-0.5 rounded">
              {queue.length} ACTIVE
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/60 border-b border-slate-700 text-[10px] uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-5 py-3">Position</th>
                  <th className="px-5 py-3">PIN Code</th>
                  <th className="px-5 py-3">Wait Time</th>
                  <th className="px-5 py-3">Elapsed</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {queue.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-600 text-sm">
                      Queue is empty for {fuelType}.
                    </td>
                  </tr>
                ) : (
                  queue.map((entry) => (
                    <tr key={entry._id} className="hover:bg-slate-800/40 transition group">
                      <td className="px-5 py-3 font-black text-slate-300">#{entry.position}</td>
                      <td className="px-5 py-3">
                        <span className="font-mono text-teal-300 text-xs bg-teal-900/30 px-2 py-0.5 rounded">
                          {entry.pinCode || '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={
                          entry.estimatedWaitMinutes >= 20 ? 'text-red-400 font-bold' :
                          entry.estimatedWaitMinutes >= 10 ? 'text-amber-400 font-semibold' :
                          'text-emerald-400'
                        }>
                          {entry.estimatedWaitMinutes ?? 0} min
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{entry.elapsedMinutes ?? 0} min</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleServeNow(entry._id)}
                            disabled={isPaused}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                              isPaused
                                ? 'bg-slate-800 text-slate-600 border-slate-700 cursor-not-allowed'
                                : 'bg-emerald-900/40 text-emerald-300 border-emerald-700 hover:bg-emerald-800/60'
                            }`}
                          >
                            <CheckCircle2 size={13} /> Serve
                          </button>
                          <button
                            onClick={() => handleNoShow(entry._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border bg-red-900/30 text-red-400 border-red-800 hover:bg-red-900/50 transition"
                          >
                            <UserX size={13} /> No-Show
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default QueueAdmin;
