export default function NewPromptLoading() {
  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-1/4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}