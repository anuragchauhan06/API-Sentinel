
import { Router } from "express";
import Monitor from "../models/Monitor";
import { validate } from "../middleware/validate";
import { createMonitorSchema } from "../validators/monitorSchema";

const router = Router();

// POST /api/v1/monitors
router.post(
  "/",
  validate(createMonitorSchema),
  async (req, res, next) => {
    try {
      const monitor = await Monitor.create(req.body);

      res.status(201).json({
        success: true,
        message: "Monitor created successfully",
        data: monitor,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
