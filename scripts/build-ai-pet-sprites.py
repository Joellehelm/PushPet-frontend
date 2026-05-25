from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "assets" / "pets"
CELL = 256
STAGES = ["egg", "baby", "adolescent", "adult"]
MOODS = ["idle", "happy", "hungry", "sleepy", "hyped", "sad", "sick"]
SOURCE_ROWS = {
    "idle": 0,
    "happy": 0,
    "hungry": 1,
    "sleepy": 2,
    "hyped": 3,
    "sad": 1,
    "sick": 2,
}
COLORS = {
    "blue": (111, 215, 255),
    "pink": (255, 143, 199),
    "green": (126, 227, 111),
    "purple": (173, 140, 255),
    "orange": (255, 173, 79),
    "white": (255, 247, 223),
}
SOURCES = {
    "goat_dragon": OUT / "source-goat-dragon-ai.png",
    "raccoon": OUT / "source-raccoon-ai.png",
    "star_axolotl": OUT / "source-star-axolotl-ai.png",
}
ACCESSORIES = ["ruby_crown", "javascript_shades", "typescript_visor", "python_wizard_hat", "rust_armor_accent", "go_jetpack", "caretaker_crown"]


def remove_green(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    px = rgba.load()
    width, height = rgba.size
    for y in range(height):
        for x in range(width):
            r, g, b, a = px[x, y]
            green_score = g - max(r, b)
            if g > 145 and green_score > 42:
                alpha = max(0, min(255, int((82 - green_score) * 4)))
                px[x, y] = (r, g, b, min(a, alpha))
            elif g > 115 and green_score > 22:
                alpha = max(0, min(255, int((green_score - 22) * 8)))
                px[x, y] = (r, g, b, min(a, 255 - alpha))
    return rgba


def largest_subject(image: Image.Image, keep_extra: bool = True) -> Image.Image:
    alpha = image.getchannel("A")
    width, height = image.size
    seen = bytearray(width * height)
    components: list[tuple[int, tuple[int, int, int, int], list[tuple[int, int]]]] = []
    pix = alpha.load()
    for y in range(height):
        for x in range(width):
            idx = y * width + x
            if seen[idx] or pix[x, y] < 45:
                continue
            seen[idx] = 1
            queue: deque[tuple[int, int]] = deque([(x, y)])
            points: list[tuple[int, int]] = []
            min_x = max_x = x
            min_y = max_y = y
            while queue:
                qx, qy = queue.popleft()
                points.append((qx, qy))
                min_x = min(min_x, qx)
                max_x = max(max_x, qx)
                min_y = min(min_y, qy)
                max_y = max(max_y, qy)
                for nx, ny in ((qx + 1, qy), (qx - 1, qy), (qx, qy + 1), (qx, qy - 1)):
                    if nx < 0 or ny < 0 or nx >= width or ny >= height:
                        continue
                    nidx = ny * width + nx
                    if seen[nidx] or pix[nx, ny] < 45:
                        continue
                    seen[nidx] = 1
                    queue.append((nx, ny))
            components.append((len(points), (min_x, min_y, max_x, max_y), points))

    if not components:
        return image

    components.sort(reverse=True, key=lambda item: item[0])
    if not keep_extra:
        cleaned = Image.new("RGBA", image.size, (0, 0, 0, 0))
        src = image.load()
        dst = cleaned.load()
        for x, y in components[0][2]:
            dst[x, y] = src[x, y]
        return cleaned

    main_size, main_box, _ = components[0]
    main_cx = (main_box[0] + main_box[2]) / 2
    main_cy = (main_box[1] + main_box[3]) / 2
    keep: list[list[tuple[int, int]]] = []
    for size, box, points in components:
        cx = (box[0] + box[2]) / 2
        cy = (box[1] + box[3]) / 2
        near_main = abs(cx - main_cx) < width * 0.42 and abs(cy - main_cy) < height * 0.48
        meaningful = size > max(260, main_size * 0.055)
        if size == main_size or (meaningful and near_main):
            keep.append(points)

    cleaned = Image.new("RGBA", image.size, (0, 0, 0, 0))
    src = image.load()
    dst = cleaned.load()
    for points in keep:
        for x, y in points:
            dst[x, y] = src[x, y]
    return cleaned


def extract_source_slots(source: Image.Image) -> dict[tuple[int, int], Image.Image]:
    """Extract whole creatures from the AI source sheet.

    The generated sheets are visually arranged in a 4x4 grid, but the art does
    not respect exact mathematical cell boundaries. Cropping by grid lines can
    slice horns, heads, tails, or gills. This pulls connected transparent
    components from the full sheet and then assigns each complete component to
    the nearest intended row/column.
    """
    rgba = remove_green(source)
    alpha = rgba.getchannel("A")
    width, height = rgba.size
    seen = bytearray(width * height)
    pix = alpha.load()
    slots: dict[tuple[int, int], tuple[int, Image.Image]] = {}

    for y in range(height):
        for x in range(width):
            idx = y * width + x
            if seen[idx] or pix[x, y] < 45:
                continue

            seen[idx] = 1
            queue: deque[tuple[int, int]] = deque([(x, y)])
            points: list[tuple[int, int]] = []
            min_x = max_x = x
            min_y = max_y = y

            while queue:
                qx, qy = queue.popleft()
                points.append((qx, qy))
                min_x = min(min_x, qx)
                max_x = max(max_x, qx)
                min_y = min(min_y, qy)
                max_y = max(max_y, qy)
                for nx, ny in ((qx + 1, qy), (qx - 1, qy), (qx, qy + 1), (qx, qy - 1)):
                    if nx < 0 or ny < 0 or nx >= width or ny >= height:
                        continue
                    nidx = ny * width + nx
                    if seen[nidx] or pix[nx, ny] < 45:
                        continue
                    seen[nidx] = 1
                    queue.append((nx, ny))

            area = len(points)
            box_w = max_x - min_x + 1
            box_h = max_y - min_y + 1
            if area < 900 or box_w < 24 or box_h < 24:
                continue

            cx = (min_x + max_x) / 2
            cy = (min_y + max_y) / 2
            col = min(3, max(0, int(cx / (width / 4))))
            row = min(3, max(0, int(cy / (height / 4))))

            pad = 14
            crop_box = (
                max(0, min_x - pad),
                max(0, min_y - pad),
                min(width, max_x + pad + 1),
                min(height, max_y + pad + 1),
            )
            component = Image.new("RGBA", (crop_box[2] - crop_box[0], crop_box[3] - crop_box[1]), (0, 0, 0, 0))
            src = rgba.load()
            dst = component.load()
            left, top = crop_box[0], crop_box[1]
            for px, py in points:
                dst[px - left, py - top] = src[px, py]

            current = slots.get((row, col))
            if current is None or area > current[0]:
                slots[(row, col)] = (area, component)

    return {slot: image for slot, (_, image) in slots.items()}


def fit_to_cell(sprite: Image.Image, stage: str) -> Image.Image:
    bbox = sprite.getbbox()
    out = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    if not bbox:
        return out
    cropped = sprite.crop(bbox)
    max_w = 218 if stage == "egg" else 232
    max_h = 222 if stage == "egg" else 226
    scale = min(max_w / cropped.width, max_h / cropped.height)
    resized = cropped.resize((max(1, round(cropped.width * scale)), max(1, round(cropped.height * scale))), Image.Resampling.LANCZOS)
    x = (CELL - resized.width) // 2
    y = CELL - resized.height - (18 if stage == "egg" else 12)
    out.alpha_composite(resized, (x, max(4, y)))
    return out


def tint(sprite: Image.Image, target: tuple[int, int, int], mood: str) -> Image.Image:
    rgba = sprite.convert("RGBA")
    px = rgba.load()
    tr, tg, tb = target
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            lum = (r * 0.299 + g * 0.587 + b * 0.114)
            saturation = max(r, g, b) - min(r, g, b)
            if 42 < lum < 236 and saturation > 16:
                amount = 0.28 if target == COLORS["white"] else 0.42
                r = round(r * (1 - amount) + tr * amount)
                g = round(g * (1 - amount) + tg * amount)
                b = round(b * (1 - amount) + tb * amount)
            if mood == "sick":
                r = round(r * 0.74 + 150 * 0.26)
                g = round(g * 0.8 + 205 * 0.2)
                b = round(b * 0.74 + 170 * 0.26)
            elif mood == "sad":
                r = round(r * 0.82 + 150 * 0.18)
                g = round(g * 0.84 + 170 * 0.16)
                b = round(b * 0.92 + 225 * 0.08)
            px[x, y] = (r, g, b, a)
    if mood == "sick":
        rgba = ImageEnhance.Color(rgba).enhance(0.72)
    elif mood == "sad":
        rgba = ImageEnhance.Color(rgba).enhance(0.86)
    return rgba


def build_base_sheet(species: str) -> dict[tuple[str, str], Image.Image]:
    source = Image.open(SOURCES[species])
    slots = extract_source_slots(source)
    extracted: dict[tuple[str, str], Image.Image] = {}
    for mood in MOODS:
        source_row = SOURCE_ROWS[mood]
        for stage_index, stage in enumerate(STAGES):
            sprite = slots.get((source_row, stage_index))
            if sprite is None:
                raise RuntimeError(f"Missing source sprite for {species} row {source_row} stage {stage}")
            extracted[(mood, stage)] = fit_to_cell(sprite, stage)

    sheet = Image.new("RGBA", (CELL * len(STAGES), CELL * len(COLORS) * len(MOODS)), (0, 0, 0, 0))
    for color_index, (color_name, target) in enumerate(COLORS.items()):
        for mood_index, mood in enumerate(MOODS):
            for stage_index, stage in enumerate(STAGES):
                sprite = tint(extracted[(mood, stage)], target, mood)
                sheet.alpha_composite(sprite, (stage_index * CELL, (color_index * len(MOODS) + mood_index) * CELL))
    sheet.save(OUT / f"{species}-base.png")
    return extracted


def sprite_bbox(sprite: Image.Image) -> tuple[int, int, int, int]:
    bbox = sprite.getbbox()
    if not bbox:
        return (64, 64, 192, 192)
    return bbox


def anchors_for(sprite: Image.Image, mood: str, stage: str, species: str) -> dict[str, tuple[float, float, float]]:
    left, top, right, bottom = sprite_bbox(sprite)
    width = right - left
    height = bottom - top
    center_x = left + width * 0.5

    if mood in {"sleepy", "sick"}:
        face_x = left + width * (0.36 if species != "star_axolotl" else 0.4)
        face_y = top + height * (0.34 if species != "raccoon" else 0.32)
        head_x = face_x
        head_y = top + height * 0.12
    elif mood in {"hungry", "sad"}:
        face_x = left + width * 0.46
        face_y = top + height * 0.43
        head_x = face_x
        head_y = top + height * 0.13
    else:
        face_x = center_x
        face_y = top + height * (0.42 if species != "star_axolotl" else 0.39)
        head_x = center_x
        head_y = top + height * 0.08

    if species == "star_axolotl":
        face_y += height * 0.03
        head_y += height * 0.04
    if species == "raccoon" and stage == "baby":
        face_y += height * 0.04

    body_x = center_x
    body_y = top + height * 0.62
    back_x = right - width * 0.12
    back_y = top + height * 0.56
    scale = max(0.72, min(1.2, width / 176))

    return {
        "head": (head_x, head_y, scale),
        "face": (face_x, face_y, scale),
        "body": (body_x, body_y, scale),
        "back": (back_x, back_y, scale),
    }


def cell_at(sheet: Image.Image, col: int, row: int) -> Image.Image:
    return sheet.crop((col * CELL, row * CELL, (col + 1) * CELL, (row + 1) * CELL))


def paste_cell(sheet: Image.Image, cell: Image.Image, col: int, row: int) -> None:
    sheet.paste(cell, (col * CELL, row * CELL))


def rotate_subject(cell: Image.Image, angle: float, shift: tuple[int, int] = (0, 0)) -> Image.Image:
    bbox = cell.getchannel("A").getbbox()
    if not bbox:
        return cell

    pad = 18
    padded_box = (
        max(0, bbox[0] - pad),
        max(0, bbox[1] - pad),
        min(CELL, bbox[2] + pad),
        min(CELL, bbox[3] + pad),
    )
    crop = cell.crop(padded_box)
    center_x = (bbox[0] + bbox[2]) / 2
    center_y = (bbox[1] + bbox[3]) / 2
    rotated = crop.rotate(angle, resample=Image.Resampling.BICUBIC, expand=True)
    out = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    x = round(center_x - rotated.width / 2 + shift[0])
    y = round(center_y - rotated.height / 2 + shift[1])
    out.alpha_composite(rotated, (x, y))
    return out


def offset_mask(mask: Image.Image, dx: int, dy: int) -> Image.Image:
    out = Image.new("L", mask.size, 0)
    src_box = (
        max(0, -dx),
        max(0, -dy),
        min(mask.width, mask.width - dx),
        min(mask.height, mask.height - dy),
    )
    if src_box[0] >= src_box[2] or src_box[1] >= src_box[3]:
        return out
    out.paste(mask.crop(src_box), (max(0, dx), max(0, dy)))
    return out


def add_raster_polish(cell: Image.Image) -> Image.Image:
    alpha = cell.getchannel("A")
    bbox = alpha.getbbox()
    if bbox is None:
        return cell

    shadow_alpha = offset_mask(alpha, 2, 3).filter(ImageFilter.GaussianBlur(1.4))
    shadow = Image.new("RGBA", (CELL, CELL), (28, 20, 44, 88))
    shadow.putalpha(shadow_alpha)
    out = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    out.alpha_composite(shadow)
    out.alpha_composite(cell)

    sheen = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    sheen_draw = ImageDraw.Draw(sheen)
    left, top, right, bottom = bbox
    sheen_draw.line((left + 6, top + 7, right - 8, top + 1), fill=(255, 255, 255, 46), width=3)
    if bottom - top > 28:
        sheen_draw.line((left + 10, top + 18, right - 12, top + 12), fill=(255, 255, 255, 28), width=2)
    sheen.putalpha(Image.composite(sheen.getchannel("A"), Image.new("L", (CELL, CELL), 0), alpha))
    out = Image.alpha_composite(out, sheen)
    out.putalpha(Image.alpha_composite(cell, shadow).getchannel("A"))
    return out


def polish_accessory_sheet(sheet: Image.Image, species: str) -> Image.Image:
    polished = Image.new("RGBA", sheet.size, (0, 0, 0, 0))
    for accessory_index, accessory in enumerate(ACCESSORIES):
        for mood_index, mood in enumerate(MOODS):
            row = accessory_index * len(MOODS) + mood_index
            for col, stage in enumerate(STAGES):
                cell = cell_at(sheet, col, row)
                if stage == "egg" or cell.getchannel("A").getbbox() is None:
                    paste_cell(polished, cell, col, row)
                    continue

                rotate = 0.0
                shift = (0, 0)
                if accessory in {"ruby_crown", "caretaker_crown"}:
                    if mood in {"sleepy", "sick"}:
                        rotate = -13 if species == "goat_dragon" else -9
                        shift = (-4, 4)
                    elif mood in {"hungry", "sad"}:
                        rotate = -5
                        shift = (-1, 2)
                    elif mood == "hyped":
                        rotate = 4
                        shift = (0, -2)
                elif accessory == "python_wizard_hat" and mood in {"sleepy", "sick"}:
                    rotate = -9 if species != "star_axolotl" else -5
                    shift = (-3, 8)
                elif accessory in {"javascript_shades", "typescript_visor"} and mood in {"sleepy", "sick"}:
                    rotate = -5 if species == "goat_dragon" else -3
                    shift = (-2, 1)

                if rotate:
                    cell = rotate_subject(cell, rotate, shift)
                cell = add_raster_polish(cell)
                paste_cell(polished, cell, col, row)
    return polished


def draw_accessories(species: str, extracted: dict[tuple[str, str], Image.Image]) -> None:
    from PIL import ImageDraw

    sheet = Image.new("RGBA", (CELL * len(STAGES), CELL * len(ACCESSORIES) * len(MOODS)), (0, 0, 0, 0))
    draw = ImageDraw.Draw(sheet)
    ink = (36, 22, 51, 255)
    for accessory_index, accessory in enumerate(ACCESSORIES):
        for mood_index, mood in enumerate(MOODS):
            row = accessory_index * len(MOODS) + mood_index
            for col, stage in enumerate(STAGES):
                if stage == "egg":
                    continue
                sprite = extracted[(mood, stage)]
                anchor = anchors_for(sprite, mood, stage, species)
                ox = col * CELL
                oy = row * CELL
                head_x, head_y, scale = anchor["head"]
                face_x, face_y, face_scale = anchor["face"]
                body_x, body_y, body_scale = anchor["body"]
                back_x, back_y, back_scale = anchor["back"]
                crown_y = head_y - 8 * scale
                crown_w = 72 * scale
                crown_h = 42 * scale
                crown_y = max(crown_h * 0.62 + 16, min(crown_y, CELL - crown_h * 0.78 - 14))
                if accessory == "ruby_crown":
                    pts = [
                        (ox + head_x - crown_w * 0.5, oy + crown_y + crown_h * 0.42),
                        (ox + head_x - crown_w * 0.34, oy + crown_y - crown_h * 0.18),
                        (ox + head_x - crown_w * 0.12, oy + crown_y + crown_h * 0.26),
                        (ox + head_x, oy + crown_y - crown_h * 0.35),
                        (ox + head_x + crown_w * 0.12, oy + crown_y + crown_h * 0.26),
                        (ox + head_x + crown_w * 0.34, oy + crown_y - crown_h * 0.18),
                        (ox + head_x + crown_w * 0.5, oy + crown_y + crown_h * 0.42),
                    ]
                    draw.line(pts, fill=ink, width=14, joint="curve")
                    draw.line(pts, fill=(227, 49, 93, 255), width=8, joint="curve")
                    draw.rounded_rectangle((ox + head_x - crown_w * 0.48, oy + crown_y + crown_h * 0.34, ox + head_x + crown_w * 0.48, oy + crown_y + crown_h * 0.68), radius=6, fill=(227, 49, 93, 255), outline=ink, width=5)
                    draw.line((ox + head_x - crown_w * 0.36, oy + crown_y + crown_h * 0.43, ox + head_x + crown_w * 0.34, oy + crown_y + crown_h * 0.43), fill=(255, 156, 188, 255), width=3)
                    for jewel_x, jewel_y, jewel_color in (
                        (-0.29, 0.49, (255, 226, 63, 255)),
                        (0, 0.46, (164, 255, 77, 255)),
                        (0.29, 0.49, (116, 221, 255, 255)),
                    ):
                        draw.ellipse(
                            (
                                ox + head_x + crown_w * jewel_x - 4 * scale,
                                oy + crown_y + crown_h * jewel_y - 4 * scale,
                                ox + head_x + crown_w * jewel_x + 4 * scale,
                                oy + crown_y + crown_h * jewel_y + 4 * scale,
                            ),
                            fill=jewel_color,
                            outline=ink,
                            width=2,
                        )
                elif accessory == "caretaker_crown":
                    pts = [
                        (ox + head_x - crown_w * 0.55, oy + crown_y + crown_h * 0.48),
                        (ox + head_x - crown_w * 0.36, oy + crown_y - crown_h * 0.2),
                        (ox + head_x - crown_w * 0.12, oy + crown_y + crown_h * 0.25),
                        (ox + head_x, oy + crown_y - crown_h * 0.42),
                        (ox + head_x + crown_w * 0.12, oy + crown_y + crown_h * 0.25),
                        (ox + head_x + crown_w * 0.36, oy + crown_y - crown_h * 0.2),
                        (ox + head_x + crown_w * 0.55, oy + crown_y + crown_h * 0.48),
                    ]
                    draw.line(pts, fill=ink, width=15, joint="curve")
                    draw.line(pts, fill=(255, 225, 86, 255), width=9, joint="curve")
                    draw.rounded_rectangle((ox + head_x - crown_w * 0.52, oy + crown_y + crown_h * 0.38, ox + head_x + crown_w * 0.52, oy + crown_y + crown_h * 0.74), radius=7, fill=(255, 225, 86, 255), outline=ink, width=5)
                    draw.line((ox + head_x - crown_w * 0.4, oy + crown_y + crown_h * 0.47, ox + head_x + crown_w * 0.42, oy + crown_y + crown_h * 0.47), fill=(255, 250, 176, 255), width=4)
                    for jewel_x, jewel_color in ((-0.3, (255, 79, 176, 255)), (0, (0, 230, 242, 255)), (0.3, (124, 77, 255, 255))):
                        draw.ellipse(
                            (
                                ox + head_x + crown_w * jewel_x - 4 * scale,
                                oy + crown_y + crown_h * 0.57 - 4 * scale,
                                ox + head_x + crown_w * jewel_x + 4 * scale,
                                oy + crown_y + crown_h * 0.57 + 4 * scale,
                            ),
                            fill=jewel_color,
                            outline=ink,
                            width=2,
                        )
                elif accessory == "javascript_shades":
                    lens_w = 34 * face_scale
                    lens_h = 24 * face_scale
                    gap = 7 * face_scale
                    face_y = max(lens_h * 0.5 + 6, min(face_y, CELL - lens_h * 0.5 - 6))
                    face_x = max(lens_w + gap + 6, min(face_x, CELL - lens_w - gap - 6))
                    draw.rounded_rectangle((ox + face_x - lens_w - gap, oy + face_y - lens_h * 0.5, ox + face_x - gap, oy + face_y + lens_h * 0.5), radius=8, fill=(255, 225, 86, 235), outline=ink, width=5)
                    draw.rounded_rectangle((ox + face_x + gap, oy + face_y - lens_h * 0.5, ox + face_x + lens_w + gap, oy + face_y + lens_h * 0.5), radius=8, fill=(255, 225, 86, 235), outline=ink, width=5)
                    draw.line((ox + face_x - gap, oy + face_y, ox + face_x + gap, oy + face_y), fill=ink, width=5)
                    draw.line((ox + face_x - lens_w - gap + 6 * face_scale, oy + face_y - lens_h * 0.18, ox + face_x - gap - 7 * face_scale, oy + face_y - lens_h * 0.18), fill=(255, 250, 178, 255), width=3)
                    draw.line((ox + face_x + gap + 6 * face_scale, oy + face_y - lens_h * 0.18, ox + face_x + lens_w + gap - 7 * face_scale, oy + face_y - lens_h * 0.18), fill=(255, 250, 178, 255), width=3)
                    draw.line((ox + face_x - lens_w - gap, oy + face_y + lens_h * 0.22, ox + face_x - gap, oy + face_y + lens_h * 0.22), fill=(126, 83, 27, 115), width=4)
                    draw.line((ox + face_x + gap, oy + face_y + lens_h * 0.22, ox + face_x + lens_w + gap, oy + face_y + lens_h * 0.22), fill=(126, 83, 27, 115), width=4)
                elif accessory == "typescript_visor":
                    visor_w = 92 * face_scale
                    visor_h = 34 * face_scale
                    face_y = max(visor_h * 0.5 + 6, min(face_y, CELL - visor_h * 0.5 - 6))
                    face_x = max(visor_w * 0.5 + 6, min(face_x, CELL - visor_w * 0.5 - 6))
                    draw.rounded_rectangle((ox + face_x - visor_w * 0.5, oy + face_y - visor_h * 0.5, ox + face_x + visor_w * 0.5, oy + face_y + visor_h * 0.5), radius=13, fill=(47, 120, 255, 225), outline=ink, width=5)
                    draw.rounded_rectangle((ox + face_x - visor_w * 0.42, oy + face_y - visor_h * 0.34, ox + face_x + visor_w * 0.42, oy + face_y + visor_h * 0.08), radius=9, fill=(92, 204, 255, 118))
                    draw.line((ox + face_x - visor_w * 0.34, oy + face_y - visor_h * 0.13, ox + face_x, oy + face_y - visor_h * 0.28, ox + face_x + visor_w * 0.34, oy + face_y - visor_h * 0.13), fill=(189, 233, 255, 245), width=5)
                    for bolt_x in (-0.42, 0.42):
                        draw.ellipse(
                            (
                                ox + face_x + visor_w * bolt_x - 3 * face_scale,
                                oy + face_y - 3 * face_scale,
                                ox + face_x + visor_w * bolt_x + 3 * face_scale,
                                oy + face_y + 3 * face_scale,
                            ),
                            fill=(255, 226, 63, 255),
                            outline=ink,
                            width=1,
                        )
                elif accessory == "python_wizard_hat":
                    hat_w = 82 * scale
                    hat_h = 70 * scale
                    hat_top = head_y - hat_h * 0.72
                    hat_bottom = head_y + hat_h * 0.46
                    if hat_top < 6:
                        head_y += 6 - hat_top
                    if hat_bottom > CELL - 6:
                        head_y -= hat_bottom - (CELL - 6)
                    draw.polygon([(ox + head_x - hat_w * 0.28, oy + head_y + hat_h * 0.26), (ox + head_x + hat_w * 0.04, oy + head_y - hat_h * 0.72), (ox + head_x + hat_w * 0.34, oy + head_y + hat_h * 0.28)], fill=(125, 108, 255, 255), outline=ink)
                    draw.line([(ox + head_x - hat_w * 0.28, oy + head_y + hat_h * 0.26), (ox + head_x + hat_w * 0.04, oy + head_y - hat_h * 0.72), (ox + head_x + hat_w * 0.34, oy + head_y + hat_h * 0.28), (ox + head_x - hat_w * 0.28, oy + head_y + hat_h * 0.26)], fill=ink, width=5)
                    draw.ellipse((ox + head_x - hat_w * 0.48, oy + head_y + hat_h * 0.16, ox + head_x + hat_w * 0.52, oy + head_y + hat_h * 0.46), fill=(90, 79, 207, 255), outline=ink, width=5)
                    draw.ellipse((ox + head_x, oy + head_y - hat_h * 0.48, ox + head_x + 10 * scale, oy + head_y - hat_h * 0.36), fill=(255, 225, 86, 255), outline=ink, width=3)
                    draw.line((ox + head_x - hat_w * 0.12, oy + head_y + hat_h * 0.05, ox + head_x + hat_w * 0.22, oy + head_y + hat_h * 0.22), fill=(255, 226, 63, 255), width=4)
                    draw.line((ox + head_x - hat_w * 0.05, oy + head_y - hat_h * 0.36, ox + head_x + hat_w * 0.06, oy + head_y - hat_h * 0.29), fill=(255, 245, 160, 255), width=3)
                    draw.line((ox + head_x + hat_w * 0.01, oy + head_y - hat_h * 0.41, ox + head_x, oy + head_y - hat_h * 0.24), fill=(255, 245, 160, 255), width=2)
                elif accessory == "rust_armor_accent" and stage != "baby":
                    armor_w = 70 * body_scale
                    armor_h = 62 * body_scale
                    draw.polygon([(ox + body_x - armor_w * 0.5, oy + body_y - armor_h * 0.35), (ox + body_x, oy + body_y - armor_h * 0.65), (ox + body_x + armor_w * 0.5, oy + body_y - armor_h * 0.35), (ox + body_x + armor_w * 0.36, oy + body_y + armor_h * 0.45), (ox + body_x - armor_w * 0.36, oy + body_y + armor_h * 0.45)], fill=(197, 99, 50, 220), outline=ink)
                    draw.line((ox + body_x, oy + body_y - armor_h * 0.55, ox + body_x, oy + body_y + armor_h * 0.38), fill=(255, 191, 122, 255), width=5)
                    draw.line((ox + body_x - armor_w * 0.28, oy + body_y - armor_h * 0.08, ox + body_x + armor_w * 0.28, oy + body_y - armor_h * 0.08), fill=(255, 191, 122, 255), width=5)
                    draw.line((ox + body_x - armor_w * 0.32, oy + body_y - armor_h * 0.27, ox + body_x - armor_w * 0.06, oy + body_y - armor_h * 0.42), fill=(255, 207, 158, 220), width=4)
                    for rivet_x in (-0.29, 0.29):
                        draw.ellipse(
                            (
                                ox + body_x + armor_w * rivet_x - 3 * body_scale,
                                oy + body_y + armor_h * 0.18 - 3 * body_scale,
                                ox + body_x + armor_w * rivet_x + 3 * body_scale,
                                oy + body_y + armor_h * 0.18 + 3 * body_scale,
                            ),
                            fill=(255, 226, 63, 255),
                            outline=ink,
                            width=1,
                        )
                elif accessory == "go_jetpack" and stage != "baby":
                    pack_h = 56 * back_scale
                    pack_w = 18 * back_scale
                    gap = 9 * back_scale
                    x = min(CELL - pack_w - gap - 13 * back_scale, max(pack_w + gap + 13 * back_scale, back_x - 4 * back_scale))
                    y = back_y - pack_h * 0.45
                    y = max(8, min(y, CELL - pack_h - 34 * back_scale - 12))
                    draw.rounded_rectangle((ox + x - pack_w - gap, oy + y, ox + x - gap, oy + y + pack_h), radius=6, fill=(71, 199, 255, 230), outline=ink, width=5)
                    draw.rounded_rectangle((ox + x + gap, oy + y, ox + x + pack_w + gap, oy + y + pack_h), radius=6, fill=(71, 199, 255, 230), outline=ink, width=5)
                    draw.polygon([(ox + x - pack_w - gap + 1, oy + y + pack_h), (ox + x - gap - pack_w * 0.5, oy + y + pack_h + 26 * back_scale), (ox + x - gap - 1, oy + y + pack_h)], fill=(255, 139, 43, 245))
                    draw.polygon([(ox + x + gap + 1, oy + y + pack_h), (ox + x + gap + pack_w * 0.5, oy + y + pack_h + 26 * back_scale), (ox + x + gap + pack_w - 1, oy + y + pack_h)], fill=(255, 139, 43, 245))
                    draw.line((ox + x - pack_w - gap + 5 * back_scale, oy + y + 8 * back_scale, ox + x - gap - 5 * back_scale, oy + y + 8 * back_scale), fill=(195, 245, 255, 255), width=3)
                    draw.line((ox + x + gap + 5 * back_scale, oy + y + 8 * back_scale, ox + x + pack_w + gap - 5 * back_scale, oy + y + 8 * back_scale), fill=(195, 245, 255, 255), width=3)
                    draw.line((ox + x - gap, oy + y + pack_h * 0.22, ox + x + gap, oy + y + pack_h * 0.22), fill=ink, width=4)
                    draw.polygon([(ox + x - gap - pack_w * 0.5, oy + y + pack_h + 8 * back_scale), (ox + x - gap - pack_w * 0.5 - 5 * back_scale, oy + y + pack_h + 20 * back_scale), (ox + x - gap - pack_w * 0.5 + 5 * back_scale, oy + y + pack_h + 20 * back_scale)], fill=(255, 226, 63, 230))
                    draw.polygon([(ox + x + gap + pack_w * 0.5, oy + y + pack_h + 8 * back_scale), (ox + x + gap + pack_w * 0.5 - 5 * back_scale, oy + y + pack_h + 20 * back_scale), (ox + x + gap + pack_w * 0.5 + 5 * back_scale, oy + y + pack_h + 20 * back_scale)], fill=(255, 226, 63, 230))
    sheet = polish_accessory_sheet(sheet, species)
    sheet.save(OUT / f"{species}-accessories.png")


def main() -> None:
    for species in SOURCES:
        extracted = build_base_sheet(species)
        draw_accessories(species, extracted)


if __name__ == "__main__":
    main()
