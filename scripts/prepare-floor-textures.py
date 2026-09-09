"""
Priprema Poly Haven tekstura za hero pod.

Sta radi: raspakuje tri zipa, izvlaci iz njih SAMO folder `textures/`, pretvara
.exr mape u 8-bitne PNG-ove i sve smanjuje na velicine koje browser moze da
skine bez cekanja. Rezultat ide u `public/textures/hero/<set>/`.

Zasto OpenCV, a ne ImageMagick: EXR je float32 format i magick ga bez
OpenEXR delegata uopste ne otvara. `cv2.imread(..., IMREAD_UNCHANGED)` ga cita
kao float32 niz, ali samo ako je `OPENCV_IO_ENABLE_OPENEXR=1` postavljen PRIJE
uvoza cv2 — zato taj red stoji na pocetku fajla, iznad importa.

EXR mape su linearne i vrijednosti su vec u [0, 1], pa se u 8 bita prevode
mnozenjem sa 255 bez ikakve gama korekcije. Gama bi normalu iskrivila nagib, a
roughness pomjerila u pogresnu stranu.

O formatima — izmjereno na laminate setu, ne pretpostavljeno:

    normal 1024   PNG 1297 KB | WebP lossless 1056 KB | WebP q95  172 KB
    rough  1024   PNG  580 KB | WebP lossless  507 KB
    rough   512   PNG  132 KB | WebP lossless  113 KB
    diff   2048   WebP q85 902 KB

Sa PNG-om za normalu i roughness set izlazi 2779 KB — skoro dvostruko preko
cilja od 1.5 MB. Zato normala ide u WebP q95 (172 KB): na blagom reljefu
drveta razlika se ne vidi, a ustedi se 1.1 MB po setu. Roughness ide u WebP
bez gubitka na 512 — mapa je niskofrekventna, 1024 ne nosi vise podataka.

Ko hoce tacno formate iz prve specifikacije: `--png` pise normal.png i
rough.png na 1024, bez gubitka. Tada set ima 2779 KB i to skripta kaze.

Displacement mape se ne diraju: daska je ravna geometrija (BoxGeometry), nema
sta da se pomjera po visini.

Pokretanje:  python scripts/prepare-floor-textures.py
"""

import os

# Mora prije `import cv2` — inace OpenCV ne registruje EXR citac.
os.environ["OPENCV_IO_ENABLE_OPENEXR"] = "1"

import shutil
import sys
import tempfile
import zipfile
from pathlib import Path

import cv2
import numpy as np

KORIJEN = Path(__file__).resolve().parent.parent
# `textures/hero/`, ne `textures/`: pod na naslovnoj ima svoje setove, a
# `textures/laminate`, `layers/`, `synthetic/` i `wood/` vec koriste presjek
# daske na /proizvodi/parketi i drugi dijelovi sajta.
IZLAZ = KORIJEN / "public" / "textures" / "hero"

# Gdje zipovi stoje. Prvo se gleda korijen projekta, pa Downloads.
MJESTA = [KORIJEN, Path.home() / "Downloads"]

# ime seta -> (ime zipa, prefiks fajlova unutar textures/)
SETOVI = {
    "laminate": ("laminate_floor_02_4k_blend.zip", "laminate_floor_02"),
    "kitchen": ("kitchen_wood_2k.blend.zip", "kitchen_wood"),
    "oak": ("white_oak_veneer_2k.blend.zip", "white_oak_veneer"),
}

# Diffuse nosi boju i gleda se izbliza, pa ide na 2048. Normala i roughness su
# podaci o povrsini, ne slika — 1024 i 512 su dovoljni.
DIFF_PX = 2048
NORMAL_PX = 1024
ROUGH_PX = 512
ROUGH_PX_PNG = 1024
# q80, ne 85: kitchen diff je najsumljiviji od tri i na 85 sam gura set
# preko 1.5 MB. Na 80 se razlika ne vidi na dasci, a set stane u budzet.
DIFF_Q = 80
NORMAL_Q = 95
# OpenCV: kvalitet 101 znaci WebP bez gubitka.
BEZ_GUBITKA = 101
BUDZET_KB = 1536


def nadji_zip(ime: str) -> Path:
    for mjesto in MJESTA:
        put = mjesto / ime
        if put.exists():
            return put
    raise SystemExit(
        f"Nema {ime}. Trazio sam u: " + ", ".join(str(m) for m in MJESTA)
    )


def raspakuj(zip_put: Path, kamo: Path) -> None:
    """Izvlaci samo `textures/`; .blend fajlovi se preskacu."""
    with zipfile.ZipFile(zip_put) as z:
        for clan in z.namelist():
            if not clan.startswith("textures/") or clan.endswith("/"):
                continue
            meta = kamo / Path(clan).name
            with z.open(clan) as izvor, open(meta, "wb") as cilj:
                shutil.copyfileobj(izvor, cilj)


def procitaj(put: Path) -> np.ndarray:
    slika = cv2.imread(str(put), cv2.IMREAD_UNCHANGED)
    if slika is None:
        raise SystemExit(f"OpenCV nije procitao {put.name}")
    return slika


def u_osam_bita(slika: np.ndarray) -> np.ndarray:
    """float32 EXR -> uint8, bez gama korekcije (mape su linearne)."""
    if slika.dtype == np.uint8:
        return slika
    if slika.dtype == np.uint16:
        return (slika / 257.0).round().astype(np.uint8)
    return np.clip(slika * 255.0, 0, 255).round().astype(np.uint8)


def smanji(slika: np.ndarray, na: int) -> np.ndarray:
    h, w = slika.shape[:2]
    if max(h, w) <= na:
        return slika
    odnos = na / max(h, w)
    # INTER_AREA je jedini koji pri smanjivanju uzima prosjek svih piksela
    # koje spaja — ostali uzorkuju i ostavljaju aliasing u godovima drveta.
    return cv2.resize(
        slika, (round(w * odnos), round(h * odnos)), interpolation=cv2.INTER_AREA
    )


def kb(put: Path) -> float:
    return put.stat().st_size / 1024


def obradi_set(ime: str, zip_ime: str, prefiks: str, privremeno: Path, png: bool) -> float:
    zip_put = nadji_zip(zip_ime)
    radni = privremeno / ime
    radni.mkdir(parents=True, exist_ok=True)
    raspakuj(zip_put, radni)

    odrediste = IZLAZ / ime
    odrediste.mkdir(parents=True, exist_ok=True)

    print(f"\n[{ime}]  {zip_put.name}")

    ukupno = 0.0

    # ── diffuse: boja, jedino sto ide u WebP ─────────────────────
    izvor = radni / f"{prefiks}_diff_2k.jpg"
    if not izvor.exists():
        izvor = radni / f"{prefiks}_diff_4k.jpg"
    diff = smanji(procitaj(izvor), DIFF_PX)
    meta = odrediste / "diff.webp"
    cv2.imwrite(str(meta), diff, [cv2.IMWRITE_WEBP_QUALITY, DIFF_Q])
    print(f"  diff.webp    {diff.shape[1]}x{diff.shape[0]}  {kb(meta):7.0f} KB")
    ukupno += kb(meta)

    # ── normala ──────────────────────────────────────────────────
    izvor = next(radni.glob(f"{prefiks}_nor_gl_*.exr"))
    nor = smanji(u_osam_bita(procitaj(izvor)), NORMAL_PX)
    if png:
        meta = odrediste / "normal.png"
        cv2.imwrite(str(meta), nor, [cv2.IMWRITE_PNG_COMPRESSION, 9])
    else:
        meta = odrediste / "normal.webp"
        cv2.imwrite(str(meta), nor, [cv2.IMWRITE_WEBP_QUALITY, NORMAL_Q])
    print(f"  {meta.name:12} {nor.shape[1]}x{nor.shape[0]}  {kb(meta):7.0f} KB")
    ukupno += kb(meta)

    # ── roughness: jedan kanal je dovoljan ───────────────────────
    izvor = next(radni.glob(f"{prefiks}_rough_*.exr"))
    rough = u_osam_bita(procitaj(izvor))
    if rough.ndim == 3:
        # Sva tri kanala nose istu vrijednost; uzima se jedan, ne prosjek,
        # da se ne pomjeri kontrast.
        rough = rough[:, :, 0]
    rough = smanji(rough, ROUGH_PX_PNG if png else ROUGH_PX)
    if png:
        meta = odrediste / "rough.png"
        cv2.imwrite(str(meta), rough, [cv2.IMWRITE_PNG_COMPRESSION, 9])
    else:
        meta = odrediste / "rough.webp"
        cv2.imwrite(str(meta), rough, [cv2.IMWRITE_WEBP_QUALITY, BEZ_GUBITKA])
    print(f"  {meta.name:12} {rough.shape[1]}x{rough.shape[0]}  {kb(meta):7.0f} KB")
    ukupno += kb(meta)

    print(f"  set ukupno   {ukupno:7.0f} KB" + ("" if ukupno < BUDZET_KB else "   PREKO 1.5 MB"))
    return ukupno


def main() -> int:
    png = "--png" in sys.argv
    print("Format: " + ("normal/rough kao PNG (prva specifikacija)" if png
                        else "normal WebP q95, rough WebP bez gubitka"))
    IZLAZ.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="ponos-tex-") as tmp:
        privremeno = Path(tmp)
        sve = 0.0
        for ime, (zip_ime, prefiks) in SETOVI.items():
            sve += obradi_set(ime, zip_ime, prefiks, privremeno, png)
    print(f"\nSva tri seta: {sve:.0f} KB ({sve / 1024:.2f} MB)")
    print(f"Izlaz: {IZLAZ}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
