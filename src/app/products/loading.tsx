import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsLoading() {
  return (
    <section
      className="page-container py-12 lg:py-16"
      aria-busy="true"
      aria-label="Loading catalogue"
    >
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-10 h-16 max-w-3xl" />
      <Skeleton className="mt-12 h-20 w-full" />
      <div className="mt-12 grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index}>
            <Skeleton className="aspect-[4/3] w-full rounded-panel" />
            <Skeleton className="mt-5 h-4 w-28" />
            <Skeleton className="mt-3 h-8 w-3/4" />
          </div>
        ))}
      </div>
    </section>
  )
}
