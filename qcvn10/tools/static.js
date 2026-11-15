// Tạo bản đọc tĩnh (không cần JavaScript) cho iPhone: dựng sẵn mọi mục thành HTML, nhúng phông.
// Dùng: node qcvn10/tools/static.js so-tay-qcvn10-offline.html so-tay-qcvn10-iphone.html
const { chromium } = require("playwright"); const fs = require("fs"); const path = require("path");
(async () => {
  const src = path.resolve(process.argv[2]), out = process.argv[3];
  const html = fs.readFileSync(src, "utf8");
  const style = html.slice(html.indexOf("<style>"), html.indexOf("</head>"));
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto("file://" + src); await p.waitForTimeout(200);
  const body = await p.evaluate(() => {
    const toc = ORDER.map(id => `<li><a href="#${id}"><span class="num ${META[id].c}">${META[id].n}</span><span><b>${META[id].t}</b><span class="d">${META[id].d}</span></span></a></li>`).join("");
    const secs = ORDER.map(id => {
      const s = SECTIONS[id];
      const blocks = s.blocks.map(bl => `<section class="blk" id="${bl.id}"><h3 class="bt">${inline(bl.title)}</h3><div class="body">${mdToHtml(bl.lines)}</div></section>`).join("");
      return `<article class="doc st" id="${id}"><h2 class="sh"><span class="num ${META[id].c}">${META[id].n}</span>${META[id].t}</h2>${mdToHtml(s.lead)}${blocks}<p class="up"><a href="#muc-luc">↑ Mục lục</a></p></article>`;
    }).join("");
    return `<header class="top gutter"><div class="wrap"><div class="brand"><h1>Sổ tay trang bị PCCC<small>QCVN 10:2025/BCA · TT 103/2025/TT-BCA · bản đọc offline</small></h1></div></div></header>
<main class="gutter"><div class="wrap">
<p class="intro">Bản đọc tĩnh, mở được trên iPhone không cần mạng. Bấm tên mục để nhảy tới. Các công cụ tra theo công trình và tính nước có ở bản web.</p>
<p class="label" id="muc-luc">Mục lục</p><ul class="toc st">${toc}</ul>${secs}
<p class="disclaimer">Đối chiếu QCVN 10:2025/BCA ban hành kèm Thông tư 103/2025/TT-BCA ngày 04/11/2025. Sổ tay không thay thế văn bản quy chuẩn.</p>
</div></main>`;
  });
  await b.close();
  const extra = `<style>
main { padding-bottom: 32px; }
.toc.st a { display: flex; gap: 12px; align-items: center; padding: 12px 14px; color: inherit; text-decoration: none; }
.st .sh { display: flex; gap: 10px; align-items: center; font-size: 20px; margin: 28px 0 8px; padding-top: 8px; border-top: 2px solid var(--fire); }
.st .blk { background: var(--panel); border: 1px solid var(--line); border-radius: 12px; padding: 4px 14px 10px; margin: 10px 0; }
.st .bt { font-size: 15.5px; margin: 10px 0 4px; }
.st .hint { display: none; }
.up a { font-size: 13px; color: var(--muted); }
header.top { position: static; }
</style>`;
  const doc = `<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<title>Sổ tay QCVN 10 — bản đọc offline</title>\n${style}${extra}\n</head>\n<body>\n${body}\n</body>\n</html>\n`;
  if (/<script/i.test(doc)) throw new Error("bản tĩnh còn thẻ script");
  fs.writeFileSync(out, doc);
  console.log(out, Math.round(fs.statSync(out).size / 1024) + " KB");
})();
