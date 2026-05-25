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
        <span>{dormant ? "Quiet little legend" : "Freshly charged"}</span>
      </div>
      <p>
        <strong>{pet.summary_text}</strong>
      </p>
      <div className="summary-chips">
        <span>{pet.recent_pushes_7d} pushes this week</span>
        <span>{pet.recent_prs_30d} PR signals</span>
        <span>{pet.active_repo_count_30d} active repos</span>
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
