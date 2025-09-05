import { getTapGooseLobbyPath } from "@/src/router/pathes";
import { Link } from "../Goose-UI/Link";
import { url } from "inspector";

type GameNavItem = {
  title: string;
  url: string;
};

const gamesNavData: Array<GameNavItem> = [
  {
    title: "Tap Goose",
    url: getTapGooseLobbyPath(),
  },
];

export const GameListNav: React.FC = () => {
  return (
    <nav className="flex gap-6">
      {gamesNavData.map((item, idx) => (
        <Link key={idx} to={item.url} className="font-semibold" activeOptions={{ exact: true }}>
          {item.title}
        </Link>
      ))}

      {/* В будущем сюда можно добавить другие игры */}
    </nav>
  );
};
