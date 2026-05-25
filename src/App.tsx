import { FormEvent, useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, BadgeInfo, Github, Loader2, RotateCw, Sparkles, ToyBrick } from "lucide-react";
import { ActivitySummary } from "./components/ActivitySummary";
import { CommunityPetCard } from "./components/CommunityPetCard";
import { FeedLog } from "./components/FeedLog";
import { LeaderboardPanel } from "./components/LeaderboardPanel";
import { OutfitUnlocks } from "./components/OutfitUnlocks";
import { CareMeters } from "./components/CareMeters";
import { PetDesignControls, type PetDesign } from "./components/PetDesignControls";
import { PetStageDisplay } from "./components/PetStageDisplay";
import { PetStatsPanel } from "./components/PetStatsPanel";
import { DemoWalkthrough } from "./components/DemoWalkthrough";
import { hatchPet, updatePetEquipment } from "./api/pushpetApi";
import { useCommunityPet } from "./hooks/useCommunityPet";
import { useIndividualPushpets } from "./hooks/useIndividualPushpets";
import { usePet } from "./hooks/usePet";
import { useSessionLeaderboard } from "./hooks/useSessionLeaderboard";
import { accessoriesFromEquipment } from "./assets/pets/petManifest";
import type { EquippedAccessories, PetAccessory, PetAccessorySlot, PetColor, PetSpecies } from "./components/pets/petTypes";
import type { IndividualPet } from "./types/pushpet";

const speciesOptions: Array<{ value: PetSpecies; label: string }> = [
  { value: "goat_dragon", label: "Goat-Dragon" },
  { value: "raccoon", label: "Raccoon" },
  { value: "star_axolotl", label: "Star Axolotl" }
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

const COMMUNITY_DESIGN_KEY = "pushpet.communityDesign.v2";

function readCommunityDesign(): CommunityDesign {
  try {
    const stored = window.localStorage.getItem(COMMUNITY_DESIGN_KEY);
    if (!stored) return { species: "star_axolotl", color: "purple", hatched: false };
    const parsed = JSON.parse(stored) as Partial<CommunityDesign>;
    const species: PetSpecies = speciesOptions.some((option) => option.value === parsed.species) ? (parsed.species as PetSpecies) : "star_axolotl";
    const color: PetColor = colorOptions.some((option) => option.value === parsed.color) ? (parsed.color as PetColor) : "purple";
    return {
      species,
      color,
      hatched: Boolean(parsed.hatched)
    };
  } catch {
    return { species: "star_axolotl", color: "purple", hatched: false };
  }
}

function App() {
  if (window.location.pathname === "/demo") {
    return <DemoWalkthrough />;
  }

  return <PushpetApp />;
}

function PushpetApp() {
  const [username, setUsername] = useState("");
  const [activeView, setActiveView] = useState<"community" | "individual">("community");
  const [loadingUsername, setLoadingUsername] = useState<string | null>(null);
  const [hatchDesign, setHatchDesign] = useState<PetDesign>({ species: "goat_dragon", color: "blue" });
  const [activePetDesign, setActivePetDesign] = useState<PetDesign | null>(null);
  const [equippedAccessories, setEquippedAccessories] = useState<EquippedAccessories>({});
  const [communityDesign, setCommunityDesign] = useState<CommunityDesign>(() => readCommunityDesign());
  const { status, pet, error, lookup, isDormant, isDegraded } = usePet();
  const community = useCommunityPet();
  const sessionLeaderboard = useSessionLeaderboard();
  const individualPushpets = useIndividualPushpets();

  useEffect(() => {
    window.localStorage.setItem(COMMUNITY_DESIGN_KEY, JSON.stringify(communityDesign));
  }, [communityDesign]);

  const activeUsername = pet?.username ?? null;
  const localLeader = sessionLeaderboard.entries[0] ?? null;
  const canCustomize = Boolean(
    activeUsername && localLeader && localLeader.username.toLowerCase() === activeUsername.toLowerCase() && community.communityPet
  );

  async function runLookup(nextUsername: string) {
    const cleanUsername = nextUsername.trim();
    if (!cleanUsername) return;

    setLoadingUsername(cleanUsername);
    const response = await lookup(cleanUsername);
    setLoadingUsername(null);

    if (response) {
      community.applyCommunityPet(response.community_pet);
      sessionLeaderboard.applyServerLeaderboard(response.leaderboard);
      const existingPushpet = response.pushpet ? individualPushpets.upsert(response.pushpet) : individualPushpets.findRecord(response.pet.username);
      if (existingPushpet) {
        const existingDesign = { species: existingPushpet.species, color: existingPushpet.color };
        setActivePetDesign(existingDesign);
        setEquippedAccessories(existingPushpet.equipped);
      } else {
        setActivePetDesign(null);
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
    if (!pet) return;
    const response = await hatchPet(pet.username, hatchDesign);
    community.applyCommunityPet(response.community_pet);
    sessionLeaderboard.applyServerLeaderboard(response.leaderboard);
    const record = individualPushpets.upsert(response.pushpet!);
    const design = { species: record.species, color: record.color };
    setActivePetDesign(design);
    setEquippedAccessories(record.equipped);
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
    const response = await updatePetEquipment(pet.username, { slot, accessory });
    const record = individualPushpets.upsert(response.pushpet);
    setEquippedAccessories(record.equipped);
    sessionLeaderboard.applyServerLeaderboard(response.leaderboard);
  }

  return (
    <main className="app-shell">
      <header className="top-marquee">
        <img src="/assets/brand/pushpet-logo.png" alt="Pushpet" className="brand-logo" />
        <nav className="app-nav" aria-label="Pushpet views">
          <button className={activeView === "community" ? "is-active" : ""} type="button" onClick={() => setActiveView("community")}>
            Community Pushpet
          </button>
          <button className={activeView === "individual" ? "is-active" : ""} type="button" onClick={() => setActiveView("individual")}>
            Individual Pushpet
          </button>
          <a className="how-it-works-link" href="/demo" aria-label="Open the Pushpet walkthrough">
            <BadgeInfo size={18} />
            How it works
          </a>
        </nav>
      </header>

      <div className={`locked-stage active-${activeView}`}>
        <section className="community-stage">
          <CommunityPetCard
            communityPet={community.communityPet}
            status={community.status}
            error={community.error}
            activeUsername={activeUsername}
            canCustomize={canCustomize}
            onCustomize={community.customize}
            design={communityDesign}
            speciesOptions={speciesOptions}
            colorOptions={colorOptions}
            onDesignChange={(nextDesign) => setCommunityDesign((current) => ({ ...current, ...nextDesign }))}
            onHatch={() => setCommunityDesign((current) => ({ ...current, hatched: true }))}
          />
        </section>

        <aside className="side-console">
          {activeView === "individual" ? (
            <>
              <section className="toy-panel hatch-panel">
                <div className="panel-heading">
                  <div>
                    <span className="eyebrow">Individual</span>
                <h2>Get individual Pushpet</h2>
              </div>
              <ToyBrick size={24} />
            </div>
                <form className="lookup-form" onSubmit={handleLookup}>
                  <label htmlFor="github-username">GitHub username</label>
                  <div className="lookup-row">
                    <Github aria-hidden="true" size={20} />
                    <input
                      id="github-username"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      placeholder="octocat"
                      autoComplete="off"
                      spellCheck={false}
                    />
                    <button type="submit" disabled={status === "loading" || !username.trim()} aria-label="Get individual Pushpet">
                      {status === "loading" ? <Loader2 className="spin" size={20} /> : <ArrowRight size={20} />}
                    </button>
                  </div>
                </form>
              </section>
              <IndividualResult
                status={status}
                pet={pet}
                error={error}
                isDormant={isDormant}
                isDegraded={isDegraded}
                design={activePetDesign ?? hatchDesign}
                hatchDesign={hatchDesign}
                hasHatched={Boolean(pet && individualPushpets.findRecord(pet.username))}
                equippedAccessories={equippedAccessories}
                onHatchDesignChange={setHatchDesign}
                onHatch={handleHatchIndividualPet}
                onToggleAccessory={handleToggleAccessory}
              />
            </>
          ) : (
            <LeaderboardPanel
              entries={sessionLeaderboard.entries}
              onSelect={(entry) => {
                setActiveView("individual");
                void runLookup(entry.username);
              }}
              loadingUsername={loadingUsername}
            />
          )}
          {activeView === "individual" && (
            <LeaderboardPanel
              entries={sessionLeaderboard.entries}
              onSelect={(entry) => {
                void runLookup(entry.username);
              }}
              loadingUsername={loadingUsername}
            />
          )}
        </aside>
      </div>
    </main>
  );
}

type IndividualResultProps = {
  status: ReturnType<typeof usePet>["status"];
  pet: IndividualPet | null;
  error: string | null;
  isDormant: boolean;
  isDegraded: boolean;
  design: PetDesign;
  hatchDesign: PetDesign;
  hasHatched: boolean;
  equippedAccessories: EquippedAccessories;
  onHatchDesignChange: (design: PetDesign) => void;
  onHatch: () => void;
  onToggleAccessory: (slot: PetAccessorySlot, accessory: PetAccessory | "none") => void;
};

function IndividualResult({
  status,
  pet,
  error,
  isDormant,
  isDegraded,
  design,
  hatchDesign,
  hasHatched,
  equippedAccessories,
  onHatchDesignChange,
  onHatch,
  onToggleAccessory
}: IndividualResultProps) {
  if (status === "idle") {
    return (
      <section className="toy-panel individual-card empty-state">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Individual Pushpet</span>
            <h2>Get a Pushpet</h2>
          </div>
          <Sparkles size={24} />
        </div>
        <PetStageDisplay score={0} mood="curious" evolutionStage="egg" species="goat_dragon" color="blue" />
        <p className="quiet-copy">Enter a GitHub username above.</p>
      </section>
    );
  }

  if (status === "loading") {
    return (
      <section className="toy-panel individual-card empty-state">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Individual Pushpet</span>
            <h2>Getting pet...</h2>
          </div>
          <Loader2 className="spin" size={24} />
        </div>
        <PetStageDisplay score={0} mood="loading" evolutionStage="egg" species={design.species} color={design.color} />
        <p className="quiet-copy">Checking for an existing Pushpet.</p>
      </section>
    );
  }

  if (status === "not_found") {
    return (
      <section className="toy-panel individual-card empty-state">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">No hatch</span>
            <h2>Username not found</h2>
          </div>
          <AlertTriangle size={24} />
        </div>
        <PetStageDisplay score={0} mood="lost" evolutionStage="egg" dormancyState="sad" species={design.species} color={design.color} />
        <p className="quiet-copy">{error ?? "That GitHub username did not hatch. Try another spelling."}</p>
      </section>
    );
  }

  if (!pet) {
    return (
      <section className="toy-panel individual-card empty-state">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Retry hatch</span>
            <h2>Signal got fuzzy</h2>
          </div>
          <RotateCw size={24} />
        </div>
        <PetStageDisplay score={0} mood="retry" evolutionStage="egg" species={design.species} color={design.color} />
        <p className="quiet-copy">{error ?? "PushPet could not hatch that lookup yet."}</p>
      </section>
    );
  }

  if (!hasHatched) {
    return (
      <section className="toy-panel individual-card empty-state">
        <div className="pet-nameplate">
          <img src={pet.avatar_url} alt="" className="avatar" />
          <div>
            <span className="eyebrow">New Pushpet</span>
            <h2>@{pet.username}</h2>
          </div>
          {isDegraded && <span className="degraded-sticker">cached</span>}
        </div>
        <PetStageDisplay score={0} mood="curious" evolutionStage="egg" species={hatchDesign.species} color={hatchDesign.color} />
        <CareMeters hunger={pet.hunger} happiness={pet.happiness} score={0} evolutionStage="egg" />
        <div className="community-hatch-box individual-hatch-box">
          <PetDesignControls
            title="Choose shell"
            design={hatchDesign}
            speciesOptions={speciesOptions}
            colorOptions={colorOptions}
            onChange={onHatchDesignChange}
          />
          <button className="hatch-community-button" type="button" onClick={onHatch}>
            Hatch @{pet.username}
          </button>
        </div>
        <ActivitySummary pet={pet} />
      </section>
    );
  }

  return (
    <section className={`toy-panel individual-card ${isDormant ? "is-dormant" : "is-active"}`}>
      <div className="pet-nameplate">
        <img src={pet.avatar_url} alt="" className="avatar" />
        <div>
          <span className="eyebrow">{isDormant ? "Dormant find" : "Active find"}</span>
          <h2>@{pet.username}</h2>
        </div>
        {isDegraded && <span className="degraded-sticker">cached</span>}
      </div>
      <PetStageDisplay
        score={pet.pet_score}
        mood={pet.mood}
        evolutionStage={pet.evolution_stage}
        dormancyState={pet.dormancy_state}
        accessories={accessoriesFromEquipment(equippedAccessories)}
        seed={pet.username}
        species={design.species}
        color={design.color}
      />
      <ActivitySummary pet={pet} />
      <CareMeters hunger={pet.hunger} happiness={pet.happiness} score={pet.pet_score} evolutionStage={pet.evolution_stage} />
      <PetStatsPanel pet={pet} mode="individual" />
      <OutfitUnlocks outfits={pet.outfit_unlocks} equipped={equippedAccessories} onToggleAccessory={onToggleAccessory} />
      <FeedLog title="Hatch feed" items={pet.feed_log} />
    </section>
  );
}

export default App;
