// src/components/CompletedTaskCard.tsx
// UI component to display a small completed task card

"use client";

import React from "react";

interface CompletedTaskCardProps {
  task: {
    id: string;
    title: string;
    description?: string;
    completedAt?: string;
    points?: number;
  };
}

const CompletedTaskCard: React.FC<CompletedTaskCardProps> = ({ task }) => {
  return (
    <div className="p-4 bg-green-100 rounded shadow mb-2">
      <h3 className="text-lg font-semibold">{task.title}</h3>
      {task.description && <p>{task.description}</p>}
      {task.completedAt && <p className="text-sm text-gray-500">Completed at: {new Date(task.completedAt).toLocaleString()}</p>}
      {task.points !== undefined && <p className="text-sm text-gray-700">Points: {task.points}</p>}
    </div>
  );
};

export default CompletedTaskCard; 