import { useParams } from "@tanstack/react-router";

export function MatchPage() {
  const { matchId } = useParams({ strict: false }) as { matchId: string };

  console.log("~| Render TestPathComponent with param:", matchId);

  return (
    <div className="p-8 text-gray-100">
      <h1 className="text-2xl  font-bold">Match Page</h1>
      <p>
        Match ID: <code className=" p-1 rounded">{matchId}</code>
      </p>
    </div>
  );
}
