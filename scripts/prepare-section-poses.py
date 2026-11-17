"""Deriva WebP transparentes de las tres poses nuevas, sin editar los PNG originales.

Requiere Pillow, numpy y opencv-python. Solo elimina negro conectado al borde;
no aplica una clave de color global que perforaría el cabello o el traje.
"""
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1]
poses = [(2, 'aranza_historia.webp'), (3, 'aranza_carta.webp'), (4, 'aranza_gustos.webp')]
for number, filename in poses:
    source = Image.open(root / 'aranza modelo' / f'aranza posicion {number}.png')
    image = source.convert('RGBA')
    if source.mode != 'RGBA':
        pixels = np.array(image)
        rgb = pixels[:, :, :3].astype(np.int16)
        # Cerrar las pequeñas aberturas del contorno antes de buscar el exterior:
        # el negro del cabello no debe comunicarse con el negro del fondo.
        support = (rgb.max(axis=2) > 8).astype(np.uint8)
        support = cv2.morphologyEx(support, cv2.MORPH_CLOSE, np.ones((13, 13), np.uint8))
        background_candidate = (1 - support).astype(np.uint8)
        _, labels = cv2.connectedComponents(background_candidate, connectivity=8)
        border_labels = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
        border_labels = border_labels[border_labels != 0]
        background = np.isin(labels, border_labels)
        alpha = np.where(background, 0, 255).astype(np.uint8)
        pixels[:, :, 3] = cv2.GaussianBlur(alpha, (3, 3), .45)
        # Se conserva intacto el color y la opacidad de todos los píxeles interiores.
        image = Image.fromarray(pixels)
    image.save(root / 'nightfall_assets' / filename, lossless=True, method=6)
    print(f'{filename}: {image.width} x {image.height}, RGBA, original intacto')
