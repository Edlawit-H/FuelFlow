import React, { useState } from 'react';
import { X, Bell, CheckCheck, Fuel, Clock, AlertTriangle } from 'lucide-react';
import { useLang } from '../context/LanguageContext';

const MOCK_NOTIFICATIONS = [
  { id: 1, icon: 'turn', title: 'Your turn is approaching', body: 'Prepare to enter Pump #4 — approx. 4 minutes.', time: '2 min ago', read: false },
  { id: 2, icon: 'fuel', title: 'Fuel available', body: 'Central Plaza Station now has petrol available.', time: '15 min ago', read: false },
  { id: 3, icon: 'alert', title: 'Queue paused', body: 'Northside Hub diesel queue has been paused.', time: '1 hr ago', read: true },
];

const iconMap = {
  turn: <Clock size={16} className="text-orange-500" />,
  fuel: <Fuel size={16} className="text-teal-500" />,
  alert: <AlertTriangle size={16} className="text-red-400" />,
};

const NotificationsPanel = ({ onClose }) => {
  const { t } = useLang();
  const [items, setItems] = useState(MOCK_NOTIFICATIONS);

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-teal-600" />
            <h2 className="font-bold text-slate-800">{t.notifications}</h2>
            {unreadCount > 0 && (
              <span className="bg-teal-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Mark all read */}
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-teal-600 hover:bg-teal-50 transition border-b border-slate-100"
          >
            <CheckCheck size={14} /> {t.markAllRead}
          </button>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {items.length === 0 ? (
            <p className="text-center text-slate-400 text-sm py-12">{t.noNotifications}</p>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                onClick={() => setItems((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))}
                className={`w-full text-left px-5 py-4 flex gap-3 hover:bg-slate-50 transition ${!n.read ? 'bg-teal-50/40' : ''}`}
              >
                <div className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                  {iconMap[n.icon]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{n.body}</p>
                  <p className="text-[10px] text-slate-300 mt-1 font-medium">{n.time}</p>
                </div>
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationsPanel;
