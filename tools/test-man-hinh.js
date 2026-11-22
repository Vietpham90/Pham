// Mọi trang trên nhiều cỡ màn hình: không tràn ngang, chữ không bị che, nút đủ lớn để bấm
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const f = 'file://' + process.argv[2]; const out = [];
  const pages = ['', '#cong-trinh', '#hon-hop', '#gian-phong', '#tra-nhanh', '#so-do', '#da-luu', '#phan-loai', '#ngan-chay', '#thoat-nan', '#chay-lan', '#chua-chay', '#sua-doi', '#thuat-ngu', '#cao-tang'];
  for (const [w, h, name] of [[320, 568, 'iPhone SE 320'], [390, 844, 'iPhone 390'], [768, 1024, 'iPad dọc 768'], [844, 390, 'Điện thoại ngang 844']]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => new MutationObserver(() => document.querySelectorAll('details:not([open])').forEach(d => { if (!d.dataset.t) { d.dataset.t = 1; d.open = true; } })).observe(document, { childList: true, subtree: true }));
    for (const pg of pages) {
      await p.goto(f + pg); await p.waitForTimeout(250);
      const r = await p.evaluate(W => {
        const sw = document.documentElement.scrollWidth;
        const wide = [...document.querySelectorAll('#view *')].filter(e => { const r = e.getBoundingClientRect(); if (!r.width) return false; if (e.closest('.tbl, .dgov, pre, table, svg')) return false; return r.right > W + 1; }).slice(0, 3).map(e => e.tagName + '.' + (e.className || '') + ':' + Math.round(e.getBoundingClientRect().right));
        const small = [...document.querySelectorAll('#view button, nav.bottom a, nav.bottom button')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.height && r.height < 28 && !e.classList.contains('ref') && !e.classList.contains('star') && !e.closest('.dg-index, .chips'); }).slice(0, 3).map(e => (e.textContent || '').trim().slice(0, 20) + ':' + Math.round(e.getBoundingClientRect().height));
        return { sw, wide, small };
      }, w);
      if (r.sw > w || r.wide.length || r.small.length || errs.length) out.push(`${name} ${pg || 'trang chủ'}: ${r.sw > w ? 'tràn ngang ' + r.sw + ' px; ' : ''}${r.wide.length ? 'phần tử vượt khung ' + r.wide.join(', ') + '; ' : ''}${r.small.length ? 'nút nhỏ ' + r.small.join(', ') + '; ' : ''}${errs.join(' ')}`);
    }
    await ctx.close();
  }
  console.log(out.length ? out.join('\n') : 'Tất cả trang, mọi cỡ màn hình: không tràn ngang, không lỗi'); await b.close(); })();
