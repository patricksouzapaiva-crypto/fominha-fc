# Recorta a bola gerada, remove o fundo preto (alpha por luminosidade no halo) e gera WebP 256/64.
from PIL import Image
import numpy as np, io, base64, sys
SRC = sys.argv[1]
im = np.asarray(Image.open(SRC).convert('RGB')).astype(np.float32)
H, W, _ = im.shape
cx, cy, RING = 639.5, 351.8, 314.0

def cut(rad, inner_edge, size, glow_gain=1.0):
    x0, y0 = int(round(cx - rad)), int(round(cy - rad)); S = int(2 * rad)
    can = np.zeros((S, S, 3), np.float32)
    sx0, sy0 = max(0, x0), max(0, y0); sx1, sy1 = min(W, x0 + S), min(H, y0 + S)
    can[sy0 - y0:sy1 - y0, sx0 - x0:sx1 - x0] = im[sy0:sy1, sx0:sx1]
    yy, xx = np.mgrid[0:S, 0:S]
    r = np.hypot(xx + 0.5 - rad, yy + 0.5 - rad)
    lum = can.max(-1)
    a_glow = np.clip((lum - 8) / 235 * glow_gain, 0, 1)            # halo sobre preto -> alpha por luminosidade
    a_ball = np.clip((inner_edge - r) / 3.0, 0, 1)                   # corpo da bola sempre opaco (inclui gomos pretos)
    a_out = np.clip((rad - 2 - r) / 10.0, 0, 1)                      # some suavemente antes da borda do quadrado
    a = np.maximum(a_ball, a_glow) * a_out
    rgb = np.where(a[..., None] > 0.02, np.clip(can / np.maximum(a[..., None], 1e-3), 0, 255), 0)  # despremultiplica
    rgb = np.where(a_ball[..., None] >= 1, can, rgb)
    out = Image.fromarray(np.dstack([rgb, a * 255]).astype(np.uint8), 'RGBA')
    out = out.convert('RGBa').resize((size, size), Image.LANCZOS).convert('RGBA')
    return out

logo = cut(372, RING + 2, 256)
icon = cut(326, RING + 4, 64, 1.0)
def webp(img, q):
    b = io.BytesIO(); img.save(b, 'WEBP', quality=q, method=6, alpha_quality=90); return b.getvalue()
for name, img, q in (('bola-256', logo, 82), ('bola-64', icon, 88)):
    img.save(f'assets/{name}.png', optimize=True)
    d = webp(img, q); open(f'assets/{name}.webp', 'wb').write(d)
    print(name, 'webp', len(d), 'png', len(open(f'assets/{name}.png', 'rb').read()))
open('src/ball-data.js', 'w').write(
  "const BALL_IMG = 'data:image/webp;base64,%s';\nconst BALL_ICON = 'data:image/webp;base64,%s';\n" % (
    base64.b64encode(open('assets/bola-256.webp', 'rb').read()).decode(), base64.b64encode(open('assets/bola-64.webp', 'rb').read()).decode()))
