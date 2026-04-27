import React from 'react';

const FuelFlowLanding = () => {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-[#1e293b]">
   
      <nav className="flex items-center justify-between px-6 md:px-20 py-4 bg-white border-b border-slate-100">
        <div className="text-xl font-bold text-[#0ea5e9] flex items-center">
          <span className="text-[#10b981]">FuelFlow</span>
        </div>
        <div className="hidden md:flex space-x-8 text-[13px] font-medium text-slate-500">
          <a href="#" className="hover:text-emerald-500 transition">Solutions</a>
          <a href="#" className="hover:text-emerald-500 transition">How it Works</a>
          <a href="#" className="hover:text-emerald-500 transition">Benefits</a>
          <a href="#" className="hover:text-emerald-500 transition">User Types</a>
        </div>
        <div className="flex items-center space-x-4">
          <button className="text-[13px] font-medium text-slate-600">Login</button>
          <button className="bg-[#10b981] text-white px-4 py-2 rounded-md text-[13px] font-semibold hover:bg-emerald-600 transition">
            Sign Up
          </button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <header className="pt-20 pb-24 text-center px-4">
        <div className="inline-block bg-slate-100 border border-slate-200 px-3 py-1 rounded-full mb-6">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Fuel Management System</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-slate-900">FuelFlow</h1>
        <p className="text-lg md:text-xl font-semibold text-slate-800 mb-3">
          A smart system for managing fuel station queues in real time.
        </p>
        <p className="text-slate-500 text-sm md:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
          Drivers join fuel queues digitally. Stations manage fuel flow and waiting lists efficiently.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="bg-[#14b8a6] text-white px-8 py-2.5 rounded-md text-sm font-bold shadow-sm hover:bg-teal-600 transition">
            Login
          </button>
          <button className="bg-white border border-slate-200 text-slate-700 px-8 py-2.5 rounded-md text-sm font-bold shadow-sm hover:bg-slate-50 transition">
            Create Account
          </button>
        </div>
      </header>

      {/* --- How it Works --- */}
      <section className="py-20 px-6 md:px-20 bg-[#f1f5f9]/50 border-t border-slate-100">
        <h2 className="text-2xl font-bold text-center mb-16">How it Works</h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { id: 1, title: "Drivers join queue", desc: "Select a station and join a fuel queue instantly." },
            { id: 2, title: "Get a PIN code", desc: "Each user receives a unique code for their queue position." },
            { id: 3, title: "Stations manage flow", desc: "Admins control fuel availability and serve users in order." }
          ].map((item) => (
            <div key={item.id} className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
              <div className="bg-[#14b8a6] text-white w-8 h-8 flex items-center justify-center rounded-md text-sm font-bold mb-6">
                {item.id}
              </div>
              <h3 className="font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-500 text-[13px] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- Comprehensive System Overview --- */}
      <section className="py-24 px-6 md:px-20 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-2xl font-bold mb-10 text-slate-800">Comprehensive System Overview</h2>
            <div className="space-y-8">
              {[
                { label: "Separate Queues", text: "Dedicated management for Petrol and Diesel fuel types to avoid congestion." },
                { label: "Real-Time Updates", text: "Instant notifications on queue progress and station fuel status." },
                { label: "PIN-Based Identification", text: "Secure digital tokens for every driver to ensure order integrity." },
                { label: "Admin Controls", text: "Advanced dashboard for station managers to regulate the flow." }
              ].map((feature, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                  <div>
                    <h4 className="font-bold text-[15px] text-slate-800">{feature.label}</h4>
                    <p className="text-slate-500 text-[13px] leading-relaxed">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Dashboard Mockup */}
          <div className="lg:w-1/2 w-full bg-[#e2e8f0] p-6 rounded-2xl border border-slate-200">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-slate-200">
              <div className="bg-slate-50 px-4 py-3 border-b flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Live Queue: Station #942</span>
                <span className="bg-blue-100 text-blue-600 text-[9px] px-2 py-0.5 rounded font-bold">ACTIVE</span>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center text-[13px] border-b border-slate-100 pb-3">
                  <span className="font-semibold text-slate-700">PIN: 4421</span>
                  <span className="text-[#10b981] font-bold text-[10px] uppercase">Next in line</span>
                </div>
                <div className="flex justify-between items-center text-[13px] border-b border-slate-100 pb-3">
                  <span className="font-medium text-slate-400">PIN: 4422</span>
                  <span className="text-slate-300 text-[10px]">Waiting</span>
                </div>
                <div className="flex justify-between items-center text-[13px] border-b border-slate-100 pb-3">
                  <span className="font-medium text-slate-400">PIN: 4423</span>
                  <span className="text-slate-300 text-[10px]">Waiting</span>
                </div>
                <div className="pt-4">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-2">
                    <span>Petrol Supply</span>
                    <span>82%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full">
                    <div className="bg-[#14b8a6] h-full w-[82%] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Designed for Everyone --- */}
      <section className="py-24 px-6 md:px-20">
        <h2 className="text-2xl font-bold text-center mb-16">Designed for Everyone</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Driver Card */}
          <div className="bg-white p-10 rounded-xl border border-slate-100 shadow-sm">
            <div className="inline-block bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase mb-4">For Drivers</div>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Driver Account</h3>
            <ul className="space-y-4">
              {['Join queues remotely', 'Track position in real-time', 'Digital PIN for verification'].map(item => (
                <li key={item} className="flex items-center text-[13px] text-slate-600">
                  <span className="text-emerald-400 mr-3 text-lg">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
          {/* Admin Card */}
          <div className="bg-white p-10 rounded-xl border border-slate-100 shadow-sm">
            <div className="inline-block bg-emerald-50 border border-emerald-100 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase mb-4">For Stations</div>
            <h3 className="text-xl font-bold text-slate-800 mb-6">Station Admin</h3>
            <ul className="space-y-4">
              {['Manage fuel type availability', 'Control queues & waiting lists', 'Serve users in digital order'].map(item => (
                <li key={item} className="flex items-center text-[13px] text-slate-600">
                  <span className="text-emerald-400 mr-3 text-lg">•</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* --- Why FuelFlow? --- */}
      <section className="py-20 px-6 md:px-20">
        <h2 className="text-2xl font-bold text-center mb-16">Why FuelFlow?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {[
            { t: "Eliminate Confusion", d: "Reduces waiting confusion with clear digital tracking." },
            { t: "Organized Flow", d: "Organizes fuel queues separately per fuel type." },
            { t: "Safety First", d: "Prevents overcrowding at the station premises." },
            { t: "Predictable Logic", d: "Makes station operations predictable and efficient." }
          ].map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-slate-200 hover:border-emerald-200 transition">
              <h4 className="font-bold text-[14px] text-slate-800 mb-2">{item.t}</h4>
              <p className="text-slate-500 text-[12px] leading-relaxed">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="px-6 md:px-10 pb-20">
        <div className="bg-[#064e3b] rounded-[40px] py-20 px-6 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Start using FuelFlow today</h2>
          <p className="text-emerald-100/70 text-[15px] mb-10 max-w-xl mx-auto">
            Join thousands of stations and drivers already streamlining their fueling experience.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-white text-[#064e3b] px-10 py-3 rounded-md text-[14px] font-bold hover:bg-slate-100 transition">
              Login
            </button>
            <button className="bg-[#2dd4bf] text-white px-10 py-3 rounded-md text-[14px] font-bold hover:bg-teal-400 transition">
              Register
            </button>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="px-6 md:px-20 py-10 border-t border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="font-bold text-[#10b981] text-lg mb-1">FuelFlow</div>
            <p className="text-slate-400 text-[11px]">© 2024 FuelFlow Fuel Management. All rights reserved.</p>
          </div>
          <div className="flex space-x-8 text-slate-400 text-[11px] font-medium">
            <a href="#" className="hover:text-emerald-500">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-500">Terms of Service</a>
            <a href="#" className="hover:text-emerald-500">Contact</a>
            <a href="#" className="hover:text-emerald-500">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default FuelFlowLanding;