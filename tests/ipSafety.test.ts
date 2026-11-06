
import { describe, it, expect, vi, beforeEach } from "vitest";
import { lookup } from "node:dns/promises";
import { assertPublicHttpUrl } from "../src/utils/ipSafety";

vi.mock("node:dns/promises", () => ({
  lookup: vi.fn(),
}));

describe("IP Safety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should allow a public IPv4 address", async () => {
    const result = await assertPublicHttpUrl("https://8.8.8.8");

    expect(result.hostname).toBe("8.8.8.8");
    expect(lookup).not.toHaveBeenCalled();
  });

  it("should reject a private IPv4 address", async () => {
    await expect(
      assertPublicHttpUrl("http://192.168.1.1")
    ).rejects.toThrow("Non-public IP addresses are not allowed");
  });

  it("should reject a loopback IPv4 address", async () => {
    await expect(
      assertPublicHttpUrl("http://127.0.0.1")
    ).rejects.toThrow("Non-public IP addresses are not allowed");
  });

  it("should reject an IPv6 loopback address", async () => {
    await expect(
      assertPublicHttpUrl("http://[::1]")
    ).rejects.toThrow("Non-public IP addresses are not allowed");
  });

  it("should reject localhost", async () => {
    await expect(
      assertPublicHttpUrl("http://localhost")
    ).rejects.toThrow("Localhost addresses are not allowed");
  });

  it("should reject unsupported protocols", async () => {
    await expect(
      assertPublicHttpUrl("ftp://example.com")
    ).rejects.toThrow("Only HTTP and HTTPS URLs are allowed");
  });

  it("should reject invalid URLs", async () => {
    await expect(
      assertPublicHttpUrl("not-a-valid-url")
    ).rejects.toThrow("Invalid URL");
  });

  it("should reject URLs containing credentials", async () => {
    await expect(
      assertPublicHttpUrl("https://user:password@example.com")
    ).rejects.toThrow("URLs containing credentials are not allowed");
  });

  it("should allow a hostname resolving to a public IP", async () => {
    vi.mocked(lookup).mockResolvedValue([
      {
        address: "93.184.216.34",
        family: 4,
      },
    ]);

    const result = await assertPublicHttpUrl("https://example.com");

    expect(result.hostname).toBe("example.com");
    expect(lookup).toHaveBeenCalledWith("example.com", {
      all: true,
      verbatim: true,
    });
  });

  it("should reject a hostname resolving to a private IP", async () => {
    vi.mocked(lookup).mockResolvedValue([
      {
        address: "93.184.216.34",
        family: 4,
      },
      {
        address: "192.168.1.10",
        family: 4,
      },
    ]);

    await expect(
      assertPublicHttpUrl("https://example.com")
    ).rejects.toThrow(
      "Hostname resolves to a non-public IP address"
    );
  });

  it("should reject a hostname that cannot be resolved", async () => {
    vi.mocked(lookup).mockRejectedValue(new Error("DNS failure"));

    await expect(
      assertPublicHttpUrl("https://unknown.example")
    ).rejects.toThrow("Unable to resolve hostname");
  });
});
