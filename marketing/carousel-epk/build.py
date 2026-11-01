#!/usr/bin/env python3
"""Generate the EPK Instagram carousel (1080x1080, FR + EN) as HTML, then PNG.

Usage: python3 marketing/carousel-epk/build.py [out_dir]
Needs: chromium on PATH. Fonts: Space Grotesk + JetBrains Mono, loaded from
marketing/carousel-epk/fonts/ if present, else from locally installed fonts.
"""
import subprocess, sys, pathlib, shutil

HERE = pathlib.Path(__file__).parent
OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else HERE / "out")

PAPER, INK, SOFT, MUTE, HAIR, HAIR2 = "#e8e6e0", "#141414", "#55524b", "#8a877f", "#d8d5cd", "#cfccc4"
ACC, ACCFG, QUOTE, FBODY = "#44579c", "#e8e6e0", "#3a3833", "#9a978f"

def mark(uid, ink):
    return f'''<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><defs>
<mask id="c{uid}"><rect width="100" height="100" fill="#fff"/><circle cx="63" cy="39" r="29" fill="#000"/></mask>
<mask id="k{uid}"><rect width="100" height="100" fill="#000"/><circle cx="57" cy="47" r="35" fill="#fff"/><circle cx="50" cy="51" r="30" fill="#000"/></mask>
<pattern id="d{uid}" width="2.7" height="2.7" patternUnits="userSpaceOnUse" patternTransform="rotate(8)"><circle cx="1.35" cy="1.35" r="0.52" fill="{ink}"/></pattern></defs>
<rect width="100" height="100" fill="url(#d{uid})" mask="url(#k{uid})"/><circle cx="50" cy="51" r="29" fill="{ink}" mask="url(#c{uid})"/></svg>'''

def R(x, y, w, h, fill="none", stroke=None, sw=2, rx=2):
    s = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}"{s}/>'

def T(x, y, s, size=20, fill=MUTE, anchor="start", weight=400, ls=2.2):
    return (f'<text x="{x}" y="{y}" font-family="JetBrains Mono, monospace" font-size="{size}" '
            f'font-weight="{weight}" letter-spacing="{ls}" fill="{fill}" text-anchor="{anchor}">{s.upper()}</text>')

# ---------- illustrations (viewBox 936 x 470 unless noted) ----------
import math
W_, H_ = 936, 470

def ill_cover():
    out = []
    cw, ch, gx, gy = 130, 128, 31.2, 26
    for r in range(2):
        for c in range(6):
            x, y = c * (cw + gx), r * (ch + gy) + 10
            if (r, c) == (1, 2):
                out.append(R(x - 10, y - 10, cw + 20, ch + 20, PAPER, rx=3))
                out.append(R(x + 10, y + 4, 60, 10, ACC))
                out.append(R(x + 10, y + 24, cw - 20, 44, "#c9c6bd"))
                for i, w in enumerate((cw - 20, cw - 20, 60)):
                    out.append(R(x + 10, y + 80 + i * 13, w, 6, INK))
            else:
                out.append(R(x, y, cw, ch, "none", QUOTE, 2))
                out.append(R(x + 14, y + 16, 46, 7, QUOTE))
                for i in range(4):
                    out.append(R(x + 14, y + 40 + i * 16, cw - 28 - (i % 2) * 24, 5, QUOTE))
    return 936, 300, "".join(out)

def ill_scan(L):
    o = []
    px, py, pw, ph = 176, 22, 640, 426
    o.append(R(px, py, pw, ph, "#fff", HAIR2, 2, 3))
    o.append(R(px + 14, py + 14, pw - 28, 214, "none", ACC, 2, 2).replace('/>', ' stroke-dasharray="9 8"/>'))
    o.append(R(px + 40, py + 40, 200, 26, INK))
    o.append(R(px + 40, py + 86, pw - 80, 86, "#d6d3ca"))
    o.append(R(px + 40, py + 188, pw - 80, 9, ACC))
    for i in range(7):
        o.append(R(px + 40, py + 256 + i * 22, pw - 80 - (i % 3) * 60, 9, HAIR))
    o.append(f'<polyline points="{px+40},{py+54} {px+pw-40},{py+54} {px+40},{py+100} {px+pw-120},{py+140} {px+190},{py+192}" fill="none" stroke="{ACC}" stroke-width="4" stroke-linejoin="round" stroke-dasharray="2 11" stroke-linecap="round"/>')
    o.append(f'<circle cx="{px+190}" cy="{py+192}" r="11" fill="{ACC}"/>')
    o.append(T(px - 30, py + 126, L["read"], 22, ACC, "end", 500))
    o.append(T(px - 30, py + 346, L["skip"], 22, MUTE, "end"))
    o.append(f'<line x1="{px-14}" y1="{py+14}" x2="{px-14}" y2="{py+228}" stroke="{ACC}" stroke-width="3"/>')
    o.append(f'<line x1="{px-14}" y1="{py+244}" x2="{px-14}" y2="{py+ph-14}" stroke="{HAIR2}" stroke-width="3"/>')
    return W_, H_, "".join(o)

def ill_bio(L):
    o = []
    x = 56
    o.append(T(x, 70, L["short"], 24, ACC, weight=500))
    for i, w in enumerate((640, 700, 470)):
        o.append(R(x, 104 + i * 40, w, 20, ACC))
    o.append(T(x, 270, L["long"], 24, MUTE))
    ws = (800, 830, 780, 820, 760, 810, 520)
    for i, w in enumerate(ws):
        o.append(R(x, 304 + i * 24, w, 10, HAIR2))
    cw_ = 330
    cx = 936 - 56 - cw_
    o.append(R(cx, 36, cw_, 50, "none", ACC, 2, 2))
    o.append(T(cx + cw_ / 2, 69, L["third"], 20, ACC, "middle", 500, 1.6))
    return W_, H_, "".join(o)

def ill_photos(L):
    o = []
    base = 380
    frames = [(24, 350, 197, L["live"], True), (402, 200, 250, L["portrait"], False),
              (630, 170, 170, L["square"], False), (828, 84, 150, L["detail"], False)]
    # fit: shrink so last frame ends at <= 912
    for x, w, h, lab, acc in frames:
        y = base - h
        o.append(R(x, y, w, h, ACC if acc else "#d6d3ca", None, 0, 2))
        o.append(f'<circle cx="{x+w*0.68}" cy="{y+h*0.36}" r="{min(w,h)*0.14}" fill="#030303" opacity="0.9"/>')
        o.append(R(x, y, w, h, "none", ACC if acc else INK, 2, 2))
        o.append(T(x, base + 44, lab, 19, ACC if acc else MUTE, weight=500 if acc else 400, ls=1.4))
    o.append(T(24, 56, L["selected"], 22, ACC, weight=500))
    return W_, H_, "".join(o)

def ill_listen(L):
    o = []
    cx, cy = 104, 150
    o.append(f'<circle cx="{cx}" cy="{cy}" r="80" fill="{INK}"/>')
    o.append(f'<polygon points="{cx-22},{cy-36} {cx-22},{cy+36} {cx+38},{cy}" fill="{PAPER}"/>')
    bars, x0 = 40, 224
    for i in range(bars):
        h = 24 + 100 * abs(math.sin(i * 0.55) * math.cos(i * 0.21)) + 14
        o.append(R(x0 + i * 17.5, cy - h / 2, 9, h, ACC if i < 16 else HAIR2, None, 0, 1))
    o.append(T(24, 290, L["links"], 21, MUTE, ls=1.6))
    x = 24
    for name in L["services"]:
        w = 44 + len(name) * 15.2
        o.append(R(x, 316, w, 74, "none", HAIR2, 2, 2))
        o.append(T(x + w / 2, 363, name, 24, INK, "middle", 500, 1.2))
        x += w + 24
    return W_, H_, "".join(o)

def ill_video(L):
    o = []
    fx, fy, fw, fh = 108, 20, 720, 360
    o.append(R(fx, fy, fw, fh, "#010101", "#030303", 2, 3))
    o.append(f'<circle cx="{fx+fw/2}" cy="{fy+fh/2}" r="60" fill="none" stroke="#030303" stroke-width="3"/>')
    o.append(f'<polygon points="{fx+fw/2-15},{fy+fh/2-27} {fx+fw/2-15},{fy+fh/2+27} {fx+fw/2+32},{fy+fh/2}" fill="#030303"/>')
    ty = 414
    o.append(R(fx, ty, fw, 9, HAIR2, None, 0, 1))
    o.append(R(fx + 250, ty - 7, 130, 23, ACC, None, 0, 2))
    o.append(T(fx + 315, ty + 52, "60 s", 22, ACC, "middle", 500))
    o.append(T(fx, ty + 52, "0:00", 20, MUTE, ls=1))
    o.append(T(fx + fw, ty + 52, L["whole"], 20, MUTE, "end", ls=1))
    return W_, H_, "".join(o)

def ill_dates(L):
    o = []
    x0 = 40
    o.append(T(x0, 56, L["past"], 22, ACC, weight=500))
    for i in range(5):
        y = 100 + i * 72
        a = 1 - i * 0.13
        o.append(R(x0, y, 92, 14, INK).replace('/>', f' opacity="{a}"/>'))
        o.append(R(x0 + 124, y, 210 - (i % 2) * 44, 14, "#b9b6ad").replace('/>', f' opacity="{a}"/>'))
        o.append(f'<line x1="{x0}" y1="{y+34}" x2="{x0+440}" y2="{y+34}" stroke="{HAIR}" stroke-width="2"/>')
    cx = 536
    o.append(T(cx, 56, L["contact"], 22, ACC, weight=500))
    for i, lab in enumerate(L["roles"]):
        y = 100 + i * 64
        o.append(T(cx, y + 14, lab, 19, MUTE, ls=1.6))
        o.append(R(cx + 160, y, 200, 14, INK))
    sx, sy, sw_, sh = cx, 296, 360, 120
    o.append(R(sx, sy, sw_, sh, "none", INK, 2, 2))
    for (dx, dy) in ((62, 46), (136, 32), (210, 46), (284, 34)):
        o.append(f'<circle cx="{sx+dx}" cy="{sy+dy}" r="13" fill="{INK}"/>')
    o.append(R(sx + 116, sy + 78, 130, 26, ACC, None, 0, 2))
    o.append(T(sx + sw_, sy + sh + 38, L["rider"], 18, MUTE, "end", ls=1.2))
    return W_, H_, "".join(o)

def ill_summary(L):
    """Five section tiles on a dark ground (CTA slide): the page we build."""
    o = []
    tw, th, gap = 160, 150, 24
    labels = L["tiles"]
    for i in range(5):
        x = i * (tw + gap) + 20
        y = 4
        o.append(R(x, y, tw, th, "none", PAPER, 2, 2))
        cx = x + tw / 2
        if i == 0:   # bio
            for j, w in enumerate((100, 108, 70)):
                o.append(R(x + 24, y + 38 + j * 22, w, 8, PAPER))
        elif i == 1:  # photos
            o.append(R(x + 20, y + 48, 70, 44, PAPER)); o.append(R(x + 100, y + 38, 48, 62, QUOTE)); 
            o.append(R(x + 100, y + 38, 48, 62, "none", PAPER, 2, 2))
        elif i == 2:  # listen
            o.append(f'<circle cx="{x+44}" cy="{y+75}" r="20" fill="{PAPER}"/>')
            for j in range(7):
                o.append(R(x + 78 + j * 11, y + 75 - (10 + (j * 7) % 22) / 2, 5, 10 + (j * 7) % 22, PAPER, None, 0, 1))
        elif i == 3:  # video
            o.append(R(x + 24, y + 36, tw - 48, 68, "none", PAPER, 2, 2))
            o.append(f'<polygon points="{cx-9},{y+54} {cx-9},{y+86} {cx+16},{y+70}" fill="{PAPER}"/>')
        else:         # dates
            for j in range(3):
                o.append(R(x + 24, y + 40 + j * 24, 32, 7, PAPER)); o.append(R(x + 68, y + 40 + j * 24, 76, 7, QUOTE))
        o.append(T(cx, y + th + 40, labels[i], 20, FBODY, "middle", 400, 1.4))
    return W_, 210, "".join(o)

# ---------- copy ----------
NB = " "
COPY = {
 "fr": {
  "lang": "fr",
  "slides": [
   dict(kind="cover", a=f"On vous demande votre dossier de presse.", b=f"Que répondez-vous{NB}?",
        lead="Cinq choses qu’un programmateur cherche, et comment les montrer."),
   dict(kind="ill", ill="scan", a="Il parcourt.", b="Il ne lit pas.",
        lead="Un programmateur survole votre kit. Ce qui compte doit se trouver en haut de page."),
   dict(kind="ill", ill="bio", a="Une bio", b="qui se cite.",
        lead="À la troisième personne : trois lignes d’abord, la version longue ensuite. Une phrase doit pouvoir être reprise telle quelle."),
   dict(kind="ill", ill="photos", a="Quatre photos,", b="pas quatre cents.",
        lead="Au minimum un portrait et une photo live, en paysage, portrait et carré, pour les affiches et les posts."),
   dict(kind="ill", ill="listen", a="De la musique,", b="tout de suite.",
        lead="Un lien de streaming ou un lecteur intégré, visible sans défiler."),
   dict(kind="ill", ill="video", a="Les bonnes", b="soixante secondes.",
        lead="Un extrait live, choisi avec soin. Les programmateurs regardent d’abord la scène."),
   dict(kind="ill", ill="dates", a="Où vous avez joué,", b="comment vous joindre.",
        lead="Dates et salles passées, contact clair, fiche technique et plan de scène prêts pour l’ingénieur son."),
   dict(kind="cta", a="Pas le temps", b="de tout assembler ?",
        lead="On écrit et on monte votre kit : une page, un lien, avec un signe de marque et vos photos retouchées. 600 €, en deux semaines. Si ce n’est pas mieux que ce que vous avez, vous ne payez pas.",
        button="Écrivez-nous en message privé", example="Exemple en ligne : epk.aubuscule.com/shale"),
  ],
  "L": dict(read="Lu", skip="Survolé", short="Version courte", long="Version longue", third="Troisième personne",
            live="Live · paysage", portrait="Portrait", square="Carré", detail="Détail", selected="Les quatre retenues",
            services=["Spotify", "Apple Music", "Bandcamp"], links="Liens ou lecteur intégré",
            whole="Concert entier", past="Dates passées", contact="Contact", roles=["Artiste", "Manager", "Label"],
            rider="Fiche technique + plan de scène", tiles=["Bio", "Photos", "Écoute", "Vidéo", "Dates"]),
 },
 "en": {
  "lang": "en",
  "slides": [
   dict(kind="cover", a="They asked for your press kit.", b="What do you send?",
        lead="Five things a booker looks for, and how to show them."),
   dict(kind="ill", ill="scan", a="They skim.", b="They don’t read.",
        lead="A booker glances at your kit. What matters has to sit at the top of the page."),
   dict(kind="ill", ill="bio", a="A bio", b="you can quote.",
        lead="In the third person: three lines first, the long version after. One sentence should be liftable as it is."),
   dict(kind="ill", ill="photos", a="Four photos,", b="not four hundred.",
        lead="At least a portrait and a live shot, in landscape, portrait and square, for flyers and posts."),
   dict(kind="ill", ill="listen", a="Music to hear,", b="right away.",
        lead="A streaming link or an embedded player, visible without scrolling."),
   dict(kind="ill", ill="video", a="The right", b="sixty seconds.",
        lead="One live clip, chosen with care. Bookers watch the stage first."),
   dict(kind="ill", ill="dates", a="Where you played,", b="how to reach you.",
        lead="Past dates and venues, a clear contact, a tech rider and stage plot ready for the sound engineer."),
   dict(kind="cta", a="No time to", b="put it together?",
        lead="We write and build your kit: one page, one link, with a brand mark and retouched photos. €600, in two weeks. If it is not better than what you have now, you do not pay.",
        button="Send us a direct message", example="Live example: epk.aubuscule.com/shale"),
  ],
  "L": dict(read="Read", skip="Skimmed", short="Short version", long="Long version", third="Third person",
            live="Live · landscape", portrait="Portrait", square="Square", detail="Detail", selected="The four that made it",
            services=["Spotify", "Apple Music", "Bandcamp"], links="Links or embedded player",
            whole="Full show", past="Past dates", contact="Contact", roles=["Artist", "Manager", "Label"],
            rider="Tech rider + stage plot", tiles=["Bio", "Photos", "Listen", "Video", "Dates"]),
 },
}

ILL = dict(summary=ill_summary, scan=ill_scan, bio=ill_bio, photos=ill_photos, listen=ill_listen, video=ill_video, dates=ill_dates)

CSS = f"""
@font-face{{font-family:'Space Grotesk';src:url('FONTDIR/SpaceGrotesk.ttf');font-weight:300 700}}
@font-face{{font-family:'JetBrains Mono';src:url('FONTDIR/JetBrainsMono-400.ttf');font-weight:400}}
@font-face{{font-family:'JetBrains Mono';src:url('FONTDIR/JetBrainsMono-500.ttf');font-weight:500}}
*{{box-sizing:border-box;margin:0;padding:0}}
html,body{{width:1080px;height:1080px;background:{PAPER};overflow:hidden}}
.s{{width:1080px;height:1080px;padding:72px;display:flex;flex-direction:column;font-family:'Space Grotesk',sans-serif;color:{INK};background:{PAPER};position:relative}}
.s.dark{{background:{INK};color:{PAPER}}}
h1{{font-weight:600;font-size:88px;line-height:1.04;letter-spacing:-.03em;text-wrap:balance}}
h1 span{{display:block}}
h1 .b{{color:{ACC}}}
.dark h1 .b{{color:{PAPER}}}
.dark h1 .a{{color:{FBODY}}}
.card{{background:#1b1b1a;border-radius:3px;border:1px solid #2a2927;margin-top:40px;flex:1;display:flex;align-items:center;justify-content:center;min-height:0;padding:18px 18px}}
.card svg{{width:100%;height:100%}}
.lead{{font-size:33px;line-height:1.42;color:{SOFT};margin-top:36px;max-width:36em;text-wrap:pretty}}
.dark .lead{{color:{FBODY}}}
.foot{{display:flex;justify-content:space-between;align-items:center;margin-top:34px;font-family:'JetBrains Mono',monospace;font-size:20px;letter-spacing:.14em;text-transform:uppercase;color:{MUTE}}}
.foot .l{{display:flex;align-items:center;gap:14px}}
.foot svg{{width:38px;height:38px}}
.dark .foot{{color:{FBODY}}}
.ill{{margin-top:40px;flex:1;min-height:0}}
.ill svg{{width:100%;height:100%}}
.btn{{display:inline-block;background:{ACC};color:{ACCFG};font-weight:500;font-size:32px;padding:26px 40px;border-radius:2px;margin-top:40px;align-self:flex-start}}
.ex{{font-family:'JetBrains Mono',monospace;font-size:21px;letter-spacing:.06em;color:{FBODY};margin-top:28px}}
.spacer{{flex:1}}
"""

def to_dark(svg):
    """Re-colour a light-ground illustration for the dark theme."""
    svg = svg.replace(f'stroke="{ACC}"', 'stroke="#030303"')
    svg = svg.replace(f'fill="{ACC}" text-anchor', 'fill="#030303" text-anchor')
    svg = svg.replace(f'fill="{MUTE}" text-anchor', f'fill="{FBODY}" text-anchor')
    svg = svg.replace(INK, "@@P").replace(PAPER, INK).replace("@@P", PAPER)
    for a, b in (('"#fff"', '"#1b1b1a"'), ("#d6d3ca", "#3a3833"), (HAIR2, "#3a3833"), (HAIR, "#2e2d2a"),
                 ("#b9b6ad", "#6b6860"), ("#010101", "#262624"), ("#030303", PAPER)):
        svg = svg.replace(a, b)
    return svg

def slide_html(lang, i, s, total, fontdir):
    L = COPY[lang]["L"]
    dark = True
    num = f"{i+1:02d} / {total:02d}"
    ink = PAPER if dark else ACC
    foot = f'<div class="foot"><div class="l">{mark("f"+str(i), PAPER)}<span>Aubuscule</span></div><span>{num}</span></div>'
    h1 = f'<h1><span class="a">{s["a"]}</span><span class="b">{s["b"]}</span></h1>'
    if s["kind"] == "cover":
        w, h, svg = ill_cover()
        body = (f'<h1 style="font-size:88px"><span class="a">{s["a"]}</span><span class="b">{s["b"]}</span></h1>'
                f'<div class="ill"><svg viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid meet">{svg}</svg></div>'
                f'<p class="lead">{s["lead"]}</p>')
    elif s["kind"] == "cta":
        w, h, svg = ill_summary(L)
        body = (h1 + f'<div class="ill" style="flex:none;margin-top:44px"><svg viewBox="0 0 {w} {h}">{svg}</svg></div>'
                f'<p class="lead" style="margin-top:20px">{s["lead"]}</p>'
                f'<div class="btn">{s["button"]}</div><div class="ex">{s["example"]}</div><div class="spacer"></div>')
    else:
        w, h, svg = ILL[s["ill"]](L)
        svg = to_dark(svg)
        body = (h1 + f'<div class="card"><svg viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid meet">{svg}</svg></div>'
                f'<p class="lead">{s["lead"]}</p>')
    if lang == "fr":
        body = body.replace(" :", NB + ":").replace(" €", NB + "€")
    return (f'<!doctype html><html lang="{lang}"><head><meta charset="utf-8"><style>{CSS.replace("FONTDIR", fontdir)}</style></head>'
            f'<body><div class="s{" dark" if dark else ""}">{body}{foot}</div></body></html>')

def main():
    chromium = shutil.which("chromium") or shutil.which("chromium-browser")
    fontdir = (HERE / "fonts")
    if not (fontdir / "SpaceGrotesk.ttf").exists():
        sys.exit("Missing fonts: put SpaceGrotesk.ttf, JetBrainsMono-400.ttf, JetBrainsMono-500.ttf in " + str(fontdir))
    for lang, c in COPY.items():
        d = OUT / lang
        d.mkdir(parents=True, exist_ok=True)
        n = len(c["slides"])
        for i, s in enumerate(c["slides"]):
            html = d / f"slide-{i+1:02d}.html"
            html.write_text(slide_html(lang, i, s, n, fontdir.resolve().as_posix()))
            png = d / f"slide-{i+1:02d}.png"
            subprocess.run([chromium, "--headless", "--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=1",
                            "--window-size=1080,1080", "--virtual-time-budget=3000",
                            f"--screenshot={png}", f"file://{html.resolve()}"], check=True,
                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            html.unlink()
    print("done", OUT)

if __name__ == "__main__":
    main()
