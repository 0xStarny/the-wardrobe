"""Build every theme into one self-contained file.

    python tools/build.py

Reads themes/<id>/theme.json (tokens) and themes/<id>/extra.css (optional flourishes),
adds the shared adapters, and writes themes/<id>/theme.css plus themes/index.json.
No dependencies beyond the standard library.
"""
import json
import math
import random
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
THEMES = ROOT / 'themes'
ADAPTERS = ROOT / 'adapters'
ORDER = ['original', 'office', 'lab', 'arcade', 'blueprint', 'riso', 'dusk']


def data_uri(svg):
    return "url(\"data:image/svg+xml," + quote(svg, safe=" =:/;,'()-.") + "\")"


def arcade_blocks():
    """A seamless strip of stepped blocks, three warm rows."""
    rows = ['#fa500f', '#ff8205', '#ffd800']
    heights = [1, 1, 2, 2, 3, 2, 1, 1, 2, 3, 3, 2, 1, 2, 1, 1, 2, 3, 2, 1]
    s = 16
    w, h = len(heights) * s, 3 * s
    rects = []
    for i, n in enumerate(heights):
        for r in range(n):
            rects.append(f"<rect x='{i * s}' y='{h - (r + 1) * s}' width='{s}' height='{s}' fill='{rows[r]}'/>")
    return f"<svg xmlns='http://www.w3.org/2000/svg' width='{w}' height='{h}' shape-rendering='crispEdges'>{''.join(rects)}</svg>"


def dusk_flock():
    """A murmuration: a thousand small birds along a folded ribbon, dense in the middle."""
    rnd = random.Random(7)
    w, h = 1200, 520
    out = []
    for _ in range(1100):
        t = rnd.random()
        x = 80 + t * 1040
        fold = math.sin(t * math.pi * 1.6 + 0.4) * 120 + math.sin(t * math.pi * 4.2) * 34
        y = 250 + fold
        thick = 26 + 70 * math.sin(t * math.pi) ** 1.5
        y += rnd.gauss(0, thick * 0.5)
        x += rnd.gauss(0, 14)
        r = rnd.uniform(0.9, 1.9)
        a = rnd.uniform(0.45, 0.9)
        out.append(f"<ellipse cx='{x:.0f}' cy='{y:.0f}' rx='{r * 1.6:.1f}' ry='{r * 0.7:.1f}' fill-opacity='{a:.2f}'/>")
    return f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}' fill='#0f1024'>{''.join(out)}</svg>"


def riso_grain():
    """Paper grain in the blue ink, sparse specks only."""
    return (
        "<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>"
        "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/>"
        "<feColorMatrix values='0 0 0 0 0.145 0 0 0 0 0.19 0 0 0 0 0.42 1.6 0 0 0 -0.92'/></filter>"
        "<rect width='100%' height='100%' filter='url(#n)'/></svg>"
    )


SVGS = {'arcade-blocks': arcade_blocks, 'dusk-flock': dusk_flock, 'riso-grain': riso_grain}


def build(tid):
    meta = json.loads((THEMES / tid / 'theme.json').read_text(encoding='utf-8'))
    tokens = meta['tokens']
    lines = [
        f"/* The Wardrobe / {meta['name']}  (by {meta['by']})",
        f"   {meta['line']}",
        "   Wear it by loading this file after the app's own stylesheets. Built by tools/build.py: edit theme.json and extra.css, not this file. */",
    ]
    if meta.get('fonts'):
        lines.append(f"@import url('{meta['fonts']}');")
    lines.append('')
    lines.append(':root {')
    lines.append(f"  color-scheme: {meta['mode']};")
    for k, v in tokens.items():
        lines.append(f'  --{k}: {v};')
    lines.append('}')
    css = '\n'.join(lines) + '\n'
    if tid != 'original':
        css += '\n' + (ADAPTERS / 'common.css').read_text(encoding='utf-8')
        css += '\n' + (ADAPTERS / f"{meta['mode']}.css").read_text(encoding='utf-8')
        extra = THEMES / tid / 'extra.css'
        if extra.exists():
            text = extra.read_text(encoding='utf-8')
            for name, fn in SVGS.items():
                text = text.replace('{{svg:' + name + '}}', data_uri(fn()))
            css += '\n' + text
    (THEMES / tid / 'theme.css').write_text(css, encoding='utf-8', newline='\n')
    return {
        'id': tid,
        'name': meta['name'],
        'by': meta['by'],
        'mode': meta['mode'],
        'line': meta['line'],
        'characters': meta['characters'],
        'css': f'themes/{tid}/theme.css',
        'swatches': {k: tokens.get(k) for k in ('ink', 'panel', 'fog', 'mist', 'jade', 'garnet', 'gilt', 'vio', 'btn')},
        'fonts': {k: tokens.get(k) for k in ('display', 'body', 'code')},
    }


def main():
    index = [build(t) for t in ORDER]
    (THEMES / 'index.json').write_text(json.dumps(index, indent=2) + '\n', encoding='utf-8', newline='\n')
    for t in index:
        size = (THEMES / t['id'] / 'theme.css').stat().st_size
        print(f"{t['id']:<10} {size / 1024:6.1f} KB")


if __name__ == '__main__':
    main()
