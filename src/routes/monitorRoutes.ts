
import { Router } from "express";
import { z } from "zod";
import Monitor from "../models/Monitor";
import { validate } from "../middleware/validate";
import { createMonitorSchema } from "../validators/monitorSchema";

const router = Router();

const listMonitorsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

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

// GET /api/v1/monitors
router.get("/", async (req, res, next) => {
  try {
    const result = listMonitorsQuerySchema.safeParse(req.query);

    if (!result.success) {
      res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return;
    }

    const { page, limit } = result.data;
    const skip = (page - 1) * limit;

    const [monitors, total] = await Promise.all([
      Monitor.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Monitor.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: monitors,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/monitors/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid monitor ID",
      });
      return;
    }

    const monitor = await Monitor.findById(id);

    if (!monitor) {
      res.status(404).json({
        success: false,
        message: "Monitor not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: monitor,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
