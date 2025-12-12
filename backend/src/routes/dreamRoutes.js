import express from "express";
import { createDream, getDreams } from "../controllers/dreamController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",requireAuth, createDream);
router.get("/",requireAuth, getDreams);

export default router;
