import { ArrowUp, Flame, GitBranch, Smile, Star, UsersRound, Utensils } from "lucide-react";
import type { CommunityPet, IndividualPet } from "../types/pushpet";

type PetStatsPanelProps = {
  pet: IndividualPet | CommunityPet;
  mode: "individual" | "community";
};

export function PetStatsPanel({ pet, mode }: PetStatsPanelProps) {
  const stats =
    mode === "individual"
      ? [
          { label: "Level", value: pet.level, icon: ArrowUp, key: "level" },
          { label: "Mood", value: pet.mood, icon: Smile, key: "mood" },
          { label: "Hunger", value: pet.hunger, icon: Utensils, key: "hunger" },
          { label: "Happy", value: pet.happiness, icon: Star, key: "happy" },
          { label: "Streak", value: `${(pet as IndividualPet).streak_days}d`, icon: Flame, key: "streak" },
          { label: "Pushes", value: (pet as IndividualPet).recent_pushes_30d, icon: GitBranch, key: "pushes" }
        ]
      : [
          { label: "Level", value: pet.level, icon: ArrowUp, key: "level" },
          { label: "Mood", value: pet.mood, icon: Smile, key: "mood" },
          { label: "Hunger", value: pet.hunger, icon: Utensils, key: "hunger" },
          { label: "Happy", value: pet.happiness, icon: Star, key: "happy" },
          { label: "Users", value: (pet as CommunityPet).contributors_count, icon: UsersRound, key: "users" },
          { label: "Pushes", value: (pet as CommunityPet).total_recent_pushes, icon: GitBranch, key: "pushes" }
        ];

  return (
    <div className="stats-panel">
      {stats.map(({ label, value, icon: Icon, key }) => (
        <div className="stat-tile" data-stat={key} key={label}>
          <Icon size={16} />
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}
