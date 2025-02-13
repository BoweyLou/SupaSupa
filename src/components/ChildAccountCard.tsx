"use client";

import React from 'react';
import { Settings, Trash } from 'lucide-react';

// Define interface for ChildAccountCard props
interface ChildAccountCardProps {
  child: {
    id: string;
    name: string;
    points?: number;
    [key: string]: any;
  };
  isEditing: boolean;
  editingChildName: string;
  onEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSaveEdit: (childId: string) => void;
  onCancelEdit: () => void;
  onEditClick: (child: any) => void;
  onDelete: (childId: string) => void;
}

const ChildAccountCard: React.FC<ChildAccountCardProps> = ({
  child,
  isEditing,
  editingChildName,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  onEditClick,
  onDelete
}) => {
  return (
    <li className="relative p-2 border-b">
      {isEditing ? (
        <div>
          <input
            type="text"
            value={editingChildName}
            onChange={onEditChange}
            className="border rounded p-1 mr-2"
          />
          <button onClick={() => onSaveEdit(child.id)} className="text-green-600 mr-2">Save</button>
          <button onClick={onCancelEdit} className="text-red-600">Cancel</button>
        </div>
      ) : (
        <div className="flex items-center">
          <span>{child.name}</span>
          <div className="absolute top-1 right-2 flex space-x-1">
            <button onClick={() => onEditClick(child)} className="text-gray-500 hover:text-gray-700" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={() => onDelete(child.id)} className="text-gray-500 hover:text-red-600" title="Delete">
              <Trash className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </li>
  );
};

export default ChildAccountCard; 