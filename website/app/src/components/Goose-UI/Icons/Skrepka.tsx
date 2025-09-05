export const Skrepka: React.FC<React.HTMLAttributes<SVGSVGElement>> = (props) => {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.414 6.414a6 6 0 108.486 8.486L21 12"
      ></path>
    </svg>
  );
};
