// config/gemini.js
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyDlJHcOlXrbIrELqMYJivReonT7lDYXG8k", // your key
});

async function generateGeminiText(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const text = response?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text;

    console.warn("⚠️ Unexpected Gemini response format:", response);
    return "⚠️ Gemini responded with an unexpected format.";
  } catch (err) {
    console.error("❌ Gemini error:", err);
    return "❗ Error: Unable to generate response.";
  }
}

export default generateGeminiText;
