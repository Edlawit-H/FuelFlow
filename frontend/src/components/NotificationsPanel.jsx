import { useState, useEffect } from 'react';
import { X, Bell, CheckCheck, AlertTriangle, Clock, Fuel, Zap, Info } from 'lucide-react';
import { api } from '../services/api';

const TYPE_CONFIG = {
  turn_soon:       { icon: <Zap size={14} />,           color: 'text-teal-600 bg-teal-50' },
  leave_now:       { icon: <Clock size={14} />,          color: 'text-blue-600 bg-blue-50' },
  queue_paused:    { icon: <AlertTriangle size={14} />,  color: 'text-amber-600 bg-amber-50' },
  fuel_available:  { icon: <Fuel size={14} />,           color: 'text-emerald-600 bg-emerald-50' },
  congestion_high: { icon: <AlertTriangle size={14} />,  color: 'text-red-600 bg-red-50' },
  no_show_warning: { icon: <AlertTriangle size={14} />,  color: 'text-red-600 bg-red-50' },
  default:         { icon: <Info size={14} />,           color: 'text-slate-600 bg-slate-50' },
};

export default function NotificationsPanel({ onClose }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyAlerts()
      .then((data) => { setAlerts(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllAlertsRead();
      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    } catch { /* graceful */ }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markAlertRead(id);
      setAlerts((prev) => prev.map((a) => a._id === id ? { ...a, read: true } : a));
    } catch { /* graceful */ }
  };

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-teal-600" />
            <h2 className="font-bold text-slate-800 text-sm">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-teal-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-teal-600 hover:text-teal-800 flex items-center gap-1"
              >
                <CheckCheck size={12} /> Mark all read
              </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-slate-400 text-sm">Loading…</div>
          ) : alerts.length === 0 ? (
            <div className="p-8 text-center">
              <Bell size={32} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No notifications yet.</p>
              <p className="text-slate-300 text-xs mt-1">Alerts will appear here when your queue status changes.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {alerts.map((alert) => {
                const cfg = TYPE_CONFIG[alert.type] || TYPE_CONFIG.default;
                return (
                  <div
                    key={alert._id}
                    onClick={() => !alert.read && handleMarkRead(alert._id)}
                    className={`px-5 py-4 cursor-pointer transition hover:bg-slate-50 ${!alert.read ? 'bg-teal-50/30' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.color}`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug ${!alert.read ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {alert.stationId?.name && (
                            <span className="text-[10px] text-slate-400">{alert.stationId.name}</span>
                          )}
                          <span className="text-[10px] text-slate-300">
                            {new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      {!alert.read && (
                        <div className="w-2 h-2 bg-teal-500 rounded-full shrink-0 mt-1.5" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
