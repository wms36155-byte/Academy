// Skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="skeleton-shimmer w-10 h-10 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton-shimmer h-4 w-48" />
            <div className="skeleton-shimmer h-3 w-32" />
          </div>
          <div className="skeleton-shimmer h-6 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="stat-card space-y-4">
      <div className="skeleton-shimmer w-12 h-12 rounded-xl" />
      <div className="skeleton-shimmer h-8 w-24" />
      <div className="skeleton-shimmer h-4 w-36" />
    </div>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-5 space-y-3">
          <div className="skeleton-shimmer h-24 rounded-xl" />
          <div className="skeleton-shimmer h-4 w-3/4" />
          <div className="skeleton-shimmer h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
