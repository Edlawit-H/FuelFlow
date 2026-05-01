const BASE = '/api/v1';

function getToken() {
  return localStorage.getItem('ff_token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // 401 — token expired or invalid, clear it so the app redirects to login
    if (res.status === 401) {
      localStorage.removeItem('ff_token');
    }
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}

export const api = {
  // Auth
  login: (body) => request('POST', '/auth/login', body),
  register: (body) => request('POST', '/auth/register', body),
  registerAdmin: (body) => request('POST', '/auth/register-admin', body),
  getMe: () => request('GET', '/auth/me'),
  updateMe: (body) => request('PATCH', '/auth/me', body),

  // Stations
  listStations: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/stations${q ? '?' + q : ''}`);
  },
  getStation: (id) => request('GET', `/stations/${id}`),
  getRecommendations: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/stations/recommendations${q ? '?' + q : ''}`);
  },
  createStation: (body) => request('POST', '/stations', body),
  updateStation: (id, body) => request('PATCH', `/stations/${id}`, body),

  // Queue — user
  joinQueue: (stationId, fuelType) =>
    request('POST', `/stations/${stationId}/queues/${fuelType}/join`),
  leaveQueue: (stationId, fuelType) =>
    request('DELETE', `/stations/${stationId}/queues/${fuelType}/leave`),
  getMyStatus: () => request('GET', '/queue/my-status'),

  // Queue — admin
  getQueueList: (stationId, fuelType) =>
    request('GET', `/stations/${stationId}/queues/${fuelType}`),
  pauseQueue: (stationId, fuelType) =>
    request('POST', `/stations/${stationId}/queues/${fuelType}/pause`),
  resumeQueue: (stationId, fuelType) =>
    request('POST', `/stations/${stationId}/queues/${fuelType}/resume`),
  setFuelAvailability: (stationId, fuelType, fuelAvailable) =>
    request('PATCH', `/stations/${stationId}/queues/${fuelType}/availability`, { fuelAvailable }),
  serveUser: (stationId, fuelType, entryId) =>
    request('POST', `/stations/${stationId}/queues/${fuelType}/entries/${entryId}/serve`),
  removeNoShow: (stationId, fuelType, entryId) =>
    request('POST', `/stations/${stationId}/queues/${fuelType}/entries/${entryId}/no-show`),

  // Tokens
  validateToken: (pinCode, stationId) =>
    request('POST', '/tokens/validate', { pinCode, stationId }),

  // ─── AI Module ───────────────────────────────────────────────────────────
  aiRecommendations: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/ai/recommendations${q ? '?' + q : ''}`);
  },
  aiTravelSuggestions: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/ai/travel-suggestions${q ? '?' + q : ''}`);
  },
  aiFuelConsumption: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request('GET', `/ai/fuel-consumption${q ? '?' + q : ''}`);
  },
  aiShortageRisk: (stationId, fuelType) =>
    request('GET', `/ai/stations/${stationId}/fuel/${fuelType}/shortage-risk`),
  aiDemandForecast: (stationId, fuelType) =>
    request('GET', `/ai/stations/${stationId}/fuel/${fuelType}/demand-forecast`),
  aiCongestion: (stationId, fuelType) =>
    request('GET', `/ai/stations/${stationId}/fuel/${fuelType}/congestion`),

  // ─── Analytics ───────────────────────────────────────────────────────────
  getStationAnalytics: (stationId, days = 7) =>
    request('GET', `/analytics/stations/${stationId}?days=${days}`),
  getGlobalAnalytics: (days = 7) =>
    request('GET', `/analytics/global?days=${days}`),
  getPeakHours: (stationId, fuelType, days = 7) =>
    request('GET', `/analytics/stations/${stationId}/fuel/${fuelType}/peak-hours?days=${days}`),

  // ─── Reservations ────────────────────────────────────────────────────────
  createReservation: (body) => request('POST', '/reservations', body),
  getMyReservations: () => request('GET', '/reservations/my'),
  cancelReservation: (id) => request('DELETE', `/reservations/${id}`),
  getAvailableSlots: (stationId, fuelType, date) =>
    request('GET', `/reservations/slots/${stationId}/${fuelType}?date=${date}`),
  getStationReservations: (stationId, date) =>
    request('GET', `/reservations/station/${stationId}${date ? '?date=' + date : ''}`),

  // ─── Alerts ──────────────────────────────────────────────────────────────
  getMyAlerts: () => request('GET', '/alerts'),
  markAllAlertsRead: () => request('PATCH', '/alerts/read-all'),
  markAlertRead: (id) => request('PATCH', `/alerts/${id}/read`),
};
