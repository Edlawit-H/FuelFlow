import React from 'react';
import { MapPin, Clock, Coffee, Wifi, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const DriverStation = () => {
  return (
    <div className="min-h-screen bg-white md:bg-slate-50 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-lg flex flex-col">
        {/* Header Image Area */}
        <div className="relative h-48 bg-slate-200">
          <Link to="/driver" className="absolute top-4 left-4 p-2 bg-white/80 rounded-full">
            <ArrowLeft size={20} />
          </Link>
          <div className="absolute bottom-4 left-4 text-white drop-shadow-md">
            <h1 className="text-xl font-bold">Central Metro Station</h1>
            <p className="text-sm flex items-center gap-1"><MapPin size={14}/> 1.2 km away</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 flex-1">
          {/* Status Section */}
          <div className="flex gap-4">
            <div className="flex-1 bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Petrol</p>
              <p className="font-bold text-slate-800">Available</p>
              <p className="text-xs text-slate-500">~ 15 min wait</p>
            </div>
            <div className="flex-1 bg-slate-50 border border-slate-100 p-4 rounded-2xl opacity-60">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Diesel</p>
              <p className="font-bold text-slate-400">Out of Stock</p>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="font-bold text-slate-800 mb-4">Amenities</h3>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="bg-slate-100 p-3 rounded-full mb-1 text-slate-600"><Coffee size={20}/></div>
                <span className="text-[10px] font-medium text-slate-500">Cafe</span>
              </div>
              <div className="text-center">
                <div className="bg-slate-100 p-3 rounded-full mb-1 text-slate-600"><Wifi size={20}/></div>
                <span className="text-[10px] font-medium text-slate-500">Wi-Fi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 border-t">
          <Link to="/driver/join-confirm" className="block w-full bg-[#14b8a6] text-white text-center py-4 rounded-2xl font-bold shadow-lg shadow-teal-500/20">
            Join Queue
          </Link>
        </div>
      </div>
    </div>
  );
};
export default DriverStation;