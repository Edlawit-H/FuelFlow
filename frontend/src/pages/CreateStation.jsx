import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fuel, MapPin, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

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
    if (!form.name.trim()) { setError('Station name is required'); return; }
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
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <CheckCircle2 size={48} className="text-teal-500 mx-auto" />
          <p className="font-bold text-slate-800 text-lg">Station Created!</p>
          <p className="text-sm text-slate-500">Redirecting to dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-slate-500"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="p-2 bg-teal-50 rounded-xl text-teal-600"><Fuel size={24} /></div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Station</h1>
          <p className="text-sm text-slate-500">Add a new fuel station to the network</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Station Name</label>
              <div className="relative">
                <Fuel size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="e.g. Central Metro Station" value={form.name} onChange={set('name')}
                  className="w-full pl-9 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none transition text-sm" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" placeholder="123 Energy Way, Downtown" value={form.address} onChange={set('address')}
                  className="w-full pl-9 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none transition text-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Latitude</label>
              <input type="number" step="any" placeholder="e.g. 9.0054" value={form.lat} onChange={set('lat')}
                className="w-full px-3 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none transition text-sm" />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Longitude</label>
              <input type="number" step="any" placeholder="e.g. 38.7636" value={form.lng} onChange={set('lng')}
                className="w-full px-3 py-3 border rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none transition text-sm" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Fuel Types Available</label>
            <div className="flex gap-4">
              {[['hasPetrol', 'Petrol'], ['hasDiesel', 'Diesel']].map(([field, label]) => (
                <label key={field} className={`flex items-center gap-3 flex-1 p-4 rounded-xl border-2 cursor-pointer transition ${form[field] ? 'border-teal-500 bg-teal-50' : 'border-slate-200 bg-white'}`}>
                  <input type="checkbox" checked={form[field]} onChange={set(field)} className="accent-teal-600" />
                  <span className="font-semibold text-sm text-slate-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
              <div className="bg-red-500 rounded p-1 shrink-0"><AlertTriangle className="text-white w-4 h-4" /></div>
              <p className="text-red-600 text-xs font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate('/admin/dashboard')}
              className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-3 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold rounded-xl transition">
              {loading ? 'Creating…' : 'Create Station'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStation;
