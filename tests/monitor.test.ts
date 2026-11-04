
import { describe, it, expect } from "vitest";
import Monitor from "../src/models/Monitor";

describe("Monitor Model", () => {
  it("should create a monitor with default values", () => {
    const monitor = new Monitor({
      name: "Payment API",
      url: "https://example.com/api/payments",
    });

    expect(monitor.method).toBe("GET");
    expect(monitor.intervalSeconds).toBe(300);
    expect(monitor.timeoutMs).toBe(10000);
    expect(monitor.expectedStatusCode).toBe(200);
    expect(monitor.isActive).toBe(true);
    expect(monitor.status).toBe("unknown");
  });

  it("should require name and url", async () => {
    const monitor = new Monitor({});

    await expect(monitor.validate()).rejects.toMatchObject({
      errors: {
        name: expect.anything(),
        url: expect.anything(),
      },
    });
  });

  it("should reject an invalid HTTP method", async () => {
    const monitor = new Monitor({
      name: "Payment API",
      url: "https://example.com",
      method: "INVALID",
    });

    await expect(monitor.validate()).rejects.toMatchObject({
      errors: {
        method: expect.anything(),
      },
    });
  });

  it("should reject an interval below 30 seconds", async () => {
    const monitor = new Monitor({
      name: "Payment API",
      url: "https://example.com",
      intervalSeconds: 10,
    });

    await expect(monitor.validate()).rejects.toMatchObject({
      errors: {
        intervalSeconds: expect.anything(),
      },
    });
  });
});
