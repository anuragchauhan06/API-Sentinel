
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import Monitor from "../src/models/Monitor";

vi.mock("../src/models/Monitor", () => ({
  default: {
    create: vi.fn(),
  },
}));

describe("Monitor API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a monitor successfully", async () => {
    const monitorData = {
      name: "Payment API",
      url: "https://example.com/api/payments",
      method: "GET",
      intervalSeconds: 300,
      timeoutMs: 10000,
      expectedStatusCode: 200,
    };

    const mockMonitor = {
      _id: "monitor123",
      ...monitorData,
      isActive: true,
      status: "unknown",
    };

    vi.mocked(Monitor.create).mockResolvedValue(mockMonitor as never);

    const response = await request(app)
      .post("/api/v1/monitors")
      .send(monitorData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Monitor created successfully");
    expect(response.body.data.name).toBe("Payment API");

    expect(Monitor.create).toHaveBeenCalledWith(monitorData);
  });

  it("should reject an invalid monitor name", async () => {
    const response = await request(app)
      .post("/api/v1/monitors")
      .send({
        name: "A",
        url: "https://example.com",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Validation failed");

    expect(Monitor.create).not.toHaveBeenCalled();
  });

  it("should reject an invalid URL", async () => {
    const response = await request(app)
      .post("/api/v1/monitors")
      .send({
        name: "Payment API",
        url: "not-a-valid-url",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);

    expect(Monitor.create).not.toHaveBeenCalled();
  });
});
