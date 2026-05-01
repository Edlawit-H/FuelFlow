import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, CheckCircle2, LogOut } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const { user, logout } = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
  }, [user]);

  const handleSave = async () => {
    setError('');
    setLoading(true);
    try {
      const body = {};
      if (phone.trim() && phone !== user?.phone) body.phone = phone.trim();
      if (password) body.password = password;
      if (Object.keys(body).length === 0) { setSaved(true); setTimeout(() => setSaved(false), 2000); return; }
      await api.updateMe(body);
      setSaved(true);
      setPassword('');
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/user/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 font-semibold">
            <ArrowLeft size={18} /> {t.backToHome}
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-600 font-semibold text-sm transition">
            <LogOut size={16} /> {t.logout}
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
              <User size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Driver Profile</h1>
              <p className="text-sm text-slate-500">Manage your account details</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Phone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 border rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">New Password (leave blank to keep current)</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-3 border rounded-lg border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm" />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {saved && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                <CheckCircle2 size={16} /> Changes saved successfully
              </div>
            )}

            <button type="button" onClick={handleSave} disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition">
              {loading ? 'Saving…' : t.saveChanges}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
