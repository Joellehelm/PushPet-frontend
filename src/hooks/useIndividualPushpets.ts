import { useState } from "react";
import { normalizeColor, normalizeEquipment, normalizeSpecies, slotForAccessory } from "../assets/pets/petManifest";
import type { EquippedAccessories, PetAccessory, PetAccessorySlot, PetColor, PetSpecies } from "../components/pets/petTypes";
import type { PushpetRecord } from "../types/pushpet";

export type IndividualPushpetRecord = {
  username: string;
  species: PetSpecies;
  color: PetColor;
  accessory: PetAccessory;
  equipped: EquippedAccessories;
  hatched_at: string;
};

function normalizeRecord(record: PushpetRecord): IndividualPushpetRecord {
  return {
    username: record.username,
    species: normalizeSpecies(record.species),
    color: normalizeColor(record.color),
    accessory: (record.accessory as PetAccessory) ?? "none",
    equipped: normalizeEquipment(record.equipped, record.accessory),
    hatched_at: record.hatched_at
  };
}

export function useIndividualPushpets() {
  const [records, setRecords] = useState<IndividualPushpetRecord[]>([]);

  function findRecord(username?: string | null) {
    const key = username?.trim().toLowerCase();
    if (!key) return null;
    return records.find((record) => record.username.toLowerCase() === key) ?? null;
  }

  function upsert(recordPayload: PushpetRecord) {
    const record = normalizeRecord(recordPayload);
    setRecords((current) => {
      const withoutExisting = current.filter((item) => item.username.toLowerCase() !== record.username.toLowerCase());
      return [record, ...withoutExisting];
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

  return {
    records,
    findRecord,
    upsert,
    updateAccessorySlot
  };
}
