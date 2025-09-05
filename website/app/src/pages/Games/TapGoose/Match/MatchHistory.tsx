import { useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

interface PlayerResult {
  playerId: string;
  username: string;
  score: number;
}

interface MatchHistoryData {
  winnerId: string;
  results: PlayerResult[];
}

interface MatchHistoryParams {
  matchId: string;
}

async function fetchMatchHistory(matchId: string): Promise<MatchHistoryData> {
  return {
    winnerId: "1",
    results: [
      { playerId: "1", username: "Alice", score: 20 },
      { playerId: "2", username: "Bob", score: 15 },
    ],
  };
}

export function MatchHistory() {
  const { matchId } = useParams({ strict: false }) as MatchHistoryParams;

  const { data, isLoading, error } = useQuery({
    queryKey: ["matchHistory", matchId],
    queryFn: () => fetchMatchHistory(matchId),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading match history</div>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl mb-4">Match History for {matchId}</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">Player</th>
            <th className="border border-gray-300 p-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {data?.results.map((player) => (
            <tr key={player.playerId} className={player.playerId === data.winnerId ? "bg-green-200 font-bold" : ""}>
              <td className="border border-gray-300 p-2">{player.username}</td>
              <td className="border border-gray-300 p-2">{player.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-4 font-semibold">Winner: {data?.results.find((p) => p.playerId === data.winnerId)?.username}</p>
    </div>
  );
}
