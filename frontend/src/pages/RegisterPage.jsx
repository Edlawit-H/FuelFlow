import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Fuel } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col items-center justify-center p-4 font-sans">
      <div className="text-center mb-8">
        <div className="bg-[#14b8a6] w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Fuel className="text-white w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Sign Up to FuelFlow</h1>
        <p className="text-slate-500 text-sm mt-1">Join as a driver and start queueing digitally</p>
      </div>

      <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-sm p-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
            <input type="text" required className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm" placeholder="John Driver" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number</label>
            <input type="tel" required className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm" placeholder="+1 (555) 000-0000" />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
            <input type="password" required minLength={6} className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition text-sm" placeholder="Create a secure password" />
          </div>

          <button type="submit" className="w-full bg-[#14b8a6] hover:bg-teal-600 text-white font-bold py-3 rounded-lg transition shadow-md shadow-teal-500/20">
            Create Account
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Already have an account? <Link to="/login" className="text-teal-600 hover:underline font-bold">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
