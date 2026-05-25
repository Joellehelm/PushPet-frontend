import { HeartHandshake, Trophy } from "lucide-react";
import { useCommunityPet } from "../hooks/useCommunityPet";
import type { CommunityPet } from "../types/pushpet";
import { CaretakerControls } from "./CaretakerControls";
import { FeedLog } from "./FeedLog";
import { PetDesignControls, type PetDesign } from "./PetDesignControls";
import { PetStageDisplay } from "./PetStageDisplay";
import { PetStatsPanel } from "./PetStatsPanel";
import type { PetColor, PetSpecies } from "./pets/petTypes";

type CommunityPetCardProps = {
  communityPet: CommunityPet | null;
  status: ReturnType<typeof useCommunityPet>["status"];
  error: string | null;
  activeUsername: string | null;
  canCustomize: boolean;
  onCustomize: ReturnType<typeof useCommunityPet>["customize"];
  design: PetDesign & { hatched: boolean };
  speciesOptions: Array<{ value: PetSpecies; label: string }>;
  colorOptions: Array<{ value: PetColor; label: string }>;
  onDesignChange: (design: PetDesign) => void;
  onHatch: () => void;
};

export function CommunityPetCard({
  communityPet,
  status,
  error,
  activeUsername,
  canCustomize,
  onCustomize,
  design,
  speciesOptions,
  colorOptions,
  onDesignChange,
  onHatch
}: CommunityPetCardProps) {
  const displayScore = design.hatched ? communityPet?.community_score ?? 0 : 0;
  const displayMood = design.hatched ? communityPet?.mood ?? "idle" : "idle";
  const displayStage = design.hatched ? communityPet?.evolution_stage ?? "egg" : "egg";
  const displayOutfit = design.hatched ? communityPet?.outfit : null;
  const backendOffline = status === "error";
  const viewCommunityPet = communityPet
    ? {
        ...communityPet,
        featured_name: design.hatched ? communityPet.featured_name : "Pushpet Prime",
        display_title: design.hatched ? communityPet.display_title : "Community Pushpet",
        community_score: displayScore,
        level: design.hatched ? communityPet.level : 1,
        mood: displayMood,
        hunger: design.hatched ? communityPet.hunger : 45,
        happiness: design.hatched ? communityPet.happiness : 55,
        outfit: displayOutfit ?? "none",
        top_caretaker: design.hatched ? communityPet.top_caretaker : null,
        contributors_count: design.hatched ? communityPet.contributors_count : 0,
        total_recent_pushes: design.hatched ? communityPet.total_recent_pushes : 0,
        total_recent_prs: design.hatched ? communityPet.total_recent_prs : 0,
        active_users_count: design.hatched ? communityPet.active_users_count : 0,
        feed_log: design.hatched
          ? communityPet.feed_log
          : [
              {
                type: "community_hatch",
                label: "Choose a shell, then hatch the Community Pushpet"
              }
            ]
      }
    : null;

  return (
    <section className="toy-panel community-card">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Community</span>
          <h2>Community Pushpet</h2>
        </div>
        <HeartHandshake size={24} />
      </div>

      {status === "loading" && !communityPet ? (
        <p className="quiet-copy">Warming up the community habitat...</p>
      ) : viewCommunityPet ? (
        <>
          {backendOffline && (
            <div className="offline-ribbon" role="status">
              Backend is waking up. You can still preview the habitat.
            </div>
          )}

          <PetStageDisplay
            score={displayScore}
            mood={displayMood}
            evolutionStage={displayStage}
            outfit={displayOutfit}
            species={design.species}
            color={design.color}
            size={300}
          />

          <div className="community-identity">
            <div>
              <span className="sticker-label">{viewCommunityPet.display_title}</span>
              <h3>{viewCommunityPet.featured_name}</h3>
            </div>
            <span className="score-burst">{displayScore}</span>
          </div>

          {!design.hatched && (
            <div className="community-hatch-box">
              <PetDesignControls
                title="Choose the shared pet"
                design={design}
                speciesOptions={speciesOptions}
                colorOptions={colorOptions}
                onChange={onDesignChange}
              />
              <button className="hatch-community-button" type="button" onClick={onHatch}>
                Hatch Community Pushpet
              </button>
            </div>
          )}

          {design.hatched && (
            <div className="community-meta">
              <span>Level {viewCommunityPet.level}</span>
              <span>{displayMood} mood</span>
              <span>{displayOutfit ?? "no accessory"}</span>
            </div>
          )}

          {design.hatched && <PetStatsPanel pet={viewCommunityPet} mode="community" />}

          {design.hatched && (
            <div className="top-caretaker-strip">
              <Trophy size={17} />
              <span>Top Caretaker</span>
              <strong>{viewCommunityPet.top_caretaker?.username ? `@${viewCommunityPet.top_caretaker.username}` : "open slot"}</strong>
            </div>
          )}

          {design.hatched && canCustomize && activeUsername && (
            <CaretakerControls
              activeUsername={activeUsername}
              communityPet={viewCommunityPet}
              isSaving={status === "saving"}
              error={error}
              onSave={onCustomize}
            />
          )}

          {design.hatched && <FeedLog title="Community feed" items={viewCommunityPet.feed_log} />}
        </>
      ) : (
        <p className="quiet-copy">{error ?? "Community Pushpet is taking a tiny nap."}</p>
      )}
    </section>
  );
}
