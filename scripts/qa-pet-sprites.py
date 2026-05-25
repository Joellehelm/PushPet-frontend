from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
PET_DIR = ROOT / "public" / "assets" / "pets"
QA_DIR = ROOT.parent / "qa"
CELL = 256
PREVIEW = 118
SPECIES = ["goat_dragon", "raccoon", "star_axolotl"]
STAGES = ["egg", "baby", "adolescent", "adult"]
MOODS = ["idle", "happy", "hungry", "sleepy", "hyped", "sad", "sick"]
COLORS = ["blue", "pink", "green", "purple", "orange", "white"]
ACCESSORIES = [
    "none",
    "ruby_crown",
    "javascript_shades",
    "typescript_visor",
    "python_wizard_hat",
    "rust_armor_accent",
    "go_jetpack",
    "caretaker_crown",
]
VISIBLE_ACCESSORIES = ACCESSORIES[1:]
REVIEW_COLOR = "purple"


def font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/seguisb.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


FONT = font(12)
FONT_BOLD = font(13, True)
TITLE = font(18, True)


def crop_cell(sheet: Image.Image, col: int, row: int) -> Image.Image:
    return sheet.crop((col * CELL, row * CELL, (col + 1) * CELL, (row + 1) * CELL))


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int] | None:
    return image.getchannel("A").getbbox()


def touches_edge(image: Image.Image, margin: int = 3) -> bool:
    alpha = image.getchannel("A")
    width, height = image.size
    bands = [
        alpha.crop((0, 0, width, margin)),
        alpha.crop((0, height - margin, width, height)),
        alpha.crop((0, 0, margin, height)),
        alpha.crop((width - margin, 0, width, height)),
    ]
    return any(band.getbbox() is not None for band in bands)


def accessory_visible(stage: str, accessory: str) -> bool:
    if stage == "egg" or accessory == "none":
        return False
    if stage == "baby" and accessory in {"go_jetpack", "rust_armor_accent"}:
        return False
    return True


def paste_preview(canvas: Image.Image, sprite: Image.Image, x: int, y: int) -> None:
    preview = sprite.resize((PREVIEW, PREVIEW), Image.Resampling.LANCZOS)
    canvas.alpha_composite(preview, (x, y))


def label(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, bold: bool = False) -> None:
    draw.text(xy, text.replace("_", " "), fill=(23, 17, 35, 255), font=FONT_BOLD if bold else FONT)


def make_contact_sheet(species: str, base: Image.Image, accessories: Image.Image) -> Path:
    rows = [f"{stage} {mood}" for stage in STAGES[1:] for mood in MOODS]
    cell_w = PREVIEW + 26
    row_h = PREVIEW + 34
    left_w = 120
    header_h = 58
    width = left_w + cell_w * len(ACCESSORIES)
    height = header_h + row_h * len(rows)
    out = Image.new("RGBA", (width, height), (255, 253, 245, 255))
    draw = ImageDraw.Draw(out)
    draw.rectangle((0, 0, width, height), fill=(255, 253, 245, 255))
    draw.text((14, 14), f"{species.replace('_', ' ')} accessories, every mood", fill=(23, 17, 35, 255), font=TITLE)

    for index, accessory in enumerate(ACCESSORIES):
        x = left_w + index * cell_w + 7
        draw.text((x, 38), accessory.replace("_", "\n"), fill=(23, 17, 35, 255), font=FONT)

    color_index = COLORS.index(REVIEW_COLOR)
    row_index = 0
    for stage in STAGES[1:]:
        stage_index = STAGES.index(stage)
        for mood in MOODS:
            y = header_h + row_index * row_h
            draw.rounded_rectangle((8, y + 7, width - 8, y + row_h - 6), radius=14, fill=(235, 246, 255, 255), outline=(23, 17, 35, 255), width=2)
            label(draw, (16, y + 16), stage, True)
            label(draw, (16, y + 36), mood)
            base_row = color_index * len(MOODS) + MOODS.index(mood)
            base_sprite = crop_cell(base, stage_index, base_row)
            for accessory_index, accessory in enumerate(ACCESSORIES):
                x = left_w + accessory_index * cell_w + 12
                composite = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
                composite.alpha_composite(base_sprite)
                if accessory_visible(stage, accessory):
                    accessory_row = (VISIBLE_ACCESSORIES.index(accessory) * len(MOODS)) + MOODS.index(mood)
                    composite.alpha_composite(crop_cell(accessories, stage_index, accessory_row))
                paste_preview(out, composite, x, y + 10)
            row_index += 1

    path = QA_DIR / f"pet-accessory-contact-{species}.png"
    out.convert("RGB").save(path, quality=95)
    return path


def make_base_sheet(species: str, base: Image.Image) -> Path:
    cell_w = PREVIEW + 24
    row_h = PREVIEW + 32
    left_w = 108
    header_h = 60
    rows = [(color, mood) for color in COLORS for mood in MOODS]
    width = left_w + cell_w * len(STAGES)
    height = header_h + row_h * len(rows)
    out = Image.new("RGBA", (width, height), (255, 253, 245, 255))
    draw = ImageDraw.Draw(out)
    draw.text((14, 14), f"{species.replace('_', ' ')} base sprites", fill=(23, 17, 35, 255), font=TITLE)
    for stage_index, stage in enumerate(STAGES):
        label(draw, (left_w + stage_index * cell_w + 18, 38), stage, True)
    for row_index, (color, mood) in enumerate(rows):
        y = header_h + row_index * row_h
        draw.rounded_rectangle((8, y + 6, width - 8, y + row_h - 5), radius=14, fill=(247, 238, 255, 255), outline=(23, 17, 35, 255), width=2)
        label(draw, (16, y + 16), color, True)
        label(draw, (16, y + 36), mood)
        base_row = COLORS.index(color) * len(MOODS) + MOODS.index(mood)
        for stage_index, _stage in enumerate(STAGES):
            paste_preview(out, crop_cell(base, stage_index, base_row), left_w + stage_index * cell_w + 12, y + 10)
    path = QA_DIR / f"pet-base-contact-{species}.png"
    out.convert("RGB").save(path, quality=95)
    return path


def inspect_species(species: str) -> dict[str, object]:
    base = Image.open(PET_DIR / f"{species}-base.png").convert("RGBA")
    accessories = Image.open(PET_DIR / f"{species}-accessories.png").convert("RGBA")
    expected_base = (CELL * len(STAGES), CELL * len(COLORS) * len(MOODS))
    expected_accessories = (CELL * len(STAGES), CELL * len(VISIBLE_ACCESSORIES) * len(MOODS))
    issues: list[str] = []
    warnings: list[str] = []

    if base.size != expected_base:
        issues.append(f"base sheet size {base.size} expected {expected_base}")
    if accessories.size != expected_accessories:
        issues.append(f"accessory sheet size {accessories.size} expected {expected_accessories}")

    for color_index, color in enumerate(COLORS):
        for mood_index, mood in enumerate(MOODS):
            row = color_index * len(MOODS) + mood_index
            for stage_index, stage in enumerate(STAGES):
                cell = crop_cell(base, stage_index, row)
                if not alpha_bbox(cell):
                    issues.append(f"missing base sprite {color}/{mood}/{stage}")
                if touches_edge(cell):
                    issues.append(f"base sprite touches cell edge {color}/{mood}/{stage}")

    review_color_index = COLORS.index(REVIEW_COLOR)
    for accessory_index, accessory in enumerate(VISIBLE_ACCESSORIES):
        for mood_index, mood in enumerate(MOODS):
            accessory_row = accessory_index * len(MOODS) + mood_index
            for stage_index, stage in enumerate(STAGES):
                accessory_cell = crop_cell(accessories, stage_index, accessory_row)
                has_accessory = alpha_bbox(accessory_cell) is not None
                should_show = accessory_visible(stage, accessory)
                if should_show and not has_accessory:
                    issues.append(f"missing accessory {accessory}/{mood}/{stage}")
                if not should_show and has_accessory:
                    issues.append(f"unexpected accessory on hidden stage {accessory}/{mood}/{stage}")
                if has_accessory and touches_edge(accessory_cell):
                    issues.append(f"accessory touches cell edge {accessory}/{mood}/{stage}")

                if should_show:
                    base_row = review_color_index * len(MOODS) + mood_index
                    composite = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
                    base_cell = crop_cell(base, stage_index, base_row)
                    composite.alpha_composite(base_cell)
                    composite.alpha_composite(accessory_cell)
                    if touches_edge(composite):
                        issues.append(f"composite touches cell edge {accessory}/{mood}/{stage}")
                    base_box = alpha_bbox(base_cell)
                    accessory_box = alpha_bbox(accessory_cell)
                    if base_box and accessory_box:
                        vertical_gap = max(base_box[1] - accessory_box[3], accessory_box[1] - base_box[3], 0)
                        horizontal_gap = max(base_box[0] - accessory_box[2], accessory_box[0] - base_box[2], 0)
                        if vertical_gap > 22 or horizontal_gap > 22:
                            warnings.append(f"accessory may float {accessory}/{mood}/{stage}")

    contact = make_contact_sheet(species, base, accessories)
    base_contact = make_base_sheet(species, base)
    return {
        "species": species,
        "base_size": base.size,
        "accessory_size": accessories.size,
        "issues": issues,
        "warnings": warnings,
        "accessory_contact_sheet": str(contact),
        "base_contact_sheet": str(base_contact),
    }


def main() -> None:
    QA_DIR.mkdir(parents=True, exist_ok=True)
    results = [inspect_species(species) for species in SPECIES]
    total_issues = sum(len(result["issues"]) for result in results)
    report = {
        "cell_size": CELL,
        "review_color": REVIEW_COLOR,
        "species": results,
        "total_issues": total_issues,
    }
    report_path = QA_DIR / "pet-sprite-qa-report.json"
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    if total_issues:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
