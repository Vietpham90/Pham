// Gõ số rồi bấm ngay một nút (không mất lần bấm do vẽ lại kết quả)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const f = 'file://' + process.argv[2]; const out = [];
  for (const [hash, field, val, btn, check] of [
    ['#gian-phong', '#gpa', '777', '[data-go="cong-trinh"]', () => location.hash === '#cong-trinh'],
    ['#hon-hop', '#mxh', '33', '[data-foldall]', () => !document.querySelector('details.ct-d:not([open])')],
    ['#cong-trinh', '#cth', '44', '[data-foldall]', () => !document.querySelector('details.ct-d:not([open])')]]) {
    await p.goto(f + hash); await p.waitForTimeout(250);
    await p.fill(field, val); await p.click(btn); await p.waitForTimeout(300);
    out.push(hash + ': ' + ((await p.evaluate(check)) ? 'bấm ăn ngay' : 'MẤT LẦN BẤM'));
  }
  console.log(out.join('\n')); await b.close();
})();
