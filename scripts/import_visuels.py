"""Importe les visuels exportés depuis Canva dans le site.

Lancé par .github/workflows/import-visuels.yml quand images/import/manifest.json change.
Le manifest liste des URL d'export Canva (signées, temporaires) :
  [{"nom": "f_noir", "url": "https://export-download.canva.com/..."}, ...]

Pour chaque entrée : télécharge l'image (PNG ou ZIP d'une page), garde l'original
dans images/photo/<nom>.png et écrit la version servie images/photo/<nom>.webp.
"""
import io
import json
import sys
import urllib.request
import zipfile
from pathlib import Path

from PIL import Image

RACINE = Path(__file__).resolve().parent.parent
SORTIE = RACINE / "images" / "photo"


def telecharger(url):
    req = urllib.request.Request(url, headers={"User-Agent": "maison-kova-import"})
    with urllib.request.urlopen(req, timeout=120) as r:
        data = r.read()
    if data[:2] == b"PK":  # export multi-pages : on prend le premier fichier image du zip
        with zipfile.ZipFile(io.BytesIO(data)) as z:
            nom = sorted(n for n in z.namelist() if n.lower().endswith((".png", ".jpg", ".jpeg")))[0]
            data = z.read(nom)
    return Image.open(io.BytesIO(data))


def main(manifest_path):
    entrees = json.loads(Path(manifest_path).read_text(encoding="utf-8"))
    SORTIE.mkdir(parents=True, exist_ok=True)
    erreurs = 0
    for e in entrees:
        try:
            im = telecharger(e["url"])
            im = im.convert("RGBA") if im.mode in ("RGBA", "LA", "P") else im.convert("RGB")
            im.save(SORTIE / f"{e['nom']}.png", optimize=True)
            im.save(SORTIE / f"{e['nom']}.webp", "WEBP", quality=84, method=6)
            print(f"ok  {e['nom']}  {im.size}")
        except Exception as exc:  # on continue : une URL expirée ne doit pas bloquer les autres
            erreurs += 1
            print(f"ERR {e['nom']}: {exc}")
    if erreurs:
        sys.exit(1)


if __name__ == "__main__":
    main(sys.argv[1])
