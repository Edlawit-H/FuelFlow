import { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Zap, Car, Route, X, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../services/api';

const VEHICLE_TYPES = ['motorcycle', 'car', 'suv', 'truck'];

export default function AIInsightsPanel({ stationId, fuelType, onClose }) {
  const [shortageRisk, setShortageRisk] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [consumption, setConsumption] = useState(null);
  const [travelSuggestions, setTravelSuggestions] = useState(null);
  const [vehicleType, setVehicleType] = useState('car');
  const [distanceKm, setDistanceKm] = useState(20);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState('risk');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [risk, fc, travel] = await Promise.allSettled([
          stationId && fuelType ? api.aiShortageRisk(stationId, fuelType) : Promise.resolve(null),
          stationId && fuelType ? api.aiDemandForecast(stationId, fuelType) : Promise.resolve([]),
          api.aiTravelSuggestions({ fuelType }),
        ]);
        if (risk.status === 'fulfilled') setShortageRisk(risk.value);
        if (fc.status === 'fulfilled') setForecast(fc.value || []);
        if (travel.status === 'fulfilled') setTravelSuggestions(travel.value);
      } catch { /* graceful */ }
      setLoading(false);
    };
    load();
  }, [stationId, fuelType]);

  const handleEstimate = async () => {
    try {
      const result = await api.aiFuelConsumption({ vehicleType, distanceKm });
      setConsumption(result);
    } catch { /* graceful */ }
  };

  const riskColor = {
    low: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    medium: 'text-amber-600 bg-amber-50 border-amber-200',
    high: 'text-red-600 bg-red-50 border-red-200',
    unknown: 'text-slate-500 bg-slate-50 border-slate-200',
  };

  const toggle = (s) => setExpandedSection((v) => (v === s ? null : s));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <Brain size={18} className="text-violet-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-800 text-sm">AI Insights</h2>
              <p className="text-[10px] text-slate-400">Powered by FuelFlow Intelligence</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Analyzing data…</div>
        ) : (
          <div className="p-4 space-y-3">

            {/* Shortage Risk */}
            {shortageRisk && (
              <Section
                icon={<AlertTriangle size={16} />}
                title="Fuel Shortage Risk"
                expanded={expandedSection === 'risk'}
                onToggle={() => toggle('risk')}
                badge={shortageRisk.risk}
                badgeClass={riskColor[shortageRisk.risk] || riskColor.unknown}
              >
                <div className="space-y-2 text-sm">
                  <p className="text-slate-600">{shortageRisk.message}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Stat label="Queue Length" value={shortageRisk.queueLength ?? '—'} />
                    <Stat label="Avg Joins/hr" value={shortageRisk.avgJoinsPerHour ?? '—'} />
                  </div>
                  {shortageRisk.accelerating && (
                    <p className="text-amber-600 text-xs font-semibold">⚠ Demand is accelerating</p>
                  )}
                </div>
              </Section>
            )}

            {/* Demand Forecast */}
            {forecast.length > 0 && (
              <Section
                icon={<TrendingUp size={16} />}
                title="6-Hour Demand Forecast"
                expanded={expandedSection === 'forecast'}
                onToggle={() => toggle('forecast')}
              >
                <div className="space-y-2">
                  {forecast.map((f) => (
                    <div key={f.hour} className="flex items-center gap-3">
                      <span className="text-xs text-slate-500 w-12 shrink-0">
                        {String(f.hour).padStart(2, '0')}:00
                      </span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-violet-400 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (f.predictedJoins / 20) * 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 w-8 text-right">
                        {f.predictedJoins}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        f.confidence === 'high' ? 'bg-emerald-100 text-emerald-700'
                        : f.confidence === 'medium' ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-500'
                      }`}>
                        {f.confidence}
                      </span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Travel Suggestions */}
            {travelSuggestions && (
              <Section
                icon={<Route size={16} />}
                title="Smart Travel Suggestions"
                expanded={expandedSection === 'travel'}
                onToggle={() => toggle('travel')}
              >
                <div className="space-y-3">
                  {travelSuggestions.fuelEfficient && (
                    <SuggestionCard
                      label="Fuel Efficient"
                      color="emerald"
                      station={travelSuggestions.fuelEfficient.stationName}
                      distance={travelSuggestions.fuelEfficient.distanceKm}
                      ewt={travelSuggestions.fuelEfficient.ewt}
                      reason={travelSuggestions.fuelEfficient.reason}
                    />
                  )}
                  {travelSuggestions.timeEfficient && (
                    <SuggestionCard
                      label="Time Efficient"
                      color="blue"
                      station={travelSuggestions.timeEfficient.stationName}
                      distance={travelSuggestions.timeEfficient.distanceKm}
                      ewt={travelSuggestions.timeEfficient.ewt}
                      reason={travelSuggestions.timeEfficient.reason}
                    />
                  )}
                  {travelSuggestions.alternatives?.length > 0 && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
                      <p className="text-xs font-bold text-amber-700 mb-1">Alternative Options</p>
                      <ul className="space-y-1">
                        {travelSuggestions.alternatives.map((a, i) => (
                          <li key={i} className="text-xs text-amber-600">• {a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Fuel Consumption Estimator */}
            <Section
              icon={<Car size={16} />}
              title="Fuel Consumption Estimator"
              expanded={expandedSection === 'consumption'}
              onToggle={() => toggle('consumption')}
            >
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Vehicle Type</label>
                    <select
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/20"
                    >
                      {VEHICLE_TYPES.map((v) => (
                        <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Distance (km)</label>
                    <input
                      type="number"
                      value={distanceKm}
                      onChange={(e) => setDistanceKm(Number(e.target.value))}
                      min={1}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                </div>
                <button
                  onClick={handleEstimate}
                  className="w-full bg-violet-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-violet-700 transition flex items-center justify-center gap-2"
                >
                  <Zap size={14} /> Estimate
                </button>
                {consumption && (
                  <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 grid grid-cols-2 gap-2">
                    <Stat label="Litres Needed" value={`${consumption.litresNeeded} L`} />
                    <Stat label="Rate" value={`${consumption.consumptionRatePer100km} L/100km`} />
                  </div>
                )}
              </div>
            </Section>

          </div>
        )}
      </div>
    </div>
  );
}

function Section({ icon, title, badge, badgeClass, expanded, onToggle, children }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition"
      >
        <div className="flex items-center gap-2 text-slate-700">
          <span className="text-violet-500">{icon}</span>
          <span className="text-sm font-semibold">{title}</span>
          {badge && (
            <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase ${badgeClass}`}>
              {badge}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
      </button>
      {expanded && <div className="px-4 py-3">{children}</div>}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[9px] font-bold text-slate-400 uppercase">{label}</p>
      <p className="text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

function SuggestionCard({ label, color, station, distance, ewt, reason }) {
  const colors = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
  };
  return (
    <div className={`border rounded-xl p-3 ${colors[color]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-bold uppercase">{label}</span>
        <span className="text-xs font-bold">{ewt} min wait</span>
      </div>
      <p className="text-sm font-semibold">{station}</p>
      <p className="text-xs opacity-70">{distance} km away · {reason}</p>
    </div>
  );
}
