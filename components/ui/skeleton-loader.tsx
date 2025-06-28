import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonLoaderProps {
  className?: string;
}

export function DashboardSkeleton({ className }: SkeletonLoaderProps) {
  return (
    <div className={cn("space-y-3 lg:space-y-4 max-w-full", className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="flex flex-col xl:flex-row gap-3 min-w-0">
        {/* Main content */}
        <div className="flex-1 space-y-3 lg:space-y-4 min-w-0">
          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-md p-2.5 sm:p-3 shadow-sm border border-border/40">
                <div className="mb-1.5 sm:mb-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-24 mt-0.5" />
                </div>
                <div className="flex items-center gap-1">
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>

          {/* Chart section */}
          <div className="bg-card rounded-md p-4 shadow-sm border border-border/40">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 lg:mb-4">
              <Skeleton className="h-5 w-32" />
              <div className="flex flex-wrap items-center gap-1.5">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-5 w-16 rounded-full" />
                ))}
              </div>
            </div>
            <Skeleton className="h-60 w-full" />
          </div>

          {/* Transaction list */}
          <div className="bg-card rounded-md p-4 shadow-sm border border-border/40">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center gap-3">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full xl:w-96 space-y-3 lg:space-y-4 min-w-0">
          {/* Wallet card */}
          <div className="bg-black text-white rounded-md p-4">
            <div className="flex justify-between items-center mb-4">
              <Skeleton className="h-5 w-28 bg-white/10" />
              <Skeleton className="h-7 w-7 rounded-full bg-white/10" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-9 w-full bg-white/10" />
              <div>
                <Skeleton className="h-3 w-20 mb-1.5 bg-white/10" />
                <Skeleton className="h-6 w-32 bg-white/10" />
              </div>
              <Skeleton className="h-9 w-full bg-white/10" />
            </div>
          </div>

          {/* Service management */}
          <div className="bg-card rounded-md p-4 shadow-sm border border-border/40">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PageSkeleton({ className }: SkeletonLoaderProps) {
  return (
    <div className={cn("space-y-4 max-w-full", className)}>
      {/* Header */}
      <div className="space-y-2 mb-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Content area */}
      <div className="bg-card rounded-md p-4 shadow-sm border border-border/40">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-3">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}

export function TransactionTableSkeleton({ className }: SkeletonLoaderProps) {
  return (
    <div className={cn("bg-card rounded-md shadow-sm border border-border/40", className)}>
      <div className="p-4">
        <Skeleton className="h-5 w-40 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-md">
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Skeleton className="h-10 w-32 mx-auto" />
        </div>
      </div>
    </div>
  );
} 