export default function Loading() {
  return (
    <div className="min-h-screen bg-bg pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="skeleton h-4 w-24 rounded-full mb-4" />
        <div className="skeleton h-12 w-72 rounded-xl mb-10" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl overflow-hidden">
              <div className="skeleton aspect-[4/3]" />
              <div className="p-5 space-y-2">
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
