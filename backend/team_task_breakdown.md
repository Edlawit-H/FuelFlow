# FuelFlow — Team Task Breakdown (MVP)
**Stack:** Node.js · Express.js · MongoDB Atlas · Mongoose · Socket.IO  
**Structure:** Layered — `models / services / controllers / routes / middleware / config / utils`  
**Split:** Each dev owns specific files — no two devs touch the same file

---

## ⚡ Start Order

```
Dev 1 finishes and merges first → Devs 2, 3, 4, 5, 6 work fully in parallel
```

---

## 👤 Dev 1 — Project Setup + Admin Queue Controller
**Role:** Team Lead / Architect  
**Must finish and merge before anyone else starts.**

### Files you own
`server.js` · `app.js` · `package.json` · `.env.example`  
`config/config.js` · `config/db.js`  
`middleware/authenticate.js` · `middleware/requireRole.js` · `middleware/errorHandler.js`  
`utils/ewt.js`  
`controllers/queue.admin.controller.js` · `routes/queue.admin.routes.js`

### Tasks

**1.1 — Fix `package.json`**
- Remove `"type": "module"` — use CommonJS (`require` / `module.exports`)
- Set `"main": "server.js"`
- Add scripts:
  ```json
  "start": "node server.js",
  "dev": "nodemon server.js",
  "test": "jest"
  ```

**1.2 — Create `.env.example`**
```
PORT=5000
MONGODB_URI=
JWT_SECRET=
JWT_EXPIRES_IN=7d
FCM_SERVER_KEY=
DEFAULT_SERVE_TIME_MINUTES=5
DEFAULT_TIMEOUT_WINDOW_MINUTES=15
DEFAULT_RADIUS_KM=10
NOTIFICATION_THRESHOLD=3
RECOMMENDATION_W1=1
RECOMMENDATION_W2=1
RECOMMENDATION_W3=10
RECOMMENDATION_W4=2
```

**1.3 — Create `config/config.js`**
- Load `.env` with `require('dotenv').config()`
- Export a frozen config object with all values and documented defaults

**1.4 — Create `config/db.js`**
- Export `connectDB()` — calls `mongoose.connect(config.mongodbUri)`
- Log success; `process.exit(1)` on fatal error

**1.5 — Create `utils/ewt.js`**
```js
function calculateEWT(position, serveTimeMinutes) {
  return (position - 1) * serveTimeMinutes;
}
module.exports = { calculateEWT };
```

**1.6 — Create `middleware/errorHandler.js`**
- Export `AppError` class: `new AppError(statusCode, message, details)`
- Export `errorHandler(err, req, res, next)` — always returns `{ error, details }`

**1.7 — Create `middleware/authenticate.js`**
- Read JWT from `Authorization: Bearer <token>`
- Verify with `config.jwtSecret`; attach `req.user = { id, role }` on success
- Return `AppError(401)` on failure or expiry

**1.8 — Create `middleware/requireRole.js`**
- Export `requireRole(...roles)` factory
- Returns middleware that checks `req.user.role`; returns 403 if not allowed

**1.9 — Create `app.js`**
- Mount `cors()`, `express.json()`
- Import and mount all routers under `/api/v1`
- Mount `errorHandler` last

**1.10 — Create `server.js`**
- Call `connectDB()`
- Create HTTP server from app
- Attach Socket.IO; call `realtimeService.init(io)`
- Listen on `config.port`

**1.11 — Create `controllers/queue.admin.controller.js`**

> Note: This controller calls functions from Dev 4's `queue.service.js`. Dev 4 writes the logic; Dev 1 wires the HTTP layer.

- `getQueueList` → call `queueService.getQueueList(stationId, fuelType, adminId)` → return 200
- `pauseQueue` → call `queueService.pauseQueue(stationId, fuelType, adminId)` → return 200
- `resumeQueue` → call `queueService.resumeQueue(stationId, fuelType, adminId)` → return 200
- `setFuelAvailability` → validate body → call `queueService.setFuelAvailability(...)` → return 200
- `setServeTime` → validate body → call `queueService.setServeTime(...)` → return 200
- `serveUser` → call `queueService.serveUser(stationId, fuelType, entryId, adminId)` → return 200
- `removeNoShow` → call `queueService.removeNoShow(stationId, fuelType, entryId, adminId)` → return 200

**1.12 — Create `routes/queue.admin.routes.js`**

All routes use `authenticate` + `requireRole('station_admin')`

| Method | Path | Handler |
|---|---|---|
| GET | `/stations/:id/queues/:fuelType` | getQueueList |
| POST | `/stations/:id/queues/:fuelType/pause` | pauseQueue |
| POST | `/stations/:id/queues/:fuelType/resume` | resumeQueue |
| PATCH | `/stations/:id/queues/:fuelType/availability` | setFuelAvailability |
| PATCH | `/stations/:id/queues/:fuelType/serve-time` | setServeTime |
| POST | `/stations/:id/queues/:fuelType/entries/:entryId/serve` | serveUser |
| POST | `/stations/:id/queues/:fuelType/entries/:entryId/no-show` | removeNoShow |

Export router only.

---

---

## 👤 Dev 2 — Authentication
**Role:** Auth Developer

### Files you own
`models/User.js` · `services/auth.service.js` · `controllers/auth.controller.js` · `routes/auth.routes.js`

### Tasks

**2.1 — Create `models/User.js`**

| Field | Type | Notes |
|---|---|---|
| `phoneOrEmail` | String | unique, required |
| `passwordHash` | String | required |
| `role` | String | enum: `user` / `station_admin`, default `user` |
| `fcmToken` | String | optional — for push notifications |
| `createdAt` | Date | default now |

Export `User` model.

**2.2 — Create `services/auth.service.js`**
- `register({ phoneOrEmail, password, role })` — bcrypt hash (rounds=10); create User; throw `AppError(409)` on duplicate
- `login({ phoneOrEmail, password })` — find user; bcrypt compare; throw `AppError(401)` on mismatch; return signed JWT `{ id, role }`
- `updateFcmToken(userId, fcmToken)` — update user's fcmToken field

**2.3 — Create `controllers/auth.controller.js`**
- `register` → validate → call service → `201 { message, userId }`
- `login` → validate → call service → `200 { token }`
- `registerAdmin` → same as register but forces `role = 'station_admin'`

**2.4 — Create `routes/auth.routes.js`**

| Method | Path | Handler |
|---|---|---|
| POST | `/register` | register |
| POST | `/login` | login |
| POST | `/register-admin` | registerAdmin |

Export router only — Dev 1 mounts it.

---

---

## 👤 Dev 3 — Station Discovery & Recommendation
**Role:** Station Feature Developer

### Files you own
`models/Station.js` · `services/station.service.js` · `controllers/station.controller.js` · `routes/station.routes.js`

### Tasks

**3.1 — Create `models/Station.js`**

| Field | Type | Notes |
|---|---|---|
| `adminId` | ObjectId | ref: User, required |
| `name` | String | required |
| `address` | String | required |
| `location` | GeoJSON Point | `{ type: 'Point', coordinates: [lng, lat] }` |
| `fuelTypes` | [String] | e.g. `['petrol', 'diesel']` |
| `createdAt` | Date | default now |

Add `2dsphere` index on `location`. Export `Station` model.

**3.2 — Create `services/station.service.js`**
- `createStation(adminId, data)` — create Station; for each fuelType create a Queue document (import `Queue` model read-only)
- `updateStation(stationId, adminId, data)` — verify adminId matches; update name/address only
- `getStation(stationId)` — return station + per-fuel-type queue summary (length, EWT, fuelAvailable, isPaused)
- `listStations({ lat, lng, radiusKm })` — `$nearSphere` within radius; fallback to all sorted by name; include queue summary per fuel type; rank available above unavailable
- `getRecommendations({ lat, lng, fuelType })` — score: `(w1/queueLength) + (w2/ewt) + (w3*fuelAvailable) + (w4/distanceKm)`; sort descending; guard division by zero

**3.3 — Create `controllers/station.controller.js`**
One function per route. Validate with express-validator. Call service. Return correct status.

**3.4 — Create `routes/station.routes.js`**

| Method | Path | Role | Handler |
|---|---|---|---|
| POST | `/stations` | station_admin | createStation |
| PATCH | `/stations/:id` | station_admin | updateStation |
| GET | `/stations` | user | listStations |
| GET | `/stations/recommendations` | user | getRecommendations |
| GET | `/stations/:id` | user | getStation |

All routes use `authenticate`. Write routes use `requireRole('station_admin')`. Export router only.

---

---

## 👤 Dev 4 — Queue Models + User Actions + All Service Logic
**Role:** Queue Feature Developer

### Files you own
`models/Queue.js` · `models/QueueEntry.js` · `services/queue.service.js`  
`controllers/queue.user.controller.js` · `routes/queue.user.routes.js`

> Note: `services/queue.service.js` contains ALL queue logic — both user and admin functions. Dev 1's admin controller calls your service functions. You write the logic; Dev 1 wires the admin HTTP layer.

### Tasks

**4.1 — Create `models/Queue.js`**

| Field | Type | Notes |
|---|---|---|
| `stationId` | ObjectId | ref: Station, required |
| `fuelType` | String | required — `'petrol'` or `'diesel'` |
| `isPaused` | Boolean | default false |
| `fuelAvailable` | Boolean | default true |
| `serveTimeMinutes` | Number | default 5 |
| `timeoutWindowMinutes` | Number | default 15 |
| `counter` | Number | default 0 — atomic position counter |
| `createdAt` | Date | default now |

Unique compound index: `{ stationId: 1, fuelType: 1 }`

**4.2 — Create `models/QueueEntry.js`**

| Field | Type | Notes |
|---|---|---|
| `queueId` | ObjectId | ref: Queue, required |
| `stationId` | ObjectId | ref: Station, required |
| `userId` | ObjectId | ref: User, required |
| `fuelType` | String | required |
| `position` | Number | required |
| `status` | String | enum: active / served / left / no_show |
| `noShowEligible` | Boolean | default false |
| `joinedAt` | Date | default now |
| `servedAt` | Date | optional |
| `estimatedWaitMinutes` | Number | |

Indexes: `{ queueId:1, position:1 }` and `{ userId:1, status:1 }`

**4.3 — Create `services/queue.service.js` — user actions**

`joinQueue(userId, stationId, fuelType)`:
1. Check no active QueueEntry for user → `AppError(409, 'Already in a queue')`
2. Atomic: `Queue.findOneAndUpdate({ stationId, fuelType, fuelAvailable:true, isPaused:false }, { $inc:{counter:1} }, { new:true })` → 409 with reason if null
3. Create QueueEntry with position + EWT (use `calculateEWT` from `utils/ewt.js`)
4. Call `tokenService.createToken(...)` directly
5. Return `{ entry, token }`

`leaveQueue(userId, stationId, fuelType)`:
1. Find active entry; set `status='left'`
2. Decrement positions of all higher entries; recalculate EWT
3. Call `tokenService.invalidateToken(entryId)`
4. Call `notificationService.send(userId, 'queue_left', '...')`
5. Call `realtimeService.pushPositionUpdate(...)` for affected users

`getMyStatus(userId)` — return user's active QueueEntry with position, EWT, fuelType, stationId

**4.4 — Create `services/queue.service.js` — admin actions (called by Dev 1's controller)**

| Function | What it does |
|---|---|
| `serveUser(stationId, fuelType, entryId, adminId)` | Verify admin owns station; mark served; decrement positions; recalculate EWT; push updates; notify next user |
| `removeNoShow(stationId, fuelType, entryId, adminId)` | Mark no_show; decrement; recalculate EWT; notify removed user; push updates |
| `pauseQueue(stationId, fuelType, adminId)` | Set isPaused=true; notify all users in queue |
| `resumeQueue(stationId, fuelType, adminId)` | Set isPaused=false |
| `setFuelAvailability(stationId, fuelType, adminId, bool)` | Update fuelAvailable; if false notify all users in queue |
| `setServeTime(stationId, fuelType, adminId, minutes)` | Update serveTimeMinutes; recalculate EWT for all active entries |
| `getQueueList(stationId, fuelType, adminId)` | Return active entries sorted by position with noShowEligible + elapsed time |
| `runNoShowDetection()` | setInterval every 60s on module load; flag entries at position 1 past timeout window |

**4.5 — Create `controllers/queue.user.controller.js`**
- `joinQueue` → validate → call service → return `201 { entry, token }`
- `leaveQueue` → call service → return 200
- `getMyStatus` → call service → return 200

**4.6 — Create `routes/queue.user.routes.js`**

| Method | Path | Role | Handler |
|---|---|---|---|
| POST | `/stations/:id/queues/:fuelType/join` | user | joinQueue |
| DELETE | `/stations/:id/queues/:fuelType/leave` | user | leaveQueue |
| GET | `/queue/my-status` | user | getMyStatus |

All routes use `authenticate`. Export router only.

---

---

## 👤 Dev 5 — Token & Fraud Prevention
**Role:** Token Developer

### Files you own
`models/Token.js` · `services/token.service.js` · `controllers/token.controller.js` · `routes/token.routes.js`

### Tasks

**5.1 — Create `models/Token.js`**

| Field | Type | Notes |
|---|---|---|
| `tokenId` | String | unique, required — `crypto.randomUUID()` |
| `userId` | ObjectId | ref: User, required |
| `stationId` | ObjectId | ref: Station, required |
| `queueEntryId` | ObjectId | ref: QueueEntry, required |
| `fuelType` | String | required |
| `status` | String | enum: active / used / invalidated, default active |
| `qrPayload` | String | JSON string — client renders as QR code |
| `issuedAt` | Date | default now |

Export `Token` model.

**5.2 — Create `services/token.service.js`**

`createToken({ userId, stationId, queueEntryId, fuelType, joinedAt })`:
- `tokenId = require('crypto').randomUUID()`
- `qrPayload = JSON.stringify({ tokenId, stationId, fuelType, issuedAt: new Date() })`
- Create and return Token document

`validateToken(tokenId, adminStationId)`:
1. Find token → `AppError(404, 'Token not found')`
2. Check stationId matches → `AppError(403, 'Wrong station')`
3. Check `status === 'active'` → `AppError(409, 'Token already used')`
4. Find QueueEntry; check `position === 1` → `AppError(409, 'Not your turn yet')`
5. Set `status = 'used'`; save
6. Return `{ position, joinedAt, fuelType }`

`invalidateToken(queueEntryId)` — find by queueEntryId; set `status='invalidated'`

**5.3 — Create `controllers/token.controller.js`**
- `validateToken` → call service → return result or descriptive error

**5.4 — Create `routes/token.routes.js`**

| Method | Path | Role | Handler |
|---|---|---|---|
| POST | `/tokens/validate` | station_admin | validateToken |

Export router only.

---

---

## 👤 Dev 6 — Notifications & Real-Time
**Role:** Notifications & WebSocket Developer

### Files you own
`models/Notification.js` · `services/notification.service.js` · `services/realtime.service.js`  
`controllers/notification.controller.js` · `routes/notification.routes.js`

### Tasks

**6.1 — Create `models/Notification.js`**

| Field | Type | Notes |
|---|---|---|
| `userId` | ObjectId | ref: User, required |
| `type` | String | enum: approaching_turn / your_turn / queue_paused / no_show_removed / queue_left / fuel_unavailable |
| `message` | String | |
| `read` | Boolean | default false |
| `createdAt` | Date | default now |

Export `Notification` model.

**6.2 — Create `services/notification.service.js`**

`send(userId, type, message)`:
- Create Notification document (in-app inbox — always saved)
- Import `User` model (read-only); fetch `fcmToken`
- Attempt FCM push via `config.fcmServerKey`; silently skip if no fcmToken

`sendToAllInQueue(queueId, type, message)`:
- Import `QueueEntry` model (read-only); find all active entries for queueId
- Call `send()` for each user

**6.3 — Create `services/realtime.service.js`**

`init(io)` — called by Dev 1's `server.js`:
- On `connection`: verify JWT from `socket.handshake.auth.token`; store `userId → socket` in a `Map`
- Import `QueueEntry` model (read-only); if user has active entry, immediately emit `position_update`
- On `disconnect`: remove from Map

`pushPositionUpdate(userId, data)`:
- Find socket for userId; emit `position_update` with `{ position, estimatedWaitMinutes, fuelType, stationId }`
- Silently skip if no active socket (client uses `GET /queue/my-status` as fallback)

**6.4 — Create `controllers/notification.controller.js`**
- `getNotifications` → return all for `req.user.id` sorted by createdAt desc
- `markRead` → set `read=true` on notification owned by user

**6.5 — Create `routes/notification.routes.js`**

| Method | Path | Role | Handler |
|---|---|---|---|
| GET | `/notifications` | user | getNotifications |
| PATCH | `/notifications/:id/read` | user | markRead |

Export router only.

---

---

## 📡 Cross-Module Call Summary

| Caller | Calls | Method |
|---|---|---|
| Dev 1 `queue.admin.controller` | Dev 4 `queue.service` | All admin functions |
| Dev 4 `queue.service` | Dev 5 `token.service` | `createToken()`, `invalidateToken()` |
| Dev 4 `queue.service` | Dev 6 `notification.service` | `send()`, `sendToAllInQueue()` |
| Dev 4 `queue.service` | Dev 6 `realtime.service` | `pushPositionUpdate()` |
| Dev 3 `station.service` | Dev 4 `Queue` model | Read queue length for discovery |
| Dev 6 `notification.service` | Dev 2 `User` model | Read fcmToken for push |
| Dev 6 `notification.service` | Dev 4 `QueueEntry` model | Bulk notify all users in queue |
| Dev 6 `realtime.service` | Dev 4 `QueueEntry` model | Read position on WebSocket connect |

---
