import { PetBackgroundControls, normalizePetBackground } from "./PetBackgroundControls";
import type { PetBackground, PetColor, PetSpecies } from "./pets/petTypes";

export type PetDesign = {
  species: PetSpecies;
  color: PetColor;
  background: PetBackground;
};

type PetDesignControlsProps = {
  title: string;
  design: PetDesign;
  speciesOptions: Array<{ value: PetSpecies; label: string }>;
  colorOptions: Array<{ value: PetColor; label: string }>;
  onChange: (design: PetDesign) => void;
};

export function PetDesignControls({ title, design, speciesOptions, colorOptions, onChange }: PetDesignControlsProps) {
  return (
    <section className="pet-design-controls">
      <h3>{title}</h3>
      <div className="segmented-row" aria-label="Pet species">
        {speciesOptions.map((option) => (
          <button
            className={design.species === option.value ? "is-selected" : ""}
            key={option.value}
            type="button"
            onClick={() => onChange({ ...design, species: option.value })}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="color-row" aria-label="Pet color">
        {colorOptions.map((option) => (
          <button
            className={`color-chip color-${option.value} ${design.color === option.value ? "is-selected" : ""}`}
            key={option.value}
            type="button"
            aria-label={option.label}
            onClick={() => onChange({ ...design, color: option.value })}
          />
        ))}
      </div>
      <PetBackgroundControls
        title="Place"
        value={normalizePetBackground(design.background)}
        onChange={(background) => onChange({ ...design, background })}
      />
    </section>
  );
}
