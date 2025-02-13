import React from 'react';

interface DashboardNavProps {
  username: string;
  onSignOut: () => void;
}

const DashboardNav: React.FC<DashboardNavProps> = ({ username, onSignOut }) => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Family Dashboard</h1>
          </div>
          <div className="flex items-center">
            <span className="mr-4">Welcome, {username}</span>
            <button
              onClick={onSignOut}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default DashboardNav; 