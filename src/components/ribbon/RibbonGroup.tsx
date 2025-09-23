import React, { forwardRef } from "react";

export type RibbonAction = {
  label: string;
  onClick: () => void;
};

export type RibbonGroupProps = {
  title: string;
  icon?: React.ReactNode;
  actions: RibbonAction[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const RibbonGroup = forwardRef<HTMLDivElement, RibbonGroupProps>(
  ({ title, icon, actions, isOpen, onOpen, onClose }, ref) => {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={onOpen}
          className={`flex items-center gap-1 px-3 py-1 h-9 bg-white border shadow-sm hover:bg-gray-50 rounded text-xs font-medium transition ${
            isOpen ? "bg-blue-50 border-blue-400" : ""
          }`}
        >
          {icon}
          {title}
        </button>
        {isOpen && (
          <div className="absolute z-50 mt-1 bg-white border rounded shadow-xl w-60 right-0 animate-fade-in">
            <ul className="py-1 max-h-80 overflow-y-auto">
              {actions.map(action => (
                <li key={action.label}>
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50"
                    onClick={() => {
                      action.onClick();
                      onClose();
                    }}
                  >
                    {action.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
);
