"""Sinh các sơ đồ SVG theo ký hiệu bản vẽ kiến trúc (dùng class CSS theo theme)."""
import json, sys

def door(x, y, w, wall='h', into=1, flip=False):
    """Cửa đi trên tường: khe tường + cánh + cung mở. wall 'h' (tường ngang) hoặc 'v'.
    into = +1/-1 hướng cánh mở vào phía nào; flip: bản lề ở đầu kia."""
    if wall == 'h':
        hx = x + w if flip else x
        ex = x if flip else x + w
        ly = y + into * w
        sweep = (1 if into > 0 else 0) ^ (1 if flip else 0)
        return (f'<line class="gap" x1="{x}" y1="{y}" x2="{x+w}" y2="{y}"/>'
                f'<line class="leaf" x1="{hx}" y1="{y}" x2="{hx}" y2="{ly}"/>'
                f'<path class="swing" d="M{ex} {y} A{w} {w} 0 0 {sweep} {hx} {ly}"/>')
    else:
        hy = y + w if flip else y
        ey = y if flip else y + w
        lx = x + into * w
        sweep = (0 if into > 0 else 1) ^ (1 if flip else 0)
        return (f'<line class="gap" x1="{x}" y1="{y}" x2="{x}" y2="{y+w}"/>'
                f'<line class="leaf" x1="{x}" y1="{hy}" x2="{lx}" y2="{hy}"/>'
                f'<path class="swing" d="M{x} {ey} A{w} {w} 0 0 {sweep} {lx} {hy}"/>')

def stair(x, y, w, h, n=8, vertical=True, arrow=True):
    s = f'<rect class="stair" x="{x}" y="{y}" width="{w}" height="{h}"/>'
    if vertical:
        half = w / 2
        for k in range(1, n):
            yy = y + h * k / n
            s += f'<line class="tread" x1="{x}" y1="{yy:.1f}" x2="{x+w}" y2="{yy:.1f}"/>'
        s += f'<line class="tread" x1="{x+half}" y1="{y}" x2="{x+half}" y2="{y+h}"/>'
        if arrow:
            s += f'<path class="up" d="M{x+half/2:.1f} {y+h-4} V{y+8} M{x+half/2-3:.1f} {y+12} L{x+half/2:.1f} {y+6} L{x+half/2+3:.1f} {y+12}"/>'
    return s

def arrow(x1, y1, x2, y2):
    import math
    a = math.atan2(y2 - y1, x2 - x1); L = 7
    p1 = (x2 - L * math.cos(a - .45), y2 - L * math.sin(a - .45)); p2 = (x2 - L * math.cos(a + .45), y2 - L * math.sin(a + .45))
    return (f'<line class="flow" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"/>'
            f'<path class="flowhead" d="M{x2} {y2} L{p1[0]:.1f} {p1[1]:.1f} L{p2[0]:.1f} {p2[1]:.1f} Z"/>')

def dim(x1, y1, x2, y2, label, lx, ly, anchor='middle', cls='s'):
    import math
    a = math.atan2(y2 - y1, x2 - x1); t = 4
    nx, ny = -math.sin(a) * t, math.cos(a) * t
    return (f'<line class="dim" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}"/>'
            f'<line class="dim" x1="{x1-nx:.1f}" y1="{y1-ny:.1f}" x2="{x1+nx:.1f}" y2="{y1+ny:.1f}"/>'
            f'<line class="dim" x1="{x2-nx:.1f}" y1="{y2-ny:.1f}" x2="{x2+nx:.1f}" y2="{y2+ny:.1f}"/>'
            f'<text x="{lx}" y="{ly}" class="{cls} dimt" text-anchor="{anchor}">{label}</text>')

def truck(x, y, s=1.0, facing=1):
    # xe chữa cháy nhìn từ trên (mặt bằng) hoặc bên (mặt đứng) — dùng mặt bằng đơn giản
    w, h = 46 * s, 16 * s
    cab = 12 * s
    if facing > 0:
        body = f'<rect class="truck" x="{x}" y="{y}" width="{w-cab}" height="{h}" rx="2"/><rect class="truckcab" x="{x+w-cab}" y="{y+1*s}" width="{cab}" height="{h-2*s}" rx="2"/>'
    else:
        body = f'<rect class="truckcab" x="{x}" y="{y+1*s}" width="{cab}" height="{h-2*s}" rx="2"/><rect class="truck" x="{x+cab}" y="{y}" width="{w-cab}" height="{h}" rx="2"/>'
    ladder = f'<line class="ladder" x1="{x+6*s}" y1="{y+h/2}" x2="{x+w-cab-4*s}" y2="{y+h/2}"/>'
    return body + ladder

def truck_side(x, y, s=1.0):
    return (f'<rect class="truck" x="{x}" y="{y}" width="{40*s}" height="{14*s}" rx="2"/>'
            f'<rect class="truckcab" x="{x+40*s}" y="{y+3*s}" width="{12*s}" height="{11*s}" rx="2"/>'
            f'<line class="ladder" x1="{x+2*s}" y1="{y-3*s}" x2="{x+36*s}" y2="{y-3*s}"/>'
            f'<circle class="wheel" cx="{x+9*s}" cy="{y+15*s}" r="{3.5*s}"/><circle class="wheel" cx="{x+44*s}" cy="{y+15*s}" r="{3.5*s}"/>')

def road_h(x, y, w, h, center=True):
    s = f'<rect class="asphalt" x="{x}" y="{y}" width="{w}" height="{h}"/>'
    s += f'<line class="edge" x1="{x}" y1="{y+2}" x2="{x+w}" y2="{y+2}"/><line class="edge" x1="{x}" y1="{y+h-2}" x2="{x+w}" y2="{y+h-2}"/>'
    if center:
        s += f'<line class="lane" x1="{x}" y1="{y+h/2}" x2="{x+w}" y2="{y+h/2}"/>'
    return s

def exit_sign(x, y):
    return f'<rect class="exitbox" x="{x}" y="{y}" width="22" height="10" rx="1.5"/><text x="{x+11}" y="{y+7.6}" class="exitt" text-anchor="middle">EXIT</text>'

def person(x, y):
    return f'<circle class="ppl" cx="{x}" cy="{y}" r="2.6"/>'

D = {}

# 1. Chiều cao PCCC — mặt cắt
s = '<svg viewBox="0 0 360 270" class="dg">'
s += '<defs><pattern id="hc1" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="hatchl" x1="0" y1="0" x2="0" y2="6"/></pattern></defs>'
s += '<rect x="0" y="232" width="360" height="12" fill="url(#hc1)"/><line class="ground" x1="0" y1="232" x2="360" y2="232"/>'
s += road_h(0, 222, 120, 12, center=False)
s += truck_side(20, 204, 1.0)
s += '<text x="6" y="258" class="s">Mặt đường xe chữa cháy tiếp cận</text>'
# building section
X, W = 150, 110
s += f'<rect class="w" x="{X}" y="42" width="{W}" height="190"/>'
floors = [194, 156, 118, 80]
for fy in floors:
    s += f'<rect class="slab" x="{X}" y="{fy}" width="{W}" height="4"/>'
# windows on left facade each floor
for fy in [232, 194, 156, 118, 80]:
    s += f'<rect class="glass" x="{X-3}" y="{fy-28}" width="6" height="20"/>'
s += f'<rect class="slab" x="{X}" y="42" width="{W}" height="4"/>'
s += f'<rect class="tech" x="{X+10}" y="14" width="{W-20}" height="28"/><text x="{X+W/2}" y="32" class="s" text-anchor="middle">Tầng kỹ thuật trên cùng</text>'
s += f'<rect class="slab" x="{X-6}" y="38" width="{W+12}" height="4"/>'
# top floor window sill at y=72 (window 52..72)
s += f'<line class="dim2" x1="{X-3}" y1="72" x2="{X+40}" y2="72"/>'
s += dim(130, 222, 130, 72, '', 0, 0)
s += '<text x="124" y="130" class="b" text-anchor="end">Chiều cao</text><text x="124" y="144" class="b" text-anchor="end">PCCC</text>'
s += f'<text x="{X+W+8}" y="62" class="s">Mép dưới cửa</text><text x="{X+W+8}" y="74" class="s">sổ tầng trên</text><text x="{X+W+8}" y="86" class="s">cùng</text>'
s += f'<line class="lead" x1="{X+40}" y1="72" x2="{X+W+4}" y2="72"/>'
s += '</svg>'
D['chieu-cao'] = s

# 2. Buồng thang N1, N2, N3 — mặt bằng
def stair_core(x, y, label):
    return f'<rect class="wallr" x="{x}" y="{y}" width="64" height="86"/>' + stair(x + 6, y + 6, 52, 74, 9) + f'<text x="{x+32}" y="{y-6}" class="b" text-anchor="middle">{label}</text>'
s = '<svg viewBox="0 0 360 250" class="dg">'
# corridor band
s += '<rect class="corr" x="6" y="150" width="348" height="34"/><text x="180" y="200" class="s" text-anchor="middle">Hành lang tầng</text>'
# N1
s += stair_core(14, 30, 'N1')
s += '<rect class="air" x="14" y="116" width="64" height="34"/><text x="88" y="130" class="s" text-anchor="start">Ban công</text><text x="88" y="142" class="s">hở</text>'
s += '<line class="rail" x1="10" y1="116" x2="10" y2="150"/><line class="rail" x1="82" y1="116" x2="82" y2="150"/>'
s += door(30, 116, 16, 'h', into=-1) + door(30, 150, 16, 'h', into=-1)
s += arrow(38, 172, 38, 156)
# N2
s += stair_core(148, 30, 'N2')
s += '<text x="180" y="132" class="s" text-anchor="middle">Quạt tăng áp</text><circle class="fan" cx="180" cy="122" r="0"/>'
s += '<path class="press" d="M168 48 l6 -6 l6 6 M192 48 l6 -6 l6 6"/>'
s += door(164, 116, 16, 'h', into=-1)
s += '<line class="wall2" x1="148" y1="116" x2="164" y2="116"/><line class="wall2" x1="180" y1="116" x2="212" y2="116"/>'
s += arrow(172, 172, 172, 156)
# N3
s += stair_core(276, 24, 'N3')
s += '<rect class="lob" x="276" y="106" width="64" height="44"/><text x="308" y="131" class="s" text-anchor="middle">Khoang đệm</text>'
s += '<path class="press" d="M286 118 l5 -5 l5 5"/>'
s += door(300, 106, 16, 'h', into=-1) + door(300, 150, 16, 'h', into=-1)
s += arrow(308, 172, 308, 156)
s += '<text x="6" y="218" class="s">Mũi tên xanh: hướng thoát nạn</text><text x="6" y="231" class="s">Dấu ^ đỏ: áp suất không khí dương khi cháy</text>'
s += '<text x="6" y="244" class="s">N1: qua ban công hở · N2: tăng áp · N3: qua khoang đệm</text>'
s += '</svg>'
D['buong-thang'] = s

# 3. Vùng đệm N1 ở góc nhà (mặt bằng)
s = '<svg viewBox="0 0 360 250" class="dg">'
s += '<rect class="corr" x="24" y="150" width="200" height="30"/><text x="40" y="169" class="s">Hành lang tầng</text>'
s += '<line class="wall2" x1="20" y1="184" x2="230" y2="184"/>'
s += '<path class="wallthick" d="M20 240 V100 H230 V36 H350"/>'
s += '<rect class="glass" x="42" y="97" width="34" height="6"/><text x="59" y="118" class="s" text-anchor="middle">Cửa sổ</text>'
s += '<rect class="air" x="130" y="104" width="96" height="42"/><text x="134" y="140" class="s">Lối đi hở</text>'
s += '<line class="rail" x1="130" y1="104" x2="226" y2="104"/>'
s += '<rect class="wallr" x="236" y="104" width="70" height="100"/>' + stair(242, 110, 58, 88, 9)
s += '<text x="271" y="220" class="b" text-anchor="middle">Buồng thang N1</text>'
s += door(236, 112, 16, 'v', into=-1) + door(150, 146, 16, 'h', into=1)
s += '<circle class="pt" cx="230" cy="100" r="3.5"/>'
s += dim(76, 84, 130, 84, '≥ 2 m', 103, 78)
s += dim(130, 64, 230, 64, '≥ 4 m tới đỉnh góc', 180, 58)
s += arrow(158, 172, 158, 152) + arrow(190, 122, 230, 122)
s += '<text x="240" y="62" class="s">Góc &lt; 135°</text>'
s += '<text x="24" y="206" class="s">Lối đi ≥ 1,2 m, lan can 1,2 m;</text><text x="24" y="219" class="s">tường giữa các cửa vùng đệm ≥ 1,2 m</text>'
s += '</svg>'
D['vung-dem'] = s

# 4. Đai ngăn cháy — mặt cắt tường ngoài
s = '<svg viewBox="0 0 360 260" class="dg">'
def facade(x, mode):
    o = ''
    for fy in [40, 120, 200]:
        o += f'<rect class="slab" x="{x}" y="{fy}" width="80" height="6"/>'
    if mode == 'a':
        for top in [46, 126]:
            o += f'<rect class="glass" x="{x-4}" y="{top+2}" width="6" height="40"/>'
            o += f'<rect class="solid" x="{x-6}" y="{top+42}" width="10" height="36"/>'
        o += dim(x - 18, 88, x - 18, 126, '≥ 1,0 m', x - 22, 110, 'end')
    elif mode == 'b':
        for top in [46, 126]:
            o += f'<rect class="glass" x="{x-4}" y="{top+2}" width="6" height="66"/>'
        o += f'<rect class="solid" x="{x-36}" y="120" width="36" height="6"/>'
        o += dim(x - 36, 108, x, 108, '≥ 0,6 m', x - 18, 102)
    else:
        for top in [46, 126]:
            o += f'<rect class="glass" x="{x-4}" y="{top}" width="6" height="74"/>'
        for sy in [114, 194]:
            o += f'<line class="pipe" x1="{x+8}" y1="{sy-70}" x2="{x+8}" y2="{sy}"/>'
            o += f'<circle class="spk" cx="{x+8}" cy="{sy-66}" r="3.5"/><path class="spray" d="M{x+8} {sy-63} L{x-2} {sy-40} M{x+8} {sy-63} L{x+18} {sy-40}"/>'
        o += f'<text x="{x+14}" y="92" class="s">Sprinkler</text><text x="{x+14}" y="104" class="s">≤ 0,5 m</text>'
    return o
s += facade(66, 'a') + facade(186, 'b') + facade(276, 'c')
s += '<text x="20" y="236" class="s">a) Tường đặc</text><text x="20" y="249" class="s">không cháy</text>'
s += '<text x="150" y="236" class="s">b) Ô văng</text><text x="150" y="249" class="s">không cháy</text>'
s += '<text x="262" y="236" class="s">c) Kính ≥ 6 mm</text><text x="262" y="249" class="s">+ sprinkler ≤ 2 m</text>'
s += '<text x="74" y="30" class="s">Sàn</text>'
s += '</svg>'
D['dai-ngan-chay'] = s

# 5. Hai lối ra phân tán
s = '<svg viewBox="0 0 360 250" class="dg">'
s += '<text x="20" y="18" class="b">≥ D/2 (nhà có sprinkler toàn bộ: ≥ D/3)</text>'
s += '<rect class="wallthick fillroom" x="56" y="34" width="280" height="150"/>'
s += door(56, 58, 26, 'v', into=-1) + door(232, 184, 26, 'h', into=1)
s += '<line class="diag" x1="56" y1="184" x2="336" y2="34"/><text x="262" y="78" class="s">Đường chéo D</text>'
s += dim(56, 58, 258, 184, '', 0, 0)
s += '<text x="138" y="146" class="b">≥ D/2</text>'
s += exit_sign(62, 42) + exit_sign(262, 170)
for (px, py) in [(140, 72), (190, 92), (230, 122), (280, 104), (110, 120), (160, 160)]:
    s += person(px, py)
s += arrow(130, 72, 64, 72) + arrow(248, 140, 246, 178)
s += '<text x="8" y="100" class="s">Lối</text><text x="8" y="112" class="s">ra 1</text>'
s += '<text x="244" y="230" class="s">Lối ra 2</text>'
s += '<text x="20" y="244" class="s">Đo giữa hai cạnh xa nhất của hai lối ra (≥ 7 m)</text>'
s += '</svg>'
D['loi-ra'] = s

# 6. Bãi đỗ, đường xe, lối vào từ trên cao — tổng mặt bằng
s = '<svg viewBox="0 0 360 280" class="dg">'
s += '<defs><pattern id="hc6" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="hatchl" x1="0" y1="0" x2="0" y2="7"/></pattern></defs>'
s += '<rect class="w" x="30" y="16" width="270" height="104"/><text x="165" y="64" class="b" text-anchor="middle">Nhà</text>'
for ex in [60, 150, 240]:
    s += f'<rect class="glass" x="{ex}" y="117" width="26" height="6"/><path class="tri" d="M{ex+13} 104 l7 10 h-14 z"/>'
s += '<text x="165" y="96" class="s" text-anchor="middle">▲ Lối vào từ trên cao (850 × 1 000 mm)</text>'
s += dim(73, 132, 163, 132, '≤ 20 m', 118, 128)
# bãi đỗ
s += '<rect x="30" y="150" width="300" height="40" fill="url(#hc6)" class="park"/><rect class="parkedge" x="30" y="150" width="300" height="40"/>'
s += truck(250, 162, 1.0)
s += '<text x="40" y="184" class="s">Bãi đỗ xe chữa cháy ≥ 6 × 15 m</text>'
s += dim(320, 123, 320, 150, '', 0, 0) + '<text x="326" y="134" class="s">2 –</text><text x="326" y="146" class="s">10 m</text>'
# đường xe
s += road_h(0, 196, 360, 36)
s += truck(270, 202, 0.9, -1)
s += dim(350, 196, 350, 232, '', 0, 0) + '<text x="344" y="244" class="s" text-anchor="end">Đường xe ≥ 3,5 m</text>'
s += '<text x="6" y="258" class="s">Cao thông thủy ≥ 4,5 m, dốc ≤ 1:8,3; mép đường cách tường</text>'
s += '<text x="6" y="270" class="s">nhà ≤ 5 / 8 / 10 m theo chiều cao PCCC</text>'
s += '</svg>'
D['bai-do'] = s

# 7. Khoảng cách thoát nạn, hành lang cụt (G.1)
s = '<svg viewBox="0 0 360 250" class="dg">'
s += '<rect class="corr" x="20" y="100" width="320" height="30"/>'
s += '<line class="wall2" x1="20" y1="100" x2="340" y2="100"/><line class="wall2" x1="20" y1="130" x2="340" y2="130"/><line class="wall2" x1="340" y1="100" x2="340" y2="130"/>'
# stairs at x=20..60 and 230..270? put stair A left, stair B at 250, dead end right of stair B to 340
s += '<rect class="wallr" x="20" y="34" width="44" height="66"/>' + stair(24, 38, 36, 58, 7)
s += '<rect class="wallr" x="236" y="34" width="44" height="66"/>' + stair(240, 38, 36, 58, 7)
s += door(30, 100, 14, 'h', into=-1) + door(246, 100, 14, 'h', into=-1)
for (cx, lab) in [(100, ''), (150, ''), (200, ''), (310, '')]:
    s += f'<rect class="apt" x="{cx-22}" y="130" width="44" height="54"/>' + door(cx - 7, 130, 14, 'h', into=1)
s += '<text x="100" y="200" class="s" text-anchor="middle">Căn hộ</text><text x="310" y="200" class="s" text-anchor="middle">Căn hộ</text>'
s += arrow(150, 115, 50, 115) + arrow(150, 115, 250, 115) + arrow(310, 115, 262, 115)
s += dim(64, 222, 236, 222, 'Giữa hai lối ra: ≤ 40 m (bậc I, II – S0)', 150, 216)
s += dim(260, 240, 340, 240, '', 0, 0) + '<text x="300" y="236" class="s" text-anchor="middle">Cụt ≤ 25 m</text>'
s += '<text x="20" y="24" class="s">Đo dọc tâm hành lang, từ tâm cửa căn hộ tới tâm cửa buồng thang</text>'
s += '<text x="42" y="30" class="s"></text>'
s += '</svg>'
D['khoang-cach'] = s

# 8. Tường ngăn cháy cắt mặt ngoài
s = '<svg viewBox="0 0 360 230" class="dg">'
s += '<rect class="w" x="20" y="40" width="320" height="140"/>'
s += '<rect class="firewall" x="174" y="40" width="12" height="140"/><rect class="firewall" x="174" y="180" width="12" height="18"/>'
s += '<text x="180" y="30" class="b" text-anchor="middle">Tường ngăn cháy loại 1</text>'
s += '<line class="wallthick" x1="20" y1="180" x2="340" y2="180"/>'
for gx in [60, 110, 240, 290]:
    s += f'<rect class="glass" x="{gx}" y="177" width="28" height="6"/>'
s += dim(186, 206, 186, 180, '', 0, 0) + '<text x="192" y="200" class="s">≥ 30 cm vươn ra</text>'
s += dim(138, 216, 240, 216, '≥ 4 m giữa lỗ mở hai bên (góc < 135°)', 189, 228)
s += '<text x="30" y="110" class="s">Khoang cháy 1</text><text x="250" y="110" class="s">Khoang cháy 2</text>'
s += '<text x="30" y="160" class="s">Tường ngoài K1 – K3</text>'
s += '</svg>'
D['tuong-ngan-chay'] = s

json.dump(D, open(sys.argv[1], 'w'), ensure_ascii=False)
print(len(D))
