import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, Fuel, CheckCircle, X, ArrowLeft, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { useLang } from '../context/LanguageContext';

export default function ReservationPage() {
  const navigate = useNavigate();
  const { t } = useLang();

  const [stations, setStations] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  // Form state
  const [selectedStation, setSelectedStation] = useState('');
  const [selectedFuel, setSelectedFuel] = useState('petrol');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    api.listStations().then(setStations).catch(() => {});
    loadMyReservations();
  }, []);

  useEffect(() => {
    if (selectedStation && selectedFuel && selectedDate) {
      api.getAvailableSlots(selectedStation, selectedFuel, selectedDate)
        .then(setSlots)
        .catch(() => setSlots([]));
    }
  }, [selectedStation, selectedFuel, selectedDate]);

  const loadMyReservations = async () => {
    try {
      const data = await api.getMyReservations();
      setMyReservations(data);
    } catch { /* graceful */ }
  };

  const handleBook = async () => {
    if (!selectedStation || !selectedSlot) {
      setError('Please select a station and time slot');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.createReservation({
        stationId: selectedStation,
        fuelType: selectedFuel,
        slotDate: selectedDate,
        slotHour: selectedSlot,
      });
      setSuccess(res);
      loadMyReservations();
      setSelectedSlot(null);
    } catch (err) {
      setError(err.message || 'Booking failed');
    }
    setLoading(false);
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this reservation?')) return;
    try {
      await api.cancelReservation(id);
      loadMyReservations();
    } catch (err) {
      alert(err.message);
    }
  };

  const stationFuelTypes = stations.find((s) => s._id === selectedStation)?.fuelTypes || ['petrol', 'diesel'];

  // Min date = today
  const today = new Date().toISOString().slice(0, 10);
  const maxDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-teal-600 transition">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-bold text-slate-800">Reserve a Time Slot</h1>
          <p className="text-xs text-slate-400">Book your fueling time in advance</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">

        {/* Success Banner */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle size={20} className="text-emerald-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-emerald-800 text-sm">Reservation Confirmed!</p>
              <p className="text-xs text-emerald-600 mt-1">
                Your PIN: <span className="font-mono font-bold text-lg">{success.pinCode}</span>
              </p>
              <p className="text-xs text-emerald-600">
                Slot: {success.slotDate} at {String(success.slotHour).padStart(2, '0')}:00
              </p>
            </div>
            <button onClick={() => setSuccess(null)} className="text-emerald-400 hover:text-emerald-600">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Booking Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Calendar size={18} className="text-teal-500" /> New Reservation
          </h2>

          {/* Station */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Station</label>
            <select
              value={selectedStation}
              onChange={(e) => { setSelectedStation(e.target.value); setSelectedSlot(null); }}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="">Select a station…</option>
              {stations.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Fuel Type</label>
            <div className="flex gap-2">
              {stationFuelTypes.map((ft) => (
                <button
                  key={ft}
                  onClick={() => { setSelectedFuel(ft); setSelectedSlot(null); }}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition capitalize ${
                    selectedFuel === ft
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Fuel size={14} className="inline mr-1" />{ft}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              min={today}
              max={maxDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(null); }}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Time Slots */}
          {selectedStation && slots.length > 0 && (
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Available Time Slots</label>
              <div className="grid grid-cols-4 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.hour}
                    disabled={slot.isFull}
                    onClick={() => setSelectedSlot(slot.hour)}
                    className={`py-2 rounded-xl border text-xs font-semibold transition ${
                      slot.isFull
                        ? 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed'
                        : selectedSlot === slot.hour
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-teal-50 hover:border-teal-300'
                    }`}
                  >
                    <Clock size={10} className="inline mr-0.5" />
                    {slot.label}
                    <span className="block text-[9px] opacity-70">{slot.isFull ? 'Full' : `${slot.available} left`}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {error && (
            <p className="text-red-500 text-xs font-semibold">{error}</p>
          )}

          <button
            onClick={handleBook}
            disabled={loading || !selectedStation || selectedSlot === null}
            className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Booking…' : 'Confirm Reservation'}
          </button>
        </div>

        {/* My Reservations */}
        {myReservations.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-sm">My Upcoming Reservations</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {myReservations.map((r) => (
                <div key={r._id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{r.stationId?.name || 'Station'}</p>
                    <p className="text-xs text-slate-500">
                      {r.slotDate} at {String(r.slotHour).padStart(2, '0')}:00 · {r.fuelType}
                    </p>
                    <p className="text-xs font-mono text-teal-600 font-bold mt-0.5">PIN: {r.pinCode}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                      r.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700'
                      : r.status === 'pending' ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-500'
                    }`}>
                      {r.status}
                    </span>
                    <button
                      onClick={() => handleCancel(r._id)}
                      className="text-red-400 hover:text-red-600 transition"
                      aria-label="Cancel reservation"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
