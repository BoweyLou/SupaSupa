'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface AccordionSectionProps {
  title: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  isParent?: boolean;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({ 
  title, 
  defaultExpanded = true, 
  children,
  isParent = false
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className={`mb-4 rounded-lg overflow-hidden shadow-md ${isParent ? 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200' : 'bg-white'}`}>
      <div 
        className={`flex justify-between items-center p-4 cursor-pointer ${isParent ? 'bg-gradient-to-r from-blue-100 to-purple-100' : 'bg-gray-50'}`}
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-xl font-semibold">{title}</h3>
        <div>
          {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </div>
      {expanded && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );
};

interface DashboardAccordionProps {
  sections: {
    id: string;
    title: string;
    content: React.ReactNode;
    isParent?: boolean;
  }[];
  gridLayout?: boolean;
}

const DashboardAccordion: React.FC<DashboardAccordionProps> = ({ 
  sections,
  gridLayout = true
}) => {
  // Filter sections into parent and child sections
  const childSections = sections.filter(section => !section.isParent);
  const parentSections = sections.filter(section => section.isParent);

  return (
    <div className="w-full">
      {/* Child sections with optional grid layout */}
      <div className={gridLayout ? 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4' : ''}>
        {childSections.map((section) => (
          <AccordionSection 
            key={section.id} 
            title={section.title} 
            defaultExpanded={true}
          >
            {section.content}
          </AccordionSection>
        ))}
      </div>

      {/* Parent sections always in full width */}
      <div>
        {parentSections.map((section) => (
          <AccordionSection 
            key={section.id} 
            title={section.title} 
            defaultExpanded={true}
            isParent={true}
          >
            {section.content}
          </AccordionSection>
        ))}
      </div>
    </div>
  );
};

export default DashboardAccordion; 