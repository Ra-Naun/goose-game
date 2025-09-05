export const CircleArrow: React.FC<React.HTMLAttributes<SVGSVGElement>> = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 32a16 16 0 0 1 16-16v6l8-8-8-8v6a22 22 0 0 0-22 22h6z" fill="currentColor" />
      <path d="M48 32a16 16 0 0 1-16 16v-6l-8 8 8 8v-6a22 22 0 0 0 22-22h-6z" fill="currentColor" />
    </svg>
  );
};
