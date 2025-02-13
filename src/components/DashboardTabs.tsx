"use client";

import React from "react";

export interface DashboardTabsProps {
  tabs: { id: string; label: string }[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex w-full mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 text-center py-3 px-6 text-xl ${activeTab === tab.id ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-md rounded-t' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-t'}`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default DashboardTabs; 