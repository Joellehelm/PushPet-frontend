import { BatteryCharging, Heart, Pizza, Sparkles } from "lucide-react";
import { stageFromEvolution } from "../assets/pets/petManifest";

type CareMetersProps = {
  hunger: number;
  happiness: number;
  score: number;
  evolutionStage: string;
};

const stagePlan = [
  { label: "Egg", threshold: 0 },
  { label: "Baby", threshold: 1 },
  { label: "Adolescent", threshold: 30 },
  { label: "Adult", threshold: 70 }
];

export function CareMeters({ hunger, happiness, score, evolutionStage }: CareMetersProps) {
  const currentStage = stageFromEvolution(evolutionStage, score);
  const stageIndex = currentStage === "egg" ? 0 : currentStage === "baby" ? 1 : currentStage === "adolescent" ? 2 : 3;
  const nextStage = stagePlan[stageIndex + 1];
  const currentThreshold = stagePlan[stageIndex].threshold;
  const nextThreshold = nextStage?.threshold ?? 100;
  const progress = nextStage ? clamp(((score - currentThreshold) / Math.max(nextThreshold - currentThreshold, 1)) * 100) : 100;
  const nextCopy = currentStage === "egg" ? "Hatch to become Baby" : nextStage ? `${Math.max(nextThreshold - score, 0)} care points to ${nextStage.label}` : "Fully grown";

  return (
    <section className="care-meters" aria-label="Pushpet care meters">
      <Meter icon={Pizza} label="Hunger" value={hunger} tone="hunger" helper={hunger > 70 ? "Needs care" : hunger > 40 ? "Snack soon" : "Fed"} />
      <Meter icon={Heart} label="Happiness" value={happiness} tone="happy" helper={happiness > 70 ? "Glowing" : happiness > 35 ? "Steady" : "Needs cheering"} />
      <Meter icon={Sparkles} label="Evolution" value={progress} tone="evolution" helper={nextCopy} />
      <div className="evolution-track" aria-label="Evolution stages">
        {stagePlan.map((stage, index) => (
          <span className={index <= stageIndex ? "is-reached" : ""} key={stage.label}>
            {stage.label}
          </span>
        ))}
      </div>
      <div className="care-tip">
        <BatteryCharging size={16} />
        <span>
          {currentStage === "egg"
            ? "Choose a shell and hatch when you are ready."
            : nextStage
              ? "More recent public GitHub activity raises care points."
              : "Keep activity fresh to maintain mood and happiness."}
        </span>
      </div>
    </section>
  );
}

function Meter({
  icon: Icon,
  label,
  value,
  tone,
  helper
}: {
  icon: typeof Pizza;
  label: string;
  value: number;
  tone: "hunger" | "happy" | "evolution";
  helper: string;
}) {
  const clamped = clamp(value);

  return (
    <div className={`care-meter care-meter-${tone}`}>
      <div className="care-meter-label">
        <Icon size={16} />
        <span>{label}</span>
        <strong>{Math.round(clamped)}%</strong>
      </div>
      <div className="care-meter-track" aria-hidden="true">
        <span style={{ width: `${clamped}%` }} />
      </div>
      <small>{helper}</small>
    </div>
  );
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}
