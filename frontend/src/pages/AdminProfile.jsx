import { useState } from 'react';
import { Camera, Save, CheckCircle2 } from 'lucide-react';
import { useLang } from '../context/LanguageContext';
import AdminLayout from '../components/AdminLayout';

const AdminProfile = () => {
  const { t } = useLang();
  const [stationName, setStationName] = useState('Central Metro Station');
  const [contact, setContact] = useState('+251 900 000 001');
  const [address, setAddress] = useState('123 Energy Way, Downtown District');
  const [saved, setSaved] = useState(false);

  const handleUpdate = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AdminLayout title="Station Profile" backTo="/admin/dashboard" backLabel="Back to Dashboard">
      <div className="p-6 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-lg font-bold text-slate-100">Station Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your station's public information</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          {/* Banner upload */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center relative border-2 border-dashed border-slate-700">
              <Camera className="text-slate-500" size={22} />
              <button
                type="button"
                className="absolute -bottom-2 -right-2 bg-teal-600 text-white p-1.5 rounded-lg border-2 border-slate-900"
                aria-label="Upload station banner"
              >
                <Save size={12} />
              </button>
            </div>
            <div>
              <p className="font-semibold text-slate-200 text-sm">Station Banner</p>
              <p className="text-xs text-slate-500 mt-0.5">Upload a photo of your station entrance.</p>
            </div>
          </div>

          {/* Fields */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Station Name</label>
              <input
                type="text"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contact Number</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition"
              />
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Address</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition resize-none"
              />
            </div>
          </div>

          {saved && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
              <CheckCircle2 size={16} /> Profile updated successfully
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={handleUpdate}
              className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition"
            >
              {t.updateProfile || 'Update Profile'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
