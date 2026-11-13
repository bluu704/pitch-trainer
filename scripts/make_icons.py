"""Generate Android launcher icons, notification icon and splash screens for Pitch Trainer."""
import os, sys
from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(__file__), '..', 'android', 'app', 'src', 'main', 'res')
ORANGE = (255, 150, 0, 255)
WHITE = (255, 255, 255, 255)

def note(size, color, scale=1.0, bg=None, radius=0, circle=False):
    S = size * 4
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if bg:
        if circle: d.ellipse([0, 0, S - 1, S - 1], fill=bg)
        else: d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(radius * S), fill=bg)
    u = S * scale / 512.0
    ox = S / 2 - 256 * u
    P = lambda x, y: (ox + x * u, ox + y * u)
    w = int(34 * u)
    # stem + flag
    d.line([P(286, 132), P(286, 338)], fill=color, width=w)
    d.line([P(286, 132), P(374, 170)], fill=color, width=w)
    for (x, y) in [(286, 132), (286, 338), (374, 170)]:
        cx, cy = P(x, y); d.ellipse([cx - w / 2, cy - w / 2, cx + w / 2, cy + w / 2], fill=color)
    # note head (rotated ellipse)
    head = Image.new('RGBA', (int(140 * u), int(110 * u)), (0, 0, 0, 0))
    ImageDraw.Draw(head).ellipse([0, 0, head.width - 1, head.height - 1], fill=color)
    head = head.rotate(18, expand=True, resample=Image.BICUBIC)
    cx, cy = P(240, 344)
    im.alpha_composite(head, (int(cx - head.width / 2), int(cy - head.height / 2)))
    return im.resize((size, size), Image.LANCZOS)

DENS = {'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
for k, f in DENS.items():
    dirn = os.path.join(ROOT, 'mipmap-' + k)
    os.makedirs(dirn, exist_ok=True)
    s = int(48 * f)
    note(s, WHITE, 0.82, ORANGE, 0.22).save(os.path.join(dirn, 'ic_launcher.png'))
    note(s, WHITE, 0.82, ORANGE, circle=True).save(os.path.join(dirn, 'ic_launcher_round.png'))
    note(int(108 * f), WHITE, 0.5).save(os.path.join(dirn, 'ic_launcher_foreground.png'))
    dd = os.path.join(ROOT, 'drawable-' + k)
    os.makedirs(dd, exist_ok=True)
    note(int(24 * f), WHITE, 1.0).save(os.path.join(dd, 'ic_stat_note.png'))

# splash screens: orange with a centered white note
for name in os.listdir(ROOT):
    if name.startswith('drawable') and os.path.exists(os.path.join(ROOT, name, 'splash.png')):
        p = os.path.join(ROOT, name, 'splash.png')
        w, h = Image.open(p).size
        sp = Image.new('RGBA', (w, h), ORANGE)
        n = note(int(min(w, h) * 0.45), WHITE, 1.0)
        sp.alpha_composite(n, ((w - n.width) // 2, (h - n.height) // 2))
        sp.convert('RGB').save(p)

with open(os.path.join(ROOT, 'values', 'ic_launcher_background.xml'), 'w') as fh:
    fh.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#FF9600</color>\n</resources>\n')
# drop the default vector foreground so the PNG is used
v = os.path.join(ROOT, 'drawable-v24', 'ic_launcher_foreground.xml')
if os.path.exists(v): os.remove(v)
print('icons ok')
