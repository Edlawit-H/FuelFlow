import { useState, useEffect } from 'react';
import { MapPin, Coffee, Wifi, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DriverStation = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  // Admins cannot join queues
  if (user?.role === 'station_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-sm text-center space-y-4">
          <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={28} className="text-orange-500" />
          </div>
          <h2 className="font-bold text-slate-800 text-lg">Admin accounts can't join queues</h2>
          <p className="text-slate-500 text-sm">Log in with a driver account to join a fuel queue.</p>
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/login" className="block w-full bg-teal-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-teal-700 transition">
              Switch Account
            </Link>
            <Link to="/admin/dashboard" className="block w-full border border-slate-200 text-slate-600 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition">
              Back to Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const [station, setStation] = useState(null);
  const [loadingStation, setLoadingStation] = useState(true);
  const [selectedFuel, setSelectedFuel] = useState(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.getStation(id)
      .then(setStation)
      .catch(() => setError('Could not load station details.'))
      .finally(() => setLoadingStation(false));
  }, [id]);

  const handleJoin = async () => {
    if (!selectedFuel || !station) return;
    setJoining(true);
    setError('');
    try {
      await api.joinQueue(station._id, selectedFuel);
      // Navigate to MyQueue — it will poll getMyStatus and show the PIN
      navigate('/my-queue');
    } catch (err) {
      setError(err.message || 'Failed to join queue');
      setJoining(false);
    }
  };

  if (loadingStation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-teal-500" />
      </div>
    );
  }

  // Build fuel options from real station data
  const fuelOptions = (station?.fuelTypes || []).map((ft) => {
    const queueInfo = station?.queues?.find((q) => q.fuelType === ft);
    const available = queueInfo ? (queueInfo.fuelAvailable && !queueInfo.isPaused) : true;
    const wait = queueInfo?.estimatedWaitMinutes;
    return { id: ft, label: ft.charAt(0).toUpperCase() + ft.slice(1), available, wait };
  });

  return (
    <div className="min-h-screen bg-white md:bg-slate-50 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-lg flex flex-col">
        {/* Header */}
        <div className="relative h-48 bg-gradient-to-br from-teal-600 to-teal-800">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div className="absolute bottom-4 left-4 text-white drop-shadow-md">
            <h1 className="text-xl font-bold">{station?.name || 'Station'}</h1>
            <p className="text-sm flex items-center gap-1 opacity-90">
              <MapPin size={14} /> {station?.address || '—'}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-8 flex-1">
          {/* Fuel Type Selector */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3">Select Fuel Type</h3>
            {fuelOptions.length === 0 ? (
              <p className="text-sm text-slate-400">No fuel types available at this station.</p>
            ) : (
              <div className="flex gap-4 flex-wrap">
                {fuelOptions.map((fuel) => (
                  <button
                    key={fuel.id}
                    type="button"
                    disabled={!fuel.available}
                    onClick={() => fuel.available && setSelectedFuel(fuel.id)}
                    className={`flex-1 min-w-[120px] p-4 rounded-2xl border-2 text-left transition-all ${
                      !fuel.available
                        ? 'opacity-50 cursor-not-allowed border-slate-100 bg-slate-50'
                        : selectedFuel === fuel.id
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-200 bg-white hover:border-teal-300'
                    }`}
                  >
                    <p className={`text-[10px] font-bold uppercase mb-1 ${selectedFuel === fuel.id ? 'text-teal-600' : 'text-slate-400'}`}>
                      {fuel.label}
                    </p>
                    <p className={`font-bold text-sm ${fuel.available ? 'text-slate-800' : 'text-slate-400'}`}>
                      {fuel.available ? 'Available' : 'Unavailable'}
                    </p>
                    {fuel.available && fuel.wait != null && (
                      <p className="text-xs text-slate-500 mt-0.5">~{fuel.wait} min wait</p>
                    )}
                  </button>
                ))}
              </div>
            )}
            {!selectedFuel && fuelOptions.some(f => f.available) && (
              <p className="text-xs text-slate-400 mt-2">Select an available fuel type to continue.</p>
            )}
          </div>

          {/* Amenities */}
          <div>
            <h3 className="font-bold text-slate-800 mb-4">Amenities</h3>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="bg-slate-100 p-3 rounded-full mb-1 text-slate-600"><Coffee size={20} /></div>
                <span className="text-[10px] font-medium text-slate-500">Cafe</span>
              </div>
              <div className="text-center">
                <div className="bg-slate-100 p-3 rounded-full mb-1 text-slate-600"><Wifi size={20} /></div>
                <span className="text-[10px] font-medium text-slate-500">Wi-Fi</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-600 text-sm">{error}</div>
          )}
        </div>

        {/* Join Button */}
        <div className="p-6 border-t">
          <button
            type="button"
            onClick={handleJoin}
            disabled={!selectedFuel || joining}
            className={`w-full py-4 rounded-2xl font-bold text-base shadow-lg transition flex items-center justify-center gap-2 ${
              selectedFuel && !joining
                ? 'bg-[#14b8a6] text-white shadow-teal-500/20 hover:bg-teal-600'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            {joining && <Loader2 size={18} className="animate-spin" />}
            {joining
              ? 'Joining…'
              : selectedFuel
              ? `Join Queue — ${fuelOptions.find(f => f.id === selectedFuel)?.label}`
              : 'Select Fuel Type'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverStation;
