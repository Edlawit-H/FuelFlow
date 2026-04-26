 # FuelFlow — Backend API

A fuel station queue management system built with Node.js, Express, MongoDB Atlas, and Mongoose.

---

##  Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Runtime      | Node.js                        |
| Framework    | Express.js                     |
| Database     | MongoDB Atlas + Mongoose      |
| Auth         | JWT (jsonwebtoken) + bcryptjs  |
| Validation   | express-validator              |
| Logging      | morgan                         |
| Testing      | Jest + Supertest               |
| Real-time    | Polling only (every 8s)        |

---
 Folder Structure
```
fuelflow/
├── app.js                  # Express app setup + middleware
├── server.js               # HTTP server entry point
├── jest.config.js          # Jest configuration
├── .env                    # Environment variables (never commit this)
├── config/
│   ├── db.js               # MongoDB connection
│   └── config.js           # Env vars + defaults
├── middleware/
│   ├── authenticate.js     # JWT verification, attaches req.user
│   ├── requireRole.js      # Role-based access control (403)
│   └── errorHandler.js     # AppError class + global error handler
├── utils/
│   └── ewt.js              # calculateEWT(position, serveTimeMinutes)
├── models/
│   ├── User.js             # User schema
│   ├── Station.js          # Station schema (GeoJSON + 2dsphere)
│   ├── Queue.js            # Queue schema
│   ├── QueueEntry.js       # QueueEntry schema
│   └── Token.js            # Token schema
├── routes/
│   ├── auth.routes.js          # /auth routes
│   ├── queue.user.routes.js
│   ├── station.routes.js       # /stations routes
│   ├── queue.admin.routes.js   # /queue routes
│   └── token.routes.js         # /tokens routes
├── controllers/
│   └── auth.controller.js
│   └── queue.admin.controller.js
│   └── queue.user.controller.js
│   └── station.controller.js
│   └── token.controller.js
├── services/
│   ├── queue.service.js       # Queue business logic
|   ├── station.service.js
|   ├── auth.service.js
│   └── token.service.js       # Token creation + invalidation
└── tests/
    └── integration.test.js    # All integration tests
```
---
 Setup Instructions
1. Clone the repository
```bash
git clone https://github.com/your-team/fuelflow.git
cd fuelflow
```
2. Install dependencies
```bash
npm install
```
3. Configure environment variables
Create a `.env` file in the root directory:
```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/fuelflow
MONGO_URI_TEST=mongodb://localhost:27017/fuelflow_test

JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```
> ⚠️ Never commit your `.env` file. It is already listed in `.gitignore`.
4. Run the development server
```bash
npm run dev
```
The server will start on `http://localhost:5000`

5. Run tests
```bash
npm test
```
> Make sure `MONGO_URI_TEST` in your `.env` points to a local or test MongoDB instance before running tests.
---

##  API Overview

---

###  Auth — `/auth`

| Method | Endpoint                | Auth Required | Description                        |
|--------|------------------------|---------------|------------------------------------|
| POST   | `/auth/register`       | --            | Register a new user               |
| POST   | `/auth/login`          | --            | Login and receive JWT             |
| POST   | `/auth/register-admin` | --            | Register a station admin          |
| GET    | `/auth/me`             |  user       | Get current user info             |
| PATCH  | `/auth/me`             |  user       | Update email or password          |
| DELETE | `/auth/me`             |  user       | Delete account                    |

---

###  Stations — `/stations`

| Method | Endpoint                          | Auth Required        | Description                              |
|--------|----------------------------------|----------------------|------------------------------------------|
| POST   | `/stations`                      |  station_admin     | Create a station                        |
| PATCH  | `/stations/:id`                 |  station_admin     | Update station name/address             |
| GET    | `/stations`                     | --                   | List stations (geo filter + summary)    |
| GET    | `/stations/recommendations`    | --                   | Ranked station recommendations          |
| GET    | `/stations/:id`                | --                   | Get single station + queue summary      |

---

###  Queue (User) — `/stations/:id/queues/:fuelType`

| Method | Endpoint                                                | Auth Required | Description                    |
|--------|--------------------------------------------------------|---------------|--------------------------------|
| POST   | `/stations/:id/queues/:fuelType/join`                |  user       | Join a fuel queue             |
| DELETE | `/stations/:id/queues/:fuelType/leave`               |  user       | Leave the queue               |
| GET    | `/queue/my-status`                                    |  user       | Poll queue status (every 8s)  |

---

###  Queue (Admin) — `/stations/:id/queues/:fuelType`

| Method | Endpoint                                                               | Auth Required        | Description                        |
|--------|------------------------------------------------------------------------|----------------------|------------------------------------|
| GET    | `/stations/:id/queues/:fuelType`                                      |  station_admin     | Get full queue list              |
| POST   | `/stations/:id/queues/:fuelType/pause`                                |  station_admin     | Pause queue                      |
| POST   | `/stations/:id/queues/:fuelType/resume`                               |  station_admin     | Resume queue                     |
| PATCH  | `/stations/:id/queues/:fuelType/availability`                         |  station_admin     | Toggle fuel availability         |
| PATCH  | `/stations/:id/queues/:fuelType/serve-time`                           |  station_admin     | Update serve time                |
| POST   | `/stations/:id/queues/:fuelType/entries/:entryId/serve`               |  station_admin     | Mark user as served             |
| POST   | `/stations/:id/queues/:fuelType/entries/:entryId/no-show`             |  station_admin     | Remove no-show entry            |

---

###  Tokens — `/tokens`

| Method | Endpoint              | Auth Required        | Description                      |
|--------|----------------------|----------------------|----------------------------------|
| POST   | `/tokens/validate`   |  station_admin     | Validate a user's token          |

---

###  Health — `/health`

| Method | Endpoint     | Auth Required | Description            |
|--------|-------------|---------------|------------------------|
| GET    | `/health`   | --            | Server health check    |

---
 Running Tests
```bash
# Run all tests
npm test

# Run with verbose output
npm test -- --verbose

# Run a specific test file
npx jest tests/integration.test.js
```
---
 Postman Collection
A Postman collection covering all routes is available in the repo:
```
/postman/FuelFlow.postman_collection.json
```
Import the API collection into Postman via **File → Import**, then set the following environment variables:

| Variable  | Value                         |
|-----------|-------------------------------|
| BASE_URL  | http://localhost:5000         |
| TOKEN     | (Paste JWT after login)       |

Import it into Postman via **File → Import**, then set these environment variables:

- BASE_URL = http://localhost:5000  
- TOKEN = (paste JWT after login)

