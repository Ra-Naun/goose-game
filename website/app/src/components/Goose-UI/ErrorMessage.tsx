export const ErrorMessage = ({ error }: { error: unknown }) => (
  <div className="flex items-center justify-center min-h-screen bg-red-50 p-6">
    <div className="max-w-md w-full bg-red-100 border border-red-400 rounded-lg shadow-md p-6 text-center">
      <p className="text-red-700 font-bold text-lg mb-2">Error</p>
      <p className="text-red-600 break-words">{String(error)}</p>
    </div>
  </div>
);
