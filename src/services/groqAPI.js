import Groq from "groq-sdk";

// Initialize Groq client with API key from environment
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const generateGroqText = async (prompt) => {
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.1-70b-versatile", // Currently supported Groq model
      temperature: 0.5,
      max_tokens: 500,
    });

    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Groq API Error:", error);
    throw error;
  }
};

const groqAPI = {
  analyzeExpenses: async (summaryText) => {
    console.log("Sending to Groq:", summaryText);

    try {
      const prompt = `
        Analyze my expenses in plain, simple language.
        Focus on key insights and patterns, not raw numbers.
        Provide 3-5 concise points that highlight trends, areas of concern, and suggestions.
      `;

      const result = await generateGroqText(
        `${prompt}\nData: ${summaryText}`
      );

      console.log("Groq result:", result);

      // === Simplify output ===
      let simplified = result
        .replace(/\*\*.*?\*\*/g, "")
        .replace(/^\s*-\s*/gm, "• ")
        .replace(/Income:.*Expenses:.*/s, "")
        .replace(/\s{2,}/g, " ")
        .trim();

      if (!simplified || simplified.length < 10) {
        simplified =
          "Your spending is generally under control, with room for savings. Focus on big categories like food and shopping for optimization.";
      }

      return { data: simplified };
    } catch (err) {
      console.error("Groq API error:", err);

      return {
        data:
          "Unable to generate AI analysis. Overall, your finances seem stable — consider tracking big expense categories for better insights.",
      };
    }
  },
};

export { groqAPI };