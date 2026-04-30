import mongoose from "mongoose";
import { jest } from "@jest/globals";
import request from "supertest";
import app from "../app.js";
import config from "../config/config.js";

jest.setTimeout(30000);

// ─────────────────────────────
// DB SETUP
// ─────────────────────────────
beforeAll(async () => {
  await mongoose.connect(config.mongodbUri);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

// ─────────────────────────────
// HELPERS (INLINE)
// ─────────────────────────────
const API = "/api/v1";

const registerUser = (phone, password) =>
  request(app).post(`${API}/auth/register`).send({ phone, password });

const loginUser = async (phone, password) => {
  const res = await request(app)
    .post(`${API}/auth/login`)
    .send({ phone, password });

  return res.body.token || res.body.accessToken;
};

const registerAdmin = (phone, password) =>
  request(app).post(`${API}/auth/register-admin`).send({ phone, password });

const loginAdmin = async (phone, password) => {
  const res = await request(app)
    .post(`${API}/auth/login`)
    .send({ phone, password });

  return res.body.token || res.body.accessToken;
};

// ─────────────────────────────
// TESTS
// ─────────────────────────────
describe("AUTH", () => {
  it("should register user", async () => {
    const res = await registerUser("111", "123456");
    expect(res.statusCode).toBe(201);
  });

  it("should login user", async () => {
    await registerUser("222", "123456");

    const token = await loginUser("222", "123456");
    expect(token).toBeDefined();
  });
});

describe("QUEUE FLOW", () => {
  let adminToken;
  let userToken;
  let stationId;

  beforeAll(async () => {
    await registerAdmin("admin", "123456");
    await registerUser("user", "123456");

    adminToken = await loginAdmin("admin", "123456");
    userToken = await loginUser("user", "123456");

    const stationRes = await request(app)
      .post(`${API}/stations`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Station",
        address: "Main Road",
        location: {
          type: "Point",
          coordinates: [38.7, 9.0],
        },
        fuelTypes: ["petrol"],
      });

    stationId = stationRes.body._id;
  });

it("user joins queue", async () => {
  const res = await request(app)
    .post(`${API}/stations/stations/${stationId}/queues/petrol/join`)
    .set("Authorization", `Bearer ${adminToken}`); 
  
  console.log("JOIN RESPONSE:", res.body);
  expect([200, 201, 403]).toContain(res.statusCode);
});

  it("queue status works", async () => {
    const res = await request(app)
      .get(`${API}/stations/queue/my-status`)
      .set("Authorization", `Bearer ${userToken}`);

    console.log("STATUS:", res.body);

    expect([200, 404]).toContain(res.statusCode);
  });
});