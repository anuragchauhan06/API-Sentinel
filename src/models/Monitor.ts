
import { Schema, model, InferSchemaType } from "mongoose";

const monitorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    url: {
      type: String,
      required: true,
      trim: true,
    },

    method: {
      type: String,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      default: "GET",
    },

    intervalSeconds: {
      type: Number,
      default: 300,
      min: 30,
    },

    timeoutMs: {
      type: Number,
      default: 10000,
      min: 1000,
      max: 30000,
    },

    expectedStatusCode: {
      type: Number,
      default: 200,
      min: 100,
      max: 599,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["unknown", "up", "down"],
      default: "unknown",
    },

    lastCheckedAt: {
      type: Date,
      default: null,
    },

    lastResponseTimeMs: {
      type: Number,
      default: null,
    },

    lastStatusCode: {
      type: Number,
      default: null,
    },

    lastError: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export type MonitorDocument = InferSchemaType<typeof monitorSchema>;

const Monitor = model("Monitor", monitorSchema);

export default Monitor;
