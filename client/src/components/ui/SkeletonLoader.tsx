import React from 'react';

interface SkeletonLoaderProps {
  className?: string;
  count?: number;
  height?: string;
  width?: string;
  circle?: boolean;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  count = 1,
  height = 'h-4',
  width = 'w-full',
  circle = false,
}) => {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((item) => (
        <div
          key={item}
          className={`animate-pulse ${className}`}
        >
          <div
            className={`bg-gray-200 ${circle ? 'rounded-full' : 'rounded'} ${height} ${width}`}
          />
        </div>
      ))}
    </>
  );
};

export const SkeletonCard: React.FC<{ lines?: number }> = ({ lines = 3 }) => {
  return (
    <div className="bg-tertiary rounded-lg p-6 shadow-sm">
      <SkeletonLoader height="h-6" width="w-1/3" className="mb-4" />
      <SkeletonLoader count={lines} className="mb-2" />
      <SkeletonLoader height="h-10" width="w-24" className="mt-4" />
    </div>
  );
};

export const SkeletonForm: React.FC = () => {
  return (
    <div className="space-y-4">
      <div>
        <SkeletonLoader height="h-3" width="w-20" className="mb-2" />
        <SkeletonLoader height="h-10" />
      </div>
      <div>
        <SkeletonLoader height="h-3" width="w-24" className="mb-2" />
        <SkeletonLoader height="h-10" />
      </div>
      <div>
        <SkeletonLoader height="h-3" width="w-16" className="mb-2" />
        <SkeletonLoader height="h-20" />
      </div>
      <SkeletonLoader height="h-12" width="w-32" />
    </div>
  );
};