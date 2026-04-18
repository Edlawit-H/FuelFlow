# FuelFlow — Team Task Breakdown
Stack: Node.js · Express.js · MongoDB Atlas · Mongoose
Real-time: Polling only (no Socket.IO)

---

## Dev 1
### Project Setup + Admin Queue
**Role: Team Lead / Architect**

**Tasks**
- Initialize project with `npm init`, install all dependencies
- Setup Express server with `app.js` and `server.js`
- Configure `.env` with dotenv
- Connect MongoDB with Mongoose in `config/db.js`
- Create `config/config.js` with all env vars and defaults
- Create `middleware/authenticate.js` — verify JWT, attach `req.user`
- Create `middleware/requireRole.js` — block by role, return 403
- Create `middleware/errorHandler.js` — `AppError` class + global error handler
- Create `utils/ewt.js` — `calculateEWT(position, serveTimeMinutes)`
- Setup folder structure for the whole team
- `GET /stations/:id/queues/:fuelType` — return full queue list with noShowEligible flag
- `POST /stations/:id/queues/:fuelType/pause` — set isPaused=true
- `POST /stations/:id/queues/:fuelType/resume` — set isPaused=false
- `PATCH /stations/:id/queues/:fuelType/availability` — toggle fuelAvailable
- `PATCH /stations/:id/queues/:fuelType/serve-time` — update serveTimeMinutes
- `POST /stations/:id/queues/:fuelType/entries/:entryId/serve` — mark user as served
- `POST /stations/:id/queues/:fuelType/entries/:entryId/no-show` — remove no-show

**Libraries**
Express · Mongoose · dotenv · bcryptjs · jsonwebtoken · express-validator · cors · uuid

---

## Dev 2
### Authentication
**Role: Auth Developer**

**Tasks**
- Create `User` schema:
  - `phoneOrEmail` String, unique, required
  - `passwordHash` String, required
  - `role` enum: user / station_admin, default user
  - `fcmToken` String, optional
  - `createdAt` Date, default now
- `POST /auth/register` — validate input, hash password with bcrypt (rounds=10), save user, return 201
- `POST /auth/login` — find user, compare password, return signed JWT `{ id, role }`
- `POST /auth/register-admin` — same as register but forces role = station_admin
- Return 409 on duplicate phoneOrEmail
- Return 401 on wrong password, never return token on failure

**Libraries**
bcryptjs · jsonwebtoken · express-validator

---

## Dev 3
### Station Discovery + Recommendation
**Role: Station Feature Developer**

**Tasks**
- Create `Station` schema:
  - `adminId` ObjectId ref User, required
  - `name` String, required
  - `address` String, required
  - `location` GeoJSON Point `{ type: 'Point', coordinates: [lng, lat] }`
  - `fuelTypes` [String], e.g. ['petrol', 'diesel']
  - `createdAt` Date, default now
  - Add `2dsphere` index on `location`
- `POST /stations` — create station, auto-create one Queue doc per fuelType
- `PATCH /stations/:id` — update name/address only, verify adminId matches
- `GET /stations` — list stations within radius using `$nearSphere`, fallback to all sorted by name, include queue summary per fuel type, rank available above unavailable
- `GET /stations/recommendations` — score each station: `(w1/queueLength) + (w2/ewt) + (w3*fuelAvailable) + (w4/distanceKm)`, sort descending, guard division by zero
- `GET /stations/:id` — return station + per-fuel-type queue summary (length, EWT, fuelAvailable, isPaused)

**Libraries**
express-validator · Mongoose geo queries

---

## Dev 4
### Queue Management (User Side + All Service Logic)
**Role: Queue Feature Developer**

**Tasks**
- Create `Queue` schema:
  - `stationId` ObjectId ref Station, required
  - `fuelType` String, required
  - `isPaused` Boolean, default false
  - `fuelAvailable` Boolean, default true
  - `serveTimeMinutes` Number, default 5
  - `timeoutWindowMinutes` Number, default 15
  - `counter` Number, default 0
  - Unique index: `{ stationId: 1, fuelType: 1 }`
- Create `QueueEntry` schema:
  - `queueId` ObjectId ref Queue, required
  - `stationId` ObjectId ref Station, required
  - `userId` ObjectId ref User, required
  - `fuelType` String, required
  - `position` Number, required
  - `status` enum: active / served / left / no_show, default active
  - `noShowEligible` Boolean, default false
  - `joinedAt` Date, default now
  - `servedAt` Date, optional
  - `estimatedWaitMinutes` Number
  - Indexes: `{ queueId:1, position:1 }` and `{ userId:1, status:1 }`
- `POST /stations/:id/queues/:fuelType/join`:
  - Reject if user already in any active queue (409)
  - Atomic `findOneAndUpdate` with `$inc: { counter:1 }` on Queue — guarantees unique position
  - Reject if fuelAvailable=false or isPaused=true (409 with reason)
  - Create QueueEntry, call tokenService.createToken(), return `{ entry, token }`
- `DELETE /stations/:id/queues/:fuelType/leave`:
  - Set status=left, decrement positions of higher entries, recalculate EWT
  - Call tokenService.invalidateToken(), call notificationService.send()
- `GET /queue/my-status` — polling endpoint, called every 8s by frontend:
  - If no active entry: return `{ active: false }`
  - If active: return `{ active: true, entry: { id, position, estimatedWaitMinutes, fuelType, stationId, stationName, joinedAt, status, noShowEligible }, queue: { isPaused, fuelAvailable }, token: { tokenId, qrPayload } }`
- Write all admin service functions (called by Dev 1's controller):
  - `serveUser` — mark served, decrement positions, recalculate EWT, notify next user
  - `removeNoShow` — mark no_show, decrement, recalculate EWT, notify user
  - `pauseQueue` — set isPaused=true, notify all users in queue
  - `resumeQueue` — set isPaused=false
  - `setFuelAvailability` — update, if false notify all users in queue
  - `setServeTime` — update, recalculate EWT for all active entries
  - `getQueueList` — return active entries sorted by position with noShowEligible + elapsed time
  - `runNoShowDetection` — setInterval every 60s, flag entries at position 1 past timeout window

**Libraries**
Mongoose · express-validator

---

## Dev 5
### Token + Fraud Prevention
**Role: Token Developer**

**Tasks**
- Create `Token` schema:
  - `tokenId` String, unique, required — `crypto.randomUUID()`
  - `userId` ObjectId ref User, required
  - `stationId` ObjectId ref Station, required
  - `queueEntryId` ObjectId ref QueueEntry, required
  - `fuelType` String, required
  - `status` enum: active / used / invalidated, default active
  - `qrPayload` String — JSON string, client renders as QR code
  - `issuedAt` Date, default now
- `createToken({ userId, stationId, queueEntryId, fuelType, joinedAt })`:
  - Generate `tokenId = crypto.randomUUID()`
  - Build `qrPayload = JSON.stringify({ tokenId, stationId, fuelType, issuedAt })`
  - Save and return Token document
- `POST /tokens/validate` (station_admin only):
  - Find token by tokenId — 404 if not found
  - Check stationId matches admin's station — 403 "Wrong station"
  - Check status === active — 409 "Token already used"
  - Check QueueEntry position === 1 — 409 "Not your turn yet"
  - Set status = used, save, return `{ position, joinedAt, fuelType }`
- `invalidateToken(queueEntryId)` — called by Dev 4 on leave queue, set status = invalidated

**Libraries**
crypto (built-in Node.js)

---

## Dev 6
### Notifications
**Role: Notifications Developer**

**Tasks**
- Create `Notification` schema:
  - `userId` ObjectId ref User, required
  - `type` enum: approaching_turn / your_turn / queue_paused / no_show_removed / queue_left / fuel_unavailable
  - `message` String
  - `read` Boolean, default false
  - `createdAt` Date, default now
- `send(userId, type, message)`:
  - Save Notification document (in-app inbox)
  - Fetch user's fcmToken from User model (read-only)
  - Attempt FCM push via config.fcmServerKey, silently skip if no fcmToken
- `sendToAllInQueue(queueId, type, message)`:
  - Find all active QueueEntries for queueId (read-only)
  - Call send() for each user
- `GET /notifications` — return all notifications for req.user.id sorted by createdAt desc
- `PATCH /notifications/:id/read` — set read=true on notification owned by user

**Libraries**
node-fetch or axios (for FCM HTTP call)

---

## Cross-Module Calls

| Caller | Calls | Why |
|---|---|---|
| Dev 1 queue.admin.controller | Dev 4 queue.service | All admin queue actions |
| Dev 4 queue.service | Dev 5 token.service | createToken, invalidateToken |
| Dev 4 queue.service | Dev 6 notification.service | send, sendToAllInQueue |
| Dev 3 station.service | Dev 4 Queue model (read) | Queue length for station list |
| Dev 6 notification.service | Dev 2 User model (read) | fcmToken for push |
| Dev 6 notification.service | Dev 4 QueueEntry model (read) | Bulk notify queue users |
