"use client";
import React, { useMemo, useRef, useState } from "react";
import { useRibbon } from "./RibbonProvider";
import { CONTROLS } from "./registry";
import type { RibbonControl } from "./types";

function useOutsideClick(ref: React.RefObject<HTMLElement>, onClose: () => void) {
  React.useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, onClose]);
}

export default function Ribbon() {
  // Remove all security/context logic for now, show all controls
  const groups = useMemo(() => {
    const map = new Map<string, { ctrl: RibbonControl; enabled: boolean; disabled: boolean }[]>();
    CONTROLS.forEach(c => {
      const arr = map.get(c.group) || [];
      arr.push({ ctrl: c, enabled: true, disabled: false });
      map.set(c.group, arr);
    });
    return Array.from(map.entries());
  }, []);

  return (
    <>
      <div className="w-full flex flex-wrap items-center gap-3">
        {groups.map(([title, items]) => (
          <RibbonGroup key={title} title={title} items={items} />
        ))}
      </div>
      {/* Debug panel removed: all controls are now always enabled */}
    </>
  );
}

function RibbonGroup({ title, items }: { title: string; items: { ctrl: RibbonControl; disabled: boolean }[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, () => open && setOpen(false));

  // Only show group button if at least one item is visible for this role/context
  const hasVisible = items.some(({ ctrl, disabled }) => !disabled);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`px-3 h-9 bg-white border rounded shadow-sm text-xs font-medium hover:bg-gray-50 ${!hasVisible ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={!hasVisible}
      >
        {title}
      </button>
      {open && (
        <div className="absolute z-50 mt-1 right-0 w-56 bg-white border rounded shadow-xl">
          <ul className="py-1 max-h-80 overflow-y-auto">
            {hasVisible ? (
              items.filter(({ ctrl, disabled }) => !disabled).map(({ ctrl }) => (
                <li key={ctrl.id} className="px-1">
                  {ctrl.render
                    ? ctrl.render({
                        disabled: false,
                        onClick: ctrl.onClick,
                        state: {} as any,
                      })
                    : (
                      <button
                        type="button"
                        onClick={ctrl.onClick}
                        className="w-full text-left px-3 py-2 text-sm rounded hover:bg-blue-50"
                      >
                        {ctrl.label}
                      </button>
                    )}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-gray-400">No actions available</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

const defaultButton = (label: string, disabled: boolean) => () =>
  <button disabled={disabled}
          className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-blue-50 ${disabled ? "text-gray-400 cursor-not-allowed" : ""}`}>
    {label}
  </button>;
