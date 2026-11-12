"""Studio-style illustrative product artwork (4:5) for the Featured Drop and the social
gallery. Original, unbranded demo pieces, not Katwalk inventory.
Run:  python scripts/make_product_svgs.py"""
from pathlib import Path
import importlib.util

here = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("bag", here / "make_bag_svg.py")
bag = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bag)  # also regenerates the bag files (idempotent)

root = here.parent / "public" / "media"

GRAIN = ('<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" '
         'numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0.14  0 0 0 0 0.13  0 0 0 0 0.14  0 0 0 0.06 0"/></filter>'
         '<filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>')


def studio(bg_top, bg_bottom, niche_top, niche_bottom, floor):
    return f"""
<linearGradient id="sbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{bg_top}"/><stop offset="1" stop-color="{bg_bottom}"/></linearGradient>
<linearGradient id="sniche" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{niche_top}"/><stop offset="1" stop-color="{niche_bottom}"/></linearGradient>
<linearGradient id="sfloor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{floor}"/><stop offset="1" stop-color="{bg_bottom}"/></linearGradient>
""", """
<rect width="800" height="1000" fill="url(#sbg)"/>
<path d="M170 840V380a230 230 0 0 1 460 0v460z" fill="url(#sniche)"/>
<rect y="840" width="800" height="160" fill="url(#sfloor)"/>
"""


def write(name, defs, body):
    (root / name).write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1000" viewBox="0 0 800 1000"><defs>{defs}{GRAIN}</defs>'
        f'{body}<rect width="800" height="1000" filter="url(#grain)"/></svg>\n', encoding="utf-8")


# 1. The Arch Top-Handle (accessory)
d, b = studio("#F4E9E1", "#E9D6CC", "#FBF4EF", "#F0DCD6", "#E6D0C6")
write("product-top-handle.svg", bag.DEFS + d, b + """
<ellipse cx="400" cy="845" rx="230" ry="22" fill="#5A2A30" opacity=".18" filter="url(#soft)"/>
<g transform="translate(40 330) scale(0.9)">""" + bag.BAG + "</g>")

# 2. Blush Oversized Bomber (outerwear)
d, b = studio("#F7E4E4", "#EECACF", "#FFF6F4", "#F3D9DC", "#EBC6CB")
write("product-bomber.svg", d + """
<linearGradient id="jk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F1AEBB"/><stop offset="1" stop-color="#DA8C9D"/></linearGradient>""", b + """
<path d="M400 236c0-20 15-24 15-40 0-14-12-22-24-15" fill="none" stroke="#3A3236" stroke-width="4" stroke-linecap="round"/>
<path d="M400 236 266 302h268z" fill="none" stroke="#3A3236" stroke-width="4" stroke-linejoin="round"/>
<path d="M282 302q118-22 236 0l94 78q28 30 24 70l-8 190h-56l-6-190h-10v250H244V450h-10l-6 190h-56l-8-190q-4-40 24-70z" fill="url(#jk)"/>
<path d="M300 330q-40 80-50 170M500 330q40 80 50 170" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="6" stroke-linecap="round"/>
<rect x="244" y="680" width="312" height="36" rx="8" fill="#CF7F92"/>
<rect x="172" y="626" width="56" height="30" rx="6" fill="#CF7F92"/>
<rect x="572" y="626" width="56" height="30" rx="6" fill="#CF7F92"/>
<path d="M346 300l54 56 54-56q-54-14-108 0z" fill="#FFF4F1"/>
<path d="M400 356v324" stroke="#B9667A" stroke-width="3"/>
<ellipse cx="400" cy="845" rx="170" ry="18" fill="#5A2A30" opacity=".14" filter="url(#soft)"/>""")

# 3. Satin Slip Dress (evening)
d, b = studio("#3A3034", "#231F22", "#4A3D42", "#2C2629", "#2A2427")
write("product-slip-dress.svg", d + """
<linearGradient id="satin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C98E9C"/><stop offset=".35" stop-color="#F7CED8"/><stop offset=".55" stop-color="#FBE3E8"/><stop offset="1" stop-color="#B57A89"/></linearGradient>
<radialGradient id="rim" cx=".5" cy=".45" r=".5"><stop offset="0" stop-color="#F7CED8" stop-opacity=".25"/><stop offset="1" stop-color="#F7CED8" stop-opacity="0"/></radialGradient>""", b + """
<rect width="800" height="1000" fill="url(#rim)"/>
<path d="M400 246c0-20 15-24 15-40 0-14-12-22-24-15" fill="none" stroke="#F3DCE1" stroke-width="4" stroke-linecap="round"/>
<path d="M400 246 276 310h248z" fill="none" stroke="#F3DCE1" stroke-width="4" stroke-linejoin="round"/>
<path d="M344 310l14 104M456 310l-14 104" stroke="#F3DCE1" stroke-width="3"/>
<path d="M352 412q48 28 96 0l24 96q30 230 74 320-146 34-292 0 44-90 74-320z" fill="url(#satin)"/>
<path d="M352 412q48 44 96 0" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3"/>
<path d="M420 450q16 200 70 370" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="10" stroke-linecap="round"/>
<ellipse cx="400" cy="850" rx="170" ry="16" fill="#F7CED8" opacity=".12" filter="url(#soft)"/>""")

# 4. Wide-Leg Denim
d, b = studio("#F3ECE4", "#E4D9CE", "#FBF7F2", "#ECE2D8", "#E2D6CA")
write("product-denim.svg", d + """
<linearGradient id="den" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3E5577"/><stop offset=".45" stop-color="#5F7699"/><stop offset=".55" stop-color="#56709A"/><stop offset="1" stop-color="#34496A"/></linearGradient>""", b + """
<path d="M286 250h228l-2 40H288z" fill="#3A4F70"/>
<path d="M288 290h224l50 540H420l-20-380-20 380H238z" fill="url(#den)"/>
<path d="M400 296v150" stroke="#C9A46B" stroke-width="3" stroke-dasharray="6 6"/>
<path d="M300 300q30 60 2 110M500 300q-30 60-2 110" fill="none" stroke="#C9A46B" stroke-opacity=".8" stroke-width="2.5" stroke-dasharray="6 6"/>
<path d="M330 470q-16 180-60 350M470 470q16 180 60 350" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="14" stroke-linecap="round"/>
<rect x="390" y="258" width="20" height="22" rx="3" fill="#C9A46B"/>
<ellipse cx="400" cy="845" rx="200" ry="18" fill="#3A3236" opacity=".14" filter="url(#soft)"/>""")
print("ok")
