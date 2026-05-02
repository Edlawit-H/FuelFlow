import { useState, useEffect } from 'react';
import { BarChart2, TrendingUp, Clock, CheckCircle, AlertTriangle, RefreshCw, Users } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/AdminLayout';

export default function AnalyticsDashboard() {
  const { user } = useAuth();

  const [globalData, setGlobalData]           = useState([]);
  const [stationAnalytics, setStationAnalytics] = useState([]);
  const [peakHours, setPeakHours]             = useState([]);
  const [myStation, setMyStation]             = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [days, setDays]                       = useState(7);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [stations, global] = await Promise.all([
          api.listStations(),
          api.getGlobalAnalytics(days),
        ]);
        setGlobalData(global);

        const mine = stations.find(
          (s) => s.adminId === user?.id || s.adminId?.toString() === user?.id
        ) || stations[0];

        if (mine) {
          setMyStation(mine);
          const [analytics, peaks] = await Promise.all([
            api.getStationAnalytics(mine._id, days),
            api.getPeakHours(mine._id, 'petrol', days),
          ]);
          setStationAnalytics(analytics);
          setPeakHours(peaks);
        }
      } catch { /* keep previous */ }
      setLoading(false);
    };
    load();
  }, [user, days]);

  const myTotals = stationAnalytics.reduce(
    (acc, r) => ({
      joins:   acc.joins   + r.totalJoins,
      served:  acc.served  + r.totalServed,
      noShows: acc.noShows + r.totalNoShows,
      avgWait: acc.avgWait + r.avgWaitMinutes,
    }),
    { joins: 0, served: 0, noShows: 0, avgWait: 0 }
  );
  if (stationAnalytics.length > 0)
    myTotals.avgWait = Math.round(myTotals.avgWait / stationAnalytics.length);

  const efficiency = myTotals.joins > 0
    ? Math.round((myTotals.served / myTotals.joins) * 100)
    : 0;

  return (
    <AdminLayout title="Analytics" backTo="/admin/dashboard" backLabel="Back to Dashboard">
      <div className="p-6 space-y-6">

        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart2 size={20} className="text-violet-400" />
            <div>
              <h1 className="text-lg font-bold text-slate-100">Analytics Dashboard</h1>
              {myStation && <p className="text-sm text-slate-500">{myStation.name}</p>}
            </div>
          </div>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/30"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <RefreshCw size={20} className="animate-spin mr-2" /> Loading analytics…
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard icon={<Users size={18} className="text-blue-400" />}      label="Total Joins"  value={myTotals.joins}              bg="bg-blue-900/30 border-blue-800" />
              <KPICard icon={<CheckCircle size={18} className="text-emerald-400" />} label="Served"   value={myTotals.served}             bg="bg-emerald-900/30 border-emerald-800" />
              <KPICard icon={<AlertTriangle size={18} className="text-amber-400" />} label="No-Shows" value={myTotals.noShows}            bg="bg-amber-900/30 border-amber-800" />
              <KPICard icon={<Clock size={18} className="text-violet-400" />}    label="Avg Wait"     value={`${myTotals.avgWait} min`}   bg="bg-violet-900/30 border-violet-800" />
            </div>

            {/* Efficiency */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-slate-200 text-sm">Station Efficiency</h3>
                <span className={`text-2xl font-black ${efficiency >= 80 ? 'text-emerald-400' : efficiency >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {efficiency}%
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${efficiency >= 80 ? 'bg-emerald-500' : efficiency >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${efficiency}%` }}
                />
              </div>
              <p className="text-xs text-slate-600 mt-2">Served ÷ Total Joins over the last {days} days</p>
            </div>

            {/* Peak Hours Chart */}
            {peakHours.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-bold text-slate-200 text-sm mb-4 flex items-center gap-2">
                  <TrendingUp size={16} className="text-violet-400" /> Peak Hours (Petrol)
                </h3>
                <div className="flex items-end gap-0.5 h-28">
                  {peakHours.map((h) => {
                    const maxJoins = Math.max(...peakHours.map((x) => x.avgJoins), 1);
                    const pct = Math.max(4, (h.avgJoins / maxJoins) * 100);
                    const isNow = h.hour === new Date().getHours();
                    return (
                      <div key={h.hour} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                        <div
                          className={`w-full rounded-t-sm transition-all ${isNow ? 'bg-teal-500' : 'bg-slate-700 group-hover:bg-violet-500/60'}`}
                          style={{ height: `${pct}%` }}
                        />
                        {h.hour % 6 === 0 && (
                          <span className="text-[8px] text-slate-600">{h.hour}</span>
                        )}
                        <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-800 border border-slate-700 text-white text-[9px] px-2 py-1 rounded whitespace-nowrap z-10">
                          {h.hour}:00 — {h.avgJoins} avg joins
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-600 mt-2">Avg joins per hour over last {days} days. Teal = current hour.</p>
              </div>
            )}

            {/* Daily Breakdown */}
            {stationAnalytics.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-800">
                  <h3 className="font-bold text-slate-200 text-sm">Daily Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-800/60 border-b border-slate-700 text-[10px] uppercase font-bold text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Date</th>
                        <th className="px-5 py-3">Fuel</th>
                        <th className="px-5 py-3">Joins</th>
                        <th className="px-5 py-3">Served</th>
                        <th className="px-5 py-3">No-Shows</th>
                        <th className="px-5 py-3">Avg Wait</th>
                        <th className="px-5 py-3">Peak Hour</th>
                        <th className="px-5 py-3">Congestion</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {stationAnalytics.slice(0, 14).map((r, i) => (
                        <tr key={i} className="hover:bg-slate-800/40 transition">
                          <td className="px-5 py-3 font-mono text-slate-400 text-xs">{r.date}</td>
                          <td className={`px-5 py-3 font-bold text-xs capitalize ${r.fuelType === 'petrol' ? 'text-emerald-400' : 'text-orange-400'}`}>{r.fuelType}</td>
                          <td className="px-5 py-3 text-slate-300">{r.totalJoins}</td>
                          <td className="px-5 py-3 text-emerald-400 font-semibold">{r.totalServed}</td>
                          <td className="px-5 py-3 text-red-400">{r.totalNoShows}</td>
                          <td className="px-5 py-3 text-slate-400">{r.avgWaitMinutes} min</td>
                          <td className="px-5 py-3 text-slate-400">{r.peakHour}:00</td>
                          <td className="px-5 py-3">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${
                              r.congestionLevel === 'high'   ? 'bg-red-900/40 text-red-400 border-red-800' :
                              r.congestionLevel === 'medium' ? 'bg-amber-900/40 text-amber-400 border-amber-800' :
                                                               'bg-emerald-900/40 text-emerald-400 border-emerald-800'
                            }`}>
                              {r.congestionLevel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Global Overview */}
            {globalData.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-800">
                  <h3 className="font-bold text-slate-200 text-sm">All Stations Overview</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-800/60 border-b border-slate-700 text-[10px] uppercase font-bold text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Station</th>
                        <th className="px-5 py-3">Total Joins</th>
                        <th className="px-5 py-3">Served</th>
                        <th className="px-5 py-3">Efficiency</th>
                        <th className="px-5 py-3">Avg Wait</th>
                        <th className="px-5 py-3">Peak Hour</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {globalData.map((s) => (
                        <tr key={s.stationId} className="hover:bg-slate-800/40 transition">
                          <td className="px-5 py-3 font-semibold text-slate-200">{s.stationName}</td>
                          <td className="px-5 py-3 text-slate-400">{s.totalJoins}</td>
                          <td className="px-5 py-3 text-emerald-400 font-semibold">{s.totalServed}</td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-14 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${s.efficiency >= 80 ? 'bg-emerald-500' : s.efficiency >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                  style={{ width: `${s.efficiency}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-slate-300">{s.efficiency}%</span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-slate-400">{s.avgWaitMinutes} min</td>
                          <td className="px-5 py-3 text-slate-400">{s.peakHour}:00</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {stationAnalytics.length === 0 && globalData.length === 0 && (
              <div className="text-center py-16 text-slate-600">
                <BarChart2 size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">No analytics data yet. Data is recorded as queues are used.</p>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

const KPICard = ({ icon, label, value, bg }) => (
  <div className={`${bg} border rounded-2xl p-4`}>
    <div className="flex items-center gap-2 mb-2">{icon}<span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span></div>
    <p className="text-2xl font-bold text-slate-100">{value}</p>
  </div>
);
