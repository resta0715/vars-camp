import { Skeleton } from "@/components/ui/skeleton";

export default function ScheduleLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-9 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      </div>
      <main className="flex-1 bg-gray-50 p-8">
        <div className="mx-auto max-w-7xl">
          <Skeleton className="mb-6 h-8 w-40" />
          <div className="flex gap-2 mb-6">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-24 rounded-full" />)}
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </main>
    </div>
  );
}
