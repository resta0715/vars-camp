export function InstructorApplicationFormSkeleton() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse space-y-8" aria-hidden="true">
      {[1, 2, 3].map((section) => (
        <div key={section} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 h-5 w-32 rounded bg-gray-200" />
          <div className="mb-6 h-3 w-56 rounded bg-gray-100" />
          <div className="space-y-4">
            <div className="h-10 rounded bg-gray-100" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="h-10 rounded bg-gray-100" />
              <div className="h-10 rounded bg-gray-100" />
            </div>
            <div className="h-10 rounded bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
