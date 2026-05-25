import type {
  ApiError,
  CommunityCustomizationInput,
  CommunityPetResponse,
  LeaderboardResponse,
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
const REQUEST_TIMEOUT_MS = 60_000;

class ApiConfigurationError extends Error {}
class BackendUnavailableError extends Error {}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) {
    throw new ApiConfigurationError("PushPet API URL is not configured. Set VITE_API_BASE_URL to the Rails backend URL.");
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
      throw new BackendUnavailableError("Lookup timed out while waiting for the PushPet backend.");
    }

    throw new BackendUnavailableError("PushPet backend is unreachable.");
  } finally {
    window.clearTimeout(timeoutId);
  }

  const body = (await response.json().catch(() => ({}))) as Partial<ApiError>;

  if (!response.ok) {
    const detail = typeof body.exception === "string" ? body.exception.replace(/^#<|>$/g, "") : null;
    throw new Error(detail ?? body.error ?? `PushPet API returned HTTP ${response.status}.`);
  }

  return body as T;
}

export function fetchPet(username: string) {
  const cleanUsername = username.trim();
  return requestJson<PetLookupResponse>(`/api/v1/pets/${encodeURIComponent(cleanUsername)}`);
}

export function hatchPet(username: string, input: { species: string; color: string; background: string }) {
  const cleanUsername = username.trim();
  return requestJson<PetLookupResponse>(`/api/v1/pets/${encodeURIComponent(cleanUsername)}/hatch`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updatePetEquipment(username: string, input: { slot: string; accessory: string }) {
  const cleanUsername = username.trim();
  return requestJson<PushpetEquipmentResponse>(`/api/v1/pets/${encodeURIComponent(cleanUsername)}/equipment`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function updatePetBackground(username: string, input: { background: string }) {
  const cleanUsername = username.trim();
  return requestJson<PushpetEquipmentResponse>(`/api/v1/pets/${encodeURIComponent(cleanUsername)}/background`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function updatePetCustomization(username: string, input: { display_name?: string; species?: string; color?: string; background?: string }) {
  const cleanUsername = username.trim();
  return requestJson<PushpetEquipmentResponse>(`/api/v1/pets/${encodeURIComponent(cleanUsername)}/customization`, {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function fetchCommunityPet() {
  return requestJson<CommunityPetResponse>("/api/v1/community_pet");
}

export function fetchLeaderboard() {
  return requestJson<LeaderboardResponse>("/api/v1/leaderboard");
}

export function updateCommunityPetCustomization(input: CommunityCustomizationInput) {
  return requestJson<CommunityPetResponse>("/api/v1/community_pet/customization", {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}
