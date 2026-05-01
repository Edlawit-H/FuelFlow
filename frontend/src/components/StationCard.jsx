import React from 'react';
import { Fuel, MapPin } from 'lucide-react';

const StationCard = ({ name, address, distance, petrolStatus, dieselStatus, fuelTypes, onViewStation }) => {
  // Build rows from whatever fuel types the station actually has
  const rows = [];
  if (fuelTypes && fuelTypes.length > 0) {
    fuelTypes.forEach((ft) => {
      const label = ft.charAt(0).toUpperCase() + ft.slice(1);
      const status = ft === 'petrol' ? petrolStatus : ft === 'diesel' ? dieselStatus : 'NO FUEL';
      rows.push({ type: label, status: status || 'NO FUEL' });
    });
  } else {
    // fallback: always show petrol + diesel
    rows.push({ type: 'Petrol', status: petrolStatus || 'NO FUEL' });
    rows.push({ type: 'Diesel', status: dieselStatus || 'NO FUEL' });
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4 transition-all hover:shadow-md hover:border-teal-100 group">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 text-lg group-hover:text-teal-600 transition-colors">
            {name}
          </h3>
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 font-medium">
            <MapPin size={12} /> {address}
          </p>
        </div>
        <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm border border-teal-100">
          {distance}
        </span>
      </div>

      <div className="space-y-2 mt-2">
        {rows.map((row) => (
          <FuelRow key={row.type} type={row.type} status={row.status} />
        ))}
      </div>

      <button
        onClick={onViewStation}
        className="w-full py-3 mt-2 rounded-2xl border border-slate-100 text-slate-700 font-bold text-sm hover:bg-teal-600 hover:text-white hover:border-teal-600 transition-all shadow-sm active:scale-[0.98]"
      >
        View Station
      </button>
    </div>
  );
};

const FuelRow = ({ type, status }) => {
  const isAvailable = status.includes('AVAILABLE');
  const isNoFuel = status === 'NO FUEL';

  let statusStyles = 'bg-orange-50 text-orange-600 border-orange-100'; // PAUSED
  if (isAvailable) statusStyles = 'bg-blue-50 text-blue-600 border-blue-100';
  if (isNoFuel) statusStyles = 'bg-red-50 text-red-600 border-red-100';

  return (
    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
      <div className="flex items-center gap-2">
        <Fuel size={14} className="text-teal-600" />
        <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{type}</span>
      </div>
      <span className={`text-[9px] font-black px-2 py-1 rounded-lg border shadow-sm ${statusStyles}`}>
        {status}
      </span>
    </div>
  );
};

export default StationCard;
