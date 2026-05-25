import type {
  PetAccessory,
  PetAnchorName,
  PetColor,
  PetAccessorySlot,
  EquippedAccessories,
  PetMood,
  PetPalette,
  PetSpecies,
  PetSpeciesManifest,
  PetStage
} from "../../components/pets/petTypes";

export const PET_COLORS: Record<PetColor, PetPalette> = {
  blue: {
    base: "#6fd7ff",
    light: "#c9f5ff",
    dark: "#238ac2",
    accent: "#ff73b7",
    accentDark: "#d9438b",
    cheek: "#ff9acb",
    wing: "#b9e9ff",
    outline: "#241633",
    white: "#fffdf8",
    shadow: "rgba(36, 22, 51, 0.2)",
    sick: "#b9e5cf"
  },
  pink: {
    base: "#ff8fc7",
    light: "#ffd8ec",
    dark: "#d84d96",
    accent: "#ffe156",
    accentDark: "#e3a70e",
    cheek: "#ffbad8",
    wing: "#ffe6f4",
    outline: "#241633",
    white: "#fffdf8",
    shadow: "rgba(36, 22, 51, 0.2)",
    sick: "#c9e4c9"
  },
  green: {
    base: "#7ee36f",
    light: "#d7ffd1",
    dark: "#379940",
    accent: "#28a8ff",
    accentDark: "#1669b2",
    cheek: "#ffd0dc",
    wing: "#c6f9d0",
    outline: "#241633",
    white: "#fffdf8",
    shadow: "rgba(36, 22, 51, 0.2)",
    sick: "#bddfbc"
  },
  purple: {
    base: "#ad8cff",
    light: "#eadfff",
    dark: "#6647c8",
    accent: "#4de5b1",
    accentDark: "#219879",
    cheek: "#ffa8cf",
    wing: "#e5d9ff",
    outline: "#241633",
    white: "#fffdf8",
    shadow: "rgba(36, 22, 51, 0.2)",
    sick: "#c9d8cf"
  },
  orange: {
    base: "#ffad4f",
    light: "#ffe2b8",
    dark: "#cb6427",
    accent: "#8758ff",
    accentDark: "#5d35c8",
    cheek: "#ffb3c9",
    wing: "#ffe2cc",
    outline: "#241633",
    white: "#fffdf8",
    shadow: "rgba(36, 22, 51, 0.2)",
    sick: "#d4d7ba"
  },
  white: {
    base: "#fff7df",
    light: "#ffffff",
    dark: "#c9bfa3",
    accent: "#ff5fa8",
    accentDark: "#c73b78",
    cheek: "#ffb4d3",
    wing: "#ecf7ff",
    outline: "#241633",
    white: "#fffdf8",
    shadow: "rgba(36, 22, 51, 0.2)",
    sick: "#dce7d4"
  }
};

const allAccessories: PetAccessory[] = [
  "none",
  "ruby_crown",
  "javascript_shades",
  "typescript_visor",
  "python_wizard_hat",
  "rust_armor_accent",
  "go_jetpack",
  "caretaker_crown"
];

export const PET_MANIFEST: Record<PetSpecies, PetSpeciesManifest> = {
  goat_dragon: {
    species: "goat_dragon",
    label: "Fuzzy Goat-Dragon",
    allowedAccessories: allAccessories,
    anchors: {
      egg: anchors(128, 92, 0.78, 128, 123, 0.7, 128, 150, 0.7, 86, 132, 0.75, 174, 154, 0.6, 128, 142, 0.85),
      baby: anchors(126, 72, 0.62, 126, 108, 0.7, 128, 131, 0.55, 84, 124, 0.56, 178, 154, 0.58, 126, 141, 0.72),
      adolescent: anchors(122, 58, 0.72, 122, 101, 0.78, 126, 128, 0.68, 78, 126, 0.68, 183, 163, 0.72, 126, 143, 0.88),
      adult: anchors(120, 45, 0.84, 120, 91, 0.88, 126, 122, 0.82, 73, 122, 0.8, 190, 166, 0.84, 127, 146, 1)
    }
  },
  raccoon: {
    species: "raccoon",
    label: "Raccoon-Style Creature",
    allowedAccessories: allAccessories,
    anchors: {
      egg: anchors(128, 92, 0.72, 128, 123, 0.72, 128, 150, 0.66, 80, 130, 0.62, 178, 148, 0.75, 128, 142, 0.82),
      baby: anchors(128, 67, 0.62, 128, 105, 0.72, 128, 130, 0.58, 82, 130, 0.58, 181, 147, 0.78, 128, 144, 0.78),
      adolescent: anchors(124, 54, 0.7, 124, 96, 0.78, 126, 125, 0.7, 80, 127, 0.66, 186, 145, 0.82, 127, 147, 0.9),
      adult: anchors(123, 43, 0.8, 123, 88, 0.88, 126, 119, 0.82, 82, 120, 0.78, 189, 141, 0.9, 128, 149, 1)
    }
  },
  star_axolotl: {
    species: "star_axolotl",
    label: "Pixel Star Axolotl",
    allowedAccessories: allAccessories,
    anchors: {
      egg: anchors(128, 95, 0.7, 128, 124, 0.7, 128, 151, 0.64, 83, 132, 0.6, 174, 157, 0.58, 128, 143, 0.82),
      baby: anchors(128, 73, 0.58, 128, 112, 0.68, 128, 134, 0.55, 82, 136, 0.52, 178, 151, 0.62, 128, 146, 0.72),
      adolescent: anchors(128, 60, 0.68, 128, 101, 0.78, 128, 130, 0.66, 80, 132, 0.64, 184, 151, 0.74, 128, 147, 0.86),
      adult: anchors(128, 49, 0.78, 128, 92, 0.86, 128, 123, 0.78, 78, 128, 0.75, 188, 151, 0.82, 128, 148, 1)
    }
  }
};

export const PET_SPRITE_MANIFEST = {
  cellSize: 256,
  columns: 4,
  rows: 42,
  stages: ["egg", "baby", "adolescent", "adult"] as PetStage[],
  moods: ["idle", "happy", "hungry", "sleepy", "hyped", "sad", "sick"] as PetMood[],
  colors: ["blue", "pink", "green", "purple", "orange", "white"] as PetColor[],
  accessories: [
    "none",
    "ruby_crown",
    "javascript_shades",
    "typescript_visor",
    "python_wizard_hat",
    "rust_armor_accent",
    "go_jetpack",
    "caretaker_crown"
  ] as PetAccessory[],
  species: {
    goat_dragon: {
      base: "/assets/pets/goat_dragon-base.png",
      accessories: "/assets/pets/goat_dragon-accessories.png"
    },
    raccoon: {
      base: "/assets/pets/raccoon-base.png",
      accessories: "/assets/pets/raccoon-accessories.png"
    },
    star_axolotl: {
      base: "/assets/pets/star_axolotl-base.png",
      accessories: "/assets/pets/star_axolotl-accessories.png"
    }
  } satisfies Record<PetSpecies, { base: string; accessories: string }>
};

export const ACCESSORY_ANCHORS: Record<PetAccessory, PetAnchorName> = {
  none: "head",
  ruby_crown: "head",
  javascript_shades: "face",
  typescript_visor: "face",
  python_wizard_hat: "head",
  rust_armor_accent: "body",
  go_jetpack: "back",
  caretaker_crown: "head"
};

export const OUTFIT_TO_ACCESSORY: Record<string, PetAccessory> = {
  none: "none",
  "ruby-collar": "ruby_crown",
  ruby_crown: "ruby_crown",
  "sunny-hoodie": "javascript_shades",
  javascript_shades: "javascript_shades",
  "typescript-visor": "typescript_visor",
  typescript_visor: "typescript_visor",
  "lab-goggles": "python_wizard_hat",
  python_wizard_hat: "python_wizard_hat",
  "forge-cape": "rust_armor_accent",
  rust_armor_accent: "rust_armor_accent",
  "runner-band": "go_jetpack",
  go_jetpack: "go_jetpack",
  caretaker_crown: "caretaker_crown"
};

export const LANGUAGE_TO_ACCESSORY: Record<string, PetAccessory> = {
  Ruby: "ruby_crown",
  JavaScript: "javascript_shades",
  TypeScript: "typescript_visor",
  Python: "python_wizard_hat",
  Rust: "rust_armor_accent",
  Go: "go_jetpack",
  "Top Caretaker": "caretaker_crown"
};

export const ACCESSORY_SLOT_LABELS: Record<PetAccessorySlot, string> = {
  head: "Head",
  face: "Face",
  chest: "Chest",
  back: "Back"
};

export const ACCESSORY_TO_SLOT: Record<Exclude<PetAccessory, "none">, PetAccessorySlot> = {
  ruby_crown: "head",
  caretaker_crown: "head",
  python_wizard_hat: "head",
  javascript_shades: "face",
  typescript_visor: "face",
  rust_armor_accent: "chest",
  go_jetpack: "back"
};

export const ALL_EQUIPMENT_SLOTS: PetAccessorySlot[] = ["head", "face", "chest", "back"];

export function normalizeSpecies(species?: string | null): PetSpecies {
  return species === "raccoon" || species === "star_axolotl" || species === "goat_dragon" ? species : "goat_dragon";
}

export function normalizeStage(stage?: string | null): PetStage {
  if (stage === "egg" || stage === "baby" || stage === "adolescent" || stage === "adult") return stage;
  if (stage === "ranger" || stage === "guardian" || stage === "legend" || stage === "legendary" || stage === "pro") return "adult";
  if (stage === "scout" || stage === "builder") return "adolescent";
  if (stage === "hatchling" || stage === "sprout") return "baby";
  return "baby";
}

export function stageFromEvolution(evolutionStage?: string | null, score = 0): PetStage {
  if (evolutionStage === "egg") return "egg";
  if (score >= 70) return "adult";
  if (score >= 30) return "adolescent";
  return normalizeStage(evolutionStage);
}

export function normalizeMood(mood?: string | null, dormancyState?: string | null): PetMood {
  if (dormancyState === "ghost" || dormancyState === "sad") return "sick";
  if (dormancyState === "peckish") return "hungry";
  if (dormancyState === "okay") return "sleepy";
  if (mood === "idle" || mood === "happy" || mood === "hungry" || mood === "sleepy" || mood === "hyped" || mood === "sad" || mood === "sick") {
    return mood;
  }
  if (mood === "determined" || mood === "focused" || mood === "social" || mood === "sparkly" || mood === "legendary") return "happy";
  if (mood === "patient" || mood === "cozy" || mood === "thoughtful" || mood === "tidy" || mood === "curious") return "sleepy";
  if (mood === "lost" || mood === "retry") return "sad";
  if (mood === "loading") return "idle";
  return "happy";
}

export function normalizeColor(color?: string | null): PetColor {
  return color === "pink" || color === "green" || color === "purple" || color === "orange" || color === "white" || color === "blue" ? color : "blue";
}

export function accessoryFromUnlock(value?: string | null): PetAccessory {
  if (!value) return "none";
  return OUTFIT_TO_ACCESSORY[value] ?? "none";
}

export function normalizeAccessory(accessory?: string | null): PetAccessory {
  return accessory === "ruby_crown" ||
    accessory === "javascript_shades" ||
    accessory === "typescript_visor" ||
    accessory === "python_wizard_hat" ||
    accessory === "rust_armor_accent" ||
    accessory === "go_jetpack" ||
    accessory === "caretaker_crown" ||
    accessory === "none"
    ? accessory
    : accessoryFromUnlock(accessory);
}

export function slotForAccessory(accessory: PetAccessory): PetAccessorySlot | null {
  return accessory === "none" ? null : ACCESSORY_TO_SLOT[accessory];
}

export function accessoriesFromEquipment(equipment?: EquippedAccessories | null, fallbackAccessory?: PetAccessory | string | null): PetAccessory[] {
  const normalized = normalizeEquipment(equipment, fallbackAccessory);
  return ALL_EQUIPMENT_SLOTS.map((slot) => normalizeAccessory(normalized[slot])).filter((accessory) => accessory !== "none");
}

export function normalizeEquipment(equipment?: Partial<Record<string, string | null>> | null, fallbackAccessory?: PetAccessory | string | null): EquippedAccessories {
  const normalized: EquippedAccessories = {};
  ALL_EQUIPMENT_SLOTS.forEach((slot) => {
    const accessory = normalizeAccessory(equipment?.[slot]);
    const accessorySlot = slotForAccessory(accessory);
    if (accessorySlot === slot) {
      normalized[slot] = accessory;
    }
  });

  const fallback = normalizeAccessory(fallbackAccessory);
  const fallbackSlot = slotForAccessory(fallback);
  if (fallbackSlot && !normalized[fallbackSlot]) {
    normalized[fallbackSlot] = fallback;
  }

  return normalized;
}

export function speciesFromSeed(seed?: string | null): PetSpecies {
  const species: PetSpecies[] = ["goat_dragon", "raccoon", "star_axolotl"];
  return species[hashSeed(seed) % species.length];
}

export function colorFromSeed(seed?: string | null, fallbackScore = 0): PetColor {
  const colors: PetColor[] = ["blue", "pink", "green", "purple", "orange", "white"];
  return colors[(hashSeed(seed) + fallbackScore) % colors.length];
}

export function isAccessoryVisible(stage: PetStage, accessory: PetAccessory) {
  if (stage === "egg" || accessory === "none") return false;
  if (stage === "baby" && (accessory === "go_jetpack" || accessory === "rust_armor_accent")) return false;
  return true;
}

function anchors(
  headX: number,
  headY: number,
  headScale: number,
  faceX: number,
  faceY: number,
  faceScale: number,
  neckX: number,
  neckY: number,
  neckScale: number,
  backX: number,
  backY: number,
  backScale: number,
  tailX: number,
  tailY: number,
  tailScale: number,
  bodyX: number,
  bodyY: number,
  bodyScale: number
) {
  return {
    head: { x: headX, y: headY, scale: headScale },
    face: { x: faceX, y: faceY, scale: faceScale },
    neck: { x: neckX, y: neckY, scale: neckScale },
    back: { x: backX, y: backY, scale: backScale, rotate: -10 },
    tail: { x: tailX, y: tailY, scale: tailScale, rotate: 12 },
    body: { x: bodyX, y: bodyY, scale: bodyScale }
  };
}

function hashSeed(seed?: string | null) {
  const input = seed?.trim().toLowerCase() || "pushpet";
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}
