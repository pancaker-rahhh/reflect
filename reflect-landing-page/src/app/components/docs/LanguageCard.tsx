import React from 'react';

interface LanguageCardProps {
  language: string;
  code: string;
  color: string;
}

const LanguageCard = ({ language, code, color }: LanguageCardProps) => {
  const colorClasses: { [key: string]: string } = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
    purple: 'bg-purple-50 border-purple-200',
    pink: 'bg-pink-50 border-pink-200',
    indigo: 'bg-indigo-50 border-indigo-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color] || 'bg-gray-50 border-gray-200'}`}>
      <h4 className="font-semibold text-gray-800">{language}</h4>
      <p className="text-sm text-gray-600 mt-1 font-mono">{code}</p>
    </div>
  );
};

export default LanguageCard;
