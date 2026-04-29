import React from 'react';
import { LayoutDashboard, Fuel, Users, Navigation, User, LogOut } from 'lucide-react';

const Sidebar = ({ activePage, setPage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20}/> },
    { id: 'stations', label: 'Stations', icon: <Fuel size={20}/> },
    { id: 'admin', label: 'Queue Admin', icon: <Users size={20}/> },
    { id: 'home', label: 'Driver Home', icon: <Navigation size={20}/> },
    { id: 'profile', label: 'Profile', icon: <User size={20}/> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-black text-teal-600 tracking-tighter">FuelFlow</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setPage(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
              activePage === item.id 
                ? 'bg-teal-50 text-teal-600' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-50">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-red-400 font-semibold hover:bg-red-50 rounded-xl transition-all">
          <LogOut size={20}/> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
