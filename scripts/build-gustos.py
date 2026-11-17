"""Prepara la escena autónoma de gustos integrada en luz de la noche."""
import re, base64, io
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
A = str(ROOT / 'nightfall_assets') + '/'

def enc(img, q=84, m=4):
    b = io.BytesIO(); img.save(b, 'WEBP', quality=q, method=m)
    return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()

# 1) Imagen base con el borde del alpha suavizado (el recorte original sale dentado)
im = Image.open(A + 'aranza_gustos.webp').convert('RGBA')
r, g, b, a = im.split()
a = a.filter(ImageFilter.GaussianBlur(1.3)).point(lambda v: 0 if v < 70 else 255 if v > 175 else int((v - 70) * 255 / 105))
im = Image.merge('RGBA', (r, g, b, a))
pic = enc(im, 86, 6)

# 2) Complementos (corona + zapato) y párpados
comp = Path(A + 'complemento_posicion_4.svg').read_text(encoding='utf-8')
defs = re.search(r'<defs>(.*?)</defs>', comp, re.S).group(1)
body = comp[comp.find('</defs>') + 7:comp.rfind('</svg>')].replace('class="completion-seams"', 'id="seams" class="completion-seams"')
eyes = Path(A + 'parpados_posicion_4.svg').read_text(encoding='utf-8')
skin = re.search(r'<linearGradient id="p4-lid-skin".*?</linearGradient>', eyes, re.S).group(0)
out = ''; clips = ''
for i, m in enumerate(re.finditer(r'data-pivot="([\d.\- ]+)".*?class="pose-eye-socket" d="([^"]+)".*?class="pose-eye-lash" d="([^"]+)"', eyes, re.S)):
    x, y, ang = m.group(1).split(); d = m.group(2); l = m.group(3)
    clips += f'<clipPath id="c{i}"><path d="{d}"/></clipPath>'
    out += (f'<path d="{d}" fill="url(#p4-lid-skin)"/><g clip-path="url(#c{i})"><g transform="translate({x} {y}) rotate({ang})">'
            f'<g class="ap"><g transform="rotate({-float(ang)}) translate({-float(x)} {-float(y)})"><use href="#pic"/></g></g></g></g>'
            f'<path class="lash" d="{l}" fill="none" stroke="#291b29" stroke-width="1.9" stroke-linecap="round"/>')

# 3) Capas de pelo: zonas (px de la imagen 1024x1536), pivote (x, y), amplitud en grados, duración en s
ZONES = {
 'L': [(0,190),(305,190),(335,480),(300,590),(228,640),(214,1010),(214,1010),(0,900)],
 'R': [(775,230),(880,230),(1024,380),(1024,1010),(870,1010),(640,830),(700,640),(775,600)],
 'B': [(120,1010),(250,1010),(335,1100),(420,1250),(510,1330),(490,1470),(150,1470),(90,1250)],
}
PIV = {'L': (300,200,1.2,6.8), 'R': (790,260,1.0,7.9), 'B': (330,1010,1.7,5.9)}

def zmask(poly, blur=26):
    m = Image.new('L', (1024, 1536), 0); ImageDraw.Draw(m).polygon(poly, fill=255)
    return m.filter(ImageFilter.GaussianBlur(blur))

# Capa de "brillos": solo los píxeles saturados (facetas azules/rosas), aclarados
arr = np.array(im).astype(float); rgb = arr[..., :3] / 255
mx = rgb.max(2); mn = rgb.min(2); sat = (mx - mn) / (mx + 1e-6)
sh = np.clip((sat - .4) * 4, 0, 1) * np.clip((mx - .25) * 5, 0, 1)
bright = np.clip(rgb + (1 - rgb) * .35, 0, 1) * 255
shine = Image.fromarray(np.dstack([bright, sh * arr[..., 3]]).astype('uint8'), 'RGBA')

hair = ''
for k, poly in ZONES.items():
    m = zmask(poly); bx = m.point(lambda v: 255 if v > 2 else 0).getbbox()
    def lay(src):
        L = src.copy()
        al = np.array(L.split()[3]).astype(float) * np.array(m).astype(float) / 255
        L.putalpha(Image.fromarray(al.astype('uint8'))); return L.crop(bx)
    x0, y0, x1, y1 = bx; px, py, amp, dur = PIV[k]
    spl = 'calcMode="spline" keyTimes="0;.5;1" keySplines=".45 0 .55 1;.45 0 .55 1" repeatCount="indefinite"'
    hair += (f'<g><animateTransform attributeName="transform" type="rotate" values="{-amp} {px} {py};{amp} {px} {py};{-amp} {px} {py}" dur="{dur}s" {spl}/>'
             f'<g><animateTransform attributeName="transform" type="rotate" values="{amp*.35} {px} {py};{-amp*.35} {px} {py};{amp*.35} {px} {py}" dur="{dur/2.3:.2f}s" {spl}/>'
             f'<image href="{enc(lay(im))}" x="{x0}" y="{y0}" width="{x1-x0}" height="{y1-y0}"/>'
             f'<g mask="url(#sweep)"><image href="{enc(lay(shine))}" x="{x0}" y="{y0}" width="{x1-x0}" height="{y1-y0}" opacity=".9"/></g></g></g>')

html = ((ROOT / 'src/gustos/template.html').read_text(encoding='utf-8').replace('%%PIC%%', pic).replace('%%DEFS%%', defs + skin + clips)
        .replace('%%COMP%%', body).replace('%%EYES%%', out).replace('%%HAIR%%', hair))
output = ROOT / 'public/scenes/gustos.html'
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(html, encoding='utf-8')
print(f'public/scenes/gustos.html: {len(html.encode("utf-8"))/1e6:.2f} MB')
