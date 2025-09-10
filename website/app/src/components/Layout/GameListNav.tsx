import { tapGooseLobbyPath } from "@/src/router/paths";
import { Link } from "../Goose-UI/Link";

const gamesNavData = [
  {
    title: "Tap Goose",
    url: tapGooseLobbyPath,
  },
] as const;

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
