// src/components/ChildSelectorModal.tsx
// UI component to display the modal for selecting a child account

"use client";

import React from 'react';

interface ChildSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (childId: string) => void;
  children: any[];
}

const ChildSelectorModal: React.FC<ChildSelectorModalProps> = ({ isOpen, onClose, onSelect, children }) => {
  if (!isOpen) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{ background: '#fff', padding: 20, borderRadius: 8 }}>
        <h2>Select a Child</h2>
        {children && children.map(child => (
          <button key={child.id} onClick={() => onSelect(child.id)} style={{ display: 'block', margin: '8px 0' }}>
            {child.name}
          </button>
        ))}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ChildSelectorModal; 