import { Check, Lock, Shirt } from "lucide-react";
import {
  ACCESSORY_SLOT_LABELS,
  ACCESSORY_TO_SLOT,
  ALL_EQUIPMENT_SLOTS,
  LANGUAGE_TO_ACCESSORY,
  accessoryFromUnlock,
  slotForAccessory
} from "../assets/pets/petManifest";
import type { EquippedAccessories, PetAccessory, PetAccessorySlot } from "./pets/petTypes";
import type { OutfitUnlock } from "../types/pushpet";

type OutfitUnlocksProps = {
  outfits: OutfitUnlock[];
  equipped?: EquippedAccessories;
  onToggleAccessory?: (slot: PetAccessorySlot, accessory: PetAccessory | "none") => void;
};

const ACCESSORY_LABELS: Record<Exclude<PetAccessory, "none">, string> = {
  ruby_crown: "Ruby crown",
  javascript_shades: "JavaScript shades",
  typescript_visor: "TypeScript visor",
  python_wizard_hat: "Python wizard hat",
  rust_armor_accent: "Rust armor",
  go_jetpack: "Go jetpack",
  caretaker_crown: "Caretaker crown"
};

const ACCESSORY_LANGUAGE: Partial<Record<Exclude<PetAccessory, "none">, string>> = {
  ruby_crown: "Ruby",
  javascript_shades: "JavaScript",
  typescript_visor: "TypeScript",
  python_wizard_hat: "Python",
  rust_armor_accent: "Rust",
  go_jetpack: "Go",
  caretaker_crown: "Top Caretaker"
};

const ALL_WEARABLES = Object.keys(ACCESSORY_TO_SLOT) as Array<Exclude<PetAccessory, "none">>;

export function OutfitUnlocks({ outfits, equipped = {}, onToggleAccessory }: OutfitUnlocksProps) {
  const unlocked = new Set(
    outfits
      .map((outfit) => LANGUAGE_TO_ACCESSORY[outfit.source_language] ?? accessoryFromUnlock(outfit.id))
      .filter((accessory) => accessory !== "none")
  );

  const bySlot = ALL_EQUIPMENT_SLOTS.map((slot) => ({
    slot,
    accessories: ALL_WEARABLES.filter((accessory) => ACCESSORY_TO_SLOT[accessory] === slot)
  }));

  return (
    <section className="outfit-unlocks">
      <div className="section-title">
        <Shirt size={17} />
        <h3>Accessory slots</h3>
      </div>
      <div className="equipment-grid">
        {bySlot.map(({ slot, accessories }) => (
          <div className="equipment-slot" key={slot}>
            <div className="equipment-slot-heading">
              <span>{ACCESSORY_SLOT_LABELS[slot]}</span>
              {equipped[slot] ? <strong>Equipped</strong> : <strong>Empty</strong>}
            </div>
            <div className="outfit-grid">
              <button
                className={`outfit-badge outfit-button ${!equipped[slot] ? "is-equipped" : ""}`}
                type="button"
                onClick={() => onToggleAccessory?.(slot, "none")}
                aria-label={`Clear ${ACCESSORY_SLOT_LABELS[slot]} slot`}
              >
                <span className="swatch" />
                None
              </button>
              {accessories.map((accessory) => {
                const isUnlocked = unlocked.has(accessory);
                const isEquipped = equipped[slot] === accessory;
                const language = ACCESSORY_LANGUAGE[accessory];
                return (
                  <button
                    className={`outfit-badge outfit-button ${isEquipped ? "is-equipped" : ""} ${!isUnlocked ? "is-locked" : ""}`}
                    key={accessory}
                    type="button"
                    disabled={!isUnlocked}
                    onClick={() => {
                      const accessorySlot = slotForAccessory(accessory);
                      if (accessorySlot) onToggleAccessory?.(accessorySlot, isEquipped ? "none" : accessory);
                    }}
                    aria-label={`${!isUnlocked ? "Locked" : isEquipped ? "Unequip" : "Equip"} ${ACCESSORY_LABELS[accessory]}`}
                  >
                    <span className={`swatch swatch-${accessory}`} />
                    <span>{ACCESSORY_LABELS[accessory]}</span>
                    {isEquipped && <Check size={14} />}
                    {!isUnlocked && <Lock size={14} />}
                    {language && <small>{isUnlocked ? language : `Locked: ${language}`}</small>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
