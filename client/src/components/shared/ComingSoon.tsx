import React from 'react';
import { Clock } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ 
  title, 
  description = 'This feature is currently under development and will be available soon.',
  icon 
}) => {
  return (
    <div className="p-6">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon || <Clock className="w-8 h-8 text-gray-400" />}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-4 max-w-md mx-auto">{description}</p>
        <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
          <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 animate-pulse"></div>
          Coming Soon
        </div>
      </div>
    </div>
  );
};