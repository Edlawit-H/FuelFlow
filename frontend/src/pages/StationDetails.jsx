import React from 'react';
import { ArrowLeft, MapPin, Clock, Users, Zap } from 'lucide-react';

const StationDetails = ({ onBack }) => {
  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* 1. Header with Back Button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-teal-600 font-bold mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> Back to Stations
      </button>

      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* 2. Main Station Info */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-wider">
            Station Selection
          </span>
          <h1 className="text-3xl font-black text-slate-800 mt-2">Central Petro Hub #42</h1>
          <p className="text-slate-400 flex items-center gap-2 mt-1">
            <MapPin size={16} /> Harbor District, Terminal 3
          </p>

          <div className="mt-8 p-6 bg-teal-500 rounded-2xl text-white flex justify-between items-center shadow-lg shadow-teal-500/30">
            <div>
              <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Selected Fuel Type</p>
              <h2 className="text-2xl font-black italic">PREMIUM DIESEL</h2>
            </div>
            <div className="text-right">
              <p className="text-3xl font-black italic">$3.89</p>
              <p className="text-[10px] opacity-80">PER GALLON</p>
            </div>
          </div>
        </div>

        {/* 3. Queue Stats Grid */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-slate-50 text-teal-500 rounded-xl"><Users size={24}/></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Queue Length</p>
              <p className="text-xl font-black text-slate-800">14 <span className="text-sm font-normal text-slate-400 italic">vehicles</span></p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-slate-50 text-teal-500 rounded-xl"><Clock size={24}/></div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Est. Wait</p>
              <p className="text-xl font-black text-slate-800">22 <span className="text-sm font-normal text-slate-400 italic">minutes</span></p>
            </div>
          </div>
        </div>

        {/* 4. Predicted Position Logic */}
        <div className="bg-teal-50/50 p-8 rounded-3xl border border-teal-100 relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-black text-slate-800">Predicted Position</h3>
            <p className="text-sm text-slate-500">Your spot if you join right now.</p>
            
            <div className="mt-6 flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Pump 1</span>
              <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="w-[75%] h-full bg-teal-500"></div>
              </div>
              <span className="h-10 w-10 flex items-center justify-center bg-teal-600 text-white rounded-full font-black shadow-lg">15</span>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-tighter">Your Spot</span>
            </div>
          </div>
          <Zap className="absolute -right-4 -bottom-4 text-teal-100 opacity-50" size={120} />
        </div>

        {/* 5. Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <button className="w-full py-4 bg-teal-800 text-white rounded-2xl font-black text-lg hover:bg-teal-900 transition-all shadow-xl shadow-teal-800/20">
            Confirm & Join Queue
          </button>
          <button className="w-full py-4 bg-white text-slate-400 border border-slate-100 rounded-2xl font-bold hover:bg-slate-50 transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default StationDetails;
