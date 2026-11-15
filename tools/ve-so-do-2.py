"""Sơ đồ bổ sung (dùng chung hàm vẽ của mkdiag.py)."""
import json, sys
exec(open(__file__.replace('ve-so-do-2.py', 've-so-do.py'), encoding='utf-8').read().split("D = {}")[0])
D = {}
HATCH = '<defs><pattern id="{id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="hatchl" x1="0" y1="0" x2="0" y2="6"/></pattern></defs>'

# 1. Tầng hầm, tầng nửa hầm — mặt cắt
s = '<svg viewBox="0 0 360 250" class="dg">' + HATCH.format(id='th1')
G = 140  # cốt mặt đất
s += f'<rect x="0" y="{G}" width="360" height="130" fill="url(#th1)"/><line class="ground" x1="0" y1="{G}" x2="360" y2="{G}"/>'
s += f'<text x="6" y="{G+14}" class="s">± 0,00 mặt đất</text>'
# nhà A: tầng nửa hầm (sàn -1.2, trần +1.6) ; nhà B: tầng hầm (sàn -2.6, trần +0.6)
for (X, top, bot, lab1, lab2) in [(40, G - 34, G + 26, 'Tầng nửa hầm', '≥ 1/2 cao tầng nằm trên'), (200, G - 14, G + 46, 'Tầng hầm', '> 1/2 cao tầng nằm dưới')]:
    W = 112
    s += f'<rect class="w" x="{X}" y="{top-46}" width="{W}" height="46"/>'
    s += f'<rect x="{X}" y="{top}" width="{W}" height="{bot-top}" fill="var(--fire-bg)" stroke="var(--ink)" stroke-width="1.5"/>'
    s += f'<rect class="slab" x="{X}" y="{top}" width="{W}" height="3"/><rect class="slab" x="{X}" y="{bot}" width="{W}" height="4"/>'
    s += f'<text x="{X+W/2}" y="{(top+bot)/2+2}" class="b" text-anchor="middle">{lab1}</text>'
    s += f'<text x="{X+W/2}" y="{bot+20}" class="s" text-anchor="middle">{lab2}</text><text x="{X+W/2}" y="{bot+32}" class="s" text-anchor="middle">cao độ mặt đất</text>'
    s += dim(X + W + 8, top, X + W + 8, G, '', 0, 0) + dim(X + W + 8, G, X + W + 8, bot, '', 0, 0)
s += '<text x="20" y="22" class="s">Tầng hầm: quá 1/2 chiều cao tầng nằm dưới cao độ mặt đất.</text>'
s += '<text x="20" y="36" class="s">Tầng nửa hầm: 1/2 chiều cao nằm trên hoặc ngang cao độ mặt đất.</text>'
s += '</svg>'
D['tang-ham'] = {'t': 'Tầng hầm và tầng nửa hầm', 'ref': '1.4.60, 1.4.62', 'svg': s}

# 2. Lối ra khẩn cấp qua ban công — mặt bằng
s = '<svg viewBox="0 0 360 240" class="dg">'
s += '<rect class="fillroom" x="20" y="30" width="320" height="110"/>'
s += '<line class="wall2" x1="20" y1="30" x2="340" y2="30"/><line class="wall2" x1="20" y1="30" x2="20" y2="140"/><line class="wall2" x1="340" y1="30" x2="340" y2="140"/>'
s += '<text x="180" y="84" class="b" text-anchor="middle">Căn hộ / gian phòng</text>'
# tường ngoài có ô kính (cửa ra ban công) và tường đặc
s += '<line class="wallthick" x1="20" y1="140" x2="340" y2="140"/>'
s += '<rect class="glass" x="64" y="137" width="40" height="6"/><rect class="glass" x="168" y="137" width="40" height="6"/><rect class="glass" x="276" y="137" width="40" height="6"/>'
s += door(168, 140, 22, 'h', into=1)
# ban công
s += '<rect x="20" y="143" width="230" height="40" fill="var(--exit-bg)" stroke="var(--exit)" stroke-width="1.2"/><line class="rail" x1="20" y1="183" x2="250" y2="183"/>'
s += '<text x="135" y="172" class="s" text-anchor="middle">Ban công / lô gia</text>'
s += dim(256, 143, 256, 183, '', 0, 0) + '<text x="262" y="168" class="s">≥ 0,6 m</text>'
s += '<line class="dim2" x1="104" y1="143" x2="104" y2="204"/><line class="dim2" x1="168" y1="143" x2="168" y2="204"/>' + dim(104, 200, 168, 200, '≥ 1,6 m', 136, 214)
s += '<line class="dim2" x1="208" y1="143" x2="208" y2="226"/><line class="dim2" x1="250" y1="183" x2="250" y2="226"/>' + dim(208, 222, 250, 222, '≥ 1,2 m', 229, 236)
s += '<text x="20" y="214" class="s">Tường đặc giữa</text><text x="20" y="226" class="s">các ô kính</text>'
s += '<text x="262" y="214" class="s">Tường đặc từ ô kính</text><text x="262" y="226" class="s">tới mép ban công</text>'
s += '<text x="20" y="20" class="s">Ngăn với gian phòng bằng vách từ sàn tới trần; có thông gió tự nhiên</text>'
s += '</svg>'
D['khan-cap'] = {'t': 'Lối ra khẩn cấp qua ban công, lô gia', 'ref': '3.2.13', 'svg': s}

# 3. Cửa mở ra hành lang — chiều rộng tính toán
s = '<svg viewBox="0 0 360 250" class="dg">'
def corr(y0, both, label):
    t = f'<rect class="corr" x="20" y="{y0}" width="320" height="44"/>'
    t += f'<line class="wall2" x1="20" y1="{y0}" x2="340" y2="{y0}"/><line class="wall2" x1="20" y1="{y0+44}" x2="340" y2="{y0+44}"/>'
    t += door(150, y0, 16, 'h', into=1)
    if both:
        t += door(150, y0 + 44, 16, 'h', into=-1, flip=True)
    t += f'<text x="26" y="{y0-6}" class="b">{label}</text>'
    t += dim(60, y0, 60, y0 + 44, '', 0, 0) + f'<text x="66" y="{y0+26}" class="s">B</text>'
    t += arrow(220, y0 + 22, 330, y0 + 22)
    return t
s += corr(40, False, 'Cửa một bên: trừ 1/2 phần cánh nhô ra')
s += dim(186, 56, 186, 84, '', 0, 0) + '<text x="192" y="74" class="s">B − a/2</text>'
s += corr(150, True, 'Cửa hai bên: trừ cả phần cánh nhô ra')
s += dim(186, 166, 186, 178, '', 0, 0) + '<text x="192" y="176" class="s">B − a</text>'
s += '<text x="20" y="214" class="s">a: phần cánh cửa nhô ra hành lang (cửa nhô nhiều nhất).</text>'
s += '<text x="20" y="228" class="s">Cửa trên đường thoát nạn mở theo chiều thoát ra ngoài.</text>'
s += '<text x="20" y="242" class="s">Hành lang &gt; 60 m chia đoạn ≤ 60 m bằng vách ngăn cháy loại 2.</text>'
s += '</svg>'
D['hanh-lang'] = {'t': 'Chiều rộng hành lang khi cửa mở ra hành lang', 'ref': '3.3.5, 3.2.10', 'svg': s}

# 4. Thang máy chữa cháy, sảnh — mặt bằng
s = '<svg viewBox="0 0 360 250" class="dg">'
s += '<rect class="wallr" x="40" y="40" width="120" height="70"/>'
for k in range(2):
    x = 46 + k * 56
    s += f'<rect x="{x}" y="46" width="50" height="58" fill="var(--panel)" stroke="var(--ink)" stroke-width="1"/><line class="g" x1="{x}" y1="46" x2="{x+50}" y2="104"/><line class="g" x1="{x+50}" y1="46" x2="{x}" y2="104"/>'
s += '<text x="100" y="32" class="b" text-anchor="middle">Giếng riêng ≥ REI 120, ≤ 3 thang</text>'
s += '<rect class="lob" x="40" y="110" width="120" height="68"/><text x="100" y="132" class="b" text-anchor="middle">Sảnh ≥ 4 m²</text><text x="100" y="145" class="s" text-anchor="middle">(chung thang N: ≥ 6 m²)</text>'
s += door(60, 178, 22, 'h', into=1)
s += '<circle cx="146" cy="164" r="5" fill="var(--fire)"/><text x="136" y="168" class="s" text-anchor="end">Họng DN 65</text>'
s += '<rect class="wallr" x="200" y="40" width="70" height="128"/>' + stair(206, 46, 58, 116, 9)
s += '<text x="235" y="190" class="s" text-anchor="middle">Buồng thang bộ</text>'
s += '<rect class="corr" x="20" y="200" width="320" height="16"/><line class="wall2" x1="20" y1="200" x2="340" y2="200"/><line class="wall2" x1="20" y1="216" x2="340" y2="216"/>'
s += '<text x="20" y="234" class="s">Sảnh là khoang đệm, vách ngăn cháy loại 1. Bán kính</text>'
s += '<text x="20" y="246" class="s">phục vụ ≤ 60 m (nhà &gt; 50 m: ≤ 45 m); tải ≥ 630 / 1 000 kg.</text>'
s += '</svg>'
D['thang-may-cc'] = {'t': 'Thang máy chữa cháy và sảnh', 'ref': '6.13, A.2.12', 'svg': s}

# 5. Lối ra mái, thang chữa cháy P1/P2 — mặt cắt
s = '<svg viewBox="0 0 360 260" class="dg">' + HATCH.format(id='lm1')
s += '<rect x="0" y="232" width="360" height="12" fill="url(#lm1)"/><line class="ground" x1="0" y1="232" x2="360" y2="232"/>'
s += '<rect class="w" x="40" y="80" width="170" height="152"/><rect class="w" x="210" y="130" width="120" height="102"/>'
s += '<rect class="slab" x="36" y="78" width="178" height="4"/><rect class="slab" x="206" y="128" width="128" height="4"/>'
# tum thang + cửa ra mái
s += '<rect class="wallr" x="60" y="50" width="40" height="30"/><rect x="96" y="58" width="6" height="22" fill="var(--fire)"/>'
s += '<text x="108" y="52" class="s">Cửa ngăn cháy loại 2</text><text x="108" y="64" class="s">≥ 0,75 × 1,5 m</text>'
# thang chênh mái
s += '<line x1="222" y1="80" x2="222" y2="128" stroke="var(--ink)" stroke-width="1.5"/><line x1="232" y1="80" x2="232" y2="128" stroke="var(--ink)" stroke-width="1.5"/>'
for yy in range(86, 128, 8):
    s += f'<line x1="222" y1="{yy}" x2="232" y2="{yy}" stroke="var(--ink)" stroke-width="1"/>'
s += '<text x="240" y="98" class="s">Chênh mái &gt; 1 m:</text><text x="240" y="110" class="s">thang chữa cháy</text>'
# thang P ngoài nhà
s += '<line x1="20" y1="80" x2="20" y2="232" stroke="var(--fire)" stroke-width="1.6"/><line x1="30" y1="80" x2="30" y2="232" stroke="var(--fire)" stroke-width="1.6"/>'
for yy in range(88, 232, 10):
    s += f'<line x1="20" y1="{yy}" x2="30" y2="{yy}" stroke="var(--fire)" stroke-width="1"/>'
s += '<text x="44" y="160" class="s">Thang P1 tới 20 m,</text><text x="44" y="172" class="s">P2 trên 20 m; rộng 0,7 m;</text><text x="44" y="184" class="s">cách cửa sổ ≥ 1,0 m</text>'
s += dim(8, 232, 8, 80, '', 0, 0)
s += '<text x="10" y="18" class="s">Nhà ≥ 2 tầng, cao tới diềm mái ≥ 10 m: có lối ra mái,</text>'
s += '<text x="10" y="30" class="s">≥ 1 lối / 9 300 m² mái (F1 – F4); thang thép dốc ≤ 2:1, rộng ≥ 0,7 m.</text>'
s += '</svg>'
D['loi-ra-mai'] = {'t': 'Lối ra mái, thang chữa cháy P1, P2', 'ref': '6.6, 6.7, 6.10, 6.11', 'svg': s}

# 6. Đường xe một làn: đoạn tránh xe, đường cụt — mặt bằng
s = '<svg viewBox="0 0 360 230" class="dg">'
s += road_h(0, 90, 360, 22, center=False)
s += '<rect class="asphalt" x="150" y="70" width="60" height="20"/><line class="edge" x1="150" y1="72" x2="210" y2="72"/>'
s += truck(20, 93, 0.8) + truck(160, 73, 0.8, -1)
s += dim(150, 60, 210, 60, 'dài ≥ 8 m', 180, 54)
s += dim(222, 70, 222, 112, '', 0, 0) + '<text x="230" y="64" class="s">rộng ≥ 7 m</text>'
s += dim(30, 130, 330, 130, 'Cứ ≤ 100 m có một đoạn mở rộng để tránh xe', 180, 146)
s += '<text x="10" y="24" class="b">Đường chỉ đủ một làn xe</text>'
s += '<text x="10" y="176" class="b">Đường cụt dài &gt; 46 m</text>'
s += road_h(0, 186, 250, 18, center=False)
s += '<rect class="asphalt" x="250" y="172" width="46" height="46" rx="4"/>'
s += '<text x="300" y="200" class="s">Bãi quay xe</text><text x="300" y="212" class="s">(6.4)</text>'
s += dim(0, 222, 250, 222, '', 0, 0) + '<text x="125" y="218" class="s" text-anchor="middle">&gt; 46 m</text>'
s += '</svg>'
D['duong-tranh'] = {'t': 'Đường xe một làn: đoạn tránh xe, đường cụt', 'ref': '6.5, 6.2.5, 6.4', 'svg': s}

# 7. Tầng lánh nạn — mặt cắt nhà cao tầng
s = '<svg viewBox="0 0 360 270" class="dg">'
X, W, top, bot = 120, 110, 20, 250
s += f'<rect class="w" x="{X}" y="{top}" width="{W}" height="{bot-top}"/><line class="ground" x1="0" y1="{bot}" x2="360" y2="{bot}"/>'
n = 46; fh = (bot - top) / n
for k in range(1, n):
    y = bot - k * fh
    s += f'<line x1="{X}" y1="{y:.1f}" x2="{X+W}" y2="{y:.1f}" stroke="var(--line)" stroke-width=".8"/>'
for (fl, lab) in [(21, 'Tầng lánh nạn ≤ tầng 21'), (41, 'Tầng lánh nạn tiếp theo')]:
    y = bot - fl * fh
    s += f'<rect x="{X}" y="{y:.1f}" width="{W}" height="{fh:.1f}" fill="var(--exit)" opacity=".85"/>'
    s += f'<line class="lead" x1="{X+W}" y1="{y+fh/2:.1f}" x2="{X+W+12}" y2="{y+fh/2:.1f}"/><text x="{X+W+16}" y="{y+fh/2+4:.1f}" class="s">{lab}</text>'
y21, y41 = bot - 21 * fh, bot - 41 * fh
s += dim(X - 10, y21, X - 10, y41 + fh, '', 0, 0) + f'<text x="{X-16}" y="{(y21+y41)/2:.1f}" class="b" text-anchor="end">≤ 20 tầng</text>'
s += dim(X - 10, bot, X - 10, y21 + fh, '', 0, 0) + f'<text x="{X-16}" y="{(bot+y21)/2:.1f}" class="s" text-anchor="end">≤ 21 tầng</text>'
s += '<text x="248" y="170" class="s">Gian lánh nạn:</text><text x="248" y="182" class="s">0,3 m²/người (các tầng</text><text x="248" y="194" class="s">phía trên tới tầng lánh</text><text x="248" y="206" class="s">nạn kế tiếp); ngăn</text><text x="248" y="218" class="s">REI 150; ô thông gió</text><text x="248" y="230" class="s">≥ 25 % diện tích, trên</text><text x="248" y="242" class="s">2 tường ngoài.</text>'
s += '<text x="6" y="14" class="s">Nhà &gt; 100 m (&gt; 120 m nếu có báo cháy + chữa cháy tự động)</text>'
s += '</svg>'
D['lanh-nan'] = {'t': 'Tầng lánh nạn (nhà trên 100 m)', 'ref': 'A.3.2', 'svg': s}

json.dump(D, open(sys.argv[1], 'w', encoding='utf-8'), ensure_ascii=False)
print(len(D))
