import { Queue } from "bullmq";
import dotenv from "dotenv";
dotenv.config();

export const dreamQueue = new Queue("dream-processing", {
  connection: { url: process.env.REDIS_URL }
});
