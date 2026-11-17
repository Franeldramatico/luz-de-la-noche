"""Crea una capa RGBA con un contorno trazado para esta ilustración.

Requiere Pillow. Ejecutar desde la raíz del proyecto. El original no se modifica.
Se conserva el interior completo del personaje: una segmentación por color
confundiría el cabello oscuro con el grafismo negro del fondo.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

assets = Path(__file__).resolve().parents[1] / 'nightfall_assets'
source = Image.open(assets / 'escenario_sin_menu.webp').convert('RGBA')
outline = [
    (543, 0), (785, 0), (750, 40), (705, 90), (670, 150), (653, 220),
    (634, 284), (625, 350), (620, 412), (620, 470), (602, 503),
    (600, 520), (612, 553), (613, 576), (606, 598), (626, 620),
    (648, 636), (646, 652), (635, 666), (651, 685), (669, 699),
    (674, 724), (668, 743), (657, 758), (671, 789), (663, 813),
    (684, 829), (710, 844), (738, 852), (761, 873), (775, 894),
    (770, 920), (756, 941), (150, 941), (109, 925), (83, 905),
    (60, 884), (49, 864), (28, 838), (21, 818), (28, 800),
    (22, 773), (29, 749), (47, 736), (35, 718), (23, 699),
    (21, 683), (31, 669), (47, 672), (49, 649), (41, 632),
    (36, 611), (40, 594), (51, 582), (59, 583), (61, 572),
    (73, 568), (86, 567), (105, 575), (111, 579), (126, 550),
    (132, 531), (137, 520), (141, 505), (157, 500), (170, 507),
    (182, 507), (183, 489), (191, 475), (194, 458), (203, 441),
    (211, 420), (229, 404), (248, 394), (276, 389), (300, 396),
    (324, 406), (345, 415), (367, 413), (389, 401), (398, 380),
    (415, 351), (436, 340), (442, 310), (439, 281), (419, 265),
    (393, 238), (371, 218), (353, 210), (330, 209), (341, 195),
    (356, 183), (371, 174), (393, 182), (414, 194), (435, 212),
    (451, 228), (450, 203), (457, 182), (461, 168), (460, 142),
    (465, 115), (473, 90), (488, 76), (503, 69), (514, 80),
    (527, 99), (535, 124), (544, 88), (541, 58), (540, 32),
]
holes = [
    [(485, 104), (499, 89), (510, 111), (517, 131), (507, 159), (481, 179), (478, 142)],
    [(357, 194), (377, 190), (401, 208), (424, 239), (433, 275), (413, 261), (389, 229)],
]
mask = Image.new('L', (source.width * 2, source.height * 2))
draw = ImageDraw.Draw(mask)
draw.polygon([(x * 2, y * 2) for x, y in outline], fill=255)
for hole in holes:
    draw.polygon([(x * 2, y * 2) for x, y in hole], fill=0)
mask = mask.filter(ImageFilter.GaussianBlur(.6)).resize(source.size, Image.Resampling.LANCZOS)
source.putalpha(mask)
source.save(assets / 'aranza_recortada.png', optimize=True)
source.save(assets / 'aranza_recortada.webp', lossless=True, method=6)
print('Creados recortes PNG y WebP RGBA con contorno trazado (original intacto).')
