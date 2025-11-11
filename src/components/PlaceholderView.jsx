import React from 'react';

const PlaceholderView = ({ icon, message }) => (
  <div className="text-center py-20 text-gray-500">
    {icon && React.createElement(icon, { size: 64, className: "mx-auto mb-4 opacity-50" })}
    <p className="text-lg">{message}</p>
  </div>
);
export default PlaceholderView;