import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useLang();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone.trim()) { setError('Phone number is required'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(phone.trim(), password);
      navigate('/user/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <span className="text-white font-extrabold text-lg">F</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Sign Up to {t.appName}</h1>
        <p className="text-slate-500 text-sm mt-1">Join as a driver and start queueing digitally</p>
      </div>

      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
            <input type="tel" required placeholder="+251 9XX XXX XXX" value={phone}
              onChange={e => setPhone(e.target.value)} autoComplete="tel"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} required minLength={6}
                placeholder="Create a secure password" value={password}
                onChange={e => setPassword(e.target.value)} autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm pr-11" />
              <button type="button" onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                aria-label={showPassword ? 'Hide' : 'Show'}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Confirm Password</label>
            <div className="relative">
              <input type={showConfirm ? 'text' : 'password'} required
                placeholder="Repeat your password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm pr-11" />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                aria-label={showConfirm ? 'Hide' : 'Show'}>
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-3">
              <div className="bg-red-500 rounded-lg p-1 shrink-0"><AlertTriangle className="text-white w-3.5 h-3.5" /></div>
              <p className="text-red-600 text-xs font-medium">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-sm shadow-teal-500/20 active:scale-[0.98]">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-600 hover:underline font-bold">{t.login}</Link>
        </p>
      </div>

      <div className="mt-8 flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest flex-wrap justify-center">
        <Link to="/" className="hover:text-slate-600 transition">← Home</Link>
        <span className="text-slate-300">·</span>
        <Link to="/login" className="hover:text-slate-600 transition">Sign In</Link>
      </div>
    </div>
  );
}
