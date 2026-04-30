import React from 'react';
import { X, Globe, Moon, Bell, Shield } from 'lucide-react';
import { useLang, LANGUAGES } from '../context/LanguageContext';

const SettingsPanel = ({ onClose }) => {
  const { t, lang, setLang } = useLang();

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
          <h2 className="font-bold text-slate-800">{t.settings}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Language Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Globe size={16} className="text-teal-600" />
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.language}</h3>
            </div>
            <div className="space-y-2">
              {Object.values(LANGUAGES).map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition ${
                    lang === l.code
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="text-left">
                    <p className={`text-sm font-bold ${lang === l.code ? 'text-teal-700' : 'text-slate-700'}`}>
                      {l.name}
                    </p>
                    <p className="text-[10px] text-slate-400">{l.label}</p>
                  </div>
                  {lang === l.code && (
                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Other settings (UI only) */}
          <section className="space-y-3">
            <ToggleRow icon={<Bell size={15} className="text-slate-500" />} label="Push Notifications" defaultOn />
            <ToggleRow icon={<Moon size={15} className="text-slate-500" />} label="Dark Mode" defaultOn={false} />
            <ToggleRow icon={<Shield size={15} className="text-slate-500" />} label="Location Access" defaultOn />
          </section>
        </div>
      </div>
    </>
  );
};

const ToggleRow = ({ icon, label, defaultOn }) => {
  const [on, setOn] = React.useState(defaultOn);
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <button
        type="button"
        onClick={() => setOn((v) => !v)}
        aria-label={`Toggle ${label}`}
        className={`w-9 h-5 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 ${on ? 'bg-teal-500' : 'bg-slate-300'}`}
      >
        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${on ? 'right-0.5' : 'left-0.5'}`} />
      </button>
    </div>
  );
};

export default SettingsPanel;
