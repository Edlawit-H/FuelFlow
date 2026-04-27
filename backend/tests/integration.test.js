import { jest } from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import mongoose from "mongoose";

jest.setTimeout(30000);

beforeAll(async () => {
 
  const uri =
    process.env.MONGO_URI_TEST ||
    "mongodb://127.0.0.1:27017/fuelflow_test";

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  });
});


afterAll(async () => {
 await mongoose.connection.dropDatabase();
await mongoose.disconnect();
});


async function registerUser(phoneOrEmail, password) {
  return request(app)
    .post('/auth/register')
    .send({ phoneOrEmail, password });
}

async function loginUser(phoneOrEmail, password) {
  const res = await request(app)
    .post('/auth/login')
    .send({ phoneOrEmail, password });

  return res.body.token;
}

async function registerAdmin(phoneOrEmail, password) {
  return request(app)
    .post('/auth/register-admin')
    .send({ phoneOrEmail, password });
}

async function loginAdmin(phoneOrEmail, password) {
  const res = await request(app)
    .post('/auth/login')
    .send({ phoneOrEmail, password });

  return res.body.token;
}


describe('HEALTH CHECK', () => {
  it('GET /health should return ok', async () => {
    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});


describe('AUTH', () => {
  it('should register user', async () => {
    const res = await registerUser('user1@test.com', '123456');

    expect(res.statusCode).toBe(201);
  });

  it('should not allow duplicate registration', async () => {
    await registerUser('dup@test.com', '123456');

    const res = await registerUser('dup@test.com', '123456');

    expect(res.statusCode).toBe(409);
  });

  it('should login user and return token', async () => {
    await registerUser('login@test.com', '123456');

    const token = await loginUser('login@test.com', '123456');

    expect(token).toBeDefined();
  });
});
describe('STATION + QUEUE FLOW', () => {
  let adminToken;
  let userToken;
  let stationId;

  beforeAll(async () => {
    await registerAdmin('admin@test.com', '123456');
    await registerUser('user@test.com', '123456');

    adminToken = await loginAdmin('admin@test.com', '123456');
    userToken = await loginUser('user@test.com', '123456');

    const stationRes = await request(app)
      .post('/stations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'FuelFlow Station',
        address: 'Main Road',
        location: {
          type: 'Point',
          coordinates: [38.7, 9.0],
        },
        fuelTypes: ['petrol'],
      });

    stationId = stationRes.body._id;
  }, 20000);

  it('admin should create station', async () => {
    expect(stationId).toBeDefined();
  });

  it('user should join queue', async () => {
    const res = await request(app)
      .post(`/stations/${stationId}/queues/petrol/join`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(201);
    expect(res.body.entry).toBeDefined();
    expect(res.body.token).toBeDefined();
  });

  it('should block duplicate queue join', async () => {
    const res = await request(app)
      .post(`/stations/${stationId}/queues/petrol/join`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(409);
  });

  it('should return queue status', async () => {
    const res = await request(app)
      .get('/queue/my-status')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.active).toBe(true);
    expect(res.body.entry).toBeDefined();
  });
});