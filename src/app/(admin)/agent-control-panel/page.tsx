"use client";
import React, { useState } from "react";

// Mock data for tasks and conversations
const mockTasks = [
  { id: 1, title: "Follow up with lead John Doe", status: "pending" },
  { id: 2, title: "Schedule demo for Acme Corp", status: "in-progress" },
  { id: 3, title: "Review contract for Widget Inc", status: "completed" },
];
const mockConvos = [
  { id: 1, user: "John Doe", messages: ["Hi, I'm interested in your product.", "Can we schedule a call?"] },
  { id: 2, user: "Acme Corp", messages: ["Please send the demo link.", "Thanks!"] },
];

export default function AgentControlPanel() {
  const [tasks, setTasks] = useState(mockTasks);
  const [convos, setConvos] = useState(mockConvos);
  const [selectedConvo, setSelectedConvo] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  function assignTask(taskId: number, agent: string) {
    // Simulate assignment
    alert(`Task ${taskId} assigned to ${agent}`);
  }
  function trainPrompt(newPrompt: string) {
    setPromptHistory([...promptHistory, newPrompt]);
    alert("Prompt trained in real-time!");
    setPrompt("");
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🧠 AI Agent Control Panel</h1>
      {/* Task Assignment */}
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Assign Tasks</h2>
        <ul className="mb-2">
          {tasks.map(task => (
            <li key={task.id} className="flex items-center gap-2 mb-1">
              <span>{task.title}</span>
              <span className={`px-2 py-1 rounded text-xs ${task.status === "completed" ? "bg-green-100 text-green-700" : task.status === "in-progress" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>{task.status}</span>
              <button className="px-2 py-1 bg-blue-500 text-white rounded text-xs" onClick={() => assignTask(task.id, "AI Agent")}>Assign to AI Agent</button>
            </li>
          ))}
        </ul>
      </div>
      {/* Conversation History */}
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Conversation History</h2>
        <ul className="mb-2">
          {convos.map(convo => (
            <li key={convo.id} className="mb-2">
              <button className="text-blue-600 underline" onClick={() => setSelectedConvo(convo.id)}>{convo.user}</button>
              {selectedConvo === convo.id && (
                <ul className="ml-4 mt-1 text-xs text-gray-700">
                  {convo.messages.map((msg, idx) => <li key={idx}>{msg}</li>)}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
      {/* Real-time Prompt Training */}
      <div className="bg-white rounded shadow p-4 mb-4">
        <h2 className="font-bold mb-2">Train Agent Prompts (Real-Time)</h2>
        <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Enter new prompt..." className="border rounded px-2 py-1 w-full mb-2" />
        <button className="px-2 py-1 bg-green-500 text-white rounded text-xs" onClick={() => trainPrompt(prompt)} disabled={!prompt}>Train Prompt</button>
        <div className="mt-2 text-xs text-gray-600">
          <strong>Prompt History:</strong>
          <ul>
            {promptHistory.map((p, idx) => <li key={idx}>{p}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
