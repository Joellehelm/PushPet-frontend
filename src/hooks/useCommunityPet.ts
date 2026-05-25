import { useCallback, useEffect, useState } from "react";
import { fetchCommunityPet, updateCommunityPetCustomization } from "../api/pushpetApi";
import type { CommunityCustomizationInput, CommunityPet } from "../types/pushpet";

export type CommunityStatus = "loading" | "ready" | "error" | "saving";

export function useCommunityPet() {
  const [status, setStatus] = useState<CommunityStatus>("loading");
  const [communityPet, setCommunityPet] = useState<CommunityPet | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus("loading");
    setError(null);
    try {
      const response = await fetchCommunityPet();
      setCommunityPet(response.community_pet);
      setStatus("ready");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Community Pushpet is napping.");
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
