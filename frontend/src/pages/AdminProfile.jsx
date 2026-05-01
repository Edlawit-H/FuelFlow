import { useState } from 'react';
import { Camera, Save, CheckCircle2, LogOut, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const AdminProfile = () => {
  const navigate = useNavigate();
  const { t } = useLang();
  const { logout } = useAuth();
  const [stationName, setStationName] = useState('Central Metro Station');
  const [contact, setContact] = useState('+1 234 567 890');
  const [address, setAddress] = useState('123 Energy Way, Downtown District, Metropolis');
  const [saved, setSaved] = useState(false);

  const handleUpdate = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-slate-500"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-2xl font-bold text-slate-900">Station Profile</h1>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-2 text-red-400 hover:text-red-600 font-semibold text-sm transition"
        >
          <LogOut size={16} /> {t.logout}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-8">
        {/* Profile Pic Section */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center relative border-2 border-dashed border-slate-200">
            <Camera className="text-slate-400" />
            <button
              type="button"
              className="absolute -bottom-2 -right-2 bg-teal-600 text-white p-1.5 rounded-lg border-2 border-white"
              aria-label="Upload station banner"
            >
              <Save size={14} />
            </button>
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Station Banner</h3>
            <p className="text-xs text-slate-400">Upload a high-quality photo of your station entrance.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Station Name</label>
            <input
              type="text"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none transition text-sm"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Contact Number</label>
            <input
              type="text"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none transition text-sm"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Full Address</label>
            <textarea
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none transition h-24 text-sm"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        {saved && (
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
            <CheckCircle2 size={16} /> Profile updated successfully
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={handleUpdate}
            className="bg-[#14b8a6] text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-600 transition"
          >
            {t.updateProfile}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
