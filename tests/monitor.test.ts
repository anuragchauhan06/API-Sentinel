
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

    const error = await monitor.validate().then(
      () => null,
      (validationError) => validationError
    );

    expect(error).toBeDefined();
    expect(error?.errors.name).toBeDefined();
    expect(error?.errors.url).toBeDefined();
  });

  it("should reject an invalid HTTP method", async () => {
    const monitor = new Monitor({
      name: "Payment API",
      url: "https://example.com",
      method: "INVALID",
    });

    const error = await monitor.validate().then(
      () => null,
      (validationError) => validationError
    );

    expect(error?.errors.method).toBeDefined();
  });

  it("should reject an interval below 30 seconds", async () => {
    const monitor = new Monitor({
      name: "Payment API",
      url: "https://example.com",
      intervalSeconds: 10,
    });

    const error = await monitor.validate().then(
      () => null,
      (validationError) => validationError
    );

    expect(error?.errors.intervalSeconds).toBeDefined();
  });
});
