import { useState } from "react";
import { normalizeColor, normalizeEquipment, normalizeSpecies, slotForAccessory } from "../assets/pets/petManifest";
import { normalizePetBackground } from "../components/PetBackgroundControls";
import type { EquippedAccessories, PetAccessory, PetAccessorySlot, PetBackground, PetColor, PetSpecies } from "../components/pets/petTypes";
import type { PushpetRecord } from "../types/pushpet";

const STORAGE_KEY = "pushpet.individualPushpets.v1";

export type IndividualPushpetRecord = {
  username: string;
  display_name: string | null;
  species: PetSpecies;
  color: PetColor;
  accessory: PetAccessory;
  equipped: EquippedAccessories;
  background: PetBackground;
  hatched_at: string;
};

function normalizeRecord(record: PushpetRecord): IndividualPushpetRecord {
  return {
    username: record.username,
    display_name: record.display_name?.trim() || null,
    species: normalizeSpecies(record.species),
    color: normalizeColor(record.color),
    accessory: (record.accessory as PetAccessory) ?? "none",
    equipped: normalizeEquipment(record.equipped, record.accessory),
    background: normalizePetBackground(record.background),
    hatched_at: record.hatched_at
  };
}

function readStoredRecords() {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as PushpetRecord[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeRecord);
  } catch {
    return [];
  }
}

function writeStoredRecords(records: IndividualPushpetRecord[]) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function useIndividualPushpets() {
  const [records, setRecords] = useState<IndividualPushpetRecord[]>(() => readStoredRecords());

  function findRecord(username?: string | null) {
    const key = username?.trim().toLowerCase();
    if (!key) return null;
    return records.find((record) => record.username.toLowerCase() === key) ?? null;
  }

  function upsert(recordPayload: PushpetRecord) {
    const record = normalizeRecord(recordPayload);
    setRecords((current) => {
      const withoutExisting = current.filter((item) => item.username.toLowerCase() !== record.username.toLowerCase());
      const nextRecords = [record, ...withoutExisting];
      writeStoredRecords(nextRecords);
      return nextRecords;
    });

    return record;
  }

  function updateAccessorySlot(username: string, slot: PetAccessorySlot, accessory: PetAccessory | "none") {
    setRecords((current) =>
      current.map((record) => {
        if (record.username.toLowerCase() !== username.trim().toLowerCase()) return record;

        const equipped = { ...normalizeEquipment(record.equipped, record.accessory) };
        if (accessory === "none") {
          delete equipped[slot];
        } else if (slotForAccessory(accessory) === slot) {
          equipped[slot] = accessory;
        }

        return {
          ...record,
          equipped,
          accessory: Object.values(equipped)[0] ?? "none"
        };
      })
    );
  }

  function updateBackground(username: string, background: PetBackground) {
    setRecords((current) =>
      current.map((record) => (record.username.toLowerCase() === username.trim().toLowerCase() ? { ...record, background } : record))
    );
  }

  function updateCustomization(username: string, input: { display_name?: string | null; species?: PetSpecies; color?: PetColor; background?: PetBackground }) {
    setRecords((current) =>
      current.map((record) => {
        if (record.username.toLowerCase() !== username.trim().toLowerCase()) return record;

        return {
          ...record,
          display_name: input.display_name === undefined ? record.display_name : input.display_name?.trim() || null,
          species: input.species ?? record.species,
          color: input.color ?? record.color,
          background: input.background ?? record.background
        };
      })
    );
  }

  return {
    records,
    findRecord,
    upsert,
    updateAccessorySlot,
    updateBackground,
    updateCustomization
  };
}
