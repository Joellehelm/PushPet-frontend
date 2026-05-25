import { useMemo, useState } from "react";
import { accessoryFromUnlock, colorFromSeed, normalizeMood, speciesFromSeed, stageFromEvolution } from "../assets/pets/petManifest";
import type { EquippedAccessories, PetAccessory, PetColor, PetMood, PetSpecies, PetStage } from "../components/pets/petTypes";
import type { IndividualPet, LeaderboardEntry } from "../types/pushpet";

export type SessionLeaderboardEntry = {
  username: string;
  avatar_url: string;
  pet_score: number;
  mood: string;
  dormancy_state: string;
  looked_up_at: string;
  species: PetSpecies;
  stage: PetStage;
  color: PetColor;
  accessory: PetAccessory;
  equipped?: EquippedAccessories;
  renderer_mood: PetMood;
};

const MAX_RECENT_UNIQUE = 10;

export function useSessionLeaderboard() {
  const [entries, setEntries] = useState<SessionLeaderboardEntry[]>([]);

  function applyServerLeaderboard(serverEntries: LeaderboardEntry[] = []) {
    setEntries(
      serverEntries.map((entry) => ({
        username: entry.username,
        avatar_url: entry.avatar_url ?? "",
        pet_score: entry.score,
        mood: entry.mood ?? "curious",
        dormancy_state: entry.dormancy_state ?? "thriving",
        looked_up_at: entry.last_seen_at ?? new Date().toISOString(),
        species: (entry.species as PetSpecies) ?? speciesFromSeed(entry.username),
        stage: stageFromEvolution("hatchling", entry.score),
        color: (entry.color as PetColor) ?? colorFromSeed(entry.username, entry.score),
        accessory: (entry.accessory as PetAccessory) ?? "none",
        equipped: entry.equipped as EquippedAccessories,
        renderer_mood: normalizeMood(entry.mood ?? "curious", entry.dormancy_state ?? "thriving")
      }))
    );
  }

  function recordPet(pet: IndividualPet, design?: { species: PetSpecies; color: PetColor }, accessory?: PetAccessory, equipped?: EquippedAccessories) {
    setEntries((current) => {
      const usernameKey = pet.username.toLowerCase();
      const withoutExisting = current.filter((entry) => entry.username.toLowerCase() !== usernameKey);
      return [
        {
          username: pet.username,
          avatar_url: pet.avatar_url,
          pet_score: pet.pet_score,
          mood: pet.mood,
          dormancy_state: pet.dormancy_state,
          looked_up_at: new Date().toISOString(),
          species: design?.species ?? speciesFromSeed(pet.username),
          stage: stageFromEvolution(pet.evolution_stage, pet.pet_score),
          color: design?.color ?? colorFromSeed(pet.username, pet.pet_score),
          accessory: accessory ?? accessoryFromUnlock(pet.outfit_unlocks[0]?.id),
          equipped,
          renderer_mood: normalizeMood(pet.mood, pet.dormancy_state)
        },
        ...withoutExisting
      ].slice(0, MAX_RECENT_UNIQUE);
    });
  }

  const rankedEntries = useMemo(
    () => [...entries].sort((left, right) => right.pet_score - left.pet_score || left.username.localeCompare(right.username)),
    [entries]
  );

  return {
    entries: rankedEntries,
    recordPet,
    applyServerLeaderboard
  };
}
