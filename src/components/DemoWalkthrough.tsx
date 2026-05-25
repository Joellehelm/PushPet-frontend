import { ArrowLeft, Crown, Github, HeartHandshake, Sparkles, Trophy } from "lucide-react";
import { PetRenderer } from "./pets/PetRenderer";

const steps = [
  {
    title: "Start with Community Pushpet",
    copy: "Pick the shared species and color, then hatch the world pet. Successful username lookups feed this shared pet.",
    icon: HeartHandshake
  },
  {
    title: "Get an individual Pushpet",
    copy: "Open Individual Pushpet, enter a public GitHub username, and Pushpet checks whether that username already has a local pet.",
    icon: Github
  },
  {
    title: "Hatch only when needed",
    copy: "If that username has no local Pushpet yet, choose a shell and hatch it. If it already exists, the app shows the pet instead.",
    icon: Sparkles
  },
  {
    title: "Become Top Caretaker",
    copy: "The top local leaderboard score becomes Top Caretaker and can update the shared pet name and accessory.",
    icon: Crown
  }
];

export function DemoWalkthrough() {
  return (
    <main className="demo-shell">
      <header className="demo-header">
        <img src="/assets/brand/pushpet-logo.png" alt="Pushpet" className="brand-logo" />
        <a href="/" className="demo-back-link">
          <ArrowLeft size={18} />
          Back to app
        </a>
      </header>

      <section className="demo-hero toy-panel">
        <div className="demo-copy">
          <span className="eyebrow">Demo walkthrough</span>
          <h1>Hatch, feed, customize.</h1>
          <p>
            Pushpet turns recent public GitHub activity into collectible virtual pets. No login is needed for the demo.
          </p>
        </div>
        <div className="demo-pets" aria-hidden="true">
          <PetRenderer species="goat_dragon" stage="baby" mood="happy" color="purple" accessory="ruby_crown" size={132} decorative />
          <PetRenderer species="raccoon" stage="adolescent" mood="hyped" color="pink" accessory="javascript_shades" size={132} decorative />
          <PetRenderer species="star_axolotl" stage="adult" mood="happy" color="blue" accessory="typescript_visor" size={132} decorative />
        </div>
      </section>

      <section className="demo-steps" aria-label="How Pushpet works">
        {steps.map(({ title, copy, icon: Icon }, index) => (
          <article className="demo-step toy-panel" key={title}>
            <span className="rank-token">{index + 1}</span>
            <Icon size={24} />
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>

      <section className="demo-scoreboard toy-panel">
        <Trophy size={26} />
        <div>
          <h2>Judge flow</h2>
          <p>Try `octocat`, then another public username. Hatch one individual pet, check the leaderboard, then return to Community Pushpet.</p>
        </div>
      </section>
    </main>
  );
}
