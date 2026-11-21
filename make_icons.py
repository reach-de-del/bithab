import sys, math
from PIL import Image, ImageDraw, ImageFilter
out = sys.argv[1]
S = 1024; SS = 2  # supersample

def gradient(size):
    img = Image.new("RGB", (size, size))
    px = img.load()
    c1, c2 = (16, 185, 129), (5, 107, 74)   # emerald -> deep green
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size)
            px[x, y] = tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))
    return img

def star(d, cx, cy, r, fill):
    pts = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        rr = r if i % 2 == 0 else r * 0.45
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    d.polygon(pts, fill=fill)

def glyph(size, color_check=(255, 255, 255, 255), color_star=(255, 205, 60, 255), scale=1.0):
    """Check mark in a ring + XP star, centred, drawn on transparent canvas."""
    n = size * SS
    im = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    c = n / 2
    R = n * 0.30 * scale
    w = int(n * 0.065 * scale)
    d.ellipse([c - R, c - R, c + R, c + R], outline=color_check, width=w)
    # check mark
    p = [(c - R * 0.40, c + R * 0.02), (c - R * 0.10, c + R * 0.34), (c + R * 0.44, c - R * 0.30)]
    d.line(p, fill=color_check, width=int(w * 1.25), joint="curve")
    for (x, y) in (p[0], p[2]):
        r = w * 0.62
        d.ellipse([x - r, y - r, x + r, y + r], fill=color_check)
    # XP star top-right
    star(d, c + R * 1.02, c - R * 1.02, R * 0.36, color_star)
    return im.resize((size, size), Image.LANCZOS)

bg = gradient(S)
# icon.png (opaque, full-bleed)
icon = bg.convert("RGBA")
icon.alpha_composite(glyph(S))
icon.convert("RGB").save(f"{out}/icon.png")
# splash (transparent glyph, coloured check so it shows on light bg)
glyph(S, color_check=(16, 150, 105, 255), scale=1.0).save(f"{out}/splash-icon.png")
# android adaptive: foreground in safe zone (66%), separate background
glyph(S, scale=0.78).save(f"{out}/android-icon-foreground.png")
bg.save(f"{out}/android-icon-background.png")
glyph(S, color_check=(255, 255, 255, 255), color_star=(255, 255, 255, 255), scale=0.78).save(f"{out}/android-icon-monochrome.png")
# favicon
icon.resize((48, 48), Image.LANCZOS).convert("RGB").save(f"{out}/favicon.png")
print("ok")
