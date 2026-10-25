
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import { z } from "zod";
import { validate } from "./middleware/validate";

const demoSchema = z.object({
  body: z.object({
    name: z.string().min(2),
  }),
});

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());


app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API Sentinel is running",
    timestamp: new Date().toISOString(),
  });
});
app.post("/test-validation", validate(demoSchema), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Validation passed",
  });
});
// Handle routes that do not exist
app.use((_req, res, next) => {
  const error = Object.assign(new Error("Route not found"), {
    status: 404,
  });

  next(error);
});

app.use(errorHandler);


export default app;
