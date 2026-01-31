"use client";
import React from "react";

export default function NLQInput({ onCreateCard }: { onCreateCard: (card: any) => void }) {
  async function handleAskAI() {
    const input = (document.getElementById('nlq-input') as HTMLInputElement).value;
    if (!input) return;

    try {
      const res = await fetch("/api/ai/nlq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input })
      });
      if (!res.ok) throw new Error("AI NLQ failed");
      const data = await res.json();

      const aiCard = {
        name: data.title || input,
        chartType: data.chartType || "bar",
        groupBy: data.groupBy || "",
        metric: data.metric || "",
        reps: data.reps || [],
        status: data.status || [],
        query: input,
        filters: data.filters || {},
        aiEnabled: true,
        color: data.color || "#a855f7",
        description: data.description || "Generated from natural language query"
      };

      onCreateCard(aiCard);
    } catch (err) {
      alert("AI parsing failed. Please try again.");
    }

    (document.getElementById('nlq-input') as HTMLInputElement).value = "";
  }

  return (
    <div className="mb-4 flex gap-2 items-center">
      <input
        type="text"
        placeholder="Ask a question (e.g. 'Show me sales by rep last month')"
        className="border rounded px-2 py-1 w-full"
        id="nlq-input"
      />
      <button className="px-2 py-1 bg-purple-500 text-white rounded" onClick={handleAskAI}>
        Ask AI
      </button>
    </div>
  );
}
