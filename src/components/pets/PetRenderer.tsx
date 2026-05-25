import {
  ACCESSORY_TO_SLOT,
  PET_SPRITE_MANIFEST,
  accessoryFromUnlock,
  isAccessoryVisible,
  normalizeAccessory,
  normalizeColor,
  normalizeMood,
  normalizeSpecies,
  normalizeStage,
  petSpeciesLabel
} from "../../assets/pets/petManifest";
import type { PetAccessory, PetColor, PetMood, PetSpecies, PetStage } from "./petTypes";

type PetRendererProps = {
  species?: PetSpecies | string | null;
  stage?: PetStage | string | null;
  mood?: PetMood | string | null;
  color?: PetColor | string | null;
  accessory?: PetAccessory | string | null;
  accessories?: Array<PetAccessory | string | null>;
  size?: number;
  className?: string;
  "aria-label"?: string;
  decorative?: boolean;
};

export function PetRenderer({
  species,
  stage,
  mood,
  color,
  accessory,
  accessories,
  size = 220,
  className,
  "aria-label": ariaLabel,
  decorative = false
}: PetRendererProps) {
  const normalizedSpecies = normalizeSpecies(species);
  const normalizedStage = normalizeStage(stage);
  const normalizedMood = normalizedStage === "egg" ? "idle" : normalizeMood(mood);
  const normalizedColor = normalizeColor(color);
  const mappedAccessory = accessoryFromUnlock(accessory);
  const normalizedAccessory =
    normalizedStage === "egg" ? "none" : mappedAccessory === "none" ? normalizeAccessory(accessory) : mappedAccessory;
  const requestedAccessories = accessories?.length
    ? accessories.map((item) => {
        const mapped = accessoryFromUnlock(item);
        return mapped === "none" ? normalizeAccessory(item) : mapped;
      })
    : [normalizedAccessory];
  const visibleAccessories = Array.from(new Set(requestedAccessories)).filter((item) => isAccessoryVisible(normalizedStage, item));
  const manifest = PET_SPRITE_MANIFEST;
  const stageIndex = manifest.stages.indexOf(normalizedStage);
  const moodIndex = manifest.moods.indexOf(normalizedMood);
  const colorIndex = manifest.colors.indexOf(normalizedColor);
  const label = ariaLabel ?? `${petSpeciesLabel(normalizedSpecies)} ${normalizedStage} Pushpet, ${normalizedMood} mood`;

  const baseStyle = spriteStyle({
    x: stageIndex,
    y: colorIndex * manifest.moods.length + moodIndex,
    image: manifest.species[normalizedSpecies].base,
    rows: manifest.rows,
    size
  });

  const accessoryStyles = visibleAccessories.map((visibleAccessory) => {
    const accessoryIndex = manifest.accessories.indexOf(visibleAccessory);
    return {
      accessory: visibleAccessory,
      style: spriteStyle({
        x: stageIndex,
        y: (accessoryIndex - 1) * manifest.moods.length + moodIndex,
        image: manifest.species[normalizedSpecies].accessories,
        rows: (manifest.accessories.length - 1) * manifest.moods.length,
        size
      })
    };
  });
  const backAccessoryStyles = accessoryStyles.filter(({ accessory: visibleAccessory }) => isBackAccessory(visibleAccessory));
  const foregroundAccessoryStyles = accessoryStyles.filter(({ accessory: visibleAccessory }) => !isBackAccessory(visibleAccessory));

  return (
    <span
      className={`pet-renderer pet-renderer-${normalizedSpecies} pet-renderer-${normalizedStage} pet-mood-${normalizedMood} ${className ?? ""}`}
      style={{ width: size, height: size }}
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
    >
      <span className="pet-motion-layer">
        {backAccessoryStyles.map(({ accessory: visibleAccessory, style }) => (
          <span className={`pet-sprite-layer pet-sprite-accessory pet-accessory-${visibleAccessory}`} key={visibleAccessory} style={style} />
        ))}
        <span className="pet-sprite-layer pet-sprite-base" style={baseStyle} />
        {foregroundAccessoryStyles.map(({ accessory: visibleAccessory, style }) => (
          <span className={`pet-sprite-layer pet-sprite-accessory pet-accessory-${visibleAccessory}`} key={visibleAccessory} style={style} />
        ))}
      </span>
    </span>
  );
}

function isBackAccessory(accessory: PetAccessory) {
  return accessory !== "none" && ACCESSORY_TO_SLOT[accessory] === "back";
}

function spriteStyle({ x, y, image, rows, size }: { x: number; y: number; image: string; rows: number; size: number }) {
  return {
    backgroundImage: `url(${image})`,
    backgroundPosition: `-${x * size}px -${y * size}px`,
    backgroundSize: `${PET_SPRITE_MANIFEST.columns * size}px ${rows * size}px`
  };
}
