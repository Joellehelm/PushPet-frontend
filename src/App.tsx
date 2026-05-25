import { FormEvent, type ReactNode, useEffect, useState } from "react";
import {
  ArrowRight,
  Cat,
  CircleHelp,
  Gamepad2,
  Github,
  Heart,
  Home,
  Loader2,
  AlertTriangle,
  Settings,
  ShoppingCart,
  Star,
  RotateCw,
  Sparkles,
  Trophy,
  ToyBrick,
  Users
} from "lucide-react";
import { ActivitySummary } from "./components/ActivitySummary";
import { CommunityPetCard } from "./components/CommunityPetCard";
import { FeedLog } from "./components/FeedLog";
import { LeaderboardPanel } from "./components/LeaderboardPanel";
import { OutfitUnlocks } from "./components/OutfitUnlocks";
import { CareMeters } from "./components/CareMeters";
import { PetBackgroundControls, normalizePetBackground } from "./components/PetBackgroundControls";
import { PetDesignControls, type PetDesign } from "./components/PetDesignControls";
import { PetStageDisplay } from "./components/PetStageDisplay";
import { DemoWalkthrough } from "./components/DemoWalkthrough";
import { LandingPage } from "./components/LandingPage";
import { hatchPet, updatePetBackground, updatePetCustomization, updatePetEquipment } from "./api/pushpetApi";
import { useCommunityPet } from "./hooks/useCommunityPet";
import { useIndividualPushpets } from "./hooks/useIndividualPushpets";
import { usePet } from "./hooks/usePet";
import { useSessionLeaderboard } from "./hooks/useSessionLeaderboard";
import { accessoriesFromEquipment, petSpeciesLabel } from "./assets/pets/petManifest";
import type { EquippedAccessories, PetAccessory, PetAccessorySlot, PetBackground, PetColor, PetSpecies } from "./components/pets/petTypes";
import type { IndividualPet } from "./types/pushpet";

const speciesOptions: Array<{ value: PetSpecies; label: string }> = [
  { value: "goat_dragon", label: petSpeciesLabel("goat_dragon") },
  { value: "raccoon", label: petSpeciesLabel("raccoon") },
  { value: "star_axolotl", label: petSpeciesLabel("star_axolotl") }
];

const colorOptions: Array<{ value: PetColor; label: string }> = [
  { value: "blue", label: "Blue" },
  { value: "pink", label: "Pink" },
  { value: "green", label: "Green" },
  { value: "purple", label: "Purple" },
  { value: "orange", label: "Orange" },
  { value: "white", label: "White" }
];

type CommunityDesign = PetDesign & {
  hatched: boolean;
};

type ActiveView = "community" | "individual" | "rankings" | "care" | "play" | "shop" | "settings";

const COMMUNITY_DESIGN_KEY = "pushpet.communityDesign.v3";

function readCommunityDesign(): CommunityDesign {
  try {
    const stored = window.localStorage.getItem(COMMUNITY_DESIGN_KEY);
    if (!stored) return { species: "star_axolotl", color: "purple", background: "petplace1", hatched: true };
    const parsed = JSON.parse(stored) as Partial<CommunityDesign>;
    const species: PetSpecies = speciesOptions.some((option) => option.value === parsed.species) ? (parsed.species as PetSpecies) : "star_axolotl";
    const color: PetColor = colorOptions.some((option) => option.value === parsed.color) ? (parsed.color as PetColor) : "purple";
    return {
      species,
      color,
      background: normalizePetBackground(parsed.background),
      hatched: Boolean(parsed.hatched)
    };
  } catch {
    return { species: "star_axolotl", color: "purple", background: "petplace1", hatched: true };
  }
}

function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  function navigate(nextPath: string) {
    window.history.pushState(null, "", nextPath);
    setPath(nextPath);
  }

  if (path === "/" || path === "") {
    return <LandingPage onEnterApp={() => navigate("/app")} onOpenDemo={() => navigate("/demo")} />;
  }

  if (path === "/demo" || path === "/how-it-works") {
    return (
      <DemoWalkthrough
        onOpenCommunity={() => navigate("/app")}
        onOpenIndividual={() => navigate("/app/individual")}
      />
    );
  }

  return <PushpetApp initialView={path === "/app/individual" ? "individual" : "community"} onOpenDemo={() => navigate("/demo")} />;
}

function PushpetApp({ initialView = "community", onOpenDemo }: { initialView?: ActiveView; onOpenDemo: () => void }) {
  const [username, setUsername] = useState("");
  const [activeView, setActiveView] = useState<ActiveView>(initialView);
  const [loadingUsername, setLoadingUsername] = useState<string | null>(null);
  const [hatchDesign, setHatchDesign] = useState<PetDesign>({ species: "goat_dragon", color: "blue", background: "petplace1" });
  const [activePetDesign, setActivePetDesign] = useState<PetDesign | null>(null);
  const [activePetName, setActivePetName] = useState("");
  const [equippedAccessories, setEquippedAccessories] = useState<EquippedAccessories>({});
  const [individualSaveError, setIndividualSaveError] = useState<string | null>(null);
  const [individualSaving, setIndividualSaving] = useState(false);
  const [communityDesign, setCommunityDesign] = useState<CommunityDesign>(() => readCommunityDesign());
  const { status, pet, error, lookup, isDormant, isDegraded } = usePet();
  const community = useCommunityPet();
  const sessionLeaderboard = useSessionLeaderboard();
  const individualPushpets = useIndividualPushpets();

  useEffect(() => {
    window.localStorage.setItem(COMMUNITY_DESIGN_KEY, JSON.stringify(communityDesign));
  }, [communityDesign]);

  useEffect(() => {
    if (community.communityPet?.leaderboard) {
      sessionLeaderboard.applyServerLeaderboard(community.communityPet.leaderboard);
    }
  }, [community.communityPet?.updated_at]);

  const activeUsername = pet?.username ?? null;
  const localLeader = sessionLeaderboard.entries[0] ?? null;
  const topCaretaker = community.communityPet?.top_caretaker ?? localLeader;
  const topCaretakerUsername = topCaretaker?.username ?? null;
  const activeUserIsTopCaretaker =
    Boolean(activeUsername && topCaretakerUsername && topCaretakerUsername.toLowerCase() === activeUsername.toLowerCase());
  const caretakerUsername = activeUserIsTopCaretaker ? activeUsername : topCaretakerUsername;
  const canCustomize = Boolean(
    community.communityPet && topCaretakerUsername && (!activeUsername || activeUserIsTopCaretaker)
  );

  async function runLookup(nextUsername: string) {
    const cleanUsername = nextUsername.trim();
    if (!cleanUsername) return;

    setLoadingUsername(cleanUsername);
    const response = await lookup(cleanUsername);
    setLoadingUsername(null);

    if (response) {
      setIndividualSaveError(null);
      community.applyCommunityPet(response.community_pet);
      sessionLeaderboard.applyServerLeaderboard(response.leaderboard);
      const existingPushpet = response.pushpet ? individualPushpets.upsert(response.pushpet) : individualPushpets.findRecord(response.pet.username);
      if (existingPushpet) {
        const existingDesign = { species: existingPushpet.species, color: existingPushpet.color, background: existingPushpet.background };
        setActivePetDesign(existingDesign);
        setActivePetName(existingPushpet.display_name ?? "");
        setEquippedAccessories(existingPushpet.equipped);
      } else {
        setActivePetDesign(null);
        setActivePetName("");
        setEquippedAccessories({});
      }
      setUsername("");
    }
  }

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanUsername = username.trim();
    setUsername("");
    await runLookup(cleanUsername);
  }

  async function handleHatchIndividualPet() {
    if (!pet || individualSaving) return;
    setIndividualSaving(true);
    setIndividualSaveError(null);

    try {
      const response = await hatchPet(pet.username, hatchDesign);
      community.applyCommunityPet(response.community_pet);
      sessionLeaderboard.applyServerLeaderboard(response.leaderboard);
      if (!response.pushpet) {
        throw new Error("PushPet did not return a saved pet record. Try choosing the pet again.");
      }

      const record = individualPushpets.upsert(response.pushpet);
      const design = { species: record.species, color: record.color, background: record.background };
      setActivePetDesign(design);
      setActivePetName(record.display_name ?? "");
      setEquippedAccessories(record.equipped);
    } catch (caught) {
      setIndividualSaveError(caught instanceof Error ? caught.message : "PushPet could not save that hatch.");
    } finally {
      setIndividualSaving(false);
    }
  }

  async function handleToggleAccessory(slot: PetAccessorySlot, accessory: PetAccessory | "none") {
    const nextEquipped = { ...equippedAccessories };
    if (accessory === "none") {
      delete nextEquipped[slot];
    } else {
      nextEquipped[slot] = accessory;
    }
    setEquippedAccessories(nextEquipped);

    if (!pet) return;

    individualPushpets.updateAccessorySlot(pet.username, slot, accessory);
    try {
      setIndividualSaveError(null);
      const response = await updatePetEquipment(pet.username, { slot, accessory });
      const record = individualPushpets.upsert(response.pushpet);
      setEquippedAccessories(record.equipped);
      sessionLeaderboard.applyServerLeaderboard(response.leaderboard);
    } catch (caught) {
      setIndividualSaveError(caught instanceof Error ? caught.message : "PushPet could not save that accessory change.");
    }
  }

  async function handleIndividualBackgroundChange(background: PetBackground) {
    if (!pet) return;

    setActivePetDesign((current) => ({ ...(current ?? hatchDesign), background }));
    individualPushpets.updateBackground(pet.username, background);

    try {
      setIndividualSaveError(null);
      const response = await updatePetBackground(pet.username, { background });
      const record = individualPushpets.upsert(response.pushpet);
      setActivePetDesign({ species: record.species, color: record.color, background: record.background });
      sessionLeaderboard.applyServerLeaderboard(response.leaderboard);
    } catch (caught) {
      setIndividualSaveError(caught instanceof Error ? caught.message : "PushPet could not save that place change.");
    }
  }

  async function handleIndividualCustomizationChange(input: { displayName: string; design: PetDesign }) {
    if (!pet) return;

    const displayName = input.displayName.trim().slice(0, 28);
    setIndividualSaving(true);
    setIndividualSaveError(null);

    try {
      const response = await updatePetCustomization(pet.username, {
        display_name: displayName,
        species: input.design.species,
        color: input.design.color,
        background: input.design.background
      });
      const record = individualPushpets.upsert(response.pushpet);
      setActivePetName(record.display_name ?? "");
      setActivePetDesign({ species: record.species, color: record.color, background: record.background });
      sessionLeaderboard.applyServerLeaderboard(response.leaderboard);
    } catch (caught) {
      setIndividualSaveError(caught instanceof Error ? caught.message : "PushPet could not save that customization.");
    } finally {
      setIndividualSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <div className="pushpet-asset-preloads" aria-hidden="true">
        <img src="/assets/pets/goat_dragon-base.png" alt="" />
        <img src="/assets/pets/goat_dragon-accessories.png?v=placement-20260525" alt="" />
        <img src="/assets/pets/raccoon-base.png" alt="" />
        <img src="/assets/pets/raccoon-accessories.png?v=placement-20260525" alt="" />
        <img src="/assets/pets/star_axolotl-base.png" alt="" />
        <img src="/assets/pets/star_axolotl-accessories.png?v=placement-20260525" alt="" />
      </div>
      <header className="top-marquee">
        <button
          className="brand-home-button"
          type="button"
          onClick={() => setActiveView("community")}
          aria-label="Go to Pushpet home"
        >
          <span className="brand-star-tile" aria-hidden="true">
            <Star size={42} />
          </span>
          <span className="brand-wordmark" aria-hidden="true">
            <span className="brand-wordmark-push">Push</span>
            <span className="brand-wordmark-pet">pet</span>
          </span>
        </button>
        <nav className="app-nav" aria-label="Pushpet views">
          <button className={activeView === "community" ? "is-active" : ""} type="button" onClick={() => setActiveView("community")}>
            <Users size={22} />
            Community Pushpet
          </button>
          <button className={activeView === "individual" ? "is-active" : ""} type="button" onClick={() => setActiveView("individual")}>
            <Cat size={22} />
            Individual Pushpet
          </button>
          <button className="how-it-works-link" type="button" onClick={onOpenDemo} aria-label="How it works">
            <CircleHelp size={22} />
            How it works
          </button>
        </nav>
      </header>

      <div className={`locked-stage active-${activeView}`}>
        {activeView === "community" && (
          <section className="community-stage">
            <CommunityPetCard
              communityPet={community.communityPet}
              status={community.status}
              error={community.error}
              activeUsername={caretakerUsername}
              canCustomize={canCustomize}
              onCustomize={community.customize}
              design={communityDesign}
              speciesOptions={speciesOptions}
              colorOptions={colorOptions}
              onDesignChange={(nextDesign) => setCommunityDesign((current) => ({ ...current, ...nextDesign }))}
              onHatch={() => setCommunityDesign((current) => ({ ...current, hatched: true }))}
            />
          </section>
        )}

        {activeView === "individual" && (
          <IndividualWorkspace
            username={username}
            status={status}
            pet={pet}
            error={error}
            isDormant={isDormant}
            isDegraded={isDegraded}
            design={activePetDesign ?? hatchDesign}
            displayName={activePetName}
            hatchDesign={hatchDesign}
            hasHatched={Boolean(pet && individualPushpets.findRecord(pet.username))}
            equippedAccessories={equippedAccessories}
            onUsernameChange={setUsername}
            onLookup={handleLookup}
            onHatchDesignChange={setHatchDesign}
            onHatch={handleHatchIndividualPet}
            onToggleAccessory={handleToggleAccessory}
            onBackgroundChange={handleIndividualBackgroundChange}
            onCustomize={handleIndividualCustomizationChange}
            saveError={individualSaveError}
            isSaving={individualSaving}
          />
        )}

        {activeView === "rankings" && (
          <section className="rankings-page">
            <LeaderboardPanel
              entries={sessionLeaderboard.entries}
              onSelect={(entry) => {
                setActiveView("individual");
                void runLookup(entry.username);
              }}
              loadingUsername={loadingUsername}
            />
          </section>
        )}

        {["care", "play", "shop", "settings"].includes(activeView) && <ComingSoonPanel view={activeView} />}
      </div>

      <nav className="bottom-dock" aria-label="Pushpet action rail">
        <button className={activeView === "community" ? "is-active" : ""} type="button" onClick={() => setActiveView("community")}>
          <Home size={24} />
          Home
        </button>
        <button className={activeView === "care" ? "is-active" : ""} type="button" onClick={() => setActiveView("care")}>
          <Heart size={24} />
          Care
        </button>
        <button className={activeView === "play" ? "is-active" : ""} type="button" onClick={() => setActiveView("play")}>
          <Gamepad2 size={24} />
          Play
        </button>
        <button className={activeView === "shop" ? "is-active" : ""} type="button" onClick={() => setActiveView("shop")}>
          <ShoppingCart size={24} />
          Shop
        </button>
        <button className={activeView === "rankings" ? "is-active" : ""} type="button" onClick={() => setActiveView("rankings")}>
          <Trophy size={24} />
          Rankings
        </button>
        <button className={activeView === "settings" ? "is-active" : ""} type="button" onClick={() => setActiveView("settings")}>
          <Settings size={24} />
          Settings
        </button>
      </nav>
    </main>
  );
}

function ComingSoonPanel({ view }: { view: ActiveView }) {
  const label = view.charAt(0).toUpperCase() + view.slice(1);

  return (
    <section className="coming-soon-panel">
      <span className="sticker-label">{label}</span>
      <h2>Coming soon</h2>
      <p>This part of Pushpet is being tuned up next.</p>
    </section>
  );
}

type IndividualWorkspaceProps = {
  username: string;
  status: ReturnType<typeof usePet>["status"];
  pet: IndividualPet | null;
  error: string | null;
  isDormant: boolean;
  isDegraded: boolean;
  design: PetDesign;
  displayName: string;
  hatchDesign: PetDesign;
  hasHatched: boolean;
  equippedAccessories: EquippedAccessories;
  onUsernameChange: (username: string) => void;
  onLookup: (event: FormEvent<HTMLFormElement>) => void;
  onHatchDesignChange: (design: PetDesign) => void;
  onHatch: () => void;
  onToggleAccessory: (slot: PetAccessorySlot, accessory: PetAccessory | "none") => void;
  onBackgroundChange: (background: PetBackground) => void;
  onCustomize: (input: { displayName: string; design: PetDesign }) => void | Promise<void>;
  saveError: string | null;
  isSaving: boolean;
};

function IndividualWorkspace({
  username,
  status,
  pet,
  error,
  isDormant,
  isDegraded,
  design,
  displayName,
  hatchDesign,
  hasHatched,
  equippedAccessories,
  onUsernameChange,
  onLookup,
  onHatchDesignChange,
  onHatch,
  onToggleAccessory,
  onBackgroundChange,
  onCustomize,
  saveError,
  isSaving
}: IndividualWorkspaceProps) {
  const [expandedPanel, setExpandedPanel] = useState<"place" | "accessories" | "feed" | null>(null);
  const [openCustomizerMenu, setOpenCustomizerMenu] = useState<"species" | "color" | null>(null);
  const [draftName, setDraftName] = useState(displayName);
  const [draftDesign, setDraftDesign] = useState(design);
  const lookupDisabled = status === "loading" || !username.trim();
  const pageTitle = pet && hasHatched ? draftName.trim() || `${pet.username}'s Pushpet` : "Get individual Pushpet";

  useEffect(() => {
    setDraftName(displayName);
    setDraftDesign(design);
  }, [displayName, design.species, design.color, design.background]);

  function saveCustomization(nextName = draftName, nextDesign = draftDesign) {
    if (!pet || !hasHatched) return;
    void onCustomize({ displayName: nextName, design: nextDesign });
  }

  function updateDraftDesign(nextDesign: PetDesign) {
    setDraftDesign(nextDesign);
    saveCustomization(draftName, nextDesign);
  }
  let workspaceClass = "is-empty";
  let stage = (
    <PetStageDisplay
      score={0}
      mood="curious"
      evolutionStage="egg"
      species={hatchDesign.species}
      color={hatchDesign.color}
      background={hatchDesign.background}
      showPet={false}
    />
  );
  let stageMeters: ReactNode = null;
  let controls = (
    <section className="toy-panel individual-card empty-state individual-guidance">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Individual Pushpet</span>
          <h2>Get a Pushpet</h2>
        </div>
        <Sparkles size={24} />
      </div>
      <p className="quiet-copy">Enter a GitHub username to hatch or load an individual Pushpet.</p>
    </section>
  );

  if (status === "idle") {
    workspaceClass = "is-empty";
  } else if (status === "loading") {
    workspaceClass = "is-loading";
    stage = (
      <PetStageDisplay
        score={0}
        mood="loading"
        evolutionStage="egg"
        species={design.species}
        color={design.color}
        background={design.background}
        showPet={false}
      />
    );
    controls = (
      <section className="toy-panel individual-card empty-state individual-guidance">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Individual Pushpet</span>
            <h2>Getting pet...</h2>
          </div>
          <Loader2 className="spin" size={24} />
        </div>
        <p className="quiet-copy">Checking for an existing Pushpet.</p>
      </section>
    );
  } else if (status === "not_found") {
    workspaceClass = "is-error";
    stage = (
      <PetStageDisplay
        score={0}
        mood="lost"
        evolutionStage="egg"
        dormancyState="sad"
        species={design.species}
        color={design.color}
        background={design.background}
        showPet={false}
      />
    );
    controls = (
      <section className="toy-panel individual-card empty-state individual-guidance">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">No hatch</span>
            <h2>Username not found</h2>
          </div>
          <AlertTriangle size={24} />
        </div>
        <p className="quiet-copy">{error ?? "That GitHub username did not hatch. Try another spelling."}</p>
      </section>
    );
  } else if (!pet) {
    workspaceClass = "is-error";
    stage = (
      <PetStageDisplay
        score={0}
        mood="retry"
        evolutionStage="egg"
        species={design.species}
        color={design.color}
        background={design.background}
        showPet={false}
      />
    );
    controls = (
      <section className="toy-panel individual-card empty-state individual-guidance">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Retry hatch</span>
            <h2>Signal got fuzzy</h2>
          </div>
          <RotateCw size={24} />
        </div>
        <p className="quiet-copy">{error ?? "PushPet could not hatch that lookup yet."}</p>
      </section>
    );
  } else if (!hasHatched) {
    workspaceClass = "is-new";
    stage = (
      <PetStageDisplay
        score={0}
        mood="curious"
        evolutionStage="egg"
        species={hatchDesign.species}
        color={hatchDesign.color}
        background={hatchDesign.background}
      />
    );
    stageMeters = (
      <section className="individual-stage-meters">
        <CareMeters
          hunger={pet.hunger}
          happiness={pet.happiness}
          score={0}
          evolutionStage="egg"
          level={1}
          mood="new"
          pushes={pet.recent_pushes_30d}
          streakDays={pet.streak_days}
          prSignals={pet.recent_prs_30d}
          activeRepos={pet.active_repo_count_30d}
        />
      </section>
    );
    controls = (
      <>
        <section className="toy-panel individual-card individual-summary-card">
          <div className="pet-nameplate">
            <img src={pet.avatar_url} alt="" className="avatar" />
            <div>
              <span className="eyebrow">New Pushpet</span>
              <h2>@{pet.username}</h2>
            </div>
            {isDegraded && <span className="degraded-sticker">cached</span>}
          </div>
        </section>
        <section className="toy-panel individual-card individual-hatch-box">
          <PetDesignControls
            title="Choose pet"
            design={hatchDesign}
            speciesOptions={speciesOptions}
            colorOptions={colorOptions}
            onChange={onHatchDesignChange}
          />
          <p className="quiet-copy hatch-helper-copy">Low public activity may keep this pet in egg form until more GitHub signals appear.</p>
          <button className="hatch-community-button" type="button" onClick={onHatch} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="spin" size={18} />
                Choosing pet...
              </>
            ) : (
              "Choose pet"
            )}
          </button>
        </section>
        <section className="toy-panel individual-card">
          <ActivitySummary pet={pet} />
        </section>
      </>
    );
  } else {
    workspaceClass = isDormant ? "is-dormant" : "is-active";
    stage = (
      <PetStageDisplay
        score={pet.pet_score}
        mood={pet.mood}
        evolutionStage={pet.evolution_stage}
        dormancyState={pet.dormancy_state}
        accessories={accessoriesFromEquipment(equippedAccessories)}
        seed={pet.username}
        species={design.species}
        color={design.color}
        background={design.background}
      />
    );
    stageMeters = (
      <section className="individual-stage-meters">
        <CareMeters
          hunger={pet.hunger}
          happiness={pet.happiness}
          score={pet.pet_score}
          evolutionStage={pet.evolution_stage}
          level={pet.level}
          mood={pet.mood}
          pushes={pet.recent_pushes_30d}
          streakDays={pet.streak_days}
          prSignals={pet.recent_prs_30d}
          activeRepos={pet.active_repo_count_30d}
        />
      </section>
    );
    controls = (
      <>
        <section className="toy-panel individual-card individual-summary-card">
          <div className="pet-nameplate">
            <img src={pet.avatar_url} alt="" className="avatar" />
            <div>
              <a href={pet.profile_url} target="_blank" rel="noreferrer" className="github-name-link">
                <Github size={17} />
                @{pet.username}
              </a>
            </div>
            <span className="eyebrow status-corner">{isDormant ? "Dormant find" : "Active find"}</span>
            {isDegraded && <span className="degraded-sticker">cached</span>}
          </div>
          <form
            className="individual-customizer"
            onSubmit={(event) => {
              event.preventDefault();
              saveCustomization();
            }}
          >
            <label className="customizer-field customizer-field-name">
              <span className="customizer-label">Name</span>
              <input
                value={draftName}
                onChange={(event) => setDraftName(event.target.value)}
                onBlur={() => saveCustomization()}
                maxLength={28}
                placeholder={`${pet.username}'s Pushpet`}
              />
            </label>
            <CustomizerDropdown<PetSpecies>
              id="individual-pet-type"
              label="Type"
              value={draftDesign.species}
              options={speciesOptions}
              isOpen={openCustomizerMenu === "species"}
              onToggle={() => setOpenCustomizerMenu((current) => (current === "species" ? null : "species"))}
              onChange={(species) => {
                updateDraftDesign({ ...draftDesign, species });
                setOpenCustomizerMenu(null);
              }}
            />
            <CustomizerDropdown<PetColor>
              id="individual-pet-color"
              label="Color"
              value={draftDesign.color}
              options={colorOptions}
              isOpen={openCustomizerMenu === "color"}
              onToggle={() => setOpenCustomizerMenu((current) => (current === "color" ? null : "color"))}
              onChange={(color) => {
                updateDraftDesign({ ...draftDesign, color });
                setOpenCustomizerMenu(null);
              }}
            />
            <button type="submit" disabled={isSaving}>{isSaving ? "Saving" : "Save"}</button>
          </form>
          {saveError && <p className="form-error individual-save-error">{saveError}</p>}
        </section>
        <div className={`individual-panel-stack ${expandedPanel ? "has-expanded" : ""}`}>
          <CollapsiblePanel
            id="place"
            title="Pet place"
            expandedPanel={expandedPanel}
            onToggle={setExpandedPanel}
          >
            <PetBackgroundControls
              value={normalizePetBackground(draftDesign.background)}
              onChange={(background) => {
                updateDraftDesign({ ...draftDesign, background });
                onBackgroundChange(background);
              }}
              title="Pet place"
            />
          </CollapsiblePanel>
          <CollapsiblePanel
            id="accessories"
            title="Outfit and accessories"
            expandedPanel={expandedPanel}
            onToggle={setExpandedPanel}
          >
            <OutfitUnlocks outfits={pet.outfit_unlocks} equipped={equippedAccessories} onToggleAccessory={onToggleAccessory} />
          </CollapsiblePanel>
          <CollapsiblePanel
            id="feed"
            title="Hatch feed"
            expandedPanel={expandedPanel}
            onToggle={setExpandedPanel}
          >
            <FeedLog title="Hatch feed" items={pet.feed_log} />
          </CollapsiblePanel>
        </div>
      </>
    );
  }

  return (
    <section className={`individual-workspace ${workspaceClass}`}>
      <div className="individual-page-heading">
        <div>
          <span className="sticker-label">Individual Pushpet</span>
          <h2>{pageTitle}</h2>
        </div>
        <ToyBrick size={28} />
      </div>
      <div className="individual-stage-column">
        {stage}
        {stageMeters}
      </div>
      <aside className="individual-control-column">
        <section className="toy-panel hatch-panel individual-lookup-panel">
          <form className="lookup-form" onSubmit={onLookup}>
            <label htmlFor="individual-github-username">GitHub username</label>
            <div className="lookup-row">
              <Github aria-hidden="true" size={20} />
              <input
                id="individual-github-username"
                value={username}
                onChange={(event) => onUsernameChange(event.target.value)}
                placeholder="octocat"
                autoComplete="off"
                spellCheck={false}
              />
              <button type="submit" disabled={lookupDisabled} aria-label="Get individual Pushpet">
                {status === "loading" ? <Loader2 className="spin" size={20} /> : <ArrowRight size={20} />}
              </button>
            </div>
          </form>
        </section>
        {controls}
      </aside>
    </section>
  );
}

type CollapsiblePanelProps = {
  id: "place" | "accessories" | "feed";
  title: string;
  expandedPanel: "place" | "accessories" | "feed" | null;
  onToggle: (panel: "place" | "accessories" | "feed" | null) => void;
  children: ReactNode;
};

type CustomizerDropdownProps<T extends string> = {
  id: string;
  label: string;
  value: T;
  options: Array<{ value: T; label: string }>;
  isOpen: boolean;
  onToggle: () => void;
  onChange: (value: T) => void;
};

function CustomizerDropdown<T extends string>({ id, label, value, options, isOpen, onToggle, onChange }: CustomizerDropdownProps<T>) {
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <div className={`customizer-field customizer-dropdown-field ${isOpen ? "is-open" : ""}`}>
      <span id={`${id}-label`} className="customizer-label">
        {label}
      </span>
      <button
        className="customizer-select-trigger"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={`${id}-label ${id}-value`}
        onClick={onToggle}
      >
        <span className={`customizer-swatch customizer-swatch-${value}`} aria-hidden="true" />
        <span id={`${id}-value`}>{selected.label}</span>
        <span className="customizer-caret" aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="customizer-option-menu" role="listbox" aria-labelledby={`${id}-label`}>
          {options.map((option) => (
            <button
              className={option.value === value ? "is-selected" : ""}
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              onClick={() => onChange(option.value)}
            >
              <span className={`customizer-swatch customizer-swatch-${option.value}`} aria-hidden="true" />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CollapsiblePanel({ id, title, expandedPanel, onToggle, children }: CollapsiblePanelProps) {
  const isExpanded = expandedPanel === id;

  return (
    <section className={`toy-panel individual-card individual-collapsible ${isExpanded ? "is-expanded" : ""}`}>
      <button
        className="individual-collapsible-trigger"
        type="button"
        onClick={() => onToggle(isExpanded ? null : id)}
        aria-expanded={isExpanded}
      >
        <span>{title}</span>
        <span aria-hidden="true">{isExpanded ? "-" : "+"}</span>
      </button>
      {isExpanded && <div className="individual-collapsible-body">{children}</div>}
    </section>
  );
}

export default App;
