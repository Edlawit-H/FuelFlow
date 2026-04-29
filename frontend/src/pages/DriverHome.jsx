import React from 'react';
import { 
  Search, Navigation, LayoutDashboard, 
  Fuel, Users, User, Bell, Settings, Zap, Map 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StationCard from '../components/StationCard';

const DriverHome = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar - Matching your screenshot */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-extrabold text-teal-700 tracking-tight">FuelFlow</h1>
          <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1">QUEUE MANAGEMENT</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <SidebarLink icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <SidebarLink icon={<Fuel size={20} />} label="Stations" />
          <SidebarLink icon={<Users size={20} />} label="Queue Admin" />
          <SidebarLink icon={<Navigation size={20} />} label="Driver Home" active />
          <SidebarLink icon={<User size={20} />} label="Profile" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        
        {/* Top Header with Profile Avatar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-end px-8 space-x-6">
          <Bell size={20} className="text-slate-400 cursor-pointer hover:text-teal-600 transition-colors" />
          <Settings size={20} className="text-slate-400 cursor-pointer hover:text-teal-600 transition-colors" />
          <div className="w-9 h-9 bg-teal-600 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white cursor-pointer overflow-hidden">
            <User size={18} />
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8">
          
          {/* teammate's Search & Action Row - Styled with Tailwind */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Search for stations near you..." 
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500 transition-all shadow-sm"
              />
            </div>
            <div className="flex gap-3">
              <button className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 shadow-sm transition-all">
                <Navigation size={18} className="text-teal-500" />
                <span>Near Me</span>
              </button>
              <button className="flex items-center justify-center space-x-2 px-8 py-3.5 bg-teal-500 text-white rounded-2xl font-black shadow-lg shadow-teal-500/20 hover:bg-teal-600 transition-all active:scale-95">
                <Zap size={18} fill="currentColor" />
                <span>Smart Pick</span>
              </button>
            </div>
          </div>

          {/* New: Filter Tabs from screenshot */}
          <div className="flex space-x-8 border-b border-slate-200 text-sm font-bold text-slate-400">
            <button className="pb-4 text-teal-600 border-b-2 border-teal-600">All Stations</button>
            <button className="pb-4 hover:text-slate-600 transition-colors">Petrol Only</button>
            <button className="pb-4 hover:text-slate-600 transition-colors">Diesel Only</button>
            <button className="pb-4 hover:text-slate-600 transition-colors">24 Hours</button>
          </div>

          {/* Grid using teammate's Logic */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <StationCard 
              name="Central Plaza Station" 
              address="122 Main St, Downtown" 
              distance="0.8 KM"
              petrolStatus="AVAILABLE (4 MIN)"
              dieselStatus="PAUSED"
              onViewStation={() => navigate('/driver/station/central-plaza')}
            />
            <StationCard 
              name="Northside Hub" 
              address="85 Expressway Ave" 
              distance="2.4 KM"
              petrolStatus="NO FUEL"
              dieselStatus="AVAILABLE (0 MIN)"
              onViewStation={() => navigate('/driver/station/northside-hub')}
            />
            <StationCard 
              name="Metro Gas & Oil" 
              address="Circular Road, Sector 4" 
              distance="3.1 KM"
              petrolStatus="AVAILABLE (12 MIN)"
              dieselStatus="AVAILABLE (8 MIN)"
              onViewStation={() => navigate('/driver/station/metro-gas')}
            />
          </div>
        </div>

        {/* Floating Map Toggle Button */}
        <button className="fixed bottom-8 right-8 w-16 h-16 bg-teal-500 text-white rounded-2xl shadow-2xl shadow-teal-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
          <Map size={28} />
        </button>
      </main>
    </div>
  );
};

// Sidebar Helper
const SidebarLink = ({ icon, label, active = false }) => (
  <div className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all ${
    active ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-700 font-bold' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
  }`}>
    {icon}
    <span className="text-sm tracking-tight">{label}</span>
  </div>
);

export default DriverHome;
