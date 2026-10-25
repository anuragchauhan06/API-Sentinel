
import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app";

describe("GET /health", () => {
  it("should return a successful health response", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("API Sentinel is running");
    expect(response.body.timestamp).toBeDefined();
  });
});

describe("404 Not Found", () => {
  it("should return 404 for an unknown route", async () => {
    const response = await request(app).get("/unknown-route");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Route not found");
  });
});
