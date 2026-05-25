import { useCallback, useEffect, useState } from "react";
import { fetchCommunityPet, updateCommunityPetCustomization } from "../api/pushpetApi";
import type { CommunityCustomizationInput, CommunityPet } from "../types/pushpet";

export type CommunityStatus = "loading" | "ready" | "error" | "saving";
const STORAGE_KEY = "pushpet.communityPet.v1";

export function useCommunityPet() {
  const [status, setStatus] = useState<CommunityStatus>("loading");
  const [communityPet, setCommunityPet] = useState<CommunityPet | null>(() => readStoredCommunityPet() ?? defaultCommunityPet());
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const response = await fetchCommunityPet();
      setCommunityPet(response.community_pet);
      writeStoredCommunityPet(response.community_pet);
      setStatus("ready");
    } catch (caught) {
      setCommunityPet((current) => current ?? readStoredCommunityPet() ?? defaultCommunityPet());
      setError(caught instanceof Error ? caught.message : "Community Pushpet could not load.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function applyCommunityPet(nextPet: CommunityPet) {
    setCommunityPet(nextPet);
    writeStoredCommunityPet(nextPet);
    setStatus("ready");
  }

  async function customize(input: CommunityCustomizationInput) {
    setStatus("saving");
    setError(null);
    try {
      const response = await updateCommunityPetCustomization(input);
      setCommunityPet(response.community_pet);
      writeStoredCommunityPet(response.community_pet);
      setStatus("ready");
      return response.community_pet;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Customization did not stick.");
      setStatus("ready");
      return null;
    }
  }

  return {
    status,
    communityPet,
    error,
    refresh,
    applyCommunityPet,
    customize
  };
}

function readStoredCommunityPet() {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CommunityPet) : null;
  } catch {
    return null;
  }
}

function writeStoredCommunityPet(communityPet: CommunityPet) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(communityPet));
}

function defaultCommunityPet(): CommunityPet {
  return {
    featured_name: "Pushpet Prime",
    display_title: "Community Pushpet",
    species: "goat_dragon",
    color: "purple",
    outfit: "none",
    environment: "petplace1",
    community_score: 0,
    level: 1,
    evolution_stage: "egg",
    hunger: 45,
    happiness: 55,
    mood: "idle",
    dominant_language: null,
    top_caretaker: null,
    contributors_count: 0,
    total_recent_pushes: 0,
    total_recent_prs: 0,
    active_users_count: 0,
    leaderboard: [],
    unlocked_outfits: [{ id: "caretaker_crown", label: "Caretaker Crown", source_language: "Top Caretaker" }],
    history: [{ type: "community_hatch", label: "Community Pushpet is ready to hatch" }],
    feed_log: [{ type: "community_hatch", label: "Community Pushpet is ready to hatch" }],
    updated_at: new Date().toISOString()
  };
}
