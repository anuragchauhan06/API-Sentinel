
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import Monitor from "../src/models/Monitor";

vi.mock("../src/models/Monitor", () => ({
  default: {
    create: vi.fn(),
    find: vi.fn(),
    countDocuments: vi.fn(),
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    findByIdAndDelete: vi.fn(),
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

  it("should return monitors with pagination", async () => {
    const mockMonitors = [
      {
        _id: "monitor123",
        name: "Payment API",
        url: "https://example.com/payments",
      },
      {
        _id: "monitor456",
        name: "User API",
        url: "https://example.com/users",
      },
    ];

    const limitMock = vi.fn().mockResolvedValue(mockMonitors);
    const skipMock = vi.fn().mockReturnValue({ limit: limitMock });
    const sortMock = vi.fn().mockReturnValue({ skip: skipMock });

    vi.mocked(Monitor.find).mockReturnValue({
      sort: sortMock,
    } as never);

    vi.mocked(Monitor.countDocuments).mockResolvedValue(2);

    const response = await request(app).get("/api/v1/monitors");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(2);

    expect(response.body.pagination).toEqual({
      total: 2,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    expect(skipMock).toHaveBeenCalledWith(0);
    expect(limitMock).toHaveBeenCalledWith(10);
  });

  it("should support custom pagination parameters", async () => {
    const limitMock = vi.fn().mockResolvedValue([]);
    const skipMock = vi.fn().mockReturnValue({ limit: limitMock });
    const sortMock = vi.fn().mockReturnValue({ skip: skipMock });

    vi.mocked(Monitor.find).mockReturnValue({
      sort: sortMock,
    } as never);

    vi.mocked(Monitor.countDocuments).mockResolvedValue(25);

    const response = await request(app)
      .get("/api/v1/monitors?page=2&limit=5");

    expect(response.status).toBe(200);
    expect(response.body.pagination).toEqual({
      total: 25,
      page: 2,
      limit: 5,
      totalPages: 5,
    });

    expect(skipMock).toHaveBeenCalledWith(5);
    expect(limitMock).toHaveBeenCalledWith(5);
  });

  it("should reject invalid pagination parameters", async () => {
    const response = await request(app)
      .get("/api/v1/monitors?page=0&limit=200");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(Monitor.find).not.toHaveBeenCalled();
  });

  it("should return a monitor by ID", async () => {
    const mockMonitor = {
      _id: "507f1f77bcf86cd799439011",
      name: "Payment API",
      url: "https://example.com/payments",
      status: "unknown",
    };

    vi.mocked(Monitor.findById).mockResolvedValue(mockMonitor as never);

    const response = await request(app).get(
      "/api/v1/monitors/507f1f77bcf86cd799439011"
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe("Payment API");

    expect(Monitor.findById).toHaveBeenCalledWith(
      "507f1f77bcf86cd799439011"
    );
  });

  it("should reject an invalid monitor ID", async () => {
    const response = await request(app).get(
      "/api/v1/monitors/invalid-id"
    );

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid monitor ID");

    expect(Monitor.findById).not.toHaveBeenCalled();
  });

  it("should return 404 when monitor does not exist", async () => {
    vi.mocked(Monitor.findById).mockResolvedValue(null);

    const response = await request(app).get(
      "/api/v1/monitors/507f1f77bcf86cd799439011"
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Monitor not found");
  });
  
it("should update a monitor successfully", async () => {
  const updatedMonitor = {
    _id: "507f1f77bcf86cd799439011",
    name: "Updated Payment API",
    url: "https://example.com/payments",
    intervalSeconds: 600,
  };

  vi.mocked(Monitor.findByIdAndUpdate).mockResolvedValue(
    updatedMonitor as never
  );

  const response = await request(app)
    .patch("/api/v1/monitors/507f1f77bcf86cd799439011")
    .send({
      name: "Updated Payment API",
      intervalSeconds: 600,
    });

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.message).toBe("Monitor updated successfully");
  expect(response.body.data.name).toBe("Updated Payment API");

  expect(Monitor.findByIdAndUpdate).toHaveBeenCalledWith(
    "507f1f77bcf86cd799439011",
    {
      $set: {
        name: "Updated Payment API",
        intervalSeconds: 600,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );
});

it("should reject an invalid monitor ID during update", async () => {
  const response = await request(app)
    .patch("/api/v1/monitors/invalid-id")
    .send({
      name: "Updated API",
    });

  expect(response.status).toBe(400);
  expect(response.body.message).toBe("Invalid monitor ID");
  expect(Monitor.findByIdAndUpdate).not.toHaveBeenCalled();
});

it("should return 404 when updating a non-existent monitor", async () => {
  vi.mocked(Monitor.findByIdAndUpdate).mockResolvedValue(null);

  const response = await request(app)
    .patch("/api/v1/monitors/507f1f77bcf86cd799439011")
    .send({
      name: "Updated API",
    });

  expect(response.status).toBe(404);
  expect(response.body.message).toBe("Monitor not found");
});

it("should reject an empty update request", async () => {
  const response = await request(app)
    .patch("/api/v1/monitors/507f1f77bcf86cd799439011")
    .send({});

  expect(response.status).toBe(400);
  expect(Monitor.findByIdAndUpdate).not.toHaveBeenCalled();
});

it("should delete a monitor successfully", async () => {
  const deletedMonitor = {
    _id: "507f1f77bcf86cd799439011",
    name: "Payment API",
    url: "https://example.com/payments",
  };

  vi.mocked(Monitor.findByIdAndDelete).mockResolvedValue(
    deletedMonitor as never
  );

  const response = await request(app).delete(
    "/api/v1/monitors/507f1f77bcf86cd799439011"
  );

  expect(response.status).toBe(200);
  expect(response.body.success).toBe(true);
  expect(response.body.message).toBe("Monitor deleted successfully");

  expect(Monitor.findByIdAndDelete).toHaveBeenCalledWith(
    "507f1f77bcf86cd799439011"
  );
});

it("should reject an invalid monitor ID during deletion", async () => {
  const response = await request(app).delete(
    "/api/v1/monitors/invalid-id"
  );

  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toBe("Invalid monitor ID");

  expect(Monitor.findByIdAndDelete).not.toHaveBeenCalled();
});

it("should return 404 when deleting a non-existent monitor", async () => {
  vi.mocked(Monitor.findByIdAndDelete).mockResolvedValue(null);

  const response = await request(app).delete(
    "/api/v1/monitors/507f1f77bcf86cd799439011"
  );

  expect(response.status).toBe(404);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toBe("Monitor not found");
});

});
