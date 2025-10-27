"use client";
import React from "react";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  animated?: boolean;
}

export function ProgressBar({ value, max = 100, color = "bg-blue-600", showLabel = false, animated = true }: ProgressBarProps) {
  const percent = Math.round((value / max) * 100);
  return (
    <div className="w-full bg-gray-200 rounded h-3 relative" aria-valuenow={value} aria-valuemax={max} aria-valuemin={0} role="progressbar">
      <div className={`${color} h-3 rounded transition ${animated ? 'animate-progress' : ''}`} style={{ width: `${percent}%` }} />
      {showLabel && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-700">{percent}%</span>
      )}
    </div>
  );
}
