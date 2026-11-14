const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const f = 'file://' + process.argv[2]; const out = [];
  for (const [hash, field, val] of [['#gian-phong', '#gpa', '777'], ['#hon-hop', '#mxh', '33'], ['#cong-trinh', '#cth', '44']]) {
    await p.goto(f + hash); await p.waitForTimeout(250);
    await p.fill(field, val); await p.click('[data-report]'); await p.waitForTimeout(300);
    out.push(hash + ': ' + (await p.evaluate(() => location.hash)) + ' ' + (await p.$$eval('.rp-row', x => x.length)) + ' dòng');
  }
  console.log(out.join('\n')); await b.close();
})();
