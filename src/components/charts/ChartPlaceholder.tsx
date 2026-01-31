import React from "react";

export default function ChartPlaceholder({ title }: { title: string }) {
  return (
    <div className="card mb-4">
      <div className="font-bold mb-2">{title}</div>
      <div className="h-32 flex items-center justify-center text-gray-400">[Chart]</div>
    </div>
  );
}
