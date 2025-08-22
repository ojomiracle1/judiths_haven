import React from 'react';

const LoadingSkeleton = ({ rows = 5, className = '' }) => {
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="h-4 sm:h-6 bg-pink-100 rounded w-full" />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
