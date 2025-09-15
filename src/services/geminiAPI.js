import generateGeminiText from '../config/gemini';

const geminiAPI = {
  analyzeExpenses: async (summaryText) => {
    console.log('Sending to Gemini:', summaryText);

    try {
      // Ask Gemini for a short, fact-based summary
      const prompt = `
        Analyze my expenses in plain, simple language.
        Focus on key insights and patterns, not raw numbers.
        Provide 3-5 concise points that highlight trends, areas of concern, and suggestions.
      `;

      const result = await generateGeminiText(`${prompt}\nData: ${summaryText}`);
      console.log('Gemini result:', result);

      // === Simplify output ===
      let simplified = result
        .replace(/\*\*.*?\*\*/g, '')        // remove bold markers
        .replace(/^\s*-\s*/gm, '• ')        // convert lists to bullet points
        // remove large raw numbers
        .replace(/Income:.*Expenses:.*/s, '')    // remove repetitive totals
        .replace(/\s{2,}/g, ' ')                 // collapse multiple spaces
        .trim();

      // Fallback if Gemini returns empty or nonsensical output
      if (!simplified || simplified.length < 10) {
        simplified = 'Your spending is generally under control, with room for savings. Focus on big categories like food and shopping for optimization.';
      }

      return { data: simplified };
    } catch (err) {
      console.error('Gemini API error:', err);
      // Return a friendly fallback summary if API fails
      return {
        data: 'Unable to generate AI analysis. Overall, your finances seem stable — consider tracking big expense categories for better insights.'
      };
    }
  },
};

export { geminiAPI };
