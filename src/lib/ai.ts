export async function getAIPrediction(query: string, cardId?: string): Promise<string> {
  try {
    const res = await fetch("/api/dashboard/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Analyze this CRM data query and predict future trends: ${query}`,
        cardId,
      }),
    });
    if (!res.ok) {
      return "AI prediction unavailable.";
    }
    const data = await res.json();
    return data?.result || data?.prediction || "AI prediction unavailable.";
  } catch {
    return "AI prediction unavailable.";
  }
}
