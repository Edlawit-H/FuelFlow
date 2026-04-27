import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound } from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <div className="text-center mb-8">
          <div className="bg-teal-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
            <KeyRound className="text-teal-700 w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
          <p className="text-sm text-slate-500 mt-1">We will send a reset code to your phone</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
            <input type="tel" required placeholder="+1 (555) 000-0000" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">New Password</label>
            <input type="password" required minLength={6} placeholder="Enter new password" className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm" />
          </div>
          <button type="submit" className="w-full bg-[#14b8a6] hover:bg-teal-600 text-white font-bold py-3 rounded-lg transition shadow-md shadow-teal-500/20">
            Update Password
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Back to <Link className="text-teal-600 font-bold hover:underline" to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
