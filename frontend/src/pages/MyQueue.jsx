import React from 'react';
import { 
  LayoutDashboard, 
  Fuel, 
  Users, 
  User, 
  Bell, 
  Settings, 
  MapPin, 
  QrCode, 
  PauseCircle, 
  LogOut, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

const MyQueue = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 hidden md:block">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-teal-700">FuelFlow</h1>
          <p className="text-[10px] font-semibold text-slate-400 tracking-widest mt-1">QUEUE MANAGEMENT</p>
        </div>

        <nav className="space-y-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavItem icon={<Fuel size={18} />} label="Stations" />
          <NavItem icon={<Users size={18} />} label="My Queue" active />
          <NavItem icon={<MapPin size={18} />} label="Driver Home" />
          <NavItem icon={<User size={18} />} label="Profile" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-4 md:px-10">
        
        {/* Top Navbar */}
        <header className="flex justify-between items-center py-4 border-b border-slate-200 mb-6">
          <div className="flex space-x-8 text-sm font-medium text-slate-500">
            <a href="AdminDashboard.jsx" className="hover:text-teal-700">Dashboard</a>
            <a href="StationDetails.jsx" className="hover:text-teal-700">Stations</a>
            <a href="MyQueue.jsx" className="text-teal-700 border-b-2 border-teal-700 pb-5">My Queue</a>
            <a href="Profile.jsx" className="hover:text-teal-700">Profile</a>
          </div>
          <div className="flex items-center space-x-4 text-slate-400">
            <Bell size={20} className="cursor-pointer hover:text-slate-600" />
            <Settings size={20} className="cursor-pointer hover:text-slate-600" />
          </div>
        </header>


        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-start space-x-4 mb-8">
          <div className="bg-orange-100 p-2 rounded-full">
            <Bell size={20} className="text-orange-600" />
          </div>
          <div>
            <h4 className="font-bold text-orange-800 text-sm">Near turn</h4>
            <p className="text-orange-700 text-sm">Please prepare to enter Pump #4. Your turn is in approximately 4 minutes.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
         
          <div className="lg:col-span-2 space-y-6">
            
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Queue Status</h2>
                  <p className="text-slate-500 text-sm flex items-center mt-1">
                    <MapPin size={14} className="mr-1 text-teal-600" /> Shell Metro Central Station
                  </p>
                </div>
                <span className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center border border-blue-100">
                  <Fuel size={14} className="mr-1" /> DIESEL PLUS
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <StatItem label="CURRENT POSITION" value="#04" highlight />
                <StatItem label="PEOPLE AHEAD" value="3 Vehicles" />
                <StatItem label="ESTIMATED WAIT" value="12 min" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-slate-700">Queue Progress</span>
                  <span className="text-teal-600">75% Complete</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full transition-all duration-500" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>

         
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center space-x-4">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="font-bold text-emerald-900 text-sm">Your Turn</p>
                  <p className="text-emerald-700 text-xs text-opacity-80">Proceed to designated lane</p>
                </div>
              </div>
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center space-x-4 opacity-80">
                <div className="bg-red-100 p-2 rounded-lg text-red-600">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <p className="font-bold text-red-900 text-sm">No fuel</p>
                  <p className="text-red-700 text-xs text-opacity-80">Supply currently exhausted</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            
            <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-slate-800 rounded-full opacity-50"></div>
              
              <p className="text-[10px] font-bold tracking-widest text-slate-400 mb-4">YOUR SECRET CODE</p>
              <h2 className="text-4xl font-mono font-bold text-teal-400 tracking-wider mb-6">A3F9B2</h2>
              
              <div className="border-t border-slate-700 pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Assigned Pump</span>
                  <span className="font-semibold text-slate-200">Pump #04</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Vehicle ID</span>
                  <span className="font-semibold text-slate-200">KBD 492L</span>
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
              <button className="w-full py-3 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-colors">
                <QrCode size={18} />
                <span>Scan at Pump</span>
              </button>
              <button className="w-full py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-50 transition-colors">
                <PauseCircle size={18} />
                <span>Pause My Spot</span>
              </button>
              <button className="w-full py-3 bg-white border border-red-100 text-red-500 font-semibold rounded-xl flex items-center justify-center space-x-2 hover:bg-red-50 transition-colors">
                <LogOut size={18} />
                <span>Leave Queue</span>
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-2">
                Leaving the queue will forfeit your current position. This action cannot be undone.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false }) => (
  <a href="#" className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
    active ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-700 font-bold' : 'text-slate-500 hover:bg-slate-50'
  }`}>
    {icon}
    <span className="text-sm">{label}</span>
  </a>
);

const StatItem = ({ label, value, highlight = false }) => (
  <div>
    <p className="text-[10px] font-bold text-slate-400 tracking-tighter mb-1 uppercase">{label}</p>
    <p className={`text-lg font-bold ${highlight ? 'text-teal-600' : 'text-slate-800'}`}>{value}</p>
  </div>
);

export default MyQueue;
