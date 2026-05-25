import { HeartHandshake, Trophy } from "lucide-react";
import { normalizeColor, normalizeSpecies } from "../assets/pets/petManifest";
import { useCommunityPet } from "../hooks/useCommunityPet";
import type { CommunityPet } from "../types/pushpet";
import { CaretakerControls } from "./CaretakerControls";
import { FeedLog } from "./FeedLog";
import { normalizePetBackground } from "./PetBackgroundControls";
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
  const displayEnvironment = normalizePetBackground(design.hatched ? communityPet?.environment : design.background);
  const displaySpecies = normalizeSpecies(design.hatched ? communityPet?.species ?? design.species : design.species);
  const displayColor = normalizeColor(design.hatched ? communityPet?.color ?? design.color : design.color);
  const backendOffline = status === "error";
  const viewCommunityPet = communityPet
    ? {
        ...communityPet,
        featured_name: design.hatched ? communityPet.featured_name : "Pushpet Prime",
        display_title: design.hatched ? communityPet.display_title : "Community Pushpet",
        community_score: displayScore,
        environment: displayEnvironment,
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
    <section className={`toy-panel community-card ${canCustomize ? "is-caretaker" : "is-visitor"}`}>
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
              {error ?? "Community API could not load. You can still preview the habitat."}
            </div>
          )}

          <PetStageDisplay
            score={displayScore}
            mood={displayMood}
            evolutionStage={displayStage}
            outfit={displayOutfit}
            species={displaySpecies}
            color={displayColor}
            environment={displayEnvironment}
            size={design.hatched ? 300 : 256}
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
            <section className="caretaker-zone">
              <div className="top-caretaker-strip">
                <Trophy size={17} />
                <span>Top Caretaker</span>
                <strong>{viewCommunityPet.top_caretaker?.username ? `@${viewCommunityPet.top_caretaker.username}` : "open slot"}</strong>
              </div>
              {canCustomize && activeUsername && (
                <CaretakerControls
                  activeUsername={activeUsername}
                  communityPet={viewCommunityPet}
                  isSaving={status === "saving"}
                  error={error}
                  onSave={onCustomize}
                  speciesOptions={speciesOptions}
                  colorOptions={colorOptions}
                />
              )}
            </section>
          )}

          {design.hatched && <FeedLog title="Community feed" items={viewCommunityPet.feed_log} />}
        </>
      ) : (
        <p className="quiet-copy">{error ?? "Community Pushpet is taking a tiny nap."}</p>
      )}
    </section>
  );
}
