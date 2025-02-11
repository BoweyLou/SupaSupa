// src/components/DashboardSection.tsx
// DashboardSection: A reusable container for dashboard sections with a header and optional toggleable content

import React, { useState } from 'react';

interface DashboardSectionProps {
  title: React.ReactNode;
  toggleable?: boolean;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ title, toggleable = false, defaultExpanded = true, children }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{title}</h2>
        {toggleable && (
          <button onClick={() => setExpanded(!expanded)} className="text-blue-600">
            {expanded ? `Hide ${title}` : `Show ${title}`}
          </button>
        )}
      </div>
      {(!toggleable || expanded) && (
        <div>
          {children}
        </div>
      )}
    </section>
  );
};

export default DashboardSection; 