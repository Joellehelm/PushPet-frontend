from __future__ import annotations

import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
BRAND_DIR = ROOT / "public" / "assets" / "brand"
LOGO_OUT = BRAND_DIR / "pushpet-logo.png"
BG_OUT = BRAND_DIR / "pushpet-bg.png"

INK = (28, 20, 44, 255)
CREAM = (255, 250, 226, 255)
PINK = (255, 76, 174, 255)
CYAN = (45, 221, 255, 255)
YELLOW = (255, 224, 72, 255)
LIME = (145, 255, 60, 255)
PURPLE = (132, 86, 255, 255)
ORANGE = (255, 139, 42, 255)
WHITE = (255, 255, 255, 255)


def font(size: int) -> ImageFont.FreeTypeFont:
    candidates = [
        "C:/Windows/Fonts/CeraPROModern-Medium.ttf",
        "C:/Windows/Fonts/ariblk.ttf",
        "C:/Windows/Fonts/comicbd.ttf",
        "C:/Windows/Fonts/arialbd.ttf",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def make_logo() -> None:
    scale = 4
    image = Image.new("RGBA", (920 * scale, 230 * scale), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    title_font = font(110 * scale)
    text = "PUSHPET"

    text_box = draw.textbbox((0, 0), text, font=title_font, stroke_width=0)
    text_w = text_box[2] - text_box[0]
    text_h = text_box[3] - text_box[1]
    x = 44 * scale
    y = 38 * scale

    shadow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow)
    shadow_draw.text((x + 17 * scale, y + 18 * scale), text, font=title_font, fill=(28, 20, 44, 190), stroke_width=9 * scale, stroke_fill=(28, 20, 44, 190))
    shadow = shadow.filter(ImageFilter.GaussianBlur(2 * scale))
    image.alpha_composite(shadow)

    # A restrained 90s toy wordmark: bold type, clean offset colors, no noisy icon clutter.
    draw.text((x + 12 * scale, y + 11 * scale), text, font=title_font, fill=CYAN, stroke_width=8 * scale, stroke_fill=INK)
    draw.text((x + 5 * scale, y + 6 * scale), text, font=title_font, fill=PINK, stroke_width=8 * scale, stroke_fill=INK)
    draw.text((x, y), text, font=title_font, fill=YELLOW, stroke_width=11 * scale, stroke_fill=INK)
    draw.text((x + 3 * scale, y + 2 * scale), text, font=title_font, fill=(255, 251, 198, 255), stroke_width=2 * scale, stroke_fill=YELLOW)

    underline_y = y + text_h + 22 * scale
    draw.rounded_rectangle((x + 7 * scale, underline_y, x + text_w - 5 * scale, underline_y + 13 * scale), radius=7 * scale, fill=INK)
    draw.rounded_rectangle((x, underline_y - 5 * scale, x + text_w - 12 * scale, underline_y + 5 * scale), radius=5 * scale, fill=PINK)
    draw.rounded_rectangle((x + 142 * scale, underline_y - 5 * scale, x + 340 * scale, underline_y + 5 * scale), radius=5 * scale, fill=CYAN)

    bbox = image.getchannel("A").getbbox()
    if bbox:
        pad = 20 * scale
        image = image.crop((
            max(0, bbox[0] - pad),
            max(0, bbox[1] - pad),
            min(image.width, bbox[2] + pad),
            min(image.height, bbox[3] + pad),
        ))

    target_height = 170
    target_width = round(image.width * (target_height / image.height))
    image = image.resize((target_width, target_height), Image.Resampling.LANCZOS)
    LOGO_OUT.parent.mkdir(parents=True, exist_ok=True)
    image.save(LOGO_OUT)


def draw_rotated_rect(canvas: Image.Image, center: tuple[int, int], size: tuple[int, int], angle: float, fill: tuple[int, int, int, int]) -> None:
    layer = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    cx, cy = center
    w, h = size
    points = []
    for px, py in [(-w / 2, -h / 2), (w / 2, -h / 2), (w / 2, h / 2), (-w / 2, h / 2)]:
        radians = math.radians(angle)
        points.append((cx + px * math.cos(radians) - py * math.sin(radians), cy + px * math.sin(radians) + py * math.cos(radians)))
    draw.polygon(points, fill=fill)
    canvas.alpha_composite(layer)


def make_background() -> None:
    width, height = 1536, 960
    image = Image.new("RGBA", (width, height), (34, 24, 54, 255))
    draw = ImageDraw.Draw(image)

    for x in range(-40, width, 40):
        draw.line((x, 0, x + 210, height), fill=(255, 255, 255, 22), width=2)
    for x in range(0, width, 96):
        for y in range(0, height, 96):
            if (x // 96 + y // 96) % 3 == 0:
                draw.ellipse((x + 14, y + 14, x + 24, y + 24), fill=(255, 250, 226, 72))

    blobs = [
        ((-120, 95), 360, PINK),
        ((width - 180, -80), 340, CYAN),
        ((width - 245, height - 230), 390, LIME),
        ((120, height - 180), 310, PURPLE),
    ]
    for (cx, cy), radius, color in blobs:
        draw.ellipse((cx, cy, cx + radius, cy + radius), fill=(*color[:3], 220))

    for center, size, angle, color in [
        ((258, 210), (170, 44), -17, YELLOW),
        ((1110, 210), (210, 42), 19, PINK),
        ((640, 780), (260, 40), -8, CYAN),
        ((1220, 720), (190, 46), -25, ORANGE),
    ]:
        draw_rotated_rect(image, center, size, angle, color)

    for x, y, color in [(455, 128, LIME), (958, 590, YELLOW), (230, 720, CYAN), (1350, 360, PINK)]:
        draw.polygon([(x, y - 42), (x + 14, y - 12), (x + 45, y), (x + 14, y + 12), (x, y + 42), (x - 14, y + 12), (x - 45, y), (x - 14, y - 12)], fill=color, outline=INK)

    overlay = Image.new("RGBA", image.size, (0, 0, 0, 0))
    overlay_draw = ImageDraw.Draw(overlay)
    for y in range(0, height, 12):
        overlay_draw.line((0, y, width, y), fill=(255, 255, 255, 12), width=1)
    image = Image.alpha_composite(image, overlay)
    image.save(BG_OUT)


def main() -> None:
    BRAND_DIR.mkdir(parents=True, exist_ok=True)
    make_logo()
    make_background()


if __name__ == "__main__":
    main()
