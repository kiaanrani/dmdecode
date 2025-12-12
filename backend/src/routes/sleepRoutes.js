// src/routes/sleepRoutes.js
import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  createSleepSession,
  listSleepSessions,
  getSleepSessionById,
} from "../controllers/sleepController.js";

const router = express.Router();

// All routes require auth
router.use(requireAuth);

// Create sleep session
router.post("/", createSleepSession);

// List sessions (optional query: from=ISO,to=ISO)
router.get("/", listSleepSessions);

// Get by id
router.get("/:id", getSleepSessionById);

export default router;
