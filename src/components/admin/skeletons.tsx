import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-[#ebe6dd]", className)} />;
}

export function AdminPageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-2">
          <Bone className="h-7 w-48" />
          <Bone className="h-4 w-72 max-w-full" />
        </div>
        <Bone className="h-9 w-32" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-[#e8e4dc] bg-white p-4 space-y-3">
            <Bone className="h-3 w-24" />
            <Bone className="h-8 w-20" />
            <Bone className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-[#e8e4dc] bg-white">
        <div className="border-b border-[#eee9e0] bg-[#faf8f5] px-3 py-2">
          <Bone className="h-3 w-full max-w-md" />
        </div>
        <div className="divide-y divide-[#f3efe8]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-3 py-3">
              <Bone className="h-4 w-1/4" />
              <Bone className="h-4 w-1/6" />
              <Bone className="h-4 w-16" />
              <Bone className="ml-auto h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
