export const ErrorMessage: React.FC<React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>> = ({ children }) => (
  <div className="flex items-center justify-center min-h-screen max-h-screen p-6">
    <div className="max-w-md w-full bg-red-200 border border-red-400 rounded-lg shadow-md p-6 text-center">
      <div className="text-red-700 font-bold text-lg mb-2">Error</div>
      <div className="text-red-600">{children}</div>
    </div>
  </div>
);
