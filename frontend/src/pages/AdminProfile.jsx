import React from 'react';
import { Camera, Save } from 'lucide-react';

const AdminProfile = () => {
  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Station Profile</h1>
      
      <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-8">
        {/* Profile Pic Section */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center relative border-2 border-dashed border-slate-200">
             <Camera className="text-slate-400" />
             <button className="absolute -bottom-2 -right-2 bg-teal-600 text-white p-1.5 rounded-lg border-2 border-white"><Save size={14}/></button>
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Station Banner</h3>
            <p className="text-xs text-slate-400">Upload a high-quality photo of your station entrance.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Station Name</label>
            <input type="text" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none transition" defaultValue="Central Metro Station" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Contact Number</label>
            <input type="text" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none transition" defaultValue="+1 234 567 890" />
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Full Address</label>
            <textarea className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-teal-500/20 outline-none transition h-24">123 Energy Way, Downtown District, Metropolis</textarea>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button className="bg-[#14b8a6] text-white px-8 py-3 rounded-xl font-bold">Update Profile</button>
        </div>
      </div>
    </div>
  );
};
export default AdminProfile;