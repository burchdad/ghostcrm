import React from "react";

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  canEdit?: boolean;
}

export default function DashboardCard({
  title,
  children,
  draggable = false,
  onDragStart,
  onDrop,
  onDragOver,
  canEdit = false,
}: DashboardCardProps) {
  return (
    <div
      className={`dashboard-card ${canEdit ? "cursor-move" : ""}`}
      draggable={draggable}
      onDragStart={onDragStart}
      onDrop={onDrop}
      onDragOver={onDragOver}
    >
      <div className="dashboard-card-title font-bold mb-2">{title}</div>
      <div className="dashboard-card-content">{children}</div>
    </div>
  );
}
