import { FormEvent, useState } from "react";
import { Paintbrush } from "lucide-react";
import { LANGUAGE_TO_ACCESSORY, accessoryFromUnlock } from "../assets/pets/petManifest";
import type { CommunityPet } from "../types/pushpet";

type CaretakerControlsProps = {
  activeUsername: string;
  communityPet: CommunityPet;
  isSaving: boolean;
  error: string | null;
  onSave: (input: { caretaker_username: string; title?: string; name?: string; outfit?: string }) => Promise<CommunityPet | null>;
};

export function CaretakerControls({ activeUsername, communityPet, isSaving, error, onSave }: CaretakerControlsProps) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [outfit, setOutfit] = useState("");
  const wearableOutfits = communityPet.unlocked_outfits
    .map((unlock) => ({
      ...unlock,
      accessory: LANGUAGE_TO_ACCESSORY[unlock.source_language] ?? accessoryFromUnlock(unlock.id)
    }))
    .filter((unlock, index, allUnlocks) => unlock.accessory !== "none" && allUnlocks.findIndex((item) => item.accessory === unlock.accessory) === index);
  const hasCaretakerCrown = wearableOutfits.some((unlock) => unlock.accessory === "caretaker_crown");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await onSave({
      caretaker_username: activeUsername,
      name,
      title,
      outfit
    });

    if (saved) {
      setName("");
      setTitle("");
      setOutfit("");
    }
  }

  return (
    <section className="caretaker-controls">
      <div className="section-title">
        <Paintbrush size={17} />
        <h3>Top Caretaker controls</h3>
      </div>
      <p className="mvp-note">Playful MVP power: the current local leaderboard champ can decorate the shared pet. No account ownership is claimed.</p>
      <form onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="community-pet-name">Community pet name</label>
        <input
          id="community-pet-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder={communityPet.featured_name}
        />
        <label className="sr-only" htmlFor="community-pet-title">Community pet title</label>
        <input
          id="community-pet-title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder={communityPet.display_title}
        />
        <label className="sr-only" htmlFor="community-pet-outfit">Community pet outfit</label>
        <select id="community-pet-outfit" value={outfit} onChange={(event) => setOutfit(event.target.value)}>
          <option value="">Keep {communityPet.outfit}</option>
          <option value="none">Remove accessory</option>
          {wearableOutfits.map((unlock) => (
            <option value={unlock.accessory} key={unlock.accessory}>
              {unlock.label}
            </option>
          ))}
          {!hasCaretakerCrown && <option value="caretaker_crown">Caretaker Crown</option>}
        </select>
        <button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save sparkle"}</button>
      </form>
      {error && <p className="form-error">{error}</p>}
    </section>
  );
}
