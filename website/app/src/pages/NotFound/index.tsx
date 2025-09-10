import { Link } from "@/src/components/Goose-UI/Link";
import { getStartPagePath } from "@/src/router/paths";

export const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-gray-100 px-6 text-center">
      <h1 className="text-[6rem] font-extrabold mb-2 select-none">404</h1>
      <p className="text-xl mb-6">Oops! The page you're looking for does not exist.</p>
      <Link
        href={getStartPagePath()}
        className="px-6 py-3 bg-purple-700 hover:bg-purple-800 text-gray-900 hover:text-gray-900 font-semibold rounded-md transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
};
