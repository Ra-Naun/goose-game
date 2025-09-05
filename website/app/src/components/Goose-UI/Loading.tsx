export const Loading: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => {
  const { className = "", ...rest } = props;
  return (
    <div className={`flex items-center justify-center ${className}`} {...rest}>
      <div className="text-center">
        <svg
          className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
        <p className="text-gray-600 font-semibold text-lg">Loading...</p>
      </div>
    </div>
  );
};
