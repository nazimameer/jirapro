export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="h-8 bg-slate-200 rounded-lg w-1/2 animate-pulse mx-auto"></div>
        <div className="space-y-4">
          <div className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse shadow-sm"></div>
          <div className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse shadow-sm"></div>
          <div className="h-32 bg-white rounded-2xl border border-slate-200 animate-pulse shadow-sm"></div>
        </div>
        <p className="text-center text-slate-400 text-sm font-medium animate-pulse">
          Polishing the workflow engine...
        </p>
      </div>
    </div>
  );
}
