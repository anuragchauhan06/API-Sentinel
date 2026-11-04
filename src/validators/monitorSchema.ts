
import { z } from "zod";

const monitorBodySchema = z.object({
  name: z.string().trim().min(2).max(100),

  url: z.string().trim().superRefine((value, ctx) => {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(value);
    } catch {
      ctx.addIssue({
        code: "custom",
        message: "Please provide a valid URL",
      });
      return;
    }

    if (
      parsedUrl.protocol !== "http:" &&
      parsedUrl.protocol !== "https:"
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Only HTTP and HTTPS URLs are allowed",
      });
    }
  }),

  method: z
    .enum(["GET", "POST", "PUT", "PATCH", "DELETE"])
    .optional(),

  intervalSeconds: z.number().int().min(30).optional(),

  timeoutMs: z.number().int().min(1000).max(30000).optional(),

  expectedStatusCode: z.number().int().min(100).max(599).optional(),
});

export const createMonitorSchema = z.object({
  body: monitorBodySchema,
});
