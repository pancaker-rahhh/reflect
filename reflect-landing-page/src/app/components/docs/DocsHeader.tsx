import React from 'react';

const DocsHeader = ({ title, description }: { title: string; description: string }) => {
  return (
    <div className="mb-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-lg text-gray-600">{description}</p>
    </div>
  );
};

export default DocsHeader;
