import { cx } from '../lib/cx'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx('animate-pulse rounded-md bg-mist/60', className)} />
}

export function RowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-xl border border-mist bg-white px-4 py-3.5"
        >
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      ))}
    </div>
  )
}
