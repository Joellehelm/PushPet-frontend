import { AlertTriangle, ExternalLink, Moon, Zap } from "lucide-react";
import type { IndividualPet } from "../types/pushpet";

type ActivitySummaryProps = {
  pet: IndividualPet;
};

export function ActivitySummary({ pet }: ActivitySummaryProps) {
  const dormant = ["peckish", "sad", "ghost"].includes(pet.dormancy_state);

  return (
    <section className={`activity-summary ${dormant ? "dormant" : "active"}`}>
      <div className="summary-heading">
        {dormant ? <Moon size={18} /> : <Zap size={18} />}
        <span>{dormant ? "Quiet activity" : "GitHub activity"}</span>
      </div>
      {pet.degraded && (
        <div className="rate-note">
          <AlertTriangle size={16} />
          <span>GitHub got stingy, so this hatch used cached activity.</span>
        </div>
      )}
      <a href={pet.profile_url} target="_blank" rel="noreferrer" className="profile-link">
        Open GitHub
        <ExternalLink size={15} />
      </a>
    </section>
  );
}
