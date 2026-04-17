# FuelFlow — Backend Folder Structure (MVP)
**Stack:** Node.js · Express.js · MongoDB Atlas · Mongoose · Socket.IO  
**Structure:** Layered — models / services / controllers / routes / middleware / config / utils

---

## Full Annotated Folder Tree

```
backend/
│
├── server.js                            ← DEV 1 | HTTP server + Socket.IO entry point
├── app.js                               ← DEV 1 | Express app — all routers mounted here
├── package.json                         ← DEV 1 | Dependencies and scripts
├── .env                                 ← never commit to git
├── .env.example                         ← DEV 1 | template with all required keys
│
├── config/
│   ├── config.js                        ← DEV 1 | all env vars with defaults
│   └── db.js                            ← DEV 1 | mongoose.connect()
│
├── middleware/
│   ├── authenticate.js                  ← DEV 1 | JWT verification
│   ├── requireRole.js                   ← DEV 1 | role guard
│   └── errorHandler.js                  ← DEV 1 | AppError class + global error handler
│
├── utils/
│   └── ewt.js                           ← DEV 1 | calculateEWT(position, serveTime)
│
├── models/
│   ├── User.js                          ← DEV 2 | phoneOrEmail, passwordHash, role, fcmToken
│   ├── Station.js                       ← DEV 3 | name, location (GeoJSON), fuelTypes[], adminId
│   ├── Queue.js                         ← DEV 4 | stationId, fuelType, isPaused, fuelAvailable, counter
│   ├── QueueEntry.js                    ← DEV 4 | userId, position, status, noShowEligible, joinedAt
│   ├── Token.js                         ← DEV 5 | tokenId, status, qrPayload, queueEntryId
│   └── Notification.js                  ← DEV 6 | userId, type, message, read
│
├── services/
│   ├── auth.service.js                  ← DEV 2 | register, login, updateFcmToken
│   ├── station.service.js               ← DEV 3 | createStation, listStations, getRecommendations
│   ├── queue.service.js                 ← DEV 4 | ALL queue logic (user + admin actions)
│   ├── token.service.js                 ← DEV 5 | createToken, validateToken, invalidateToken
│   ├── notification.service.js          ← DEV 6 | send, sendToAllInQueue
│   └── realtime.service.js              ← DEV 6 | init(io), pushPositionUpdate
│
├── controllers/
│   ├── auth.controller.js               ← DEV 2
│   ├── station.controller.js            ← DEV 3
│   ├── queue.user.controller.js         ← DEV 4 | join, leave, my-status
│   ├── queue.admin.controller.js        ← DEV 1 | serve, no-show, pause, resume, availability, serve-time
│   ├── token.controller.js              ← DEV 5
│   └── notification.controller.js       ← DEV 6
│
└── routes/
    ├── auth.routes.js                   ← DEV 2
    ├── station.routes.js                ← DEV 3
    ├── queue.user.routes.js             ← DEV 4 | user-facing queue routes
    ├── queue.admin.routes.js            ← DEV 1 | admin-facing queue routes
    ├── token.routes.js                  ← DEV 5
    └── notification.routes.js           ← DEV 6
```

---

## Developer File Ownership

| Dev | Feature | Files owned |
|---|---|---|
| **Dev 1** | Setup + Admin queue wiring | `server.js`, `app.js`, `package.json`, `.env.example`, `config/config.js`, `config/db.js`, `middleware/authenticate.js`, `middleware/requireRole.js`, `middleware/errorHandler.js`, `utils/ewt.js`, `controllers/queue.admin.controller.js`, `routes/queue.admin.routes.js` |
| **Dev 2** | Authentication | `models/User.js`, `services/auth.service.js`, `controllers/auth.controller.js`, `routes/auth.routes.js` |
| **Dev 3** | Station + Recommendation | `models/Station.js`, `services/station.service.js`, `controllers/station.controller.js`, `routes/station.routes.js` |
| **Dev 4** | Queue models + user actions + all service logic | `models/Queue.js`, `models/QueueEntry.js`, `services/queue.service.js`, `controllers/queue.user.controller.js`, `routes/queue.user.routes.js` |
| **Dev 5** | Token + fraud prevention | `models/Token.js`, `services/token.service.js`, `controllers/token.controller.js`, `routes/token.routes.js` |
| **Dev 6** | Notifications + real-time | `models/Notification.js`, `services/notification.service.js`, `services/realtime.service.js`, `controllers/notification.controller.js`, `routes/notification.routes.js` |

---

## Key Design Decision — Queue Split

`services/queue.service.js` is owned by **Dev 4** and contains ALL queue logic (both user and admin functions).

**Dev 1** owns `controllers/queue.admin.controller.js` and `routes/queue.admin.routes.js` — these just call Dev 4's service functions. This way:
- Dev 4 writes all the business logic in one place
- Dev 1 wires the admin HTTP layer without duplicating logic

---

## MongoDB Collections

| Collection | Model | Owner |
|---|---|---|
| `users` | `models/User.js` | Dev 2 |
| `stations` | `models/Station.js` | Dev 3 |
| `queues` | `models/Queue.js` | Dev 4 |
| `queueentries` | `models/QueueEntry.js` | Dev 4 |
| `tokens` | `models/Token.js` | Dev 5 |
| `notifications` | `models/Notification.js` | Dev 6 |

---

## Full API Route List

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
| GET | `/api/v1/stations/:id/queues/:fuelType` | station_admin | **Dev 1** |
| POST | `/api/v1/stations/:id/queues/:fuelType/pause` | station_admin | **Dev 1** |
| POST | `/api/v1/stations/:id/queues/:fuelType/resume` | station_admin | **Dev 1** |
| PATCH | `/api/v1/stations/:id/queues/:fuelType/availability` | station_admin | **Dev 1** |
| PATCH | `/api/v1/stations/:id/queues/:fuelType/serve-time` | station_admin | **Dev 1** |
| POST | `/api/v1/stations/:id/queues/:fuelType/entries/:entryId/serve` | station_admin | **Dev 1** |
| POST | `/api/v1/stations/:id/queues/:fuelType/entries/:entryId/no-show` | station_admin | **Dev 1** |
| POST | `/api/v1/tokens/validate` | station_admin | Dev 5 |
| GET | `/api/v1/notifications` | user | Dev 6 |
| PATCH | `/api/v1/notifications/:id/read` | user | Dev 6 |

---

## Cross-Module Calls

```
queue.service (Dev 4)
  ├── calls → token.service.createToken()              (Dev 5)
  ├── calls → token.service.invalidateToken()          (Dev 5)
  ├── calls → notification.service.send()              (Dev 6)
  ├── calls → notification.service.sendToAllInQueue()  (Dev 6)
  └── calls → realtime.service.pushPositionUpdate()    (Dev 6)

queue.admin.controller (Dev 1)
  └── calls → queue.service (all admin functions)      (Dev 4)

station.service (Dev 3)
  └── reads → models/Queue.js                          (Dev 4 — read only)

notification.service (Dev 6)
  ├── reads → models/User.js                           (Dev 2 — read only)
  └── reads → models/QueueEntry.js                     (Dev 4 — read only)

realtime.service (Dev 6)
  └── reads → models/QueueEntry.js                     (Dev 4 — read only)
```

---

## Git Branch Workflow

```
main
 └── dev1/setup-and-admin-queue    ← merges FIRST
      ├── dev2/auth
      ├── dev3/station              ← all parallel after Dev 1
      ├── dev4/queue
      ├── dev5/token
      └── dev6/notifications
```
