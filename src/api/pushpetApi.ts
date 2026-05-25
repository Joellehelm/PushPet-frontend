import type {
  ApiError,
  CommunityCustomizationInput,
  CommunityPetResponse,
  PetLookupResponse,
  PushpetEquipmentResponse
} from "../types/pushpet";

function defaultApiBaseUrl() {
  if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return "http://localhost:3004";
  }

  return "";
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl()).replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 14_000;

class BackendUnavailableError extends Error {}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new BackendUnavailableError("PushPet backend is not connected yet.");
  }

  let response: Response;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...init?.headers
      }
    });
  } catch (caught) {
    if (caught instanceof DOMException && caught.name === "AbortError") {
      throw new BackendUnavailableError("Lookup timed out. The PushPet backend may still be waking up.");
    }

    throw new BackendUnavailableError("PushPet backend is waking up.");
  } finally {
    window.clearTimeout(timeoutId);
  }

  const body = (await response.json().catch(() => ({}))) as Partial<ApiError>;

  if (!response.ok) {
    throw new Error(body.error ?? "PushPet had trouble reaching GitHub. Please try again.");
  }

  return body as T;
}

export function fetchPet(username: string) {
  const cleanUsername = username.trim();
  return requestJson<PetLookupResponse>(`/api/v1/pets/${encodeURIComponent(cleanUsername)}`).catch((caught) => {
    if (caught instanceof BackendUnavailableError) return buildOfflinePetResponse(cleanUsername);
    throw caught;
  });
}

export function hatchPet(username: string, input: { species: string; color: string }) {
  const cleanUsername = username.trim();
  return requestJson<PetLookupResponse>(`/api/v1/pets/${encodeURIComponent(cleanUsername)}/hatch`, {
    method: "POST",
    body: JSON.stringify(input)
  }).catch((caught) => {
    if (caught instanceof BackendUnavailableError) {
      return buildOfflinePetResponse(cleanUsername, {
        username: cleanUsername,
        species: input.species,
        color: input.color,
        accessory: "none",
        equipped: {},
        hatched_at: new Date().toISOString()
      });
    }
    throw caught;
  });
}

export function updatePetEquipment(username: string, input: { slot: string; accessory: string }) {
  const cleanUsername = username.trim();
  return requestJson<PushpetEquipmentResponse>(`/api/v1/pets/${encodeURIComponent(cleanUsername)}/equipment`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function fetchCommunityPet() {
  return requestJson<CommunityPetResponse>("/api/v1/community_pet");
}

export function updateCommunityPetCustomization(input: CommunityCustomizationInput) {
  return requestJson<CommunityPetResponse>("/api/v1/community_pet/customization", {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

function buildOfflinePetResponse(username: string, pushpet = null as PetLookupResponse["pushpet"]): PetLookupResponse {
  const now = new Date().toISOString();
  const cleanUsername = username || "builder";
  const feed = [
    {
      type: "offline",
      label: "Backend is waking up; showing a demo-safe Pushpet shell",
      timestamp: now
    }
  ];

  return {
    pet: {
      username: cleanUsername,
      avatar_url: `https://github.com/${encodeURIComponent(cleanUsername)}.png?size=160`,
      profile_url: `https://github.com/${encodeURIComponent(cleanUsername)}`,
      pet_score: 0,
      level: 1,
      evolution_stage: "egg",
      mood: "curious",
      hunger: 45,
      happiness: 55,
      streak_days: 0,
      recent_pushes_7d: 0,
      recent_pushes_30d: 0,
      recent_prs_30d: 0,
      active_repo_count_30d: 0,
      last_active_at: null,
      dormancy_state: "okay",
      top_languages: [],
      outfit_unlocks: [],
      recent_commit_messages: [],
      history: feed,
      feed_log: feed,
      summary_text: `${cleanUsername}'s Pushpet shell is ready while the backend wakes up. Public GitHub scoring will appear once the API responds.`,
      degraded: true,
      degraded_messages: ["Backend unavailable; this is a temporary demo-safe fallback."]
    },
    pushpet,
    leaderboard: [],
    community_pet: {
      featured_name: "Pushpet Prime",
      display_title: "Community Pushpet",
      outfit: "none",
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
      history: feed,
      feed_log: feed,
      updated_at: now
    }
  };
}
