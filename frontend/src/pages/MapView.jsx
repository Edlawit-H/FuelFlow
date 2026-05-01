import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Fuel, Users, AlertTriangle, CheckCircle, PauseCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

/**
 * MapView — OpenStreetMap via Leaflet (no API key required).
 * Leaflet is loaded dynamically to avoid SSR issues.
 */
export default function MapView() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const [stations, setStations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leafletReady, setLeafletReady] = useState(false);

  // Dynamically load Leaflet CSS + JS
  useEffect(() => {
    if (document.getElementById('leaflet-css')) {
      setLeafletReady(true);
      return;
    }
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setLeafletReady(true);
    document.head.appendChild(script);
  }, []);

  // Fetch stations
  useEffect(() => {
    api.listStations()
      .then((data) => { setStations(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Init map once Leaflet is ready
  useEffect(() => {
    if (!leafletReady || !mapRef.current || leafletMapRef.current) return;
    const L = window.L;
    const map = L.map(mapRef.current).setView([9.03, 38.74], 12); // Addis Ababa default

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    leafletMapRef.current = map;
  }, [leafletReady]);

  // Add/update markers when stations change
  useEffect(() => {
    if (!leafletReady || !leafletMapRef.current || stations.length === 0) return;
    const L = window.L;
    const map = leafletMapRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    stations.forEach((station) => {
      const coords = station.location?.coordinates;
      if (!coords || coords.length < 2) return;

      const [lng, lat] = coords;
      const queues = station.queues || [];
      const hasAvailable = queues.some((q) => q.fuelAvailable && !q.isPaused);
      const minWait = queues
        .filter((q) => q.fuelAvailable && !q.isPaused)
        .reduce((min, q) => Math.min(min, q.estimatedWaitMinutes ?? 999), 999);
      const congestion = queues.reduce((sum, q) => sum + (q.queueLength || 0), 0);

      const color = !hasAvailable ? '#ef4444' : congestion > 15 ? '#f59e0b' : '#10b981';

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          background:${color};
          color:white;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          width:32px;height:32px;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
          border:2px solid white;
        ">
          <span style="transform:rotate(45deg);font-size:14px;">⛽</span>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([lat, lng], { icon })
        .addTo(map)
        .on('click', () => setSelected(station));

      markersRef.current.push(marker);
    });

    // Fit bounds if we have markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.2));
    }
  }, [stations, leafletReady]);

  const handleRefresh = async () => {
    try {
      const data = await api.listStations();
      setStations(data);
    } catch { /* keep previous */ }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-teal-600 transition text-sm font-semibold"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h1 className="font-bold text-slate-800 text-sm">Live Station Map</h1>
        <button onClick={handleRefresh} className="text-slate-400 hover:text-teal-600 transition">
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-20">
            <p className="text-slate-500 text-sm">Loading map…</p>
          </div>
        )}
        <div ref={mapRef} className="w-full h-full" />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-xl shadow-lg p-3 z-[1000] text-xs space-y-1.5">
          <p className="font-bold text-slate-700 text-[10px] uppercase mb-2">Legend</p>
          <LegendItem color="#10b981" label="Available" />
          <LegendItem color="#f59e0b" label="High Congestion" />
          <LegendItem color="#ef4444" label="No Fuel" />
        </div>
      </div>

      {/* Station Detail Panel */}
      {selected && (
        <div className="bg-white border-t border-slate-200 p-4 z-10">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-bold text-slate-800">{selected.name}</h2>
              <p className="text-xs text-slate-500">{selected.address}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
          </div>
          <div className="flex gap-3 flex-wrap">
            {(selected.queues || []).map((q) => (
              <div key={q.fuelType} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <Fuel size={14} className={q.fuelAvailable ? 'text-emerald-500' : 'text-red-400'} />
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{q.fuelType}</p>
                  <p className="text-xs font-semibold text-slate-700">
                    {!q.fuelAvailable ? 'No Fuel' : q.isPaused ? 'Paused' : `${q.estimatedWaitMinutes ?? 0} min wait`}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Users size={12} />
                  <span className="text-xs">{q.queueLength}</span>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate(`/driver/station/${selected._id}`)}
            className="mt-3 w-full bg-teal-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-teal-700 transition"
          >
            View Station & Join Queue
          </button>
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full" style={{ background: color }} />
      <span className="text-slate-600">{label}</span>
    </div>
  );
}
