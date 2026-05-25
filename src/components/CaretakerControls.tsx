import { FormEvent, useEffect, useState } from "react";
import { Cat, Image, Paintbrush, Palette, Shirt } from "lucide-react";
import { LANGUAGE_TO_ACCESSORY, accessoryFromUnlock, petSpeciesLabel } from "../assets/pets/petManifest";
import { normalizePetBackground, petBackgroundOptions } from "./PetBackgroundControls";
import type { CommunityCustomizationInput, CommunityPet } from "../types/pushpet";
import type { PetBackground, PetColor, PetSpecies } from "./pets/petTypes";

type CaretakerControlsProps = {
  activeUsername: string;
  communityPet: CommunityPet;
  isSaving: boolean;
  error: string | null;
  onSave: (input: CommunityCustomizationInput) => Promise<CommunityPet | null>;
  speciesOptions: Array<{ value: PetSpecies; label: string }>;
  colorOptions: Array<{ value: PetColor; label: string }>;
};

export function CaretakerControls({
  activeUsername,
  communityPet,
  isSaving,
  error,
  onSave,
  speciesOptions,
  colorOptions
}: CaretakerControlsProps) {
  const [name, setName] = useState(communityPet.featured_name);
  const [title, setTitle] = useState(communityPet.display_title);
  const [species, setSpecies] = useState(communityPet.species ?? "goat_dragon");
  const [color, setColor] = useState(communityPet.color ?? "purple");
  const [outfit, setOutfit] = useState(communityPet.outfit);
  const [environment, setEnvironment] = useState<PetBackground>(normalizePetBackground(communityPet.environment));
  const wearableOutfits = communityPet.unlocked_outfits
    .map((unlock) => ({
      ...unlock,
      accessory: LANGUAGE_TO_ACCESSORY[unlock.source_language] ?? accessoryFromUnlock(unlock.id)
    }))
    .filter((unlock, index, allUnlocks) => unlock.accessory !== "none" && allUnlocks.findIndex((item) => item.accessory === unlock.accessory) === index);
  const hasCaretakerCrown = wearableOutfits.some((unlock) => unlock.accessory === "caretaker_crown");
  useEffect(() => {
    setName(communityPet.featured_name);
    setTitle(communityPet.display_title);
    setSpecies(communityPet.species ?? "goat_dragon");
    setColor(communityPet.color ?? "purple");
    setOutfit(communityPet.outfit);
    setEnvironment(normalizePetBackground(communityPet.environment));
  }, [
    communityPet.featured_name,
    communityPet.display_title,
    communityPet.species,
    communityPet.color,
    communityPet.outfit,
    communityPet.environment
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await onSave({
      caretaker_username: activeUsername,
      name,
      title,
      species,
      color,
      outfit,
      environment
    });

    if (saved) {
      setName(saved.featured_name);
      setTitle(saved.display_title);
      setSpecies(saved.species ?? "goat_dragon");
      setColor(saved.color ?? "purple");
      setOutfit(saved.outfit);
      setEnvironment(normalizePetBackground(saved.environment));
    }
  }

  return (
    <section className="caretaker-controls" aria-label="Top caretaker customization controls">
      <div className="section-title">
        <Paintbrush size={17} />
        <h3>Caretaker controls</h3>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="caretaker-field">
          <label htmlFor="community-pet-title">Tag</label>
          <input
            id="community-pet-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Community Pushpet"
          />
        </div>
        <div className="caretaker-field">
          <label htmlFor="community-pet-name">Name</label>
          <input
            id="community-pet-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Pushpet Prime"
          />
        </div>
        <div className="caretaker-field">
          <label htmlFor="community-pet-species">
            <Cat size={15} />
            Type
          </label>
          <select id="community-pet-species" value={species} onChange={(event) => setSpecies(event.target.value)}>
            {speciesOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="caretaker-field">
          <label htmlFor="community-pet-color">
            <Palette size={15} />
            Color
          </label>
          <select id="community-pet-color" value={color} onChange={(event) => setColor(event.target.value)}>
            {colorOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="caretaker-field">
          <label htmlFor="community-pet-outfit">
            <Shirt size={15} />
            Outfit
          </label>
          <select id="community-pet-outfit" value={outfit} onChange={(event) => setOutfit(event.target.value)}>
            <option value="none">No outfit</option>
            {wearableOutfits.map((unlock) => (
              <option value={unlock.accessory} key={unlock.accessory}>
                {unlock.label}
              </option>
            ))}
            {!hasCaretakerCrown && <option value="caretaker_crown">Caretaker Crown</option>}
          </select>
        </div>
        <div className="caretaker-field">
          <label htmlFor="community-pet-environment">
            <Image size={15} />
            Background
          </label>
          <select id="community-pet-environment" value={environment} onChange={(event) => setEnvironment(event.target.value as PetBackground)}>
            {petBackgroundOptions.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save sparkle"}</button>
      </form>
      {error && <p className="form-error">{error}</p>}
    </section>
  );
}
