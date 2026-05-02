import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, LogOut, User, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function AdminProfile() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { user, logout } = useAuth();

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [station, setStation] = useState(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
    if (user?.email) setEmail(user.email);

    api.listStations()
      .then(stations => {
        const mine = stations.find(s =>
          s.adminId === user?.id || s.adminId?.toString() === user?.id
        ) || stations[0];
        if (mine) setStation(mine);
      })
      .catch(() => {});
  }, [user]);

  const handleSave = async () => {
    setError('');
    setLoading(true);
    try {
      const body = {};
      if (phone.trim() && phone !== user?.phone) body.phone = phone.trim();
      if (email.trim()) body.email = email.trim();
      if (password) body.password = password;
      if (Object.keys(body).length > 0) await api.updateMe(body);
      setSaved(true);
      setPassword('');
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 font-semibold transition">
            <ArrowLeft size={18} /> Back
          </button>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 text-red-400 hover:text-red-600 font-semibold text-sm transition">
            <LogOut size={16} /> {t.logout}
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8 mb-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Admin Profile</h1>
              <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">Station Admin</span>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Phone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 border rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Email (optional)</label>
              <input value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Add email address"
                className="w-full px-3 py-3 border rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm" />
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">New Password (leave blank to keep current)</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-3 border rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm" />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {saved && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                <CheckCircle2 size={16} /> Profile updated successfully
              </div>
            )}

            <button onClick={handleSave} disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition">
              {loading ? 'Saving…' : t.saveChanges}
            </button>
          </div>
        </div>

        {station && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
            <h2 className="text-base font-bold text-slate-800 mb-4">Your Station</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Station Name</p>
                <p className="font-semibold text-slate-800">{station.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Address</p>
                <p className="text-slate-600">{station.address}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Fuel Types</p>
                <div className="flex gap-2 mt-1">
                  {station.fuelTypes?.map(ft => (
                    <span key={ft} className="capitalize text-xs font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full">{ft}</span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">To manage queues, go to your dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}
