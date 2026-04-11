#!/usr/bin/env python3
"""
Generate a branded DÉPS organigramme as a print-ready PDF.

Brand palette (from the DÉPS logo):
    Navy         #141F4E   primary
    Navy deep    #0B1336   governance
    Navy soft    #2A3770   secondary text / connectors
    Teal         #2BC4D4   accent (the macron over the "e")
    Paper        #F5F7FB   subtle background tint

Output: organigramme.pdf  (A3 landscape, 420 x 297 mm)
"""

from reportlab.lib.pagesizes import A3, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfbase import pdfmetrics

# ============ BRAND CONSTANTS ============
NAVY       = HexColor("#141F4E")
NAVY_DEEP  = HexColor("#0B1336")
NAVY_SOFT  = HexColor("#2A3770")
NAVY_MID   = HexColor("#1E2C63")
TEAL       = HexColor("#2BC4D4")
TEAL_SOFT  = HexColor("#6FDFEA")
INK        = HexColor("#0E1430")
PAPER      = HexColor("#F5F7FB")
LINE_COL   = HexColor("#C2CAE0")
HAIRLINE   = HexColor("#D6DCEE")
WHITE      = HexColor("#FFFFFF")

SHADOW     = Color(0.04, 0.08, 0.21, alpha=0.18)
SOFT_BG    = HexColor("#EEF2FB")

FONT_REG  = "Helvetica"
FONT_BOLD = "Helvetica-Bold"

# ============ PAGE ============
PAGE = landscape(A3)
W, H = PAGE  # ~ 1190.55 x 841.89 pt


# ============ HELPERS ============
def wrap_text(text, font, size, max_width):
    """Greedy word wrap."""
    words = text.split()
    lines, cur = [], []
    for w in words:
        test = " ".join(cur + [w])
        if pdfmetrics.stringWidth(test, font, size) <= max_width:
            cur.append(w)
        else:
            if cur:
                lines.append(" ".join(cur))
            cur = [w]
    if cur:
        lines.append(" ".join(cur))
    return lines


def draw_card(c, cx, cy, width, height, role, name, variant="default"):
    """Draw a branded card centered at (cx, cy)."""
    x = cx - width / 2
    y = cy - height / 2
    radius = 9

    # --- Shadow ---
    c.setFillColor(SHADOW)
    c.roundRect(x + 2.5, y - 3.5, width, height, radius, fill=1, stroke=0)

    # --- Background ---
    if variant == "board":
        c.setFillColor(NAVY_DEEP)
    elif variant in ("staff", "admin"):
        c.setFillColor(WHITE)
    else:
        c.setFillColor(NAVY)
    c.roundRect(x, y, width, height, radius, fill=1, stroke=0)

    # --- Subtle inner highlight for dark cards ---
    if variant in ("default", "board", "exec"):
        c.setFillColor(Color(1, 1, 1, alpha=0.04))
        c.roundRect(x + 1.2, y + 1.2, width - 2.4, height - 2.4, radius - 1, fill=1, stroke=0)

    # --- Card borders ---
    if variant == "staff":
        c.setStrokeColor(HAIRLINE)
        c.setLineWidth(0.6)
        c.roundRect(x, y, width, height, radius, fill=0, stroke=1)
    elif variant == "admin":
        c.setStrokeColor(NAVY_SOFT)
        c.setLineWidth(0.9)
        c.setDash([3, 2.5])
        c.roundRect(x, y, width, height, radius, fill=0, stroke=1)
        c.setDash()

    # --- Teal accent bar (top) ---
    c.setFillColor(TEAL)
    bar_inset = 9
    bar_h = 3
    c.rect(x + bar_inset, y + height - bar_h, width - 2 * bar_inset, bar_h,
           fill=1, stroke=0)

    # --- Text ---
    if variant in ("staff", "admin"):
        role_color = NAVY
        name_color = NAVY_SOFT
    else:
        role_color = WHITE
        name_color = Color(1, 1, 1, alpha=0.82)

    role_size = 9 if variant == "exec" else 8.5
    name_size = 8.2 if variant == "exec" else 7.8
    role_font = FONT_BOLD
    name_font = FONT_REG
    max_text_w = width - 22

    role_lines = wrap_text(role, role_font, role_size, max_text_w)
    name_lines = wrap_text(name, name_font, name_size, max_text_w)

    role_line_h = role_size + 1.8
    name_line_h = name_size + 1.2
    gap = 3.5

    total_text_h = (len(role_lines) * role_line_h
                    + (gap if name_lines else 0)
                    + len(name_lines) * name_line_h)

    # Vertical center (excluding top accent)
    mid_y = y + (height - bar_h) / 2 - 1
    top_text_y = mid_y + total_text_h / 2 - role_size * 0.78

    # Role lines
    c.setFillColor(role_color)
    c.setFont(role_font, role_size)
    cur_y = top_text_y
    for line in role_lines:
        tw = pdfmetrics.stringWidth(line, role_font, role_size)
        c.drawString(cx - tw / 2, cur_y, line)
        cur_y -= role_line_h

    # Name lines
    cur_y -= gap - role_line_h + name_line_h - 1
    c.setFillColor(name_color)
    c.setFont(name_font, name_size)
    for line in name_lines:
        tw = pdfmetrics.stringWidth(line, name_font, name_size)
        c.drawString(cx - tw / 2, cur_y, line)
        cur_y -= name_line_h


def draw_logo(c, x, y):
    """Draw the DÉPS logo starting from baseline at (x, y)."""
    size = 46
    c.setFont(FONT_BOLD, size)

    # "deps" in navy — we will overdraw the teal macron over the 'e'
    c.setFillColor(NAVY)
    c.drawString(x, y, "deps")

    d_w = pdfmetrics.stringWidth("d", FONT_BOLD, size)
    e_w = pdfmetrics.stringWidth("e", FONT_BOLD, size)

    # Teal macron above the 'e'
    c.setFillColor(TEAL)
    bar_x = x + d_w + 2
    bar_y = y + size * 0.77
    bar_w = e_w - 4
    c.rect(bar_x, bar_y, bar_w, 3.6, fill=1, stroke=0)

    # Full-name block to the right
    deps_w = pdfmetrics.stringWidth("deps", FONT_BOLD, size)
    text_x = x + deps_w + 18

    # Thin divider
    c.setStrokeColor(Color(0.08, 0.12, 0.31, alpha=0.22))
    c.setLineWidth(0.8)
    c.line(text_x - 9, y + 3, text_x - 9, y + 38)

    c.setFillColor(NAVY)
    c.setFont(FONT_BOLD, 9.5)
    c.drawString(text_x, y + 28, "Développement")
    c.drawString(text_x, y + 16, "Économique")
    c.drawString(text_x, y + 4,  "Pierre-De Saurel")


def set_line(c, color=None, width=1.2, dashed=False):
    c.setStrokeColor(color or NAVY_SOFT)
    c.setLineWidth(width)
    if dashed:
        c.setDash([3, 2.5])
    else:
        c.setDash()


# ============ MAIN ============
def main():
    c = canvas.Canvas("organigramme.pdf", pagesize=PAGE)
    c.setTitle("Organigramme — DÉPS")
    c.setAuthor("Développement Économique Pierre-De Saurel")
    c.setSubject("Structure organisationnelle")

    # ---------- Background ----------
    c.setFillColor(WHITE)
    c.rect(0, 0, W, H, fill=1, stroke=0)

    # Corner brand accents (thin teal L-marks, very subtle)
    c.setStrokeColor(TEAL)
    c.setLineWidth(1.6)
    # top-left
    c.line(32, H - 32, 60, H - 32)
    c.line(32, H - 32, 32, H - 60)
    # top-right
    c.line(W - 60, H - 32, W - 32, H - 32)
    c.line(W - 32, H - 32, W - 32, H - 60)
    # bottom-left
    c.line(32, 32, 60, 32)
    c.line(32, 32, 32, 60)
    # bottom-right
    c.line(W - 60, 32, W - 32, 32)
    c.line(W - 32, 32, W - 32, 60)

    # ---------- Header ----------
    draw_logo(c, 55, 770)

    # Title (right-aligned)
    c.setFillColor(TEAL)
    c.setFont(FONT_BOLD, 9)
    eyebrow = "STRUCTURE ORGANISATIONNELLE"
    tw = pdfmetrics.stringWidth(eyebrow, FONT_BOLD, 9)
    # Letter-spacing emulation: draw each char with extra spacing
    ls = 1.6
    total_w = tw + ls * (len(eyebrow) - 1)
    ex = W - 55 - total_w
    for ch in eyebrow:
        c.drawString(ex, 803, ch)
        ex += pdfmetrics.stringWidth(ch, FONT_BOLD, 9) + ls

    c.setFillColor(NAVY)
    c.setFont(FONT_BOLD, 24)
    title = "Organigramme"
    tw = pdfmetrics.stringWidth(title, FONT_BOLD, 24)
    c.drawString(W - 55 - tw, 775, title)

    c.setFillColor(NAVY_SOFT)
    c.setFont(FONT_REG, 10)
    sub = "Équipe  ·  2026"
    tw = pdfmetrics.stringWidth(sub, FONT_REG, 10)
    c.drawString(W - 55 - tw, 760, sub)

    # Header separator
    c.setStrokeColor(Color(0.08, 0.12, 0.31, alpha=0.12))
    c.setLineWidth(0.8)
    c.line(55, 745, W - 55, 745)

    # ---------- CHART POSITIONS ----------
    CENTER_X = 615

    # Row 1 : CA
    CA = dict(x=CENTER_X, y=712, w=240, h=54)

    # Row 2 : DG
    DG = dict(x=CENTER_X, y=618, w=260, h=60)

    # Row 3 : direct reports (+ Coord admin adjunct at same level)
    ROW3_Y = 430
    TOURISME = dict(x=125, y=ROW3_Y, w=180, h=60)
    COORD    = dict(x=310, y=ROW3_Y, w=130, h=54)
    DGA      = dict(x=490, y=ROW3_Y, w=215, h=60)
    COMM     = dict(x=770, y=ROW3_Y, w=220, h=72)
    CHEFFE   = dict(x=1020, y=ROW3_Y, w=210, h=60)

    # Row 4 : leaves
    ROW4_Y = 278
    LEAF_W, LEAF_H = 108, 78

    L1 = dict(x=80,  y=ROW4_Y, w=LEAF_W, h=LEAF_H)  # Tourisme - Karianne
    L2 = dict(x=196, y=ROW4_Y, w=LEAF_W, h=LEAF_H)  # Tourisme - Camille
    L3 = dict(x=370, y=ROW4_Y, w=LEAF_W, h=LEAF_H)  # DGA - Mélanie
    L4 = dict(x=490, y=ROW4_Y, w=LEAF_W, h=LEAF_H)  # DGA - Éric
    L5 = dict(x=610, y=ROW4_Y, w=LEAF_W, h=LEAF_H)  # DGA - Daniella
    L6 = dict(x=1020, y=ROW4_Y, w=LEAF_W, h=LEAF_H) # Cheffe - Caroline

    # ---------- Draw connectors (behind cards) ----------
    set_line(c, NAVY_SOFT, width=1.35)

    # CA -> DG
    c.line(CA["x"], CA["y"] - CA["h"] / 2,
           DG["x"], DG["y"] + DG["h"] / 2)

    # DG -> Row3 bus (4 direct reports; Coord admin is adjunct)
    dg_bottom = DG["y"] - DG["h"] / 2
    tourisme_top  = ROW3_Y + TOURISME["h"] / 2
    dga_top       = ROW3_Y + DGA["h"] / 2
    comm_top      = ROW3_Y + COMM["h"] / 2
    cheffe_top    = ROW3_Y + CHEFFE["h"] / 2
    bus_y = (dg_bottom + max(tourisme_top, dga_top, comm_top, cheffe_top)) / 2

    c.line(DG["x"], dg_bottom, DG["x"], bus_y)
    c.line(TOURISME["x"], bus_y, CHEFFE["x"], bus_y)
    c.line(TOURISME["x"], bus_y, TOURISME["x"], tourisme_top)
    c.line(DGA["x"], bus_y, DGA["x"], dga_top)
    c.line(COMM["x"], bus_y, COMM["x"], comm_top)
    c.line(CHEFFE["x"], bus_y, CHEFFE["x"], cheffe_top)

    # Coord admin -> DGA (short dashed horizontal adjunct)
    set_line(c, NAVY_SOFT, width=1.1, dashed=True)
    coord_right = COORD["x"] + COORD["w"] / 2
    dga_left = DGA["x"] - DGA["w"] / 2
    c.line(coord_right, COORD["y"], dga_left, COORD["y"])
    set_line(c, NAVY_SOFT, width=1.35, dashed=False)

    # Tourisme -> 2 leaves
    t_bottom = ROW3_Y - TOURISME["h"] / 2
    row4_top = ROW4_Y + LEAF_H / 2
    t_bus = (t_bottom + row4_top) / 2 - 4
    c.line(TOURISME["x"], t_bottom, TOURISME["x"], t_bus)
    c.line(L1["x"], t_bus, L2["x"], t_bus)
    c.line(L1["x"], t_bus, L1["x"], row4_top)
    c.line(L2["x"], t_bus, L2["x"], row4_top)

    # DGA -> 3 leaves
    d_bottom = ROW3_Y - DGA["h"] / 2
    d_bus = (d_bottom + row4_top) / 2 - 4
    c.line(DGA["x"], d_bottom, DGA["x"], d_bus)
    c.line(L3["x"], d_bus, L5["x"], d_bus)
    c.line(L3["x"], d_bus, L3["x"], row4_top)
    c.line(L4["x"], d_bus, L4["x"], row4_top)
    c.line(L5["x"], d_bus, L5["x"], row4_top)

    # Cheffe comm -> 1 leaf
    ch_bottom = ROW3_Y - CHEFFE["h"] / 2
    c.line(CHEFFE["x"], ch_bottom, CHEFFE["x"], row4_top)

    # Small teal dots at each connector junction (brand touch)
    c.setFillColor(TEAL)
    for (px, py) in [
        (DG["x"], bus_y),
        (TOURISME["x"], bus_y), (DGA["x"], bus_y),
        (COMM["x"], bus_y), (CHEFFE["x"], bus_y),
        (TOURISME["x"], t_bus), (DGA["x"], d_bus),
    ]:
        c.circle(px, py, 2.2, fill=1, stroke=0)

    # ---------- Draw cards ----------
    draw_card(c, CA["x"], CA["y"], CA["w"], CA["h"],
              "Conseil d'administration — Présidente",
              "Chantal Cimon", variant="board")

    draw_card(c, DG["x"], DG["y"], DG["w"], DG["h"],
              "Directrice Générale",
              "Julie Gagnon, MBA", variant="exec")

    draw_card(c, COORD["x"], COORD["y"], COORD["w"], COORD["h"],
              "Coordonnatrice administrative",
              "Marie-Soleil Patenaude", variant="admin")

    draw_card(c, TOURISME["x"], TOURISME["y"], TOURISME["w"], TOURISME["h"],
              "Directrice Tourisme",
              "Marie-Josée Picard")

    draw_card(c, DGA["x"], DGA["y"], DGA["w"], DGA["h"],
              "Directeur Général-Adjoint",
              "Jean-François Leblanc, C.P.A")

    draw_card(c, COMM["x"], COMM["y"], COMM["w"], COMM["h"],
              "Commissaire au développement économique",
              "Jean-Philip Beaumier")

    draw_card(c, CHEFFE["x"], CHEFFE["y"], CHEFFE["w"], CHEFFE["h"],
              "Cheffe des communications",
              "Emanuèle Roux")

    # Row 4
    draw_card(c, L1["x"], L1["y"], L1["w"], L1["h"],
              "Conseillère touristique",
              "Karianne Lafrenière", variant="staff")

    draw_card(c, L2["x"], L2["y"], L2["w"], L2["h"],
              "Conseillère au développement agricole et agroalimentaire (PDZA)",
              "Camille Bergeron", variant="staff")

    draw_card(c, L3["x"], L3["y"], L3["w"], L3["h"],
              "Conseillère aux entreprises",
              "Mélanie Dulong", variant="staff")

    draw_card(c, L4["x"], L4["y"], L4["w"], L4["h"],
              "Conseiller aux entreprises",
              "Éric Coulombe", variant="staff")

    draw_card(c, L5["x"], L5["y"], L5["w"], L5["h"],
              "Conseillère aux entreprises et à la direction",
              "Daniella Marie Eunice Icart", variant="staff")

    draw_card(c, L6["x"], L6["y"], L6["w"], L6["h"],
              "Conseillère à l'attraction et rétention des talents",
              "Caroline Roberge", variant="staff")

    # ---------- Legend ----------
    legend_y = 130
    c.setStrokeColor(Color(0.08, 0.12, 0.31, alpha=0.12))
    c.setLineWidth(0.8)
    c.line(55, legend_y + 28, W - 55, legend_y + 28)

    legend_items = [
        ("Gouvernance",           "board"),
        ("Direction & gestion",   "exec"),
        ("Soutien administratif", "admin"),
        ("Équipe conseil",        "staff"),
    ]

    item_w = 165
    total_w = item_w * len(legend_items)
    start_x = (W - total_w) / 2 + 10

    for i, (label, kind) in enumerate(legend_items):
        lx = start_x + i * item_w
        sw_x, sw_y, sw_w, sw_h = lx, legend_y, 24, 12

        if kind == "board":
            c.setFillColor(NAVY_DEEP)
            c.roundRect(sw_x, sw_y, sw_w, sw_h, 2, fill=1, stroke=0)
            c.setFillColor(TEAL)
            c.rect(sw_x + 2, sw_y + sw_h - 2, sw_w - 4, 2, fill=1, stroke=0)
        elif kind == "exec":
            c.setFillColor(NAVY)
            c.roundRect(sw_x, sw_y, sw_w, sw_h, 2, fill=1, stroke=0)
            c.setFillColor(TEAL)
            c.rect(sw_x + 2, sw_y + sw_h - 2, sw_w - 4, 2, fill=1, stroke=0)
        elif kind == "admin":
            c.setFillColor(WHITE)
            c.roundRect(sw_x, sw_y, sw_w, sw_h, 2, fill=1, stroke=0)
            c.setStrokeColor(NAVY_SOFT)
            c.setLineWidth(0.9)
            c.setDash([2.5, 2])
            c.roundRect(sw_x, sw_y, sw_w, sw_h, 2, fill=0, stroke=1)
            c.setDash()
        elif kind == "staff":
            c.setFillColor(WHITE)
            c.roundRect(sw_x, sw_y, sw_w, sw_h, 2, fill=1, stroke=0)
            c.setStrokeColor(HAIRLINE)
            c.setLineWidth(0.6)
            c.roundRect(sw_x, sw_y, sw_w, sw_h, 2, fill=0, stroke=1)
            c.setFillColor(TEAL)
            c.rect(sw_x + 2, sw_y + sw_h - 2, sw_w - 4, 2, fill=1, stroke=0)

        c.setFillColor(NAVY_SOFT)
        c.setFont(FONT_REG, 9)
        c.drawString(sw_x + sw_w + 8, sw_y + 2, label)

    # ---------- Footer ----------
    c.setFillColor(NAVY_SOFT)
    c.setFont(FONT_BOLD, 8)
    footer = "DÉVELOPPEMENT ÉCONOMIQUE PIERRE-DE SAUREL   ·   deps.qc.ca"
    ls = 1.0
    chars_w = sum(pdfmetrics.stringWidth(ch, FONT_BOLD, 8) for ch in footer) \
              + ls * (len(footer) - 1)
    fx = (W - chars_w) / 2
    for ch in footer:
        c.drawString(fx, 75, ch)
        fx += pdfmetrics.stringWidth(ch, FONT_BOLD, 8) + ls

    # Save
    c.save()
    print("PDF generated: organigramme.pdf")


if __name__ == "__main__":
    main()
