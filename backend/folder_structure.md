# FuelFlow — Backend Folder Structure (MVP)
Stack: Node.js · Express.js · MongoDB Atlas · Mongoose
Real-time: Polling only — no Socket.IO

---

## Folder Tree

```
backend/
│
├── server.js                            ← Dev 1
├── app.js                               ← Dev 1
├── package.json                         ← Dev 1
├── .env                                 ← never commit
├── .env.example                         ← Dev 1
│
├── config/
│   ├── config.js                        ← Dev 1 | env vars with defaults
│   └── db.js                            ← Dev 1 | mongoose.connect()
│
├── middleware/
│   ├── authenticate.js                  ← Dev 1 | JWT verification
│   ├── requireRole.js                   ← Dev 1 | role guard
│   └── errorHandler.js                  ← Dev 1 | AppError + error handler
│
├── utils/
│   └── ewt.js                           ← Dev 1 | calculateEWT(position, serveTime)
│
├── models/
│   ├── User.js                          ← Dev 2 | phoneOrEmail, passwordHash, role
│   ├── Station.js                       ← Dev 3 | name, location, fuelTypes[], adminId
│   ├── Queue.js                         ← Dev 4 | stationId, fuelType, isPaused, counter
│   ├── QueueEntry.js                    ← Dev 4 | userId, position, status, noShowEligible
│   └── Token.js                         ← Dev 5 | tokenId, status, qrPayload
│
├── services/
│   ├── auth.service.js                  ← Dev 2 | register, login
│   ├── station.service.js               ← Dev 3 | createStation, listStations, getRecommendations
│   ├── queue.service.js                 ← Dev 4 | all queue logic (user + admin)
│   └── token.service.js                 ← Dev 5 | createToken, validateToken, invalidateToken
│
├── controllers/
│   ├── auth.controller.js               ← Dev 2
│   ├── station.controller.js            ← Dev 3
│   ├── queue.user.controller.js         ← Dev 4 | join, leave, my-status
│   ├── queue.admin.controller.js        ← Dev 1 | serve, no-show, pause, resume, availability, serve-time
│   └── token.controller.js              ← Dev 5
│
└── routes/
    ├── auth.routes.js                   ← Dev 2
    ├── station.routes.js                ← Dev 3
    ├── queue.user.routes.js             ← Dev 4
    ├── queue.admin.routes.js            ← Dev 1
    └── token.routes.js                  ← Dev 5
```

## Developer Ownership

| Dev | Feature | Files |
|---|---|---|
| Dev 1 | Setup + Admin queue | `server.js`, `app.js`, `config/*`, `middleware/*`, `utils/ewt.js`, `controllers/queue.admin.controller.js`, `routes/queue.admin.routes.js` |
| Dev 2 | Authentication | `models/User.js`, `services/auth.service.js`, `controllers/auth.controller.js`, `routes/auth.routes.js` |
| Dev 3 | Station + Recommendation | `models/Station.js`, `services/station.service.js`, `controllers/station.controller.js`, `routes/station.routes.js` |
| Dev 4 | Queue | `models/Queue.js`, `models/QueueEntry.js`, `services/queue.service.js`, `controllers/queue.user.controller.js`, `routes/queue.user.routes.js` |
| Dev 5 | Token | `models/Token.js`, `services/token.service.js`, `controllers/token.controller.js`, `routes/token.routes.js` |
| Dev 6 | Testing + Docs | `README.md`, test files, Postman collection |

---

## API Routes

| Method | Path | Role | Dev |
|---|---|---|---|
| POST | `/api/v1/auth/register` | public | Dev 2 |
| POST | `/api/v1/auth/login` | public | Dev 2 |
| POST | `/api/v1/auth/register-admin` | public | Dev 2 |
| POST | `/api/v1/stations` | station_admin | Dev 3 |
| PATCH | `/api/v1/stations/:id` | station_admin | Dev 3 |
| GET | `/api/v1/stations` | user | Dev 3 |
| GET | `/api/v1/stations/recommendations` | user | Dev 3 |
| GET | `/api/v1/stations/:id` | user | Dev 3 |
| POST | `/api/v1/stations/:id/queues/:fuelType/join` | user | Dev 4 |
| DELETE | `/api/v1/stations/:id/queues/:fuelType/leave` | user | Dev 4 |
| GET | `/api/v1/queue/my-status` | user | Dev 4 |
| GET | `/api/v1/stations/:id/queues/:fuelType` | station_admin | Dev 1 |
| POST | `/api/v1/stations/:id/queues/:fuelType/pause` | station_admin | Dev 1 |
| POST | `/api/v1/stations/:id/queues/:fuelType/resume` | station_admin | Dev 1 |
| PATCH | `/api/v1/stations/:id/queues/:fuelType/availability` | station_admin | Dev 1 |
| PATCH | `/api/v1/stations/:id/queues/:fuelType/serve-time` | station_admin | Dev 1 |
| POST | `/api/v1/stations/:id/queues/:fuelType/entries/:entryId/serve` | station_admin | Dev 1 |
| POST | `/api/v1/stations/:id/queues/:fuelType/entries/:entryId/no-show` | station_admin | Dev 1 |
| POST | `/api/v1/tokens/validate` | station_admin | Dev 5 |

---

## Polling Endpoint Response

`GET /api/v1/queue/my-status` — polled every 8 seconds by the My Queue page

Active:
```json
{
  "active": true,
  "entry": { "id", "position", "estimatedWaitMinutes", "fuelType", "stationId", "stationName", "joinedAt", "status", "noShowEligible" },
  "queue": { "isPaused", "fuelAvailable" },
  "token": { "tokenId", "qrPayload" }
}
```

Not in queue:
```json
{ "active": false }
```

---

## Cross-Module Calls

```
queue.service (Dev 4)
  ├── calls → token.service.createToken()
  └── calls → token.service.invalidateToken()

queue.admin.controller (Dev 1)
  └── calls → queue.service (all admin functions)

station.service (Dev 3)
  └── reads → Queue model (read only)
```
