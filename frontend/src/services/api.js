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
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
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
};
