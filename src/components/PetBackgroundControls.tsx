import { Image } from "lucide-react";
import type { PetBackground } from "./pets/petTypes";

export const petBackgroundOptions: Array<{ value: PetBackground; label: string; src: string }> = [
  { value: "petplace1", label: "Garden", src: "/petplace1.png" },
  { value: "petplace2", label: "Cozy bedroom", src: "/petplace2.png" },
  { value: "petplace3", label: "Forest", src: "/petplace3.png" }
];

type PetBackgroundControlsProps = {
  value: PetBackground;
  onChange: (background: PetBackground) => void;
  title?: string;
};

export function normalizePetBackground(value?: string | null): PetBackground {
  if (value === "petplace2" || value === "sunny" || value === "cozy" || value === "cozy_bedroom") return "petplace2";
  if (value === "petplace3" || value === "night" || value === "forest") return "petplace3";
  return "petplace1";
}

export function PetBackgroundControls({ value, onChange, title = "Background" }: PetBackgroundControlsProps) {
  return (
    <section className="pet-background-controls">
      <div className="section-title compact-title">
        <Image size={17} />
        <h3>{title}</h3>
      </div>
      <div className="background-choice-row" aria-label={title}>
        {petBackgroundOptions.map((option) => (
          <button
            className={`background-choice ${value === option.value ? "is-selected" : ""}`}
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-label={option.label}
          >
            <img src={option.src} alt="" />
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
