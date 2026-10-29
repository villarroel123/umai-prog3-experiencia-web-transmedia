"""Optimize the generated Stage C illustrations for the book pages."""

from pathlib import Path
from PIL import Image


SOURCE = Path(r"C:\Users\Administrator\.codex\generated_images\01a15998-60cd-73d2-88a0-a0f8d85f6497")
DESTINATION = Path(__file__).resolve().parents[1] / "public" / "images" / "experiences"
ASSETS = {
    "exec-95cb1b77-cfc9-4163-90f2-cdefd078223c.png": ("howl", "escritorio-magico.webp", 1400, False),
    "exec-6703b232-8ace-4cb8-8395-527d6b5ccca5.png": ("howl", "sobre-cerrado.webp", 900, True),
    "exec-ba8ec4d5-cec2-48d9-93f5-26625fec2f8b.png": ("howl", "llave.webp", 580, True),
    "exec-bcd44d02-8b15-49ab-8f26-a927b2a0cba0.png": ("howl", "sobre-abierto.webp", 900, True),
    "exec-f821311e-89e1-466e-a9d3-cc40e2f06d7c.png": ("totoro", "claro-del-bosque.webp", 1400, False),
    "exec-f4d62308-85cb-4f16-8305-89c0304c6846.png": ("totoro", "arbol.webp", 850, True),
    "exec-bb0395d3-5c90-4377-ba76-278a22b1ee8d.png": ("totoro", "hoja.webp", 850, True),
    "exec-41f8890b-b8c2-4267-9317-4260589b7482.png": ("totoro", "nube.webp", 550, True),
    "exec-b3ec7a08-4d57-4e4d-9202-a7b0445c878d.png": ("totoro", "sol.webp", 450, True),
}


for name, (chapter, output_name, longest_edge, transparent) in ASSETS.items():
    image = Image.open(SOURCE / name).convert("RGBA" if transparent else "RGB")
    if transparent:
        alpha = image.getchannel("A")
        mask = alpha.point(lambda value: 255 if value > 8 else 0)
        box = mask.getbbox()
        if box:
            pad = 16
            image = image.crop((max(0, box[0] - pad), max(0, box[1] - pad), min(image.width, box[2] + pad), min(image.height, box[3] + pad)))
    image.thumbnail((longest_edge, longest_edge), Image.Resampling.LANCZOS)
    output = DESTINATION / chapter / output_name
    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, "WEBP", quality=83, method=6)
    print(output.relative_to(DESTINATION.parent.parent.parent), image.size, output.stat().st_size)
