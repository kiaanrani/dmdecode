import { Worker } from "bullmq";
import { prisma } from "../config/prisma.js";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

console.log("🔵 Dream Worker Started (GROQ Mode)");

// Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Clean JSON helper
function cleanJSON(text) {
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

// MAIN WORKER
const w = new Worker(
  "dream-processing",
  async (job) => {
    console.log("📥 Job received:", job.data);

    const { dreamId } = job.data;

    // Fetch dream
    const dream = await prisma.dream.findUnique({
      where: { id: dreamId },
    });

    if (!dream) {
      console.log("❌ Dream not found in DB");
      return;
    }

    console.log("📝 Dream text:", dream.text);

    // AI Prompt
    const prompt = `
You are a professional dream interpretation AI.

Interpret the following dream and return JSON only:

Dream Text: "${dream.text}"

Return STRICT JSON in this exact format:

{
  "summary": "short summary",
  "moodTags": ["tag1", "tag2"],
  "stressScore": 0-100,
  "interpretation": [
    "point 1",
    "point 2",
    "point 3"
  ]
}
`;

    let aiResponse;

    try {
      console.log("⚙️ Sending request to Groq...");

      const result = await groq.chat.completions.create({
       model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 500,
      });

      const raw = result.choices[0].message.content;
      console.log("🔵 Raw AI Response:", raw);

      const cleaned = cleanJSON(raw);
      console.log("🟢 Cleaned AI Response:", cleaned);

      aiResponse = JSON.parse(cleaned);
      console.log("✅ Parsed JSON:", aiResponse);

    } catch (err) {
      console.log("❌ GROQ ERROR:", err);

      aiResponse = {
        summary: "Dream indicates emotional uncertainty.",
        moodTags: ["unknown"],
        stressScore: 50,
        interpretation: ["Unable to generate detailed interpretation."],
      };
    }

    // Save result to DB
    await prisma.dream.update({
      where: { id: dreamId },
      data: {
        summary: aiResponse.summary,
        interpretation: aiResponse,
        moodTags: aiResponse.moodTags,
        stressScore: aiResponse.stressScore,
        processed: true,
      },
    });

    console.log("✅ Dream updated in DB for:", dreamId);

    return true;
  },
  {
    connection: { url: process.env.REDIS_URL },
  }
);

// Worker Event Listeners
w.on("completed", (job) => {
  console.log(`🎉 Job completed: ${job.id}`);
});

w.on("failed", (job, err) => {
  console.error(`❌ Job failed: ${job?.id}`, err);
});

w.on("error", (err) => {
  console.error("❌ Worker Error:", err);
});

export default w;
