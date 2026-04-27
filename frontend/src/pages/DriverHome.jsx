import React from 'react';
import { Search, Navigation } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StationCard from '../components/StationCard';

const DriverHome = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div className="relative w-1/2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Search for stations near you..." 
            className="w-full pl-10 pr-4 py-3 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
        <div className="flex gap-3">
          <Link className="flex items-center gap-2 px-5 py-3 bg-white text-slate-600 rounded-xl font-bold shadow-sm hover:bg-slate-50" to="/profile">
            Profile
          </Link>
          <button className="flex items-center gap-2 px-5 py-3 bg-white text-slate-600 rounded-xl font-bold shadow-sm hover:bg-slate-50">
            <Navigation size={18} className="text-teal-500"/> Near Me
          </button>
          <button className="px-5 py-3 bg-teal-500 text-white rounded-xl font-bold shadow-lg shadow-teal-500/20 hover:bg-teal-600">
            ⚡ Smart Pick
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
};

export default DriverHome;
