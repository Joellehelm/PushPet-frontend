import { useCallback, useEffect, useState } from "react";
import { fetchCommunityPet, updateCommunityPetCustomization } from "../api/pushpetApi";
import type { CommunityCustomizationInput, CommunityPet } from "../types/pushpet";

export type CommunityStatus = "loading" | "ready" | "error" | "saving";

export function useCommunityPet() {
  const [status, setStatus] = useState<CommunityStatus>("loading");
  const [communityPet, setCommunityPet] = useState<CommunityPet | null>(defaultCommunityPet());
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const response = await fetchCommunityPet();
      setCommunityPet(response.community_pet);
      setStatus("ready");
    } catch (caught) {
      setCommunityPet((current) => current ?? defaultCommunityPet());
      setError(caught instanceof Error ? caught.message : "Community Pushpet could not load.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  function applyCommunityPet(nextPet: CommunityPet) {
    setCommunityPet(nextPet);
    setStatus("ready");
  }

  async function customize(input: CommunityCustomizationInput) {
    setStatus("saving");
    setError(null);
    try {
      const response = await updateCommunityPetCustomization(input);
      setCommunityPet(response.community_pet);
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
