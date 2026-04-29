import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  CircleUserRound,
  Fuel,
  LayoutDashboard,
  LocateFixed,
  Map,
  Search,
  Settings,
  User,
  Users,
} from 'lucide-react';
import StationCard from '../components/StationCard';

const UserDashboard = () => {
  const navigate = useNavigate();

  const stationCards = [
    {
      name: 'Central Plaza Station',
      address: '122 Main St, Downtown',
      distance: '0.8 KM',
      petrolStatus: 'AVAILABLE (4 MIN)',
      dieselStatus: 'PAUSED',
      id: 'central-plaza',
    },
    {
      name: 'Northside Hub',
      address: '85 Expressway Ave',
      distance: '2.4 KM',
      petrolStatus: 'NO FUEL',
      dieselStatus: 'AVAILABLE (0 MIN)',
      id: 'northside-hub',
    },
    {
      name: 'Metro Gas & Oil',
      address: 'Circular Road, Sector 4',
      distance: '3.1 KM',
      petrolStatus: 'AVAILABLE (12 MIN)',
      dieselStatus: 'AVAILABLE (8 MIN)',
      id: 'metro-gas-oil',
    },
    {
      name: 'Greenway Express',
      address: 'Greenway Bypass',
      distance: '5.5 KM',
      petrolStatus: 'PAUSED',
      dieselStatus: 'AVAILABLE (2 MIN)',
      id: 'greenway-express',
    },
  ];

  return (
    <div className="min-h-screen bg-[#edf3f2] flex">
      <aside className="hidden md:flex w-60 bg-white border-r border-slate-200 flex-col">
        <div className="px-6 py-5 border-b border-slate-100">
          <h1 className="text-2xl font-bold text-teal-600">FuelFlow</h1>
        </div>
        <nav className="px-3 py-4 space-y-1">
          <NavItem label="Dashboard" icon={<LayoutDashboard size={16} />} to="/user/dashboard" />
          <NavItem label="Stations" icon={<Fuel size={16} />} to="/user/dashboard" />
          <NavItem label="Queue Admin" icon={<Users size={16} />} to="/admin/manage-queue" />
          <NavItem label="Driver Home" icon={<LocateFixed size={16} />} to="/user/dashboard" active />
          <NavItem label="Profile" icon={<User size={16} />} to="/profile" />
        </nav>
      </aside>

      <main className="flex-1">
        <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex items-center justify-end gap-4">
          <button className="text-slate-500 hover:text-slate-700">
            <Bell size={16} />
          </button>
          <button className="text-slate-500 hover:text-slate-700">
            <Settings size={16} />
          </button>
          <Link to="/profile" className="text-teal-600">
            <CircleUserRound size={20} />
          </Link>
        </header>

        <div className="p-5 md:p-6">
          <div className="bg-white/35 border border-slate-200 rounded-xl p-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search for stations near you..."
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2.5 text-sm rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold flex items-center gap-2">
                  <LocateFixed size={16} className="text-teal-600" />
                  Near Me
                </button>
                <button className="px-4 py-2.5 text-sm rounded-lg bg-[#14b8a6] text-white font-semibold">
                  Smart Pick
                </button>
              </div>
            </div>

            <div className="mt-4 border-b border-slate-200">
              <div className="flex flex-wrap gap-6 text-sm">
                <TabButton active label="All Stations" />
                <TabButton label="Petrol Only" />
                <TabButton label="Diesel Only" />
                <TabButton label="24 Hours" />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {stationCards.map((station) => (
                <StationCard
                  key={station.id}
                  name={station.name}
                  address={station.address}
                  distance={station.distance}
                  petrolStatus={station.petrolStatus}
                  dieselStatus={station.dieselStatus}
                  onViewStation={() => navigate(`/driver/station/${station.id}`)}
                />
              ))}
            </div>
          </div>

          <div className="fixed bottom-5 right-5">
            <button className="w-12 h-12 bg-[#14b8a6] rounded-full text-white shadow-lg flex items-center justify-center">
              <Map size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ to, label, icon, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${
      active ? 'bg-teal-50 text-teal-700 border-r-4 border-teal-600' : 'text-slate-600 hover:bg-slate-100'
    }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const TabButton = ({ label, active = false }) => (
  <button
    className={`pb-3 text-sm font-semibold border-b-2 ${
      active ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'
    }`}
  >
    {label}
  </button>
);

export default UserDashboard;
