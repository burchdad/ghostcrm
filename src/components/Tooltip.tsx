"use client";
import React, { useState, useRef } from "react";

interface TooltipProps {
  text: string | React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  placement?: "top" | "bottom" | "left" | "right";
  controlled?: boolean;
  open?: boolean;
}

export function Tooltip({ text, children, delay = 200, placement = "top", controlled = false, open }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const show = () => {
    timer.current = setTimeout(() => setVisible(true), delay);
  };
  const hide = () => {
    if (timer.current) clearTimeout(timer.current);
    setVisible(false);
  };
  const isOpen = controlled ? open : visible;
  const posClass = {
    top: "left-1/2 -translate-x-1/2 bottom-full mb-2",
    bottom: "left-1/2 -translate-x-1/2 top-full mt-2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  }[placement];
  return (
    <span
      className="relative group"
      tabIndex={0}
      aria-label={typeof text === 'string' ? text : undefined}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {isOpen && (
        <span className={`absolute ${posClass} px-2 py-1 bg-black text-white text-xs rounded transition pointer-events-none z-50 whitespace-nowrap`} role="tooltip">
          {text}
        </span>
      )}
    </span>
  );
}
