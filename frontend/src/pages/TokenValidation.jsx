import { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, RotateCcw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TokenValidation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [stationId, setStationId] = useState('');
  const [result, setResult] = useState(null); // null | { valid, data, error }
  const [loading, setLoading] = useState(false);

  // Auto-load admin's station
  useEffect(() => {
    api.listStations()
      .then((stations) => {
        const mine = stations.find((s) => s.adminId === user?.id) || stations[0];
        if (mine) setStationId(mine._id);
      })
      .catch(() => {});
  }, [user]);

  const handleValidate = async (e) => {
    e.preventDefault();
    if (!token.trim() || !stationId) return;
    setLoading(true);
    try {
      const data = await api.validateToken(token.trim().toUpperCase(), stationId);
      setResult({ valid: true, data });
    } catch (err) {
      setResult({ valid: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setToken(''); setResult(null); };

  return (
    <div className="p-8 max-w-xl">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-slate-500"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="p-2 bg-teal-50 rounded-xl text-teal-600"><ShieldCheck size={24} /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Token Validation</h1>
          <p className="text-sm text-slate-500">Verify a driver's queue token before serving</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        <form onSubmit={handleValidate} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Enter Token / PIN Code
            </label>
            <input
              type="text"
              placeholder="e.g. A3F9B2"
              value={token}
              onChange={(e) => { setToken(e.target.value); setResult(null); }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm font-mono uppercase"
            />
          </div>
          <button type="submit" disabled={loading || !stationId}
            className="w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition">
            {loading ? 'Validating…' : 'Validate Token'}
          </button>
        </form>

        {result?.valid && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex items-start gap-4">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600 shrink-0"><CheckCircle2 size={22} /></div>
            <div>
              <p className="font-bold text-emerald-800">Token Valid</p>
              <p className="text-sm text-emerald-700 mt-0.5">
                PIN <span className="font-mono font-bold">{token.toUpperCase()}</span> verified.
                Position #{result.data.position} — {result.data.fuelType}.
              </p>
            </div>
          </div>
        )}

        {result && !result.valid && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-5 flex items-start gap-4">
            <div className="bg-red-100 p-2 rounded-lg text-red-600 shrink-0"><AlertTriangle size={22} /></div>
            <div>
              <p className="font-bold text-red-800">Validation Failed</p>
              <p className="text-sm text-red-700 mt-0.5">{result.error}</p>
            </div>
          </div>
        )}

        {result && (
          <button type="button" onClick={handleReset}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 font-semibold transition">
            <RotateCcw size={14} /> Validate another token
          </button>
        )}
      </div>
    </div>
  );
};

export default TokenValidation;
