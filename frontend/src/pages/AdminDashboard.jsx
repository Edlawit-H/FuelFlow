import React from 'react';
import { LayoutDashboard, Fuel, Users, User, Settings, LogOut, Plus, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-6 text-xl font-bold text-[#10b981]">FuelFlow</div>
        <nav className="flex-1 px-4 space-y-1">
          <SidebarItem to="/admin/dashboard" icon={<LayoutDashboard size={18}/>} label="Dashboard" active />
          <SidebarItem to="/driver-home" icon={<Fuel size={18}/>} label="Stations" />
          <SidebarItem to="/admin/manage-queue" icon={<Users size={18}/>} label="Queue Admin" />
          <SidebarItem to="/driver-home" icon={<User size={18}/>} label="Driver Home" />
          <SidebarItem to="/admin/profile" icon={<Settings size={18}/>} label="Profile" />
        </nav>
        <div className="p-4"><StatusIndicator /></div>
      </aside>

      <main className="flex-1">
        {/* Top Header */}
        <header className="bg-white border-b px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Fuel className="text-teal-600" size={20} /> Central Metro Station
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right mr-2">
              <p className="text-xs font-bold text-slate-900">Admin User</p>
              <p className="text-[10px] text-slate-400 uppercase">Super Admin</p>
            </div>
            <div className="w-10 h-10 bg-slate-200 rounded-full" />
            <LogOut size={18} className="text-red-400" />
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-500 text-sm">Manage real-time queueing and fuel availability for Central Metro Station.</p>
            </div>
            <div className="flex gap-2">
              <button className="bg-white border px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm"><Settings size={14}/> Logs</button>
              <button className="bg-[#065f46] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm"><Plus size={14}/> New Entry</button>
            </div>
          </div>

          {/* Top Fuel Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <FuelCard type="Petrol" sub="95 OCTANE" count="24" available={true} />
            <FuelCard type="Diesel" sub="ULTRA LOW SULFUR" count="08" available={false} />
          </div>

          {/* Active Sessions Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm">Current Active Sessions</h3>
              <div className="flex gap-2">
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">6 PUMPS ACTIVE</span>
                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">4 PUMPS IDLE</span>
              </div>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b">
                <tr>
                  <th className="px-6 py-4">Pump No.</th>
                  <th className="px-6 py-4">Vehicle ID</th>
                  <th className="px-6 py-4">Fuel Type</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <PumpRow pump="PUMP-01" id="ABC-1234" type="Petrol" status="Fueling" progress="75" />
                <PumpRow pump="PUMP-04" id="XYZ-9876" type="Petrol" status="Fueling" progress="20" />
                <PumpRow pump="PUMP-07" id="TRK-4455" type="Diesel" status="Finalizing" progress="98" />
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

// Helper Components for Admin
const SidebarItem = ({ to, icon, label, active }) => (
  <Link to={to} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer ${active ? 'bg-emerald-50 text-emerald-600' : 'text-slate-500'}`}>
    {icon} {label}
  </Link>
);

const FuelCard = ({ type, sub, count, available }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-6">
      <div className="flex gap-4">
        <div className={`p-3 rounded-xl ${available ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}><Fuel size={24}/></div>
        <div>
          <h4 className="font-bold text-slate-800">{type}</h4>
          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{sub}</span>
        </div>
      </div>
      <div className="text-right">
        <span className="text-2xl font-bold text-slate-800">{count}</span>
        <p className="text-[9px] text-slate-400 font-bold uppercase">Vehicles In Queue</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <StatusToggle label="Fuel Status" val={available ? "Available" : "No Fuel"} active={available} />
      <StatusToggle label="Queue State" val={available ? "Active" : "Paused"} active={available} />
    </div>
  </div>
);

const StatusToggle = ({ label, val, active }) => (
  <div className="bg-slate-50 p-3 rounded-xl flex justify-between items-center border">
    <div>
      <p className="text-[9px] font-bold text-slate-400 uppercase">{label}</p>
      <p className={`text-xs font-bold ${active ? 'text-slate-700' : 'text-red-500'}`}>{val}</p>
    </div>
    <div className={`w-8 h-4 rounded-full relative ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
      <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${active ? 'right-0.5' : 'left-0.5'}`} />
    </div>
  </div>
);

const PumpRow = ({ pump, id, type, status, progress }) => (
  <tr className="hover:bg-slate-50 transition">
    <td className="px-6 py-4 font-bold text-slate-700">{pump}</td>
    <td className="px-6 py-4 text-slate-500 font-medium">{id}</td>
    <td className={`px-6 py-4 font-bold text-xs ${type === 'Petrol' ? 'text-emerald-500' : 'text-orange-500'}`}>{type}</td>
    <td className="px-6 py-4">
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${status === 'Fueling' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{status}</span>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="w-24 bg-slate-100 h-1 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full" style={{width: `${progress}%`}} />
        </div>
        <span className="text-[10px] font-bold text-slate-400">{progress}%</span>
      </div>
    </td>
    <td className="px-6 py-4"><Ban size={16} className="text-red-400 cursor-pointer" /></td>
  </tr>
);

const StatusIndicator = () => (
  <div className="bg-slate-50 p-3 rounded-lg">
    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">System Status</p>
    <div className="flex items-center gap-2 text-emerald-500 text-[11px] font-bold uppercase">
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Operational
    </div>
  </div>
);

export default AdminDashboard;