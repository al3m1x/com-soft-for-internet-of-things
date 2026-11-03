"""Generate the Parcel Locker system diagram (SDL style, as on lecture slide 81).

Outputs:
  project/parcel-locker-system.svg / .jpg   diagram + constraints
  src/diagram-slide.svg / .png              diagram only, used on slide 1

The SVG files are always written. PNG/JPG are rendered with a headless
Edge/Chrome and converted with Pillow; they are skipped if either is missing.
"""
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROJECT = ROOT / "project"
SRC = ROOT / "src"

# signal lists: top = left -> right, bottom = right -> left
KURIER_P = ["Paczka(nr)", "Zamknięto"]
P_KURIER = ["Otwarto(sk)", "Brak_miejsca"]
P_ODBIORCA = ["SMS(kod)", "Otwarto(sk)", "Błędny_kod", "Blokada"]
ODBIORCA_P = ["Kod(kod)", "Odebrano", "Anuluj"]
ENV = ["Nadanie"]

OGRANICZENIA = [
    "Kurier skanuje paczkę (Paczka), skrytka się otwiera, Kurier wkłada paczkę i ją zamyka (Zamknięto).",
    "Kod odbioru (kod) jest jednorazowy i wysyłany do Odbiorcy w SMS po zamknięciu skrytki przez Kuriera.",
    "Po 3 błędnych kodach Odbiorcy Paczkomat blokuje odbiór (Blokada) do upływu czasu T.",
    "Czas na odbiór T = 48 h od wysłania SMS, po upływie skrytka jest zwalniana.",
    "Rozmiar paczki (rozm ∈ {S, M, L}) wynika z jej numeru; brak wolnej skrytki tego rozmiaru → Brak_miejsca.",
    "nr – numer paczki, sk – numer skrytki, kod – kod odbioru.",
]


def bracket(x1, y1, x2, y2, arm=12):
    return (f'<path d="M{x1+arm},{y1} H{x1} V{y2} H{x1+arm} '
            f'M{x2-arm},{y1} H{x2} V{y2} H{x2-arm}" fill="none" stroke="#000" stroke-width="1.5"/>')


def signal_list(x1, x2, y_top, lines, fs, lh, align_bottom=None):
    """Bracketed signal list. align_bottom: y of the bottom edge (list grows upwards)."""
    h = len(lines) * lh + 14
    y1 = (align_bottom - h) if align_bottom is not None else y_top
    y2 = y1 + h
    parts = [bracket(x1, y1, x2, y2)]
    for i, t in enumerate(lines):
        parts.append(f'<text x="{x1+16}" y="{y1+8+lh*(i+1)-4}" font-size="{fs}">{t}</text>')
    return "\n  ".join(parts)


def build(variant):
    fs, lh = (18, 24) if variant == "slide" else (16, 22)
    footer = variant == "full"
    vb = "0 0 1000 820" if footer else "10 40 960 550"
    svg = ['<?xml version="1.0" encoding="UTF-8"?>',
           f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" '
           f'width="{vb.split()[2]}" height="{vb.split()[3]}" font-family="Arial, Helvetica, sans-serif">',
           '<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">'
           '<path d="M0,0 L10,5 L0,10 z" fill="#000"/></marker></defs>',
           '<rect x="0" y="0" width="1000" height="1000" fill="#fff"/>']
    if footer:
        svg.append('<text x="40" y="46" font-size="24">System Paczkomat</text>')

    # processes (octagons)
    svg.append('<g fill="#fff" stroke="#000" stroke-width="1.5">'
               '<polygon points="95,230 225,230 260,265 260,395 225,430 95,430 60,395 60,265"/>'
               '<polygon points="435,230 565,230 600,265 600,395 565,430 435,430 400,395 400,265"/>'
               '<polygon points="775,230 905,230 940,265 940,395 905,430 775,430 740,395 740,265"/></g>')
    nfs = 24 if variant == "slide" else 22
    svg.append(f'<g font-size="{nfs}" text-anchor="middle"><text x="160" y="338">KURIER</text>'
               f'<text x="500" y="338">PACZKOMAT</text><text x="840" y="338">ODBIORCA</text></g>')

    # signal from the environment
    svg.append('<line x1="160" y1="70" x2="160" y2="228" stroke="#000" stroke-width="1.5" marker-end="url(#arr)"/>')
    svg.append(signal_list(28, 145, 100, ENV, fs, lh))

    svg.append('<g stroke="#000" stroke-width="1.5" fill="none">'
               '<line x1="262" y1="305" x2="398" y2="305" marker-end="url(#arr)"/>'
               '<line x1="398" y1="355" x2="262" y2="355" marker-end="url(#arr)"/>'
               '<line x1="602" y1="305" x2="738" y2="305" marker-end="url(#arr)"/>'
               '<line x1="738" y1="355" x2="602" y2="355" marker-end="url(#arr)"/></g>')

    svg.append(signal_list(230, 430, 0, KURIER_P, fs, lh, align_bottom=206))
    svg.append(signal_list(230, 430, 458, P_KURIER, fs, lh))
    svg.append(signal_list(570, 770, 0, P_ODBIORCA, fs, lh, align_bottom=206))
    svg.append(signal_list(570, 770, 458, ODBIORCA_P, fs, lh))

    if footer:
        svg.append('<text x="40" y="630" font-size="18" font-weight="bold">Ograniczenia</text>')
        for i, t in enumerate(OGRANICZENIA):
            svg.append(f'<text x="40" y="{660+26*i}" font-size="16">• {t}</text>')
    svg.append('</svg>')
    return "\n  ".join(svg)


def find_browser():
    for p in (r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
              r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
              r"C:\Program Files\Google\Chrome\Application\chrome.exe"):
        if Path(p).exists():
            return p
    for name in ("msedge", "google-chrome", "chromium", "chrome"):
        found = shutil.which(name)
        if found:
            return found
    return None


def render(browser, svg, png, w, h):
    subprocess.run([browser, "--headless", "--disable-gpu", "--hide-scrollbars",
                    "--force-device-scale-factor=2", f"--window-size={w},{h}",
                    f"--screenshot={png}", svg.as_uri()],
                   check=False, capture_output=True, timeout=120)
    if not png.exists():
        raise RuntimeError(f"browser did not produce {png}")


def main():
    full_svg = PROJECT / "parcel-locker-system.svg"
    slide_svg = SRC / "diagram-slide.svg"
    full_svg.write_text(build("full"), encoding="utf-8")
    slide_svg.write_text(build("slide"), encoding="utf-8")
    print("SVG written")

    browser = find_browser()
    try:
        from PIL import Image
    except ImportError:
        Image = None
    if not browser or Image is None:
        print("Skipping PNG/JPG: need Edge/Chrome and Pillow")
        return

    render(browser, slide_svg, SRC / "diagram-slide.png", 960, 550)
    tmp = PROJECT / "_system.png"
    render(browser, full_svg, tmp, 1000, 820)
    Image.open(tmp).convert("RGB").save(PROJECT / "parcel-locker-system.jpg", quality=95)
    tmp.unlink()
    print("PNG/JPG rendered")


if __name__ == "__main__":
    main()
