import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./config/prisma.js";

import dreamRoutes from "./routes/dreamRoutes.js";
import sleepRoutes from "./routes/sleepRoutes.js";
import authRoutes from "./routes/authRoutes.js";
const PORT = process.env.PORT || 3000;

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ status: "DreamDecoder Backend Running" }));

app.use("/auth", authRoutes);
app.use("/dreams", dreamRoutes);
app.use("/sleep", sleepRoutes);

app.listen(process.env.PORT, () =>
  console.log("Server running on port", PORT )
);
