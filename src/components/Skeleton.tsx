"use client";
import React from "react";

interface SkeletonProps {
  className?: string;
  shape?: "text" | "circle" | "card" | "list";
  count?: number;
  animated?: boolean;
}

export function Skeleton({ className = "h-6 bg-gray-200 rounded w-full animate-pulse", shape = "text", count = 1, animated = true }: SkeletonProps) {
  const baseClass = `${animated ? 'animate-pulse' : ''} bg-gray-200`;
  const getShape = () => {
    switch (shape) {
      case "circle": return "w-8 h-8 rounded-full";
      case "card": return "h-24 w-full rounded-xl";
      case "list": return "h-6 w-full rounded mb-2";
      default: return "h-6 w-full rounded";
    }
  };
  return (
    <div aria-label="Loading" role="status" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`${baseClass} ${getShape()} ${className}`} />
      ))}
    </div>
  );
}
