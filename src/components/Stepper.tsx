"use client";
import React from "react";

interface StepperProps {
  steps: string[];
  current: number;
  vertical?: boolean;
  onStepClick?: (idx: number) => void;
  errors?: number[];
}

export function Stepper({ steps, current, vertical = false, onStepClick, errors = [] }: StepperProps) {
  return (
    <div className={`py-4 ${vertical ? 'flex flex-col gap-4 items-start' : 'flex gap-2 items-center justify-center'}`} role="list" aria-label="Stepper">
      {steps.map((step, idx) => (
        <div
          key={step}
          className={`flex flex-col items-center cursor-pointer ${idx === current ? 'font-bold text-blue-600' : 'text-gray-400'} ${errors.includes(idx) ? 'text-red-500' : ''}`}
          tabIndex={0}
          aria-current={idx === current ? 'step' : undefined}
          aria-invalid={errors.includes(idx) ? 'true' : undefined}
          onClick={() => onStepClick && onStepClick(idx)}
        >
          <div className={`w-6 h-6 rounded-full flex items-center justify-center mb-1 ${idx === current ? 'bg-blue-500 text-white' : errors.includes(idx) ? 'bg-red-200 text-red-700' : 'bg-gray-200'}`}>{idx + 1}</div>
          <span className="text-xs">{step}</span>
        </div>
      ))}
    </div>
  );
}
