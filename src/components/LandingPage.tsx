import { useEffect } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Code2,
  Github,
  Sparkles,
  Star,
  Trophy,
  Users,
  Zap
} from "lucide-react";
import { PetRenderer } from "./pets/PetRenderer";

type LandingPageProps = {
  onEnterApp: () => void;
  onOpenDemo: () => void;
};

const signalCards = [
  {
    title: "A pet for the whole room",
    copy: "Give a developer community one shared PushPet that everyone can help grow.",
    icon: Users
  },
  {
    title: "Fueled by public GitHub signals",
    copy: "Pushes, pull request activity, active days, language signals, and hatches become care moments.",
    icon: Github
  },
  {
    title: "Vibe coded, leaderboard ready",
    copy: "The top caretaker can shape the community pet while individual pets keep their own style.",
    icon: Trophy
  }
];

const adoptionRows = [
  ["01", "Pick a community", "A coding group, OSS club, hackathon team, creator server, or dev collective adopts one shared pet."],
  ["02", "Hatch the first pets", "Members look up public GitHub usernames and hatch individual PushPets without a login step."],
  ["03", "Keep it alive", "Recent public activity feeds the system, unlocks milestones, and moves the shared pet forward."]
];

export function LandingPage({ onEnterApp, onOpenDemo }: LandingPageProps) {
  useEffect(() => {
    document.body.classList.add("pushpet-landing-page");
    return () => document.body.classList.remove("pushpet-landing-page");
  }, []);

  return (
    <main className="landing-shell">
      <div className="pushpet-asset-preloads" aria-hidden="true">
        <img src="/assets/pets/goat_dragon-base.png" alt="" />
        <img src="/assets/pets/goat_dragon-accessories.png?v=placement-20260525" alt="" />
        <img src="/assets/pets/raccoon-base.png" alt="" />
        <img src="/assets/pets/raccoon-accessories.png?v=placement-20260525" alt="" />
        <img src="/assets/pets/star_axolotl-base.png" alt="" />
        <img src="/assets/pets/star_axolotl-accessories.png?v=placement-20260525" alt="" />
      </div>

      <header className="landing-topbar" aria-label="PushPet landing navigation">
        <button className="brand-home-button landing-brand" type="button" onClick={onEnterApp} aria-label="Open PushPet app">
          <span className="brand-star-tile" aria-hidden="true">
            <Star size={42} />
          </span>
          <span className="brand-wordmark" aria-hidden="true">
            <span className="brand-wordmark-push">Push</span>
            <span className="brand-wordmark-pet">pet</span>
          </span>
        </button>
        <div className="landing-nav-actions">
          <button type="button" onClick={onOpenDemo}>
            <Sparkles size={18} />
            How it works
          </button>
          <button className="landing-nav-primary" type="button" onClick={onEnterApp}>
            <ArrowRight size={18} />
            Open app
          </button>
        </div>
      </header>

      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-hero-copy">
          <span className="sticker-label">Community pet system</span>
          <h1 id="landing-title">PushPet</h1>
          <strong>A community pet for people who push code.</strong>
          <p>
            PushPet is a shared digital pet for communities that build in public, push to GitHub, and want one mascot everyone can follow.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-cta" type="button" onClick={onEnterApp}>
              <ArrowRight size={22} />
              Try PushPet
            </button>
          </div>
        </div>

        <div className="landing-browser" aria-label="PushPet community pet preview">
          <div className="landing-browser-bar">
            <span />
            <span />
            <span />
            <strong>COMMUNITY-PET.EXE</strong>
          </div>
          <div className="landing-browser-screen">
            <div className="landing-status-strip">
              <span>VIBE BUILDERS HQ</span>
              <span>TOP CARETAKER READY</span>
            </div>
            <div className="landing-pet-stage">
              <span className="landing-pet-shadow" />
              <PetRenderer species="star_axolotl" stage="adult" mood="hyped" color="purple" size={245} decorative />
              <div className="landing-companion-pets" aria-hidden="true">
                <PetRenderer species="goat_dragon" stage="baby" mood="happy" color="blue" size={112} decorative />
                <PetRenderer species="raccoon" stage="adolescent" mood="happy" color="pink" size={112} decorative />
              </div>
            </div>
            <div className="landing-terminal">
              <span>git push origin main</span>
              <span>care +8</span>
              <span>community mood: hyped</span>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-marquee" aria-label="PushPet audience">
        <span>Vibe coding clubs</span>
        <span>Open source rooms</span>
        <span>Hackathon teams</span>
        <span>Dev communities</span>
        <span>GitHub-powered mascots</span>
      </section>

      <section className="landing-info" aria-label="Why PushPet">
        <div className="landing-info-lead">
          <span className="eyebrow">Adopt the mascot</span>
          <h2>Built for communities that ship.</h2>
          <p>
            A community PushPet gives a group one shared creature to rally around while each member can hatch an individual pet from public GitHub activity.
          </p>
        </div>
        <div className="landing-card-grid">
          {signalCards.map(({ title, copy, icon: Icon }) => (
            <article className="landing-signal-card" key={title}>
              <Icon size={28} />
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
        <div className="landing-adoption-window">
          <div className="landing-window-title">
            <BadgeCheck size={22} />
            <span>Adoption loop</span>
          </div>
          <div className="landing-adoption-rows">
            {adoptionRows.map(([number, title, copy]) => (
              <article className="landing-adoption-row" key={number}>
                <strong>{number}</strong>
                <div>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
        <div className="landing-footer-cta">
          <div>
            <Code2 size={28} />
            <span>Built for people who ship, learn, remix, and push.</span>
          </div>
          <button type="button" onClick={onEnterApp}>
            <Zap size={21} />
            Enter PushPet
          </button>
        </div>
      </section>
    </main>
  );
}
