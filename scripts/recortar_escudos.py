"""Recorta los 13 escudos de diseño/escudos-original.png a public/escudos/<id>.png con fondo transparente.

Uso: python -I scripts/recortar_escudos.py  (desde la raíz del repo). Requiere Pillow.
"""
from pathlib import Path
from PIL import Image, ImageDraw

RAIZ = Path(__file__).resolve().parent.parent
ORIGEN = RAIZ / "diseño" / "escudos-original.png"
DESTINO = RAIZ / "public" / "escudos"

COLS = [(22, 278), (297, 551), (571, 824), (844, 1101)]
FILAS = [(166, 414), (488, 728), (806, 1032)]
ORDEN = [
    ["cosme", "leon", "juventud", "clan"],
    ["racing", "san-vicente", "pinamar", "arena"],
    ["nuevo-amanecer", "valeria", "villa-gesell", "san-lorenzo"],
]
EXTRA = {"leon": (297, 166, 551, 398), "golf": (436, 1122, 690, 1334)}
LADO = 256


def limpiar(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    w, h = im.size
    marca = (255, 0, 255, 255)
    for x in range(0, w, 4):
        for y in (0, h - 1):
            if sum(im.getpixel((x, y))[:3]) > 690:
                ImageDraw.floodfill(im, (x, y), marca, thresh=60)
    for y in range(0, h, 4):
        for x in (0, w - 1):
            if sum(im.getpixel((x, y))[:3]) > 690:
                ImageDraw.floodfill(im, (x, y), marca, thresh=60)
    datos = [(0, 0, 0, 0) if p == marca else p for p in im.get_flattened_data()]
    im.putdata(datos)
    im = im.crop(im.getbbox())
    lado = max(im.size)
    lienzo = Image.new("RGBA", (lado, lado), (0, 0, 0, 0))
    lienzo.paste(im, ((lado - im.width) // 2, (lado - im.height) // 2))
    return lienzo.resize((LADO, LADO), Image.LANCZOS)


def main() -> None:
    DESTINO.mkdir(parents=True, exist_ok=True)
    base = Image.open(ORIGEN)
    cajas = {}
    for fila, (y0, y1) in zip(ORDEN, FILAS):
        for nombre, (x0, x1) in zip(fila, COLS):
            cajas[nombre] = (x0, y0, x1, y1)
    cajas.update(EXTRA)
    for nombre, caja in cajas.items():
        limpiar(base.crop(caja)).save(DESTINO / f"{nombre}.png", optimize=True)
        print(nombre)


if __name__ == "__main__":
    main()
