export type FeedItem = {
  type: string;
  label: string;
  timestamp?: string | null;
  metadata?: Record<string, unknown>;
};

export type TopLanguage = {
  name: string;
  bytes: number;
  outfit?: string | null;
};

export type OutfitUnlock = {
  id: string;
  label: string;
  source_language: string;
};

export type IndividualPet = {
  username: string;
  avatar_url: string;
  profile_url: string;
  pet_score: number;
  level: number;
  evolution_stage: string;
  mood: string;
  hunger: number;
  happiness: number;
  streak_days: number;
  recent_pushes_7d: number;
  recent_pushes_30d: number;
  recent_prs_30d: number;
  active_repo_count_30d: number;
  last_active_at: string | null;
  dormancy_state: "thriving" | "okay" | "peckish" | "sad" | "ghost" | string;
  top_languages: TopLanguage[];
  outfit_unlocks: OutfitUnlock[];
  recent_commit_messages: string[];
  history: FeedItem[];
  feed_log: FeedItem[];
  summary_text: string;
  degraded: boolean;
  degraded_messages: string[];
};

export type LeaderboardEntry = {
  username: string;
  searches: number;
  score: number;
  avatar_url?: string | null;
  mood?: string | null;
  dormancy_state?: string | null;
  species?: string | null;
  color?: string | null;
  accessory?: string | null;
  equipped?: Record<string, string>;
  background?: string | null;
  last_seen_at?: string;
};

export type PushpetRecord = {
  username: string;
  display_name?: string | null;
  species: string;
  color: string;
  accessory: string;
  equipped: Record<string, string>;
  background: string;
  hatched_at: string;
};

export type CommunityPet = {
  featured_name: string;
  display_title: string;
  species?: string | null;
  color?: string | null;
  outfit: string;
  environment: string;
  community_score: number;
  level: number;
  evolution_stage: string;
  hunger: number;
  happiness: number;
  mood: string;
  dominant_language: string | null;
  top_caretaker: LeaderboardEntry | null;
  contributors_count: number;
  total_recent_pushes: number;
  total_recent_prs: number;
  active_users_count: number;
  leaderboard: LeaderboardEntry[];
  unlocked_outfits: OutfitUnlock[];
  history: FeedItem[];
  feed_log: FeedItem[];
  updated_at: string;
};

export type PetLookupResponse = {
  pet: IndividualPet;
  pushpet: PushpetRecord | null;
  leaderboard: LeaderboardEntry[];
  community_pet: CommunityPet;
};

export type PushpetEquipmentResponse = {
  pushpet: PushpetRecord;
  leaderboard: LeaderboardEntry[];
};

export type CommunityPetResponse = {
  community_pet: CommunityPet;
};

export type CommunityCustomizationInput = {
  caretaker_username: string;
  title?: string;
  name?: string;
  species?: string;
  color?: string;
  outfit?: string;
  environment?: string;
};

export type ApiError = {
  error: string;
  exception?: string;
  detail?: string;
};
