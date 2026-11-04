
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import monitorRoutes from "./routes/monitorRoutes";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API Sentinel is running",
    timestamp: new Date().toISOString(),
  });
});

// Monitor routes
app.use("/api/v1/monitors", monitorRoutes);

// Handle routes that do not exist
app.use((_req, res, next) => {
  const error = Object.assign(new Error("Route not found"), {
    status: 404,
  });

  next(error);
});

app.use(errorHandler);

export default app;
