import { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';

const TokenValidation = () => {
  const { user } = useAuth();
  const [token, setToken] = useState('');
  const [stationId, setStationId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.listStations()
      .then((stations) => {
        const mine = stations.find((s) => s.adminId === user?.id || s.adminId?.toString() === user?.id) || stations[0];
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
    <AdminLayout title="Token Validation" backTo="/admin/dashboard" backLabel="Back to Dashboard">
      <div className="p-6 max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-teal-500/20 rounded-xl text-teal-400">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Token Validation</h1>
            <p className="text-sm text-slate-500">Verify a driver's queue PIN before serving</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
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
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition text-sm font-mono uppercase"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !stationId}
              className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition"
            >
              {loading ? 'Validating…' : 'Validate Token'}
            </button>
          </form>

          {result?.valid && (
            <div className="bg-emerald-900/30 border border-emerald-700 rounded-xl p-4 flex items-start gap-3">
              <div className="bg-emerald-800/50 p-2 rounded-lg text-emerald-400 shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="font-bold text-emerald-300">Token Valid</p>
                <p className="text-sm text-emerald-400 mt-0.5">
                  PIN <span className="font-mono font-bold">{token.toUpperCase()}</span> verified.
                  Position #{result.data.position} — {result.data.fuelType}.
                </p>
              </div>
            </div>
          )}

          {result && !result.valid && (
            <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 flex items-start gap-3">
              <div className="bg-red-800/50 p-2 rounded-lg text-red-400 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="font-bold text-red-300">Validation Failed</p>
                <p className="text-sm text-red-400 mt-0.5">{result.error}</p>
              </div>
            </div>
          )}

          {result && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-400 font-semibold transition"
            >
              <RotateCcw size={14} /> Validate another token
            </button>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default TokenValidation;
