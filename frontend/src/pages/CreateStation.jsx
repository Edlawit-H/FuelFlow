import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel, MapPin, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import AdminLayout from '../components/AdminLayout';

const CreateStation = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', address: '', lat: '', lng: '', hasPetrol: true, hasDiesel: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim())    { setError('Station name is required'); return; }
    if (!form.address.trim()) { setError('Address is required'); return; }
    if (!form.lat || !form.lng) { setError('Coordinates are required'); return; }
    if (!form.hasPetrol && !form.hasDiesel) { setError('Select at least one fuel type'); return; }

    const fuelTypes = [];
    if (form.hasPetrol) fuelTypes.push('petrol');
    if (form.hasDiesel) fuelTypes.push('diesel');

    setLoading(true);
    try {
      await api.createStation({
        name: form.name.trim(),
        address: form.address.trim(),
        location: { type: 'Point', coordinates: [parseFloat(form.lng), parseFloat(form.lat)] },
        fuelTypes,
      });
      setSuccess(true);
      setTimeout(() => navigate('/admin/dashboard'), 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Create Station" backTo="/admin/dashboard" backLabel="Back to Dashboard">
      <div className="p-6 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-teal-500/20 rounded-xl text-teal-400">
            <Fuel size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">Create Station</h1>
            <p className="text-sm text-slate-500">Add a new fuel station to the network</p>
          </div>
        </div>

        {success ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-emerald-900/40 rounded-full flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-400" />
            </div>
            <p className="font-bold text-slate-100 text-lg">Station Created!</p>
            <p className="text-sm text-slate-500">Redirecting to dashboard…</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Station Name</label>
                  <div className="relative">
                    <Fuel size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. Central Metro Station"
                      value={form.name}
                      onChange={set('name')}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                    />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Address</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="123 Energy Way, Downtown"
                      value={form.address}
                      onChange={set('address')}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 9.0054"
                    value={form.lat}
                    onChange={set('lat')}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    placeholder="e.g. 38.7636"
                    value={form.lng}
                    onChange={set('lng')}
                    className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fuel Types Available</label>
                <div className="flex gap-3">
                  {[['hasPetrol', 'Petrol'], ['hasDiesel', 'Diesel']].map(([field, label]) => (
                    <label
                      key={field}
                      className={`flex items-center gap-3 flex-1 p-3.5 rounded-xl border-2 cursor-pointer transition ${
                        form[field]
                          ? 'border-teal-500 bg-teal-500/10 text-teal-300'
                          : 'border-slate-700 bg-slate-800 text-slate-400'
                      }`}
                    >
                      <input type="checkbox" checked={form[field]} onChange={set(field)} className="accent-teal-500" />
                      <span className="font-semibold text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-900/30 border border-red-700 rounded-xl p-3 flex items-center gap-3">
                  <AlertTriangle size={16} className="text-red-400 shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/admin/dashboard')}
                  className="flex-1 py-2.5 border border-slate-700 rounded-xl font-bold text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition text-sm"
                >
                  {loading ? 'Creating…' : 'Create Station'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default CreateStation;
