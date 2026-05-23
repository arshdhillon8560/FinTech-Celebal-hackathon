import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const generateGroqText = async (prompt) => {
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    max_tokens: 350,
  });

  return chatCompletion.choices[0]?.message?.content || "";
};

const groqAPI = {
  analyzeExpenses: async (transactions) => {
    try {
      // ================= FILTER EXPENSES =================
      const expenses = transactions.filter(
        (t) => t.type === "expense"
      );

      if (expenses.length === 0) {
        return {
          data: "• No expense data available yet.",
        };
      }

      // ================= TOTAL SPENDING =================
      const totalSpent = expenses.reduce(
        (sum, t) => sum + Number(t.amount),
        0
      );

      // ================= CATEGORY TOTALS =================
      const categoryTotals = {};

      expenses.forEach((t) => {
        const category = t.category || "other";

        categoryTotals[category] =
          (categoryTotals[category] || 0) +
          Number(t.amount);
      });

      // ================= SORT CATEGORIES =================
      const sortedCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]);

      const topCategory = sortedCategories[0]?.[0];
      const topAmount = sortedCategories[0]?.[1];

      // ================= BUILD PROMPT =================
      const prompt = `
You are a professional fintech AI assistant.

Analyze ONLY the user's actual financial data below.

User Data:
- Total Spending: $${totalSpent.toFixed(2)}
- Top Category: ${topCategory} ($${topAmount.toFixed(2)})

Category Breakdown:
${sortedCategories
  .map(
    ([cat, amt]) =>
      `${cat}: $${Number(amt).toFixed(2)}`
  )
  .join("\n")}

Instructions:
- Use concise fintech-style insights
- Mention ONLY actual categories from data
- NO generic advice
- NO fake assumptions
- Keep response analytical
- Maximum 5 points
- Use clean bullet points
- NO markdown stars (*)
- NO headings
- Each point should be short and readable
`;

      // ================= GROQ RESPONSE =================
      const result = await generateGroqText(prompt);

      // ================= CLEAN OUTPUT =================
      let cleaned = result
        .replace(/\*\*/g, "")
        .replace(/^\s*[\*\-]\s*/gm, "• ")
        .replace(/\n\s*\n/g, "\n")
        .replace(/•\s+/g, "• ")
        .trim();

      // Ensure bullets exist
      if (!cleaned.includes("•")) {
        cleaned = cleaned
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .map((line) => `• ${line}`)
          .join("\n");
      }

      return {
        data: cleaned,
      };
    } catch (error) {
      console.error("Groq API Error:", error);

      return {
        data:
          "• Unable to generate financial insights right now.",
      };
    }
  },
};

export { groqAPI };