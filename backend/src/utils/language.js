import Groq from "groq-sdk";

// Groq Client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ---------------------------------------------
// 1️⃣ Detect Language (English / Hindi / Hinglish)
// ---------------------------------------------
export function detectLanguage(text) {
  // Check for Hindi characters (Devanagari script)
  const hindiChars = /[\u0900-\u097F]/;

  if (hindiChars.test(text)) {
    return "hindi";
  }

  // Hinglish pattern (Romanized Hindi)
  const hinglishPattern = /\b(hai|tha|thi|hun|hoon|mujhe|maine|sapna|sapne|raat|logo|logon|dekha|marte|khoon|ghar|khana|kya|kaise)\b/i;

  if (hinglishPattern.test(text)) {
    return "hinglish";
  }

  return "english";
}

// ---------------------------------------------
// 2️⃣ Convert Hinglish → English using Groq (LLaMA 3.1)
// ---------------------------------------------
export async function convertHinglishToEnglish(text) {
  try {
    const prompt = `
Translate the following Hinglish or Hindi text into natural English.
Do NOT add explanation or extra sentences.
Only return the translated text.

Text:
"${text}"
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // 🔥 FAST + FREE + ACCURATE
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 150,
    });

    const translated = response.choices[0].message.content.trim();
    return translated;

  } catch (error) {
    console.log("Groq Translation Error:", error);
    return text; // fallback → return original text
  }
}
