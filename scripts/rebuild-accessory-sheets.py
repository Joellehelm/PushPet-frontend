from __future__ import annotations

from pathlib import Path
from typing import Callable

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
PET_DIR = ROOT / "public" / "assets" / "pets"
CELL = 256
STAGES = ["egg", "baby", "adolescent", "adult"]
MOODS = ["idle", "happy", "hungry", "sleepy", "hyped", "sad", "sick"]
COLORS = ["blue", "pink", "green", "purple", "orange", "white"]
SPECIES = ["goat_dragon", "raccoon", "star_axolotl"]
ACCESSORIES = [
    "ruby_crown",
    "javascript_shades",
    "typescript_visor",
    "python_wizard_hat",
    "rust_armor_accent",
    "go_jetpack",
    "caretaker_crown",
]

INK = (36, 22, 51, 255)
REVIEW_COLOR = "purple"


ANCHORS = {
    "goat_dragon": {
        "baby": {
            "head": (126, 72, 0.62),
            "face": (126, 108, 0.70),
            "body": (126, 141, 0.72),
            "back": (84, 124, 0.56),
        },
        "adolescent": {
            "head": (122, 58, 0.72),
            "face": (122, 101, 0.78),
            "body": (126, 143, 0.88),
            "back": (40, 128, 0.76),
        },
        "adult": {
            "head": (120, 45, 0.84),
            "face": (120, 91, 0.88),
            "body": (127, 146, 1.00),
            "back": (38, 124, 0.84),
        },
    },
    "raccoon": {
        "baby": {
            "head": (128, 67, 0.62),
            "face": (128, 105, 0.72),
            "body": (128, 144, 0.78),
            "back": (82, 130, 0.58),
        },
        "adolescent": {
            "head": (124, 54, 0.70),
            "face": (124, 96, 0.78),
            "body": (127, 147, 0.90),
            "back": (40, 128, 0.76),
        },
        "adult": {
            "head": (123, 43, 0.80),
            "face": (123, 88, 0.88),
            "body": (128, 149, 1.00),
            "back": (38, 126, 0.84),
        },
    },
    "star_axolotl": {
        "baby": {
            "head": (128, 73, 0.58),
            "face": (128, 112, 0.68),
            "body": (128, 146, 0.72),
            "back": (82, 136, 0.52),
        },
        "adolescent": {
            "head": (128, 60, 0.68),
            "face": (128, 101, 0.78),
            "body": (128, 147, 0.86),
            "back": (40, 132, 0.76),
        },
        "adult": {
            "head": (128, 49, 0.78),
            "face": (128, 92, 0.86),
            "body": (128, 148, 1.00),
            "back": (38, 130, 0.84),
        },
    },
}

MOOD_OFFSETS = {
    "idle": {},
    "happy": {},
    "hyped": {
        "head": (0, -2, 1.02, 4),
        "face": (0, -2, 1.02, 4),
        "body": (0, -2, 1.00, 3),
        "back": (0, -2, 1.00, 3),
    },
    "hungry": {
        "head": (-4, 8, 0.96, -4),
        "face": (-4, 7, 0.96, -4),
        "body": (-3, 5, 0.98, -3),
        "back": (-3, 4, 0.98, -3),
    },
    "sad": {
        "head": (-4, 8, 0.96, -4),
        "face": (-4, 7, 0.96, -4),
        "body": (-3, 5, 0.98, -3),
        "back": (-3, 4, 0.98, -3),
    },
    "sleepy": {
        "head": (-18, 28, 0.88, -12),
        "face": (-18, 28, 0.90, -9),
        "body": (-13, 22, 0.92, -8),
        "back": (-2, 20, 0.92, -8),
    },
    "sick": {
        "head": (-18, 28, 0.88, -12),
        "face": (-18, 28, 0.90, -9),
        "body": (-13, 22, 0.92, -8),
        "back": (-2, 20, 0.92, -8),
    },
}


POSE_OFFSETS = {
    "goat_dragon": {
        "baby": {
            "idle": {"face": (0, 8, 1.02, 0)},
            "happy": {"face": (0, 8, 1.02, 0)},
            "hyped": {"face": (0, 6, 1.02, 0)},
            "hungry": {"head": (2, -1, 1.02, 2), "face": (2, 7, 1.02, 2), "body": (1, 0, 1.02, 1), "back": (2, 0, 1.02, 1)},
            "sad": {"head": (2, -1, 1.02, 2), "face": (2, 7, 1.02, 2), "body": (1, 0, 1.02, 1), "back": (2, 0, 1.02, 1)},
            "sleepy": {"head": (6, -4, 1.05, 2), "face": (7, -5, 1.04, 2), "body": (5, -3, 1.04, 2), "back": (2, -4, 1.03, 1)},
            "sick": {"head": (6, -4, 1.05, 2), "face": (7, -5, 1.04, 2), "body": (5, -3, 1.04, 2), "back": (2, -4, 1.03, 1)},
        },
        "adolescent": {
            "idle": {"face": (0, 13, 1.02, 0)},
            "happy": {"face": (0, 13, 1.02, 0)},
            "hyped": {"face": (0, 11, 1.02, 0)},
            "hungry": {"head": (3, -2, 1.03, 1), "face": (3, 11, 1.03, 1), "body": (2, -1, 1.02, 1), "back": (2, -1, 1.02, 1)},
            "sad": {"head": (3, -2, 1.03, 1), "face": (3, 11, 1.03, 1), "body": (2, -1, 1.02, 1), "back": (2, -1, 1.02, 1)},
            "sleepy": {"head": (8, -3, 1.04, 2), "face": (8, -4, 1.04, 2), "body": (7, -3, 1.03, 2), "back": (3, -2, 1.02, 1)},
            "sick": {"head": (8, -3, 1.04, 2), "face": (8, -4, 1.04, 2), "body": (7, -3, 1.03, 2), "back": (3, -2, 1.02, 1)},
        },
        "adult": {
            "idle": {"face": (0, 22, 1.03, 0)},
            "happy": {"face": (0, 22, 1.03, 0)},
            "hyped": {"face": (0, 18, 1.03, 0)},
            "hungry": {"head": (4, -2, 1.04, 1), "face": (4, 17, 1.03, 1), "body": (3, -1, 1.02, 1), "back": (2, -1, 1.02, 1)},
            "sad": {"head": (4, -2, 1.04, 1), "face": (4, 17, 1.03, 1), "body": (3, -1, 1.02, 1), "back": (2, -1, 1.02, 1)},
            "sleepy": {"head": (9, 0, 1.05, 2), "face": (9, -1, 1.04, 2), "body": (8, -1, 1.03, 2), "back": (3, 0, 1.02, 1)},
            "sick": {"head": (9, 0, 1.05, 2), "face": (9, -1, 1.04, 2), "body": (8, -1, 1.03, 2), "back": (3, 0, 1.02, 1)},
        },
    },
    "raccoon": {
        "baby": {
            "hungry": {"head": (0, -3, 1.03, 2), "face": (0, -3, 1.03, 2), "body": (0, -1, 1.02, 1), "back": (2, -1, 1.02, 1)},
            "sad": {"head": (0, -3, 1.03, 2), "face": (0, -3, 1.03, 2), "body": (0, -1, 1.02, 1), "back": (2, -1, 1.02, 1)},
            "sleepy": {"head": (3, -8, 1.05, 5), "face": (4, -8, 1.04, 4), "body": (4, -7, 1.03, 3), "back": (4, -6, 1.02, 2)},
            "sick": {"head": (3, -8, 1.05, 5), "face": (4, -8, 1.04, 4), "body": (4, -7, 1.03, 3), "back": (4, -6, 1.02, 2)},
        },
        "adolescent": {
            "hungry": {"head": (1, -5, 1.04, 3), "face": (1, -5, 1.03, 3), "body": (1, -2, 1.02, 1), "back": (3, -2, 1.02, 1)},
            "sad": {"head": (1, -5, 1.04, 3), "face": (1, -5, 1.03, 3), "body": (1, -2, 1.02, 1), "back": (3, -2, 1.02, 1)},
            "sleepy": {"head": (15, -8, 1.08, 10), "face": (15, -9, 1.07, 8), "body": (12, -7, 1.04, 6), "back": (7, -5, 1.02, 3)},
            "sick": {"head": (15, -8, 1.08, 10), "face": (15, -9, 1.07, 8), "body": (12, -7, 1.04, 6), "back": (7, -5, 1.02, 3)},
        },
        "adult": {
            "hungry": {"head": (2, -5, 1.04, 3), "face": (2, -5, 1.03, 3), "body": (1, -2, 1.02, 1), "back": (3, -2, 1.02, 1)},
            "sad": {"head": (2, -5, 1.04, 3), "face": (2, -5, 1.03, 3), "body": (1, -2, 1.02, 1), "back": (3, -2, 1.02, 1)},
            "sleepy": {"head": (9, 3, 1.08, 8), "face": (9, 2, 1.07, 7), "body": (8, 2, 1.04, 5), "back": (6, 1, 1.02, 3)},
            "sick": {"head": (9, 3, 1.08, 8), "face": (9, 2, 1.07, 7), "body": (8, 2, 1.04, 5), "back": (6, 1, 1.02, 3)},
        },
    },
    "star_axolotl": {
        "baby": {
            "hungry": {"head": (2, -2, 1.02, 2), "face": (2, -2, 1.02, 2), "body": (1, -1, 1.02, 1), "back": (2, -1, 1.02, 1)},
            "sad": {"head": (2, -2, 1.02, 2), "face": (2, -2, 1.02, 2), "body": (1, -1, 1.02, 1), "back": (2, -1, 1.02, 1)},
            "sleepy": {"head": (4, -8, 1.04, 4), "face": (5, -8, 1.04, 3), "body": (5, -6, 1.03, 3), "back": (4, -6, 1.02, 2)},
            "sick": {"head": (4, -8, 1.04, 4), "face": (5, -8, 1.04, 3), "body": (5, -6, 1.03, 3), "back": (4, -6, 1.02, 2)},
        },
        "adolescent": {
            "hungry": {"head": (3, -2, 1.03, 2), "face": (3, -2, 1.03, 2), "body": (2, -1, 1.02, 1), "back": (2, -1, 1.02, 1)},
            "sad": {"head": (3, -2, 1.03, 2), "face": (3, -2, 1.03, 2), "body": (2, -1, 1.02, 1), "back": (2, -1, 1.02, 1)},
            "sleepy": {"head": (7, -2, 1.04, 4), "face": (7, -3, 1.04, 3), "body": (6, -2, 1.03, 3), "back": (4, -2, 1.02, 2)},
            "sick": {"head": (7, -2, 1.04, 4), "face": (7, -3, 1.04, 3), "body": (6, -2, 1.03, 3), "back": (4, -2, 1.02, 2)},
        },
        "adult": {
            "hungry": {"head": (3, -2, 1.03, 2), "face": (3, -2, 1.03, 2), "body": (2, -1, 1.02, 1), "back": (2, -1, 1.02, 1)},
            "sad": {"head": (3, -2, 1.03, 2), "face": (3, -2, 1.03, 2), "body": (2, -1, 1.02, 1), "back": (2, -1, 1.02, 1)},
            "sleepy": {"head": (7, 1, 1.04, 4), "face": (7, 0, 1.04, 3), "body": (6, 0, 1.03, 3), "back": (4, 0, 1.02, 2)},
            "sick": {"head": (7, 1, 1.04, 4), "face": (7, 0, 1.04, 3), "body": (6, 0, 1.03, 3), "back": (4, 0, 1.02, 2)},
        },
    },
}


def combine_offsets(*offsets: tuple[float, float, float, float]) -> tuple[float, float, float, float]:
    dx = sum(offset[0] for offset in offsets)
    dy = sum(offset[1] for offset in offsets)
    scale = 1.0
    angle = 0.0
    for offset in offsets:
        scale *= offset[2]
        angle += offset[3]
    return dx, dy, scale, angle


def pose_offset(species: str, stage: str, mood: str, part: str) -> tuple[float, float, float, float]:
    neutral = (0, 0, 1, 0)
    mood_offset = MOOD_OFFSETS.get(mood, {}).get(part, neutral)
    stage_offset = POSE_OFFSETS.get(species, {}).get(stage, {}).get(mood, {}).get(part, neutral)
    return combine_offsets(mood_offset, stage_offset)


def crop_cell(sheet: Image.Image, col: int, row: int) -> Image.Image:
    return sheet.crop((col * CELL, row * CELL, (col + 1) * CELL, (row + 1) * CELL))


def alpha_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    bbox = image.getchannel("A").getbbox()
    return bbox if bbox else (68, 52, 188, 206)


def rounded(draw: ImageDraw.ImageDraw, box: tuple[float, float, float, float], radius: float, fill, outline=None, width: int = 1) -> None:
    draw.rounded_rectangle(tuple(round(v) for v in box), radius=round(radius), fill=fill, outline=outline, width=width)


def soft_shadow(source: Image.Image, dx: int = 2, dy: int = 3, blur: float = 2.1, alpha: int = 105) -> Image.Image:
    out = Image.new("RGBA", source.size, (0, 0, 0, 0))
    mask = source.getchannel("A").filter(ImageFilter.GaussianBlur(blur))
    shadow = Image.new("RGBA", source.size, (30, 21, 43, alpha))
    shadow.putalpha(mask)
    out.alpha_composite(shadow, (dx, dy))
    out.alpha_composite(source)
    return out


def asset_canvas(width: int, height: int, scale: int = 4) -> tuple[Image.Image, ImageDraw.ImageDraw, int]:
    image = Image.new("RGBA", (width * scale, height * scale), (0, 0, 0, 0))
    return image, ImageDraw.Draw(image), scale


def finalize_asset(image: Image.Image, width: int, height: int) -> Image.Image:
    image = image.resize((width, height), Image.Resampling.LANCZOS)
    image = soft_shadow(image)
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        return image
    padded = Image.new("RGBA", (width + 16, height + 16), (0, 0, 0, 0))
    padded.alpha_composite(image, (8, 6))
    return padded


def gradient_rect(size: tuple[int, int], top, bottom, mask: Image.Image) -> Image.Image:
    width, height = size
    grad = Image.new("RGBA", size, (0, 0, 0, 0))
    pix = grad.load()
    for y in range(height):
        t = y / max(height - 1, 1)
        color = tuple(round(top[i] * (1 - t) + bottom[i] * t) for i in range(4))
        for x in range(width):
            pix[x, y] = color
    grad.putalpha(mask)
    return grad


def draw_crown(kind: str) -> Image.Image:
    width, height = 104, 62
    image, draw, s = asset_canvas(width, height)
    magenta = kind == "ruby"
    fill = (232, 44, 95, 255) if magenta else (255, 221, 67, 255)
    fill_dark = (180, 27, 82, 255) if magenta else (229, 164, 31, 255)
    fill_light = (255, 149, 189, 255) if magenta else (255, 249, 168, 255)
    gems = [(255, 225, 65, 255), (82, 241, 211, 255), (116, 156, 255, 255)] if magenta else [
        (255, 84, 171, 255),
        (61, 231, 255, 255),
        (137, 88, 255, 255),
    ]

    pts = [(11, 43), (23, 13), (39, 35), (52, 7), (65, 35), (81, 13), (93, 43)]
    pts = [(x * s, y * s) for x, y in pts]
    draw.line(pts, fill=INK, width=13 * s, joint="curve")
    draw.line(pts, fill=fill_dark, width=8 * s, joint="curve")
    draw.line(pts, fill=fill, width=5 * s, joint="curve")
    rounded(draw, (7 * s, 35 * s, 97 * s, 57 * s), 8 * s, fill_dark, INK, 4 * s)
    rounded(draw, (12 * s, 36 * s, 92 * s, 49 * s), 6 * s, fill, None, 1)
    draw.line((17 * s, 39 * s, 87 * s, 39 * s), fill=fill_light, width=3 * s)
    for x, gem in zip((28, 52, 76), gems):
        draw.ellipse(((x - 5) * s, 43 * s, (x + 5) * s, 53 * s), fill=INK)
        draw.ellipse(((x - 3) * s, 44 * s, (x + 3) * s, 50 * s), fill=gem)
        draw.ellipse(((x - 1) * s, 45 * s, (x + 2) * s, 48 * s), fill=(255, 255, 255, 175))
    return finalize_asset(image, width, height)


def draw_javascript_shades() -> Image.Image:
    width, height = 108, 50
    image, draw, s = asset_canvas(width, height)
    for left in (7, 58):
        rounded(draw, (left * s, 9 * s, (left + 43) * s, 39 * s), 10 * s, INK)
        rounded(draw, ((left + 4) * s, 13 * s, (left + 39) * s, 35 * s), 7 * s, (245, 195, 55, 240))
        draw.rectangle(((left + 4) * s, 26 * s, (left + 39) * s, 35 * s), fill=(118, 82, 33, 118))
        draw.line(((left + 10) * s, 16 * s, (left + 34) * s, 16 * s), fill=(255, 249, 174, 240), width=3 * s)
    draw.line((50 * s, 25 * s, 58 * s, 25 * s), fill=INK, width=5 * s)
    draw.line((4 * s, 16 * s, 0, 11 * s), fill=INK, width=4 * s)
    draw.line((104 * s, 16 * s, 108 * s, 11 * s), fill=INK, width=4 * s)
    return finalize_asset(image, width, height)


def draw_typescript_visor() -> Image.Image:
    width, height = 118, 54
    image, draw, s = asset_canvas(width, height)
    mask = Image.new("L", image.size, 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle((7 * s, 10 * s, 111 * s, 43 * s), radius=14 * s, fill=255)
    image.alpha_composite(gradient_rect(image.size, (74, 225, 255, 238), (40, 92, 240, 245), mask))
    rounded(draw, (7 * s, 10 * s, 111 * s, 43 * s), 14 * s, None, INK, 5 * s)
    rounded(draw, (18 * s, 15 * s, 100 * s, 27 * s), 7 * s, (193, 242, 255, 115))
    draw.line((26 * s, 27 * s, 59 * s, 17 * s, 92 * s, 27 * s), fill=(238, 253, 255, 240), width=4 * s)
    for x in (17, 101):
        draw.ellipse(((x - 4) * s, 25 * s, (x + 4) * s, 33 * s), fill=INK)
        draw.ellipse(((x - 2) * s, 26 * s, (x + 2) * s, 30 * s), fill=(255, 226, 64, 255))
    return finalize_asset(image, width, height)


def draw_wizard_hat() -> Image.Image:
    width, height = 100, 96
    image, draw, s = asset_canvas(width, height)
    cone = [(34 * s, 66 * s), (54 * s, 9 * s), (75 * s, 67 * s)]
    draw.polygon(cone, fill=INK)
    draw.polygon([(39 * s, 63 * s), (54 * s, 14 * s), (69 * s, 63 * s)], fill=(117, 93, 239, 255))
    draw.polygon([(54 * s, 14 * s), (69 * s, 63 * s), (58 * s, 57 * s)], fill=(82, 68, 198, 255))
    rounded(draw, (18 * s, 59 * s, 86 * s, 82 * s), 15 * s, (75, 65, 179, 255), INK, 5 * s)
    rounded(draw, (28 * s, 58 * s, 75 * s, 69 * s), 8 * s, (255, 220, 77, 255), None, 1)
    draw.line((40 * s, 37 * s, 65 * s, 50 * s), fill=(255, 224, 77, 255), width=4 * s)
    draw.line((52 * s, 21 * s, 52 * s, 34 * s), fill=(255, 251, 165, 255), width=3 * s)
    draw.ellipse((59 * s, 22 * s, 68 * s, 31 * s), fill=(255, 224, 77, 255), outline=INK, width=2 * s)
    draw.polygon([(30 * s, 31 * s), (34 * s, 38 * s), (42 * s, 39 * s), (35 * s, 43 * s), (34 * s, 51 * s), (29 * s, 44 * s), (21 * s, 43 * s), (28 * s, 38 * s)], fill=(255, 245, 146, 255))
    return finalize_asset(image, width, height)


def draw_rust_armor() -> Image.Image:
    width, height = 96, 88
    image, draw, s = asset_canvas(width, height)
    plate = [(48, 7), (83, 26), (76, 75), (48, 84), (20, 75), (13, 26)]
    draw.polygon([(x * s, y * s) for x, y in plate], fill=INK)
    inner = Image.new("L", image.size, 0)
    ImageDraw.Draw(inner).polygon([(48 * s, 12 * s), (77 * s, 29 * s), (70 * s, 70 * s), (48 * s, 77 * s), (26 * s, 70 * s), (19 * s, 29 * s)], fill=255)
    image.alpha_composite(gradient_rect(image.size, (244, 153, 80, 235), (157, 71, 46, 245), inner))
    draw.line((48 * s, 14 * s, 48 * s, 76 * s), fill=(255, 206, 141, 235), width=4 * s)
    draw.line((25 * s, 39 * s, 71 * s, 39 * s), fill=(255, 190, 117, 230), width=4 * s)
    draw.line((30 * s, 26 * s, 43 * s, 19 * s), fill=(255, 220, 171, 180), width=4 * s)
    for x, y in ((30, 58), (66, 58), (35, 31), (61, 31)):
        draw.ellipse(((x - 5) * s, (y - 5) * s, (x + 5) * s, (y + 5) * s), fill=INK)
        draw.ellipse(((x - 3) * s, (y - 3) * s, (x + 3) * s, (y + 3) * s), fill=(255, 225, 82, 255))
    return finalize_asset(image, width, height)


def draw_go_jetpack() -> Image.Image:
    width, height = 96, 110
    image, draw, s = asset_canvas(width, height)
    for left in (20, 55):
        rounded(draw, (left * s, 12 * s, (left + 22) * s, 75 * s), 8 * s, (47, 197, 255, 245), INK, 5 * s)
        rounded(draw, ((left + 5) * s, 18 * s, (left + 17) * s, 35 * s), 5 * s, (208, 249, 255, 190))
        draw.rectangle(((left + 5) * s, 50 * s, (left + 17) * s, 60 * s), fill=(23, 84, 160, 135))
        draw.polygon([(left * s, 75 * s), ((left + 11) * s, 104 * s), ((left + 22) * s, 75 * s)], fill=(255, 132, 43, 235))
        draw.polygon([((left + 5) * s, 77 * s), ((left + 11) * s, 96 * s), ((left + 17) * s, 77 * s)], fill=(255, 228, 72, 235))
    draw.line((42 * s, 34 * s, 55 * s, 34 * s), fill=INK, width=5 * s)
    draw.line((42 * s, 58 * s, 55 * s, 58 * s), fill=INK, width=5 * s)
    return finalize_asset(image, width, height)


ASSETS: dict[str, Callable[[], Image.Image]] = {
    "ruby_crown": lambda: draw_crown("ruby"),
    "javascript_shades": draw_javascript_shades,
    "typescript_visor": draw_typescript_visor,
    "python_wizard_hat": draw_wizard_hat,
    "rust_armor_accent": draw_rust_armor,
    "go_jetpack": draw_go_jetpack,
    "caretaker_crown": lambda: draw_crown("caretaker"),
}


def base_row(mood: str) -> int:
    return COLORS.index(REVIEW_COLOR) * len(MOODS) + MOODS.index(mood)


def anchor(species: str, stage: str, mood: str, part: str) -> tuple[float, float, float, float]:
    x, y, scale = ANCHORS[species][stage][part]
    dx, dy, scale_factor, angle = pose_offset(species, stage, mood, part)
    return x + dx, y + dy, scale * scale_factor, angle


def placement(accessory: str, species: str, stage: str, mood: str, cell: Image.Image) -> tuple[float, float, float, float]:
    if accessory in {"ruby_crown", "caretaker_crown"}:
        x, y, scale, angle = anchor(species, stage, mood, "head")
        return x, y, scale * (0.78 if accessory == "ruby_crown" else 0.82), angle
    if accessory == "python_wizard_hat":
        x, y, scale, angle = anchor(species, stage, mood, "head")
        return x + 1, y - 6, scale * 0.72, angle - 2
    if accessory in {"javascript_shades", "typescript_visor"}:
        x, y, scale, angle = anchor(species, stage, mood, "face")
        return x, y, scale * (0.76 if accessory == "javascript_shades" else 0.80), angle
    if accessory == "rust_armor_accent":
        x, y, scale, angle = anchor(species, stage, mood, "body")
        return x, y, scale * 0.70, angle
    if accessory == "go_jetpack":
        x, y, scale, angle = anchor(species, stage, mood, "back")
        return x, y, scale * 0.82, angle - 8
    return 128, 128, 1, 0


def paste_accessory(cell: Image.Image, accessory_image: Image.Image, center_x: float, center_y: float, scale: float, angle: float) -> Image.Image:
    bbox = accessory_image.getchannel("A").getbbox()
    if not bbox:
        return cell
    asset = accessory_image.crop(bbox)
    target_w = max(1, round(asset.width * scale))
    target_h = max(1, round(asset.height * scale))
    asset = asset.resize((target_w, target_h), Image.Resampling.LANCZOS)
    if abs(angle) > 0.1:
        asset = asset.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)

    x = round(center_x - asset.width / 2)
    y = round(center_y - asset.height / 2)
    x = max(5, min(CELL - asset.width - 5, x))
    y = max(5, min(CELL - asset.height - 5, y))
    cell.alpha_composite(asset, (x, y))
    return cell


def should_render(stage: str, accessory: str) -> bool:
    if stage == "egg":
        return False
    return True


def rebuild_species(species: str) -> None:
    base = Image.open(PET_DIR / f"{species}-base.png").convert("RGBA")
    primitives = {name: maker() for name, maker in ASSETS.items()}
    sheet = Image.new("RGBA", (CELL * len(STAGES), CELL * len(ACCESSORIES) * len(MOODS)), (0, 0, 0, 0))

    for accessory_index, accessory in enumerate(ACCESSORIES):
        for mood_index, mood in enumerate(MOODS):
            row = accessory_index * len(MOODS) + mood_index
            for stage_index, stage in enumerate(STAGES):
                if not should_render(stage, accessory):
                    continue
                base_cell = crop_cell(base, stage_index, base_row(mood))
                out_cell = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
                x, y, scale, angle = placement(accessory, species, stage, mood, base_cell)
                paste_accessory(out_cell, primitives[accessory], x, y, scale, angle)
                sheet.alpha_composite(out_cell, (stage_index * CELL, row * CELL))

    sheet.save(PET_DIR / f"{species}-accessories.png")


def main() -> None:
    for species in SPECIES:
        rebuild_species(species)


if __name__ == "__main__":
    main()
