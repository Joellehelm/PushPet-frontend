import { useState } from "react";
import { fetchPet } from "../api/pushpetApi";
import type { IndividualPet } from "../types/pushpet";

export type PetStatus = "idle" | "loading" | "success" | "not_found" | "error";

export function usePet() {
  const [status, setStatus] = useState<PetStatus>("idle");
  const [pet, setPet] = useState<IndividualPet | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function lookup(username: string) {
    const cleanUsername = username.trim();
    if (!cleanUsername) return null;

    setStatus("loading");
    setError(null);

    try {
      const response = await fetchPet(cleanUsername);
      setPet(response.pet);
      setStatus("success");
      return response;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Something went sideways.";
      setPet(null);
      setError(message);
      setStatus(message.toLowerCase().includes("not found") ? "not_found" : "error");
      return null;
    }
  }

  return {
    status,
    pet,
    error,
    lookup,
    isDormant: pet ? ["peckish", "sad", "ghost"].includes(pet.dormancy_state) : false,
    isDegraded: Boolean(pet?.degraded)
  };
}
