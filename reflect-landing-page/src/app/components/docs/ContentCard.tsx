import React from 'react';

const ContentCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6 shadow-sm">
      {children}
    </div>
  );
};

export default ContentCard;
