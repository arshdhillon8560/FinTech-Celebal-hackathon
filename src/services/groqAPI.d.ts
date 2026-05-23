export const groqAPI: {
  analyzeExpenses: (summaryText: string) => Promise<{
    data: string;
  }>;
};
