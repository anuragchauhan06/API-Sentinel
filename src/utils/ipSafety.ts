
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import ipaddr from "ipaddr.js";

/**
 * Checks whether an IP address is globally routable.
 * Rejects private, loopback, link-local, reserved and other
 * non-public IPv4 and IPv6 address ranges.
 */
const isPublicIp = (address: string): boolean => {
  try {
    const parsedAddress = ipaddr.process(address);
    return parsedAddress.range() === "unicast";
  } catch {
    return false;
  }
};

/**
 * Validates an HTTP/HTTPS URL and ensures that its hostname
 * resolves exclusively to public IP addresses.
 */
export const assertPublicHttpUrl = async (
  input: string
): Promise<URL> => {
  let url: URL;

  try {
    url = new URL(input);
  } catch {
    throw new Error("Invalid URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Only HTTP and HTTPS URLs are allowed");
  }

  if (url.username || url.password) {
    throw new Error("URLs containing credentials are not allowed");
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, "");

  if (!hostname || hostname.toLowerCase() === "localhost") {
    throw new Error("Localhost addresses are not allowed");
  }

  // Handle direct IPv4 and IPv6 addresses.
  if (isIP(hostname)) {
    if (!isPublicIp(hostname)) {
      throw new Error("Non-public IP addresses are not allowed");
    }

    return url;
  }

  // Resolve domain names and inspect every returned address.
  let addresses;

  try {
    addresses = await lookup(hostname, {
      all: true,
      verbatim: true,
    });
  } catch {
    throw new Error("Unable to resolve hostname");
  }

  if (addresses.length === 0) {
    throw new Error("Hostname did not resolve to an IP address");
  }

  const hasUnsafeAddress = addresses.some(
    (entry) => !isPublicIp(entry.address)
  );

  if (hasUnsafeAddress) {
    throw new Error("Hostname resolves to a non-public IP address");
  }

  return url;
};
