import React from "react";

interface SidebarBlockProps {
  type: string;
  label: string;
  color: string;
  icon: React.ReactNode;
  onDragStart: (e: React.DragEvent, type: string) => void;
}

export const SidebarBlock = ({
  type,
  label,
  color,
  icon,
  onDragStart,
}: SidebarBlockProps) => (
  <div
    draggable
    onDragStart={(e) => onDragStart(e, type)}
    className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg cursor-grab bg-white hover:bg-gray-100 border border-gray-200 shadow-sm"
    style={{ borderLeft: `4px solid ${color}` }}
  >
    <span style={{ color, fontSize: 22 }}>{icon}</span>
    <span className="font-medium text-base">{label}</span>
  </div>
);
