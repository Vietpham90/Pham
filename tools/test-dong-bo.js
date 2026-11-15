// Kiểm thử đồng bộ: giả lập kho dữ liệu theo tài khoản (db + user) dùng chung cho 2 "máy" (2 trình duyệt riêng)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const f = 'file://' + process.argv[2];
  const res = []; const ok = (n, c, i) => res.push((c ? 'ĐẠT  ' : 'LỖI  ') + n + (c ? '' : ' → ' + String(JSON.stringify(i)).slice(0, 300)));
  const cloud = {}; let writes = 0;
  const MOCK = () => {
    const subs = [];
    const ref = path => ({
      path,
      get: async () => { const d = await window.__cget(path); return { id: path.split('/').pop(), exists: !!d, data: () => d || undefined, metadata: { fromCache: false, hasPendingWrites: false } }; },
      set: async data => { await window.__cset(path, JSON.parse(JSON.stringify(data))); },
      onSnapshot: (next) => { let last = ''; const t = setInterval(async () => { const d = await window.__cget(path); const k = JSON.stringify(d); if (k !== last) { last = k; next({ exists: !!d, data: () => d || undefined, metadata: { fromCache: false, hasPendingWrites: false } }); } }, 300); return () => clearInterval(t); }
    });
    const db = Object.freeze({ doc: ref });
    const user = Object.freeze({ id: async () => 'u-test-1' });
    window.claude = { use: async n => (n === 'db' ? db : n === 'user' ? user : null) };
  };
  const device = async () => {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const p = await ctx.newPage(); p.setDefaultTimeout(5000);
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.exposeFunction('__cget', path => cloud[path] || null);
    await p.exposeFunction('__cset', (path, d) => { cloud[path] = d; writes++; });
    await p.addInitScript(MOCK);
    return { p, errs, ctx };
  };
  const A = await device(), B = await device();
  await A.p.goto(f + '#cong-trinh'); await A.p.waitForTimeout(600);
  // Máy A: đổi công trình và chiều cao, lưu một mục ★
  await A.p.click('#cth', { clickCount: 3 }); await A.p.keyboard.type('72'); await A.p.waitForTimeout(200);
  await A.p.goto(f + '#thoat-nan'); await A.p.waitForTimeout(400);
  await A.p.click('[data-star]'); await A.p.waitForTimeout(2200);
  const doc = cloud['data/users/u-test-1/sotay'];
  ok('Máy A ghi vào kho riêng data/users/<id>/sotay', !!doc && doc.ct && doc.ct.h === 72 && Array.isArray(doc.saved) && doc.saved.length === 1, doc && { h: doc.ct && doc.ct.h, saved: doc.saved });
  ok('Gom nhiều thao tác thành ít lần ghi (≤ 3)', writes <= 3, writes);
  // Máy B mở lần đầu → nhận dữ liệu của A
  await B.p.goto(f + '#cong-trinh'); await B.p.waitForTimeout(1200);
  ok('Máy B mở → nhận chiều cao 72 m từ máy A', (await B.p.inputValue('#cth')) === '72', await B.p.inputValue('#cth'));
  await B.p.goto(f + '#da-luu'); await B.p.waitForTimeout(300);
  ok('Máy B có mục ★ đã lưu từ máy A', (await B.p.$$('.results li')).length === 1);
  // Máy B sửa → máy A đang mở tự cập nhật
  await B.p.goto(f + '#gian-phong'); await B.p.waitForTimeout(300);
  await B.p.click('#gpa', { clickCount: 3 }); await B.p.keyboard.type('950'); await B.p.click('body', { position: { x: 5, y: 300 } }); await B.p.waitForTimeout(2200);
  await A.p.goto(f + '#gian-phong'); await A.p.waitForTimeout(1500);
  ok('Máy B sửa diện tích gian 950 m² → máy A thấy', (await A.p.inputValue('#gpa')) === '950', await A.p.inputValue('#gpa'));
  // Đang gõ không bị vẽ lại làm mất chữ
  await A.p.click('#gpch', { clickCount: 3 }); await A.p.keyboard.type('5');
  cloud['data/users/u-test-1/sotay'] = { ...cloud['data/users/u-test-1/sotay'], at: Date.now() + 5000, dev: 'khac', gp: { ...cloud['data/users/u-test-1/sotay'].gp, a: 1234 } };
  await A.p.waitForTimeout(800);
  ok('Đang gõ: không vẽ lại giữa chừng (chữ vẫn giữ)', (await A.p.inputValue('#gpch')) === '5' && await A.p.evaluate(() => document.activeElement && document.activeElement.id === 'gpch'));
  await A.p.click('body', { position: { x: 5, y: 300 } }); await A.p.waitForTimeout(600);
  ok('Rời ô nhập → áp dụng thay đổi từ máy khác', (await A.p.inputValue('#gpa')) === '1234', await A.p.inputValue('#gpa'));
  await A.p.goto(f); await A.p.waitForTimeout(500);
  ok('Trang chủ báo "Đã đồng bộ theo tài khoản Claude"', /Đã đồng bộ theo tài khoản Claude/.test(await A.p.innerText('#syncst')), await A.p.innerText('#syncst'));
  // Ngoài claude.ai (không có window.claude): chỉ lưu trên máy, không lỗi
  const C = await b.newContext(); const q = await C.newPage(); const errC = []; q.on('pageerror', e => errC.push(e.message));
  await q.goto(f); await q.waitForTimeout(400);
  ok('Ngoài claude.ai: báo "lưu trên máy này", không lỗi', /lưu trên máy này/.test(await q.innerText('#syncst')) && errC.length === 0, [await q.innerText('#syncst'), errC]);
  ok('Không lỗi JS', A.errs.length === 0 && B.errs.length === 0, [A.errs, B.errs]);
  console.log(res.join('\n')); console.log(`${res.filter(r => r.startsWith('ĐẠT')).length}/${res.length}`); await b.close();
})();
