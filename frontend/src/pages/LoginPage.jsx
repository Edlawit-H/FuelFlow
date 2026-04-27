import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Fuel, Eye, AlertTriangle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    // Demo flow: route by role without backend auth.
    const role = event.currentTarget.role.value;
    if (role === 'admin') {
      navigate('/admin/dashboard');
      return;
    }
    navigate('/user/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-4 font-sans">
      {/* Logo Header */}
      <div className="text-center mb-8">
        <div className="bg-[#14b8a6] w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Fuel className="text-white w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">FuelFlow</h1>
        <p className="text-slate-500 text-sm mt-1">Queue Management & Dispatch Portal</p>
      </div>

      {/* Login Card */}
      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-sm p-8">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Phone Number */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <input 
              type="text" 
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm"
            />
            <p className="text-red-500 text-[11px] mt-1.5 flex items-center">
              <span className="mr-1">●</span> Phone number required
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm"
              />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <Eye size={18} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Login As
            </label>
            <select
              name="role"
              defaultValue="driver"
              className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm bg-white"
            >
              <option value="driver">Driver</option>
              <option value="admin">Station Admin</option>
            </select>
          </div>

          {/* Error Message Box */}
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-center gap-3">
            <div className="bg-red-500 rounded p-1">
              <AlertTriangle className="text-white w-4 h-4" />
            </div>
            <p className="text-red-600 text-xs font-medium">
              Invalid phone or password. Please try again.
            </p>
          </div>

         
          <button type="submit" className="w-full bg-[#14b8a6] hover:bg-teal-600 text-white font-bold py-3 rounded-lg transition shadow-md shadow-teal-500/20">
            Login
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Don't have an account? <Link to="/signup" className="text-teal-600 hover:underline font-bold">Sign Up</Link>
          </p>
        </div>
      </div>

      <div className="mt-10 flex items-center space-x-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
        <Link to="/reset-password" className="hover:text-slate-600">Forgot Password?</Link>
        <span className="text-slate-300">●</span>
        <Link to="/" className="hover:text-slate-600">Help Center</Link>
      </div>
    </div>
  );
};

export default LoginPage;