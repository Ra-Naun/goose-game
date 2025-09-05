import { getStartPagePath } from "@/src/router/pathes";
import { Link } from "../Goose-UI/Link";

export const GoToHome: React.FC = () => {
  return (
    <Link to={getStartPagePath()} className="text-2xl font-bold">
      🏠 Home
    </Link>
  );
};
