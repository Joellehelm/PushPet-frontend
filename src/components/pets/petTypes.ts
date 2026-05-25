export type PetSpecies = "goat_dragon" | "raccoon" | "star_axolotl";
export type PetStage = "egg" | "baby" | "adolescent" | "adult";
export type PetMood = "idle" | "happy" | "hungry" | "sleepy" | "hyped" | "sad" | "sick";
export type PetColor = "blue" | "pink" | "green" | "purple" | "orange" | "white";
export type PetBackground = "petplace1" | "petplace2" | "petplace3";
export type PetEnvironment = PetBackground | "aqua" | "sunny" | "night" | "garden";
export type PetAccessory =
  | "none"
  | "ruby_crown"
  | "javascript_shades"
  | "typescript_visor"
  | "python_wizard_hat"
  | "rust_armor_accent"
  | "go_jetpack"
  | "caretaker_crown";

export type PetAccessorySlot = "head" | "face" | "chest" | "back";
export type EquippedAccessories = Partial<Record<PetAccessorySlot, PetAccessory>>;

export type PetAnchorName = "head" | "face" | "neck" | "back" | "tail" | "body";

export type PetPalette = {
  base: string;
  light: string;
  dark: string;
  accent: string;
  accentDark: string;
  cheek: string;
  wing: string;
  outline: string;
  white: string;
  shadow: string;
  sick: string;
};

export type PetAnchor = {
  x: number;
  y: number;
  scale: number;
  rotate?: number;
};

export type PetStageAnchors = Record<PetAnchorName, PetAnchor>;

export type PetSpeciesManifest = {
  species: PetSpecies;
  label: string;
  allowedAccessories: PetAccessory[];
  anchors: Record<PetStage, PetStageAnchors>;
};

export type PetSpriteProps = {
  stage: PetStage;
  mood: PetMood;
  palette: PetPalette;
};

export type AccessorySpriteProps = {
  accessory: PetAccessory;
};
