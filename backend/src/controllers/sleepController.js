// src/controllers/sleepController.js
import { prisma } from "../config/prisma.js";

/**
 * POST /sleep
 * body: { startAt: ISO string, endAt: ISO string, sleepStages?: JSON (object/array) }
 * user from req.user.id
 */
export const createSleepSession = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { startAt, endAt, sleepStages } = req.body;

    if (!startAt || !endAt) {
      return res.status(400).json({ message: "startAt and endAt are required (ISO strings)" });
    }

    const start = new Date(startAt);
    const end = new Date(endAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format. Use ISO string." });
    }

    if (end <= start) {
      return res.status(400).json({ message: "endAt must be after startAt" });
    }

    const durationMinutes = Math.round((end - start) / 60000);

    const session = await prisma.sleepSession.create({
      data: {
        userId,
        startAt: start,
        endAt: end,
        // prisma schema: sleepStages is Json?
        ...(sleepStages ? { sleepStages } : {}),
      },
    });

    return res.status(201).json({
      message: "Sleep session created",
      session: {
        id: session.id,
        startAt: session.startAt,
        endAt: session.endAt,
        durationMinutes,
        createdAt: session.createdAt,
      },
    });
  } catch (err) {
    console.error("createSleepSession error:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

/**
 * GET /sleep?from=ISO&to=ISO&limit=&offset=
 * Lists sessions for authenticated user.
 */
export const listSleepSessions = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { from, to, limit = 50, offset = 0 } = req.query;

    const where = { userId };

    if (from || to) {
      where.startAt = {};
      if (from) where.startAt.gte = new Date(from);
      if (to) where.startAt.lte = new Date(to);
    }

    const sessions = await prisma.sleepSession.findMany({
      where,
      orderBy: { startAt: "desc" },
      take: Number(limit),
      skip: Number(offset),
    });

    // add durationMinutes to each
    const result = sessions.map((s) => {
      const durationMinutes = Math.round((new Date(s.endAt) - new Date(s.startAt)) / 60000);
      return { ...s, durationMinutes };
    });

    return res.json({ count: result.length, sessions: result });
  } catch (err) {
    console.error("listSleepSessions error:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};

/**
 * GET /sleep/:id
 */
export const getSleepSessionById = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const session = await prisma.sleepSession.findUnique({ where: { id } });

    if (!session || session.userId !== userId) {
      return res.status(404).json({ message: "Sleep session not found" });
    }

    const durationMinutes = Math.round((new Date(session.endAt) - new Date(session.startAt)) / 60000);

    return res.json({ ...session, durationMinutes });
  } catch (err) {
    console.error("getSleepSessionById error:", err);
    return res.status(500).json({ message: "Internal server error", error: err.message });
  }
};
