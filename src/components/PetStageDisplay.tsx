import { Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import {
  accessoryFromUnlock,
  colorFromSeed,
  normalizeMood,
  petSpeciesLabel,
  speciesFromSeed,
  stageFromEvolution
} from "../assets/pets/petManifest";
import { normalizePetBackground } from "./PetBackgroundControls";
import { PetRenderer } from "./pets/PetRenderer";
import type { PetAccessory, PetBackground, PetColor, PetEnvironment, PetSpecies } from "./pets/petTypes";

type PetStageDisplayProps = {
  score: number;
  mood: string;
  evolutionStage: string;
  dormancyState?: string;
  outfit?: string | null;
  seed?: string | null;
  species?: PetSpecies;
  color?: PetColor;
  accessory?: PetAccessory;
  accessories?: PetAccessory[];
  compact?: boolean;
  size?: number;
  environment?: PetEnvironment | string | null;
  background?: PetBackground | string | null;
  showPet?: boolean;
};

const stageMap: Record<string, string> = {
  egg: "Egg",
  baby: "Baby",
  hatchling: "Baby",
  sprout: "Baby",
  adolescent: "Adolescent",
  scout: "Adolescent",
  builder: "Adolescent",
  adult: "Adult",
  ranger: "Adult",
  guardian: "Adult",
  pro: "Adult",
  legend: "Adult",
  legendary: "Adult"
};

export function visualStageLabel(stage: string, score = 0) {
  const normalizedStage = stageFromEvolution(stage, score);
  return stageMap[normalizedStage] ?? "Baby";
}

export function PetStageDisplay({
  score,
  mood,
  evolutionStage,
  dormancyState = "thriving",
  outfit,
  seed,
  species,
  color,
  accessory,
  accessories,
  compact = false,
  size,
  environment = "petplace1",
  background,
  showPet = true
}: PetStageDisplayProps) {
  const petStage = stageFromEvolution(evolutionStage, score);
  const visualStage = visualStageLabel(evolutionStage, score);
  const petMood = petStage === "egg" ? "idle" : normalizeMood(mood, dormancyState);
  const petSpecies = species ?? speciesFromSeed(seed);
  const petColor = color ?? colorFromSeed(seed, score);
  const petAccessory = accessory ?? accessoryFromUnlock(outfit);
  const renderSize = size ?? (compact ? 164 : 214);
  const normalizedBackground = normalizePetBackground(background ?? environment);
  const backgroundImage = `url("/${normalizedBackground}.png")`;

  return (
    <div
      className={`pet-stage-display stage-${petStage} dormancy-${dormancyState} mood-${petMood} pet-place-${normalizedBackground} has-place-background ${compact ? "compact" : ""}`}
      style={{ "--pet-place-image": backgroundImage } as CSSProperties}
    >
      <div className="toy-sky">
        <span className="pixel-star one" />
        <span className="pixel-star two" />
        <span className="pixel-star three" />
      </div>
      {showPet && (
        <>
          <div className="pet-stage-rig" style={{ width: renderSize, height: renderSize }}>
            <div className="pet-shadow" />
            <PetRenderer
              species={petSpecies}
              stage={petStage}
              mood={petMood}
              color={petColor}
              accessory={petAccessory}
              accessories={accessories}
              size={renderSize}
              aria-label={`${visualStage} ${petSpeciesLabel(petSpecies)} Pushpet, ${petMood} mood`}
            />
          </div>
          <div className="stage-sticker">
            <Sparkles size={14} />
            <span>{visualStage}</span>
          </div>
          <span className="pet-score-bubble">{score}</span>
        </>
      )}
    </div>
  );
}
