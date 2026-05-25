import { Radio } from "lucide-react";
import type { FeedItem } from "../types/pushpet";

type FeedLogProps = {
  title: string;
  items: FeedItem[];
};

export function FeedLog({ title, items }: FeedLogProps) {
  const visibleItems = items.slice(0, 8);

  return (
    <section className="feed-log">
      <div className="section-title">
        <Radio size={17} />
        <h3>{title}</h3>
      </div>
      {visibleItems.length === 0 ? (
        <p className="quiet-copy">The log is waiting for its first little beep.</p>
      ) : (
        <div className="feed-stack">
          {visibleItems.map((item, index) => (
            <article className="feed-item" key={`${item.type}-${item.timestamp ?? "untimed"}-${index}`}>
              <span>{item.type.replace(/_/g, " ")}</span>
              <p>{item.label}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
