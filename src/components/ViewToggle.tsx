'use client';

import React from 'react';
import { Layers, List } from 'lucide-react';

export type ViewMode = 'tabs' | 'accordion';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-sm font-medium text-gray-700">Dashboard View:</span>
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onViewModeChange('tabs')}
          className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
            viewMode === 'tabs'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Layers className="w-4 h-4 mr-1.5" />
          Tabs
        </button>
        <button
          onClick={() => onViewModeChange('accordion')}
          className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
            viewMode === 'accordion'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <List className="w-4 h-4 mr-1.5" />
          Stacked
        </button>
      </div>
    </div>
  );
};

export default ViewToggle; 