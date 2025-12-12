// import {GoogleGenAI} from '@google/genai';
import { GoogleGenerativeAI } from "@google/generative-ai";
export const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
