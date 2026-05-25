import { useEffect } from "react";
import {
  BadgeInfo,
  Cat,
  Github,
  HeartHandshake,
  Palette,
  Sparkles,
  Star,
  Users
} from "lucide-react";
import { PetRenderer } from "./pets/PetRenderer";

const quickFlow = [
  {
    title: "Start with a community pet",
    copy: "A group gets one shared PushPet that everyone can help grow.",
    icon: HeartHandshake
  },
  {
    title: "Look up GitHub builders",
    copy: "Enter a public GitHub username to hatch or load that person's individual pet.",
    icon: Github
  },
  {
    title: "Activity becomes care",
    copy: "Recent public coding activity affects mood, level, feed updates, and leaderboard position.",
    icon: Sparkles
  }
];

const featureCards = [
  {
    title: "Individual pets",
    icon: Cat,
    copy: "Each GitHub username can have its own pet, name, look, room, and saved state."
  },
  {
    title: "Community pet",
    icon: Users,
    copy: "The shared pet grows from the activity people bring into the community."
  },
  {
    title: "Top caretaker",
    icon: Palette,
    copy: "The leaderboard leader can customize the community pet while they hold the top spot."
  }
];

export function DemoWalkthrough({
  onOpenCommunity,
  onOpenIndividual
}: {
  onOpenCommunity: () => void;
  onOpenIndividual: () => void;
}) {
  useEffect(() => {
    document.body.classList.add("pushpet-how-it-works-page");
    return () => document.body.classList.remove("pushpet-how-it-works-page");
  }, []);

  return (
    <main className="app-shell demo-shell how-it-works-shell">
      <div className="demo-pet-preloads" aria-hidden="true">
        <img src="/assets/pets/goat_dragon-base.png" alt="" />
        <img src="/assets/pets/goat_dragon-accessories.png?v=placement-20260525" alt="" />
        <img src="/assets/pets/raccoon-base.png" alt="" />
        <img src="/assets/pets/raccoon-accessories.png?v=placement-20260525" alt="" />
        <img src="/assets/pets/star_axolotl-base.png" alt="" />
        <img src="/assets/pets/star_axolotl-accessories.png?v=placement-20260525" alt="" />
      </div>
      <header className="top-marquee demo-header">
        <button className="brand-home-button" type="button" onClick={onOpenCommunity} aria-label="Go to Pushpet home">
          <span className="brand-star-tile" aria-hidden="true">
            <Star size={42} />
          </span>
          <span className="brand-wordmark" aria-hidden="true">
            <span className="brand-wordmark-push">Push</span>
            <span className="brand-wordmark-pet">pet</span>
          </span>
        </button>
        <nav className="app-nav" aria-label="How it works navigation">
          <button type="button" onClick={onOpenCommunity}>
            <Users size={22} />
            Community Pushpet
          </button>
          <button type="button" onClick={onOpenIndividual}>
            <Cat size={22} />
            Individual Pushpet
          </button>
          <button className="is-active how-it-works-link" type="button" aria-current="page">
            <BadgeInfo size={22} />
            How it works
          </button>
        </nav>
      </header>

      <div className="locked-stage demo-stage">
        <section className="toy-panel demo-content-panel">
          <section className="demo-hero">
            <div className="demo-copy">
              <span className="eyebrow">How it works</span>
              <h1>Push code. Feed pets.</h1>
              <p>
                PushPet turns public GitHub activity into a pet your community can share.
              </p>
            </div>
            <div className="demo-pets" aria-hidden="true">
              <PetRenderer species="goat_dragon" stage="baby" mood="happy" color="purple" size={96} decorative />
              <PetRenderer species="raccoon" stage="adolescent" mood="hyped" color="pink" size={96} decorative />
              <PetRenderer species="star_axolotl" stage="adult" mood="happy" color="blue" size={96} decorative />
            </div>
          </section>

          <section className="demo-steps" aria-label="Pushpet app flow">
            {quickFlow.map(({ title, copy, icon: Icon }, index) => (
              <article className="demo-step" key={title}>
                <span className="rank-token">{index + 1}</span>
                <Icon size={24} />
                <h2>{title}</h2>
                <p>{copy}</p>
              </article>
            ))}
          </section>

          <section className="demo-feature-grid concise-feature-grid" aria-label="Pushpet basics">
            {featureCards.map(({ title, copy, icon: Icon }) => (
              <article className="demo-system-card" key={title}>
                <Icon size={24} />
                <h2>{title}</h2>
                <p>{copy}</p>
              </article>
            ))}
          </section>

          <section className="demo-scoreboard concise-scoreboard">
            <BadgeInfo size={28} />
            <div>
              <h2>What PushPet uses</h2>
              <p>
                Public GitHub activity only. No GitHub login, no private repository data, and no manual feeding button.
              </p>
            </div>
          </section>
        </section>
      </div>

    </main>
  );
}
