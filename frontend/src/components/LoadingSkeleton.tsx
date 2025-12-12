import React from 'react';

const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/5 overflow-hidden mb-6 border border-white/40">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="h-6 w-48 skeleton rounded"></div>
            <div className="mt-3 h-4 w-full skeleton rounded"></div>
            <div className="mt-2 h-4 w-3/4 skeleton rounded"></div>
            <div className="mt-4 flex gap-3">
              <div className="h-3 w-20 skeleton rounded-full"></div>
              <div className="h-3 w-20 skeleton rounded-full"></div>
              <div className="h-3 w-20 skeleton rounded-full"></div>
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <div className="h-12 w-12 rounded-xl skeleton"></div>
          </div>
        </div>
      </div>
      <div className="bg-gray-50/70 px-6 py-4 border-t border-white/40">
        <div className="h-4 w-32 skeleton rounded"></div>
      </div>
    </div>
  );
};

const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

export default LoadingSkeleton;
