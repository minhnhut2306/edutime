import React from 'react';

const NavButton = ({ icon, label, view, currentView, onClick, badge }) => {
  const Icon = icon;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${currentView === view
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-gray-700 hover:bg-gray-100'
        }`}
    >
      {Icon && <Icon size={20} />}
      <span className="font-medium">{label}</span>
      {badge !== undefined && (
        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
};
export default NavButton;