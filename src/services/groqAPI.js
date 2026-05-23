import Groq from "groq-sdk";

// Initialize Groq client
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
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
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
You are a professional fintech AI financial assistant.

Analyze the user's expenses and provide:

1. Spending Pattern
2. Biggest Concern
3. Positive Insight
4. Savings Recommendation
5. Financial Health Score (out of 10)

Rules:
- Use concise professional language
- Use bullet points only
- Maximum 5 bullets
- No introductions
- No long paragraphs
- No repeating raw data
- Focus on analytical insights
- Keep output clean and dashboard-friendly

Example:

• Spending Pattern: Most spending is concentrated in healthcare and utilities.

• Biggest Concern: Healthcare costs are significantly higher than discretionary spending.

• Positive Insight: Shopping expenses remain controlled.

• Savings Recommendation: Reduce recurring utility usage and review healthcare subscriptions.

• Financial Health Score: 7.5/10
`;

      const result = await generateGroqText(
        `${prompt}\n\nExpense Data:\n${summaryText}`
      );

      console.log("Groq result:", result);

      // Clean formatting
      let simplified = result
        .replace(/\*\*/g, "")
        .replace(/^\s*-\s*/gm, "• ")
        .replace(/\n{2,}/g, "\n")
        .trim();

      // Fallback response
      if (!simplified || simplified.length < 10) {
        simplified = `
• Spending Pattern: Your spending is balanced across major categories.

• Biggest Concern: Some recurring expenses may need optimization.

• Positive Insight: Essential spending remains under control.

• Savings Recommendation: Monitor shopping and utility expenses closely.

• Financial Health Score: 7/10
        `.trim();
      }

      return { data: simplified };
    } catch (err) {
      console.error("Groq API error:", err);

      return {
        data: `
• Spending Pattern: Your expenses appear manageable overall.

• Biggest Concern: Some categories may require better tracking.

• Positive Insight: Spending habits remain relatively stable.

• Savings Recommendation: Focus on reducing unnecessary recurring costs.

• Financial Health Score: 6.8/10
        `.trim(),
      };
    }
  },
};

export { groqAPI };