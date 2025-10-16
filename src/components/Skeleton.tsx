"use client";
import React from "react";

interface SkeletonProps {
  className?: string;
  shape?: "text" | "circle" | "card" | "list" | "rectangular";
  count?: number;
  animated?: boolean;
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'rectangular' | 'circular' | 'card';
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({ 
  className = "h-6 bg-gray-200 rounded w-full animate-pulse", 
  shape = "text", 
  count = 1, 
  animated = true,
  width,
  height,
  variant,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClass = `${animated ? 'animate-pulse' : ''} bg-gray-200`;
  const getShape = () => {
    // Use variant if provided, otherwise use legacy shape
    const currentShape = variant || shape;
    switch (currentShape) {
      case "circle":
      case "circular": 
        return "w-8 h-8 rounded-full";
      case "card": 
        return "h-24 w-full rounded-xl";
      case "list": 
        return "h-6 w-full rounded mb-2";
      case "rectangular":
        return "rounded";
      default: 
        return "h-6 w-full rounded";
    }
  };
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]',
    none: ''
  };

  const style = {
    ...(width && { width }),
    ...(height && { height })
  };

  return (
    <div aria-label="Loading" role="status" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className={`${baseClass} ${getShape()} ${animationClasses[animation]} ${className}`} 
          style={style}
        />
      ))}
    </div>
  );
}

// Skeleton components for common layouts
export const CardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
    <Skeleton shape="text" className="w-3/5 h-6" />
    <Skeleton shape="text" className="w-full h-4" />
    <Skeleton shape="text" className="w-4/5 h-4" />
    <div className="flex gap-2 mt-4">
      <Skeleton shape="rectangular" className="w-20 h-8" />
      <Skeleton shape="rectangular" className="w-20 h-8" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="flex gap-4">
        <Skeleton shape="rectangular" className="w-12 h-8" />
        <Skeleton shape="text" className="w-1/5" />
        <Skeleton shape="text" className="w-3/10" />
        <Skeleton shape="text" className="w-1/6" />
        <Skeleton shape="text" className="w-1/10" />
      </div>
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <Skeleton shape="text" className="w-2/5 h-6 mb-4" />
    <Skeleton shape="rectangular" className="w-full h-64" />
  </div>
);
