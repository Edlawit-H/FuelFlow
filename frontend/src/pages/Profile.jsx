import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Lock, CheckCircle2, LogOut, User } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const { t } = useLang();
  const { user, logout } = useAuth();

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.phone) setPhone(user.phone);
    if (user?.email) setEmail(user.email || '');
  }, [user]);

  const handleSave = async () => {
    setError('');
    setLoading(true);
    try {
      const body = {};
      if (phone.trim() && phone !== user?.phone) body.phone = phone.trim();
      if (email.trim() !== (user?.email || '')) body.email = email.trim() || undefined;
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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to="/user/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 font-semibold text-sm transition">
            <ArrowLeft size={16} /> {t.backToHome}
          </Link>
          <button onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-1.5 text-red-400 hover:text-red-600 font-semibold text-sm transition">
            <LogOut size={15} /> {t.logout}
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-8 text-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <User size={28} className="text-white" />
            </div>
            <p className="text-white font-bold text-lg">{user?.phone || '—'}</p>
            <span className="inline-block mt-2 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">Driver</span>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email (optional)</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Add email address"
                  className="w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm" />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}

            {saved && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                <CheckCircle2 size={16} /> Changes saved successfully
              </div>
            )}

            <button onClick={handleSave} disabled={loading}
              className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition active:scale-[0.98]">
              {loading ? 'Saving…' : t.saveChanges}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
