import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function DriverStation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLang();
  const { user } = useAuth();

  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(null);
  const [joinError, setJoinError] = useState('');
  const [activeQueue, setActiveQueue] = useState(null);

  useEffect(() => {
    Promise.all([
      api.getStation(id),
      api.getMyStatus(),
    ]).then(([stationData, statusData]) => {
      setStation(stationData);
      setActiveQueue(statusData.active ? statusData : null);
    }).catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleJoin = async (fuelType) => {
    setJoinError('');
    setJoining(fuelType);
    try {
      await api.joinQueue(id, fuelType);
      navigate('/my-queue');
    } catch (err) {
      setJoinError(err.message);
    } finally {
      setJoining(null);
    }
  };

  const getButtonState = (q) => {
    if (activeQueue) return { disabled: true, label: 'Already in a queue' };
    if (!q.fuelAvailable) return { disabled: true, label: 'No Fuel' };
    if (q.isPaused) return { disabled: true, label: 'Queue Paused' };
    return { disabled: false, label: 'Join Queue' };
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <Link to="/driver" className="text-teal-600 font-bold hover:underline">← Back to Stations</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        <Link to="/driver" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 font-semibold mb-6 transition">
          <ArrowLeft size={18} /> Back to Stations
        </Link>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{station?.name}</h1>
          <p className="text-slate-400 flex items-center gap-1.5 mt-1 text-sm">
            <MapPin size={14} /> {station?.address}
          </p>
        </div>

        {joinError && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 text-red-600 text-sm font-medium">
            {joinError}
          </div>
        )}

        {activeQueue && (
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <p className="text-teal-800 text-sm font-semibold">
              You are already in a queue at {activeQueue.entry?.stationName}
            </p>
            <Link to="/my-queue" className="text-teal-600 font-bold text-sm hover:underline">View →</Link>
          </div>
        )}

        <div className="space-y-4">
          {station?.queues?.map(q => {
            const btn = getButtonState(q);
            return (
              <div key={q.fuelType} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-800 capitalize">{q.fuelType}</h2>
                  {!q.fuelAvailable ? (
                    <span className="text-red-500 font-bold text-xs bg-red-50 px-3 py-1 rounded-full">No Fuel</span>
                  ) : q.isPaused ? (
                    <span className="text-yellow-600 font-bold text-xs bg-yellow-50 px-3 py-1 rounded-full">Paused</span>
                  ) : (
                    <span className="text-teal-600 font-bold text-xs bg-teal-50 px-3 py-1 rounded-full">Available</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Queue Length</p>
                    <p className="text-xl font-bold text-slate-800">{q.queueLength} <span className="text-sm font-normal text-slate-400">people</span></p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Est. Wait</p>
                    <p className="text-xl font-bold text-slate-800">~{q.estimatedWaitMinutes} <span className="text-sm font-normal text-slate-400">min</span></p>
                  </div>
                </div>
                <button
                  onClick={() => !btn.disabled && handleJoin(q.fuelType)}
                  disabled={btn.disabled || joining === q.fuelType}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition ${
                    btn.disabled
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  }`}
                >
                  {joining === q.fuelType ? 'Joining…' : btn.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
