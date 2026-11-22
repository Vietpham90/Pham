"""Làm sơ đồ sinh động: bầu trời, cây, lửa, khói, người — chèn thêm vào SVG đã sinh.
Dùng: python3 decorate.py d1.json d2.json out.json"""
import json, sys, re
D = json.load(open(sys.argv[1], encoding='utf-8'))
for f in sys.argv[2:-1]: D.update({k: v['svg'] for k, v in json.load(open(f, encoding='utf-8')).items()})

def sky(h, w=360):
    return f'<rect class="sky" x="0" y="0" width="{w}" height="{h}"/>'
def tree(x, y, s=1.0):
    return f'<use href="#dg-tree" x="{x-10*s:.1f}" y="{y-30*s:.1f}" width="{20*s:.1f}" height="{30*s:.1f}"/>'
def flame(x, y, s=1.0):
    # gốc ngọn lửa tại (x, y)
    w, h = 21 * s, 30 * s
    o = f'<use class="flame" href="#dg-flame" x="{x-w/2:.1f}" y="{y-h:.1f}" width="{w:.1f}" height="{h:.1f}"/>'
    for k in range(3):
        o += f'<circle class="smoke s{k}" cx="{x + (k-1)*5*s:.1f}" cy="{y-h+6*s:.1f}" r="{(4+k)*s:.1f}"/>'
    return o
def walker(x, y, s=1.0, flip=False):
    tr = f' transform="translate({2*x:.1f} 0) scale(-1 1)"' if flip else ''
    return f'<use class="walker" href="#dg-walker" x="{x-7*s:.1f}" y="{y-18*s:.1f}" width="{14*s:.1f}" height="{18*s:.1f}"{tr}/>'

def after_open(svg, add):
    i = svg.index('>') + 1
    # chèn sau <defs> nếu có, để nền nằm dưới mọi thứ khác
    m = re.match(r'(<svg[^>]*>)(<defs>.*?</defs>)?', svg, re.S)
    j = m.end()
    return svg[:j] + add + svg[j:]
def before_close(svg, add):
    return svg[:svg.rindex('</svg>')] + add + '</svg>'

ADD = {
 'chieu-cao': (sky(232), tree(318, 232, 1.1) + tree(340, 232, .8) + walker(86, 220, .9)),
 'tang-ham': (sky(140), tree(178, 140, .9) + tree(348, 140, .8)),
 'loi-ra-mai': (sky(232), tree(350, 232, .8)),
 'lanh-nan': (sky(250), tree(60, 250, 1.1) + tree(30, 250, .8) + flame(175, 250 - 31 * 5, .8)),
 'dai-ngan-chay': ('', flame(110, 198, .9) + '<text x="124" y="190" class="s">Cháy tầng dưới</text>'),
 'tuong-ngan-chay': ('', flame(100, 150, 1.2) + '<text x="130" y="136" class="s">Đám cháy</text>'),
 'khan-cap': ('', flame(300, 120, 1.0) + walker(70, 176, 1.0)),
 'loi-ra': ('', flame(300, 60, .9)),
 'thang-may-cc': ('', ''),
 'bai-do': ('', tree(320, 120, .8) + tree(14, 120, .7)),
 'duong-tranh': ('', tree(110, 60, .7) + tree(300, 60, .8)),
 'khoang-cach-nha': (sky(196), tree(350, 196, .8) + tree(12, 196, .7) + flame(75, 152, .8)),
 'thang-loai-3': (sky(220), tree(40, 220, 1.1) + tree(70, 220, .8)),
 'khoang-dem': ('', flame(52, 162, 1.0)),
}
for k, (pre, post) in ADD.items():
    if pre: D[k] = after_open(D[k], pre)
    if post: D[k] = before_close(D[k], post)

# ---- Vòng 2: người di chuyển theo hướng thoát nạn, xe chạy, mây, cỏ ----
exec(open(__file__.replace('decorate.py', 'mkdiag.py').replace('trang-tri-so-do.py', 've-so-do.py'), encoding='utf-8').read().split("D = {}")[0], globals())
def movers(svg):
    out = ''
    for k, m in enumerate(re.finditer(r'<line class="flow" x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)"/>', svg)):
        x1, y1, x2, y2 = (float(v) for v in m.groups())
        L = ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** .5; dur = max(1.4, L / 45)
        for j in range(2):
            sym = "#dg-walker-l" if x2 < x1 - 1 else "#dg-walker"
            b0 = -(j * dur / 2 + k * .3)
            out += (f'<g class="mover"><animateMotion dur="{dur:.1f}s" begin="{b0:.1f}s" repeatCount="indefinite" path="M{x1:.0f} {y1:.0f} L{x2:.0f} {y2:.0f}"/>'
                    f'<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.85;1" dur="{dur:.1f}s" begin="{b0:.1f}s" repeatCount="indefinite"/>'
                    f'<use href="{sym}" x="-5" y="-12" width="10" height="13"/></g>')
    return out
def cloud(x, y, s=1.0, d=0):
    return f'<use class="cloud c{d}" href="#dg-cloud" x="{x:.0f}" y="{y:.0f}" width="{46*s:.0f}" height="{20*s:.0f}"/>'
def mtruck(y, dur, s=1.0, rev=False):
    path = "M420 0 H-80" if rev else "M-80 0 H420"
    return f'<g class="mtruck"><animateMotion dur="{dur}s" repeatCount="indefinite" path="{path}"/>{truck(0, y, s, -1 if rev else 1)}</g>'
SKY = {'khoang-cach-nha': 196, 'thang-loai-3': 220, 'chieu-cao': 232, 'tang-ham': 140, 'loi-ra-mai': 232, 'lanh-nan': 250}
CLOUDS = {'chieu-cao': [(20, 30, 1.0, 0), (250, 12, .8, 1)], 'tang-ham': [(260, 52, .8, 1)], 'loi-ra-mai': [(250, 48, .8, 0)], 'lanh-nan': [(20, 40, .9, 0), (270, 26, .8, 1)], 'khoang-cach-nha': [(150, 40, .9, 0), (300, 52, .7, 1)], 'thang-loai-3': [(20, 30, .9, 0), (230, 6, .7, 1)]}
for k in D:
    pre = ''
    if k in SKY: pre += ''.join(cloud(*c) for c in CLOUDS.get(k, [])) + f'<rect class="grass" x="0" y="{SKY[k]-3}" width="360" height="3"/>'
    if pre:
        m = re.search(r'<rect class="sky"[^>]*/>', D[k]); D[k] = D[k][:m.end()] + pre + D[k][m.end():]
    if k not in SKY:
        m = re.match(r'(<svg[^>]*>)(<defs>.*?</defs>)?', D[k], re.S); D[k] = D[k][:m.end()] + '<rect class="paper" x="-20" y="-20" width="420" height="340"/>' + D[k][m.end():]
    post = movers(D[k])
    if k == 'bai-do': post += mtruck(206, 9, .9, rev=True)
    if k == 'duong-tranh': post += mtruck(94, 7, .8) 
    if post: D[k] = before_close(D[k], post)

# ---- Vòng 3: quầng lửa, cửa sổ sáng đèn, nước sprinkler, vùng nóng, nét kích thước vẽ dần ----
import random
def glow(svg):
    def f(m):
        x, y, w, h = (float(m.group(i)) for i in range(1, 5))
        return f'<circle class="glow" cx="{x+w/2:.1f}" cy="{y+h*.7:.1f}" r="{h*.95:.1f}"/>' + m.group(0)
    return re.sub(r'<use class="flame" href="#dg-flame" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"/>', f, svg)
def wins(xs, ys, w, h, seed):
    rnd = random.Random(seed); o = ''
    for y in ys:
        for x in xs:
            lit = rnd.random() < .35
            o += f'<rect class="wn{" lit l" + str(rnd.randint(0, 2)) if lit else ""}" x="{x}" y="{y}" width="{w}" height="{h}" rx="1"/>'
    return o
WINS = {
 'chieu-cao': wins([176, 204, 232], [54, 92, 130, 168, 206], 16, 16, 1),
 'loi-ra-mai': wins([62, 94, 126, 158, 186], [92, 198], 16, 16, 2) + wins([228, 260, 292], [146, 190], 16, 16, 3),
 'tang-ham': wins([54, 82, 110], [72], 16, 14, 4) + wins([214, 242, 270], [92], 16, 14, 5),
 'bai-do': wins([44, 78, 112, 146, 180, 214, 248, 278], [26], 14, 14, 6),
 'khoang-cach-nha': wins([36, 62, 88, 112], [76, 104, 160], 14, 16, 7) + wins([36, 88, 112], [132], 14, 16, 8) + wins([238, 264, 290, 314], [108, 136, 164], 14, 16, 9),
 'lanh-nan': ''.join(f'<rect class="wcol" x="{x}" y="22" width="9" height="226"/>' for x in (130, 152, 196, 216)),
}
def after_first(svg, pat, add):
    m = re.search(pat, svg); return svg[:m.end()] + add + svg[m.end():]
def after_last(svg, pat, add):
    m = list(re.finditer(pat, svg))[-1]; return svg[:m.end()] + add + svg[m.end():]
for k, add in WINS.items():
    D[k] = after_last(D[k], r'<rect class="w"[^>]*/>', add)
# vùng nóng phía khoang cháy 1, tường ngăn cháy chặn lại
D['tuong-ngan-chay'] = after_first(D['tuong-ngan-chay'], r'<rect class="w"[^>]*/>', '<rect class="heat" x="20" y="40" width="154" height="140"/>')
D['tuong-ngan-chay'] = before_close(D['tuong-ngan-chay'], '<g class="safe"><circle cx="300" cy="140" r="9"/><path d="M295.5 140.5 l3 3 l6 -6.5"/></g>')
# giọt nước rơi dưới đầu phun
def drops(svg):
    o = ''
    for m in re.finditer(r'<circle class="spk" cx="([\d.]+)" cy="([\d.]+)"', svg):
        cx, cy = float(m.group(1)), float(m.group(2))
        for j, dx in enumerate((-8, -4, 0, 4, 8, -6, 6)):
            o += f'<circle class="drop d{j % 4}" cx="{cx+dx:.1f}" cy="{cy+6:.1f}" r="1.6"/>'
    return o
D['dai-ngan-chay'] = before_close(D['dai-ngan-chay'], drops(D['dai-ngan-chay']))
for k in D:
    D[k] = glow(D[k])
    D[k] = D[k].replace('<line class="dim" ', '<line class="dim" pathLength="1" ')
json.dump(D, open(sys.argv[-1], 'w', encoding='utf-8'), ensure_ascii=False)
print(len(D))
