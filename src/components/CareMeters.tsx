import { BatteryCharging, Heart, Pizza, Sparkles } from "lucide-react";
import { stageFromEvolution } from "../assets/pets/petManifest";

type CareMetersProps = {
  hunger: number;
  happiness: number;
  score: number;
  evolutionStage: string;
  level?: number;
  mood?: string;
  pushes?: number;
  streakDays?: number;
  prSignals?: number;
  activeRepos?: number;
};

const stagePlan = [
  { label: "Egg", threshold: 0 },
  { label: "Baby", threshold: 1 },
  { label: "Adolescent", threshold: 30 },
  { label: "Adult", threshold: 70 }
];

export function CareMeters({ hunger, happiness, score, evolutionStage, level, mood, pushes, streakDays, prSignals, activeRepos }: CareMetersProps) {
  const currentStage = stageFromEvolution(evolutionStage, score);
  const stageIndex = currentStage === "egg" ? 0 : currentStage === "baby" ? 1 : currentStage === "adolescent" ? 2 : 3;
  const nextStage = stagePlan[stageIndex + 1];
  const currentThreshold = stagePlan[stageIndex].threshold;
  const nextThreshold = nextStage?.threshold ?? 100;
  const progress = nextStage ? clamp(((score - currentThreshold) / Math.max(nextThreshold - currentThreshold, 1)) * 100) : 100;
  const levelProgress = clamp(((level ?? Math.max(1, Math.ceil(score / 10))) / 10) * 100);
  const pushProgress = pushes === undefined ? undefined : clamp((pushes / 30) * 100);

  return (
    <section className="care-meters" aria-label="Pushpet care meters">
      <Meter icon={BatteryCharging} label="Level" value={levelProgress} tone="level" displayValue={level ? `${level}` : `${score}`} />
      <Meter icon={Pizza} label="Hunger" value={hunger} tone="hunger" displayValue={`${Math.round(clamp(hunger))}%`} />
      <Meter icon={Heart} label="Happiness" value={happiness} tone="happy" displayValue={`${Math.round(clamp(happiness))}%`} />
      <Meter icon={Sparkles} label="Evolution" value={progress} tone="evolution" displayValue={`${Math.round(progress)}%`} />
      {pushProgress !== undefined && <Meter icon={Sparkles} label="Pushes" value={pushProgress} tone="pushes" displayValue={`${pushes}`} />}
      <div className="vital-facts" aria-label="Activity details">
        {mood && <span>Mood <strong>{mood}</strong></span>}
        {streakDays !== undefined && <span>Streak <strong>{streakDays}d</strong></span>}
        {prSignals !== undefined && <span>PR signals <strong>{prSignals}</strong></span>}
        {activeRepos !== undefined && <span>Repos <strong>{activeRepos}</strong></span>}
      </div>
    </section>
  );
}

function Meter({
  icon: Icon,
  label,
  value,
  tone,
  displayValue
}: {
  icon: typeof Pizza;
  label: string;
  value: number;
  tone: "level" | "hunger" | "happy" | "evolution" | "pushes";
  displayValue: string;
}) {
  const clamped = clamp(value);

  return (
    <div className={`care-meter care-meter-${tone}`}>
      <div className="care-meter-label">
        <Icon size={16} />
        <span>{label}</span>
        <strong>{displayValue}</strong>
      </div>
      <div className="care-meter-track" aria-hidden="true">
        <span style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
}
