import React from 'react';

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`
      w-full
      px-4 sm:px-6 lg:px-8
      ${className}
    `}>
      <div className="max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
};

export const MobileOptimizedCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="
      bg-tertiary 
      rounded-lg sm:rounded-xl lg:rounded-2xl
      shadow-md sm:shadow-lg lg:shadow-2xl
      p-4 sm:p-6 lg:p-8
      mx-2 sm:mx-0
    ">
      {children}
    </div>
  );
};