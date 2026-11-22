"""Sơ đồ bổ sung vòng 3: khoảng cách giữa nhà, thang bộ, cửa thoát nạn, khoang đệm, thang loại 3."""
import json, sys
exec(open(__file__.replace('mkdiag3.py', 'mkdiag.py').replace('ve-so-do-3.py', 've-so-do.py'), encoding='utf-8').read().split("D = {}")[0])
D = {}
HATCH = '<defs><pattern id="{id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line class="hatchl" x1="0" y1="0" x2="0" y2="6"/></pattern></defs>'

# 1. Khoảng cách PCCC giữa hai nhà — mặt đứng
G = 196
s = '<svg viewBox="0 0 360 268" class="dg">' + HATCH.format(id='kn1')
s += f'<rect x="0" y="{G}" width="360" height="10" fill="url(#kn1)"/><line class="ground" x1="0" y1="{G}" x2="360" y2="{G}"/>'
s += f'<rect class="w" x="24" y="64" width="110" height="{G-64}"/><rect class="w" x="226" y="96" width="110" height="{G-96}"/>'
s += '<text x="79" y="58" class="b" text-anchor="middle">Nhà thứ nhất</text><text x="281" y="90" class="b" text-anchor="middle">Nhà thứ hai</text>'
for k in range(3):
    s += f'<path class="rad" d="M140 {120+k*22} q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 t16 0"/>'
s += f'<line class="dim2" x1="134" y1="150" x2="134" y2="{G}"/><line class="dim2" x1="226" y1="150" x2="226" y2="{G}"/>'
s += dim(134, 182, 226, 182, '≥ 6 m', 180, 176, cls='b')
s += '<text x="180" y="20" class="s" text-anchor="middle">Đo thông thủy giữa hai tường ngoài (vật liệu cháy nhô</text>'
s += '<text x="180" y="33" class="s" text-anchor="middle">ra &gt; 1 m thì đo từ mép kết cấu đó) — Bảng E.1</text>'
s += f'<text x="8" y="{G+26}" class="s">6 m: hai nhà bậc I – III, S0. Tối đa 15 m (bậc IV, V – S2, S3).</text>'
s += f'<text x="8" y="{G+40}" class="s">Tường đặc, mặt ngoài ≥ Ch1: giảm 20 %. Bậc I, II – S0 có</text>'
s += f'<text x="8" y="{G+54}" class="s">chữa cháy tự động toàn nhà: giảm 50 %. Tường đối diện là</text>'
s += f'<text x="8" y="{G+68}" class="s">tường ngăn cháy loại 1: không quy định.</text>'
s += '</svg>'
D['khoang-cach-nha'] = {'t': 'Khoảng cách phòng cháy giữa hai nhà', 'ref': 'Bảng E.1, 4.1', 'svg': s,
  'cap': 'Khoảng cách thông thủy giữa các tường ngoài của nhà ở, nhà công cộng: 6 m giữa hai nhà bậc I – III, S0; 8 – 15 m với bậc, cấp nguy hiểm cháy thấp hơn (Bảng E.1). Nhà sản xuất, kho tới nhà ở, nhà công cộng: 10 – 18 m. Tường đặc, hoàn thiện ngoài ≥ Ch1: giảm 20 %; nhà bậc I, II – S0 có chữa cháy tự động toàn nhà: giảm 50 % (CT7, cần đối chiếu Thông tư 09/2023); tường cao hơn là tường ngăn cháy loại 1: không quy định.'}

# 2. Thang bộ — mặt cắt bậc, độ dốc, chiếu nghỉ
G = 214
s = '<svg viewBox="0 0 360 270" class="dg">' + HATCH.format(id='tb1')
s += f'<rect x="0" y="{G}" width="360" height="10" fill="url(#tb1)"/><line class="ground" x1="0" y1="{G}" x2="360" y2="{G}"/>'
pts = [(30, G)]; x, y = 30, G
for k in range(6):
    y -= 18; pts.append((x, y)); x += 24; pts.append((x, y))
x += 80; pts.append((x, y))  # chiếu nghỉ
for k in range(3):
    y -= 18; pts.append((x, y)); x += 24; pts.append((x, y))
pts += [(360, y), (360, G)]
s += '<path class="stsec" d="M' + ' L'.join(f'{a} {b}' for a, b in pts) + ' Z"/>'
s += '<line class="diag" x1="30" y1="196" x2="174" y2="88"/>'
s += arrow(72, 140, 150, 91)
s += dim(54, 170, 78, 170, '≥ 25 cm', 74, 164, anchor='end')
s += dim(296, 70, 296, 52, '5 – 22 cm', 292, 64, anchor='end')
s += dim(174, 96, 254, 96, 'Chiếu nghỉ ≥ 1,0 m', 214, 90)
s += '<text x="112" y="200" class="s" text-anchor="middle">Độ dốc ≤ 1:1 (45°)</text>'
s += f'<text x="8" y="{G+22}" class="s">Bản thang ≥ 0,9 m; ≥ 1,2 m: tầng &gt; 200 người, F1.1 &gt; 15 người/tầng;</text>'
s += f'<text x="8" y="{G+36}" class="s">≥ 1,0 m: F1.1 ≤ 15 người/tầng; ≥ 0,7 m: nhà ≤ 15 m, ≤ 15 người/tầng.</text>'
s += f'<text x="8" y="{G+50}" class="s">Chiếu thang rộng ≥ bản thang; khe giữa các vế ≥ 75 mm.</text>'
s += '</svg>'
D['thang-bo'] = {'t': 'Thang bộ: bậc, độ dốc, chiếu nghỉ', 'ref': '3.4.1, 3.4.3', 'svg': s,
  'cap': 'Mặt bậc ≥ 25 cm, chiều cao bậc 5 – 22 cm, độ dốc ≤ 1:1 (45°). Chiếu nghỉ giữa của thang thẳng dài ≥ 1,0 m; chiếu thang rộng ≥ bản thang. Bản thang ≥ chiều rộng tính toán và mọi cửa thoát nạn trên nó, không nhỏ hơn 1,2 m (tầng trừ tầng 1 có > 200 người; F1.1 > 15 người/tầng), 1,0 m (F1.1 ≤ 15 người/tầng), 0,7 m (nhà cao ≤ 15 m, ≤ 15 người/tầng), 0,9 m (còn lại). Bệnh viện F1.1 cao > 28 m: ≥ 1,35 m.'}

# 3. Cửa lối ra thoát nạn — mặt đứng + mặt bằng
s = '<svg viewBox="0 0 360 250" class="dg">'
s += '<rect class="w" x="16" y="34" width="150" height="150"/><line class="ground" x1="10" y1="184" x2="172" y2="184"/>'
s += '<rect class="dleaf" x="50" y="51" width="56" height="133"/><rect class="dpanel" x="56" y="58" width="44" height="54" rx="2"/><rect class="dpanel" x="56" y="120" width="44" height="56" rx="2"/>'
s += '<rect class="dbar" x="54" y="112" width="48" height="5" rx="2.5"/>' + exit_sign(67, 38)
s += dim(50, 198, 106, 198, '≥ 0,8 m', 78, 212)
s += dim(118, 51, 118, 184, '≥ 1,9 m', 124, 122, anchor='start')
s += '<text x="10" y="228" class="s">≥ 1,2 m: gian &gt; 50 người</text><text x="10" y="241" class="s">(F1.1 &gt; 15 người)</text>'
s += '<rect class="fillroom" x="190" y="40" width="160" height="110"/>'
s += '<line class="wall2" x1="190" y1="40" x2="350" y2="40"/><line class="wall2" x1="190" y1="40" x2="190" y2="150"/><line class="wall2" x1="350" y1="40" x2="350" y2="150"/>'
s += '<line class="wall2" x1="190" y1="150" x2="254" y2="150"/><line class="wall2" x1="286" y1="150" x2="350" y2="150"/>'
s += door(254, 150, 32, 'h', into=1)
s += '<text x="270" y="64" class="b" text-anchor="middle">Gian phòng</text>'
s += arrow(270, 84, 270, 200)
s += '<text x="270" y="222" class="s" text-anchor="middle">Mở theo chiều thoát ra ngoài;</text><text x="270" y="236" class="s" text-anchor="middle">tự đóng, mở không cần chìa</text>'
s += '</svg>'
D['cua-thoat-nan'] = {'t': 'Cửa lối ra thoát nạn', 'ref': '3.2.9, 3.2.10, 3.2.11', 'svg': s,
  'cap': 'Lối ra thoát nạn cao thông thủy ≥ 1,9 m (tầng kỹ thuật ≥ 1,8 m), rộng ≥ 0,8 m; ≥ 1,2 m với gian F1.1 > 15 người, gian hoặc nhà nhóm khác > 50 người (trừ F1.3). Cửa mở theo chiều thoát ra ngoài (trừ gian F1.3, F1.4, gian ≤ 15 người, buồng vệ sinh…); cửa từ hành lang, sảnh, buồng thang mở tự do từ bên trong không cần chìa; cửa có yêu cầu GHCL có cơ cấu tự đóng.'}

# 4. Khoang đệm ngăn cháy — mặt bằng
s = '<svg viewBox="0 0 360 240" class="dg">'
s += '<rect class="fillroom" x="10" y="50" width="117" height="120"/><line class="wall2" x1="10" y1="50" x2="127" y2="50"/><line class="wall2" x1="10" y1="170" x2="127" y2="170"/><line class="wall2" x1="10" y1="50" x2="10" y2="170"/>'
s += '<rect class="air" x="133" y="72" width="94" height="76"/>'
s += '<rect class="firewall" x="127" y="66" width="106" height="6"/><rect class="firewall" x="127" y="148" width="106" height="6"/>'
s += '<rect class="firewall" x="127" y="66" width="6" height="29"/><rect class="firewall" x="127" y="125" width="6" height="29"/>'
s += '<rect class="firewall" x="227" y="66" width="6" height="29"/><rect class="firewall" x="227" y="125" width="6" height="29"/>'
s += door(130, 95, 30, 'v', into=1) + door(230, 95, 30, 'v', into=1)
s += stair(250, 56, 84, 108, n=8, arrow=False)
s += '<line class="wall2" x1="233" y1="50" x2="350" y2="50"/><line class="wall2" x1="233" y1="170" x2="350" y2="170"/><line class="wall2" x1="350" y1="50" x2="350" y2="170"/>'
s += '<path class="press" d="M168 140 l6 -6 l6 6 M188 140 l6 -6 l6 6"/>'
s += arrow(36, 110, 330, 110)
s += '<text x="180" y="30" class="b" text-anchor="middle">Khoang đệm ngăn cháy loại 1</text>'
s += '<text x="68" y="44" class="s" text-anchor="middle">Gian, hành lang</text><text x="292" y="44" class="s" text-anchor="middle">Buồng thang</text>'
s += '<text x="180" y="88" class="s" text-anchor="middle">Áp suất dương</text>'
s += '<text x="8" y="190" class="s">Vách ngăn cháy loại 1 (EI 45), sàn loại 3 (REI 45);</text>'
s += '<text x="8" y="204" class="s">cửa ngăn cháy loại 2 (EI 30), tự đóng, khe chèn kín.</text>'
s += '<text x="8" y="222" class="s">Loại 2: vách loại 2 (EI 15), sàn loại 4 (REI 15),</text><text x="8" y="236" class="s">cửa loại 3 (EI 15).</text>'
s += '</svg>'
D['khoang-dem'] = {'t': 'Khoang đệm ngăn cháy', 'ref': '1.4.3, Bảng 3, 4.28', 'svg': s,
  'cap': 'Khoang đệm bảo vệ lỗ mở trên bộ phận ngăn cháy, bao bởi sàn và vách ngăn cháy, có hai lỗ mở kế tiếp (1.4.3). Loại 1: vách ngăn cháy loại 1 (EI 45), sàn loại 3 (REI 45), cửa loại 2 (EI 30); loại 2: vách loại 2 (EI 15), sàn loại 4 (REI 15), cửa loại 3 (EI 15) (Bảng 3). Trước thang máy ở tầng hầm, nửa hầm: khoang đệm ngăn cháy loại 1 có áp suất dương khi cháy (4.28); gian hạng A, B: khoang đệm luôn có áp suất dương.'}

# 5. Thang loại 3 ngoài nhà — mặt đứng
G = 220
s = '<svg viewBox="0 0 360 262" class="dg">' + HATCH.format(id='tl1')
s += f'<rect x="0" y="{G}" width="360" height="8" fill="url(#tl1)"/>'
s += f'<rect class="w" x="120" y="30" width="226" height="{G-30}"/><rect class="solidw" x="140" y="30" width="170" height="{G-30}"/>'
s += f'<line class="ground" x1="0" y1="{G}" x2="360" y2="{G}"/>'
s += '<rect class="dleaf" x="278" y="129" width="18" height="28"/><rect class="dleaf" x="156" y="66" width="18" height="28"/>'
s += '<rect class="wn" x="322" y="110" width="16" height="20" rx="1"/>'
s += '<rect class="slab" x="266" y="157" width="40" height="4"/><rect class="slab" x="144" y="94" width="40" height="4"/>'
s += f'<line class="flight" x1="150" y1="{G}" x2="270" y2="157"/><line class="flight" x1="270" y1="157" x2="180" y2="94"/>'
s += f'<line class="rail" x1="150" y1="{G-25}" x2="270" y2="132"/><line class="rail" x1="270" y1="132" x2="180" y2="69"/><line class="rail" x1="144" y1="69" x2="184" y2="69"/>'
s += '<line class="rail" x1="144" y1="69" x2="144" y2="94"/>'
s += arrow(184, 88, 266, 151) + arrow(266, 151, 158, 213)
s += dim(132, 94, 132, 69, '1,2 m', 128, 86, anchor='end')
s += dim(310, 104, 322, 104, '', 0, 0) + '<text x="316" y="98" class="s dimt" text-anchor="middle">≥ 1,0 m</text>'
s += '<text x="6" y="140" class="s">Tường đặc K1,</text><text x="6" y="153" class="s">≥ REI 30 / EI 30</text><line class="lead" x1="92" y1="146" x2="146" y2="146"/>'
s += '<text x="354" y="186" class="s" text-anchor="end">Chiếu thang cùng</text><text x="354" y="199" class="s" text-anchor="end">cao trình lối ra</text>'
s += f'<text x="8" y="{G+24}" class="s">Ngoài nhà, để hở, vật liệu không cháy. Nhà ≤ 28 m: được dùng;</text>'
s += f'<text x="8" y="{G+38}" class="s">28 – 50 m: khi phần trên 28 m có bảo vệ chống rơi ngã.</text>'
s += '</svg>'
D['thang-loai-3'] = {'t': 'Thang bộ loại 3 ngoài nhà', 'ref': '3.4.2, 3.4.11', 'svg': s,
  'cap': 'Thang loại 3 (ngoài nhà, để hở): vật liệu không cháy (trừ nhà bậc V); đặt sát phần tường đặc K1 trở lên có GHCL ≥ REI 30 / EI 30 (được thay bằng kính ≥ EI 30); chiếu thang cùng cao trình lối ra; lan can cao 1,2 m; cách lỗ cửa sổ ≥ 1,0 m. Nhà cao ≤ 28 m được dùng thang loại 3; nhà 28 – 50 m khi phần trên 28 m có bảo vệ chống rơi ngã toàn chiều cao (3.4.11).'}

json.dump(D, open(sys.argv[1], 'w', encoding='utf-8'), ensure_ascii=False)
print(len(D))
