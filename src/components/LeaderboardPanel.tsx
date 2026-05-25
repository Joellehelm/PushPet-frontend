import { Crown, RotateCw } from "lucide-react";
import { accessoriesFromEquipment, colorFromSeed, normalizeMood, speciesFromSeed, stageFromEvolution } from "../assets/pets/petManifest";
import type { SessionLeaderboardEntry } from "../hooks/useSessionLeaderboard";
import { PetRenderer } from "./pets/PetRenderer";

type LeaderboardPanelProps = {
  entries: SessionLeaderboardEntry[];
  onSelect: (entry: SessionLeaderboardEntry) => void;
  loadingUsername?: string | null;
};

export function LeaderboardPanel({ entries, onSelect, loadingUsername }: LeaderboardPanelProps) {
  return (
    <section className="toy-panel leaderboard-panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Session scoreboard</span>
          <h2>Local leaderboard</h2>
        </div>
        <Crown size={22} />
      </div>
      {entries.length === 0 ? (
        <p className="quiet-copy">Lookups land here for quick rematches.</p>
      ) : (
        <div className="leaderboard-list">
          {entries.map((entry, index) => (
            <button
              className="leaderboard-entry"
              key={entry.username}
              type="button"
              onClick={() => onSelect(entry)}
              aria-label={`Reload @${entry.username}, score ${entry.pet_score}`}
            >
              <span className="rank-token">{index + 1}</span>
              <span className="leader-pet-thumb" aria-hidden="true">
                <PetRenderer
                  species={entry.species ?? speciesFromSeed(entry.username)}
                  stage={entry.stage ?? stageFromEvolution("hatchling", entry.pet_score)}
                  mood={entry.renderer_mood ?? normalizeMood(entry.mood, entry.dormancy_state)}
                  color={entry.color ?? colorFromSeed(entry.username, entry.pet_score)}
                  accessory={entry.accessory ?? "none"}
                  accessories={accessoriesFromEquipment(entry.equipped, entry.accessory)}
                  size={42}
                  decorative
                />
              </span>
              <span className="leader-name">@{entry.username}</span>
              <strong>{entry.pet_score}</strong>
              {loadingUsername?.toLowerCase() === entry.username.toLowerCase() && <RotateCw className="spin" size={16} />}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
