// src/components/ChildSelectorModal.tsx
// UI component to display the modal for selecting a child account

"use client";

import React from 'react';
import { Child } from './ChildAccountCard';

interface ChildSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (childId: string) => void;
  childAccounts: Child[];
}

const ChildSelectorModal: React.FC<ChildSelectorModalProps> = ({ isOpen, onClose, onSelect, childAccounts }) => {
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
        {childAccounts && childAccounts.map(child => (
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