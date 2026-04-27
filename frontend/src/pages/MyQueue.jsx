import React from 'react';
import { QrCode, RefreshCw } from 'lucide-react';

const MyQueue = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 flex flex-col items-center">
      <div className="w-full max-w-sm">
        <header className="flex justify-between items-center mb-8">
          <h2 className="font-bold text-slate-800">Your Ticket</h2>
          <button className="text-slate-400"><RefreshCw size={20}/></button>
        </header>

        {/* Ticket Card */}
        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
          <div className="bg-[#0f172a] p-8 text-center text-white">
            <p className="text-[10px] uppercase tracking-[0.2em] opacity-50 mb-2">Queue Position</p>
            <h3 className="text-6xl font-bold text-teal-400">#04</h3>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="flex justify-between border-b pb-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">PIN CODE</p>
                <p className="text-xl font-mono font-bold text-slate-800 tracking-wider">A3F9B2</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase">ETA</p>
                <p className="text-xl font-bold text-slate-800">12 MIN</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Progress</span>
                <span className="text-teal-600">75%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full w-[75%]" />
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 flex justify-center">
              <QrCode size={140} className="text-slate-800" />
            </div>
            
            <p className="text-[10px] text-center text-slate-400 leading-relaxed">
              Show this QR code or PIN to the station attendant <br/> when you reach the pump.
            </p>
          </div>
        </div>

        <button className="w-full mt-8 text-red-400 font-bold text-sm">Cancel Registration</button>
      </div>
    </div>
  );
};
export default MyQueue;