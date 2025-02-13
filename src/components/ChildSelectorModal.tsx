// src/components/ChildSelectorModal.tsx
// UI component to display the modal for selecting a child account

"use client";

import React from 'react';

export interface ChildSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (childId: string) => void;
  children: { id: string; name: string }[];
}

const ChildSelectorModal: React.FC<ChildSelectorModalProps> = ({ isOpen, onClose, onSelect, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded w-full max-w-md">
        <h2 className="text-2xl mb-4">Select Child</h2>
        <ul>
          {children.map(child => (
            <li key={child.id} className="mb-2">
              <button className="text-blue-600 underline" onClick={() => onSelect(child.id)}>{child.name}</button>
            </li>
          ))}
        </ul>
        <button className="mt-4 px-4 py-2 bg-gray-300 rounded" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ChildSelectorModal; 