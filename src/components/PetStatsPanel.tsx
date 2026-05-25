import { Battery, Flame, Heart, Pizza, Sprout, Trophy } from "lucide-react";
import type { CommunityPet, IndividualPet } from "../types/pushpet";

type PetStatsPanelProps = {
  pet: IndividualPet | CommunityPet;
  mode: "individual" | "community";
};

export function PetStatsPanel({ pet, mode }: PetStatsPanelProps) {
  const stats =
    mode === "individual"
      ? [
          { label: "Level", value: pet.level, icon: Trophy },
          { label: "Mood", value: pet.mood, icon: Heart },
          { label: "Hunger", value: pet.hunger, icon: Pizza },
          { label: "Happy", value: pet.happiness, icon: Flame },
          { label: "Streak", value: `${(pet as IndividualPet).streak_days}d`, icon: Battery },
          { label: "Pushes", value: (pet as IndividualPet).recent_pushes_30d, icon: Sprout }
        ]
      : [
          { label: "Level", value: pet.level, icon: Trophy },
          { label: "Mood", value: pet.mood, icon: Heart },
          { label: "Hunger", value: pet.hunger, icon: Pizza },
          { label: "Happy", value: pet.happiness, icon: Flame },
          { label: "Users", value: (pet as CommunityPet).contributors_count, icon: Battery },
          { label: "Pushes", value: (pet as CommunityPet).total_recent_pushes, icon: Sprout }
        ];

  return (
    <div className="stats-panel">
      {stats.map(({ label, value, icon: Icon }) => (
        <div className="stat-tile" key={label}>
          <Icon size={16} />
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}
