import { useEffect } from "react";
import {
  BadgeInfo,
  Cat,
  Crown,
  Database,
  Github,
  HeartHandshake,
  Home,
  LockKeyhole,
  Medal,
  Palette,
  Sparkles,
  Star,
  Trophy,
  Users,
  Utensils
} from "lucide-react";
import { PetRenderer } from "./pets/PetRenderer";

const quickFlow = [
  {
    title: "Community first",
    copy: "Choose the shared species and color, then hatch the Community Pushpet. This shared pet is its own creature.",
    icon: HeartHandshake
  },
  {
    title: "Find a builder",
    copy: "Open Individual Pushpet, enter a public GitHub username, and the Rails API fetches public GitHub data server-side.",
    icon: Github
  },
  {
    title: "Hatch once",
    copy: "If that username already has a Pushpet in the backend, the existing species, color, and equipment load instead of hatching a duplicate.",
    icon: Sparkles
  },
  {
    title: "Compete kindly",
    copy: "The highest backend leaderboard score becomes Top Caretaker and can customize the shared pet's name and outfit.",
    icon: Crown
  }
];

const scoreRows = [
  ["Pushes", "pushes in 7 days x 8, plus older 30-day pushes x 3"],
  ["Pull requests", "merged PRs x 4, plus opened/closed/reopened PR signals x 1"],
  ["Consistency", "active days in 14 days x 2, plus streak days up to 14 x 2"],
  ["Repos", "active repositories in 30 days x 2"],
  ["Care points", "sum of those signals, capped at 100"],
  ["Level", "1 + floor(care points / 15)"]
];

const dormancyRows = [
  ["0-24h", "thriving"],
  ["25-72h", "okay"],
  ["73-168h", "peckish"],
  ["169-336h", "sad"],
  ["337h+", "ghost"]
];

const unlockRows = [
  ["Ruby", "Ruby crown"],
  ["JavaScript", "JavaScript shades"],
  ["TypeScript", "TypeScript visor"],
  ["Python", "Python wizard hat"],
  ["Go", "Go jetpack"],
  ["Rust", "Rust armor accent"],
  ["Top Caretaker", "Caretaker crown"]
];

const featureCards = [
  {
    title: "Feeding",
    icon: Utensils,
    copy:
      "There is no manual food button yet. Feeding happens when a successful username lookup finds recent public GitHub activity. Pushes, PRs, active days, streaks, and active repos raise care points, which lowers hunger and raises happiness."
  },
  {
    title: "Growing",
    icon: Medal,
    copy:
      "Evolution is score-based. Individual pets move from hatchling to sprout, scout, ranger, and guardian as care points rise. Community Pushpet uses its own combined community score and is never just a copy of the top user."
  },
  {
    title: "Outfits",
    icon: Palette,
    copy:
      "Languages unlock accessories. Equipment is slot-based in the backend, so head, face, chest, legs, and back items can persist with a hatched individual Pushpet instead of living only in browser storage."
  },
  {
    title: "Persistence",
    icon: Database,
    copy:
      "The backend now uses Postgres/Neon tables for hatched individual Pushpets, equipped accessories, leaderboard entries, and community state. Browser state is only a convenience layer."
  },
  {
    title: "No login",
    icon: LockKeyhole,
    copy:
      "The demo intentionally requires no login. It only reads public GitHub data. Private repo activity is not shown, and caretaker power is demo-oriented rather than verified account ownership."
  },
  {
    title: "History",
    icon: BadgeInfo,
    copy:
      "The feed turns computed activity into readable moments: hatches, pushes feeding the pet, level changes, outfit unlocks, mood changes, dormancy, and community boosts."
  }
];

export function DemoWalkthrough({ onBack }: { onBack: () => void }) {
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
        <button className="brand-home-button" type="button" onClick={onBack} aria-label="Go to Pushpet home">
          <span className="brand-star-tile" aria-hidden="true">
            <Star size={42} />
          </span>
          <span className="brand-wordmark" aria-hidden="true">
            <span className="brand-wordmark-push">Push</span>
            <span className="brand-wordmark-pet">pet</span>
          </span>
        </button>
        <nav className="app-nav" aria-label="How it works navigation">
          <button type="button" onClick={onBack}>
            <Users size={22} />
            Community Pushpet
          </button>
          <button type="button" onClick={onBack}>
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
              <h1>Care powered by code.</h1>
              <p>
                Pushpet is a GitHub-powered virtual pet app. Paste a public username, hatch an individual pet, and help one shared Community Pushpet grow.
              </p>
            </div>
            <div className="demo-pets" aria-hidden="true">
              <PetRenderer species="goat_dragon" stage="baby" mood="happy" color="purple" accessory="none" size={96} decorative />
              <PetRenderer species="raccoon" stage="adolescent" mood="hyped" color="pink" accessory="none" size={96} decorative />
              <PetRenderer species="star_axolotl" stage="adult" mood="happy" color="blue" accessory="none" size={96} decorative />
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

          <section className="demo-feature-grid" aria-label="Pushpet systems">
            {featureCards.map(({ title, copy, icon: Icon }) => (
              <article className="demo-system-card" key={title}>
                <Icon size={24} />
                <h2>{title}</h2>
                <p>{copy}</p>
              </article>
            ))}
          </section>

          <section className="demo-deep-grid">
            <article className="demo-table-card">
              <span className="eyebrow">Care math</span>
              <h2>How points are gained</h2>
              <div className="demo-table">
                {scoreRows.map(([label, value]) => (
                  <div className="demo-table-row" key={label}>
                    <strong>{label}</strong>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="demo-table-card">
              <span className="eyebrow">Energy</span>
              <h2>How pets stay alive</h2>
              <p>
                Pets do not die. If public activity goes quiet, dormancy changes the mood and raises hunger. Looking up fresh public activity can improve the next computed state.
              </p>
              <div className="demo-table compact-table">
                {dormancyRows.map(([hours, state]) => (
                  <div className="demo-table-row" key={hours}>
                    <strong>{hours}</strong>
                    <span>{state}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="demo-table-card">
              <span className="eyebrow">Closet</span>
              <h2>How accessories unlock</h2>
              <div className="demo-table compact-table">
                {unlockRows.map(([language, accessory]) => (
                  <div className="demo-table-row" key={language}>
                    <strong>{language}</strong>
                    <span>{accessory}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="demo-table-card">
              <span className="eyebrow">Community</span>
              <h2>How the shared pet grows</h2>
              <p>
                Each successful individual lookup contributes normalized activity to the shared pet. Duplicate username searches are protected for 10 minutes so one person cannot spam the score.
              </p>
              <p>
                Community score combines recent pushes, active users, language variety, and whether anyone shipped in the last 24 hours. Invalid usernames do not affect it.
              </p>
            </article>
          </section>

          <section className="demo-scoreboard">
            <Trophy size={28} />
            <div>
              <h2>Fast judge path</h2>
              <p>
                Try `octocat`, hatch an individual pet, search another public username, check the leaderboard, then return to Community Pushpet and customize if you are Top Caretaker.
              </p>
            </div>
          </section>
        </section>
      </div>

      <nav className="bottom-dock demo-dock" aria-label="How it works action rail">
        <button type="button" onClick={onBack}>
          <Home size={24} />
          Home
        </button>
        <button type="button" onClick={onBack}>
          <Users size={24} />
          Community
        </button>
        <button type="button" onClick={onBack}>
          <Cat size={24} />
          Individual
        </button>
        <button className="is-active" type="button" aria-current="page">
          <BadgeInfo size={24} />
          How it works
        </button>
      </nav>
    </main>
  );
}
