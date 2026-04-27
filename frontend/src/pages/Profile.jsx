import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, CarFront } from 'lucide-react';

const Profile = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Link to="/driver-home" className="inline-flex items-center gap-2 text-slate-500 hover:text-teal-600 font-semibold mb-6">
          <ArrowLeft size={18} />
          Back to Driver Home
        </Link>

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

          <form className="space-y-5">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="w-full pl-9 pr-3 py-3 border rounded-lg border-slate-200" defaultValue="John Driver" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Phone</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="w-full pl-9 pr-3 py-3 border rounded-lg border-slate-200" defaultValue="+1 (555) 000-0000" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Vehicle Number</label>
              <div className="relative">
                <CarFront size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="w-full pl-9 pr-3 py-3 border rounded-lg border-slate-200" defaultValue="CAB-4021" />
              </div>
            </div>

            <button type="button" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-lg transition">
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
