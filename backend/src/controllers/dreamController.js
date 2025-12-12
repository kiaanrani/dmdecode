import { prisma } from "../config/prisma.js";
import { Queue } from "bullmq";
import { detectLanguage, convertHinglishToEnglish } from "../utils/language.js";

const dreamQueue = new Queue("dream-processing", {
  connection: { url: process.env.REDIS_URL },
});

// CREATE DREAM
export const createDream = async (req, res) => {
  try {
    const userId = req.user.id;
    let { text } = req.body; // correct: let

    if (!text) {
      return res.status(400).json({ message: "Dream text required" });
    }

    // Detect Hinglish/Hindi and translate using Groq
    const lang = detectLanguage(text);
    if (lang === "hinglish" || lang === "hindi") {
      text = await convertHinglishToEnglish(text);
    }

    // Save dream in DB
    const dream = await prisma.dream.create({
      data: { text, userId },
    });

    // Add to queue for Groq interpretation
    await dreamQueue.add("process-dream", { dreamId: dream.id });

    // Send response back
    return res.json({ message: "Dream saved", dream });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Server error" });
  }
};


// GET DREAMS
export const getDreams = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    const dreams = await prisma.dream.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return res.json(dreams);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Cannot fetch dreams" });
  }
};
