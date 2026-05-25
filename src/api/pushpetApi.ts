import type {
  ApiError,
  CommunityCustomizationInput,
  CommunityPetResponse,
  PetLookupResponse,
  PushpetEquipmentResponse
} from "../types/pushpet";

const FALLBACK_PRODUCTION_API_URL = "https://pushpet-backend.onrender.com";

function defaultApiBaseUrl() {
  if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return "http://localhost:3004";
  }

  return FALLBACK_PRODUCTION_API_URL;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl()).replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 14_000;

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
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
      throw new Error("Lookup timed out. The PushPet backend may still be waking up. Please try again.");
    }

    throw new Error("PushPet backend is waking up. Please try again.");
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
  return requestJson<PetLookupResponse>(`/api/v1/pets/${encodeURIComponent(username.trim())}`);
}

export function hatchPet(username: string, input: { species: string; color: string }) {
  return requestJson<PetLookupResponse>(`/api/v1/pets/${encodeURIComponent(username.trim())}/hatch`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updatePetEquipment(username: string, input: { slot: string; accessory: string }) {
  return requestJson<PushpetEquipmentResponse>(`/api/v1/pets/${encodeURIComponent(username.trim())}/equipment`, {
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
