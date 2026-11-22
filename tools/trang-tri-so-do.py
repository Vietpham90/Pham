"""Làm sơ đồ sinh động: bầu trời, cây, lửa, khói, người — chèn thêm vào SVG đã sinh.
Dùng: python3 decorate.py d1.json d2.json out.json"""
import json, sys, re
D = json.load(open(sys.argv[1], encoding='utf-8')); D.update({k: v['svg'] for k, v in json.load(open(sys.argv[2], encoding='utf-8')).items()})

def sky(h, w=360):
    return f'<rect class="sky" x="0" y="0" width="{w}" height="{h}"/>'
def tree(x, y, s=1.0):
    return f'<use href="#dg-tree" x="{x-10*s:.1f}" y="{y-30*s:.1f}" width="{20*s:.1f}" height="{30*s:.1f}"/>'
def flame(x, y, s=1.0):
    # gốc ngọn lửa tại (x, y)
    w, h = 18 * s, 26 * s
    o = f'<use class="flame" href="#dg-flame" x="{x-w/2:.1f}" y="{y-h:.1f}" width="{w:.1f}" height="{h:.1f}"/>'
    for k in range(3):
        o += f'<circle class="smoke s{k}" cx="{x + (k-1)*5*s:.1f}" cy="{y-h-4*s:.1f}" r="{(4+k)*s:.1f}"/>'
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
            out += (f'<circle class="mover" r="2.8"><animateMotion dur="{dur:.1f}s" begin="{-(j * dur / 2 + k * .3):.1f}s" repeatCount="indefinite" path="M{x1:.0f} {y1:.0f} L{x2:.0f} {y2:.0f}"/>'
                    f'<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.85;1" dur="{dur:.1f}s" begin="{-(j * dur / 2 + k * .3):.1f}s" repeatCount="indefinite"/></circle>')
    return out
def cloud(x, y, s=1.0, d=0):
    return f'<use class="cloud c{d}" href="#dg-cloud" x="{x:.0f}" y="{y:.0f}" width="{46*s:.0f}" height="{20*s:.0f}"/>'
def mtruck(y, dur, s=1.0, rev=False):
    path = "M420 0 H-80" if rev else "M-80 0 H420"
    return f'<g class="mtruck"><animateMotion dur="{dur}s" repeatCount="indefinite" path="{path}"/>{truck(0, y, s, -1 if rev else 1)}</g>'
SKY = {'chieu-cao': 232, 'tang-ham': 140, 'loi-ra-mai': 232, 'lanh-nan': 250}
CLOUDS = {'chieu-cao': [(20, 30, 1.0, 0), (250, 12, .8, 1)], 'tang-ham': [(260, 52, .8, 1)], 'loi-ra-mai': [(250, 48, .8, 0)], 'lanh-nan': [(20, 40, .9, 0), (270, 26, .8, 1)]}
for k in D:
    pre = ''
    if k in SKY: pre += ''.join(cloud(*c) for c in CLOUDS.get(k, [])) + f'<rect class="grass" x="0" y="{SKY[k]-3}" width="360" height="3"/>'
    if pre:
        m = re.search(r'<rect class="sky"[^>]*/>', D[k]); D[k] = D[k][:m.end()] + pre + D[k][m.end():]
    post = movers(D[k])
    if k == 'bai-do': post += mtruck(206, 9, .9, rev=True)
    if k == 'duong-tranh': post += mtruck(94, 7, .8) 
    if post: D[k] = before_close(D[k], post)
json.dump(D, open(sys.argv[3], 'w', encoding='utf-8'), ensure_ascii=False)
print(len(D))
