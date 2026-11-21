// 全站搜索：第一次聚焦搜索框时下载 search.json（几百 KB），之后全在浏览器里搜
(() => {
  const R = window.ROOT || '', q = document.getElementById('q'), box = document.getElementById('hits');
  if (!q) return;
  let data = null, loading = null, sel = -1;
  const load = () => loading || (loading = fetch(R + 'search.json').then(r => r.json()).then(d => {
    data = d; d.low = d.s.map(x => x[2].toLowerCase());
  }));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = t => { t = Math.max(0, Math.round(t)); const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = t % 60; return (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(s).padStart(2, '0'); };
  const tlink = (v, t) => { try { const u = new URL(v[1]); if (v[2] === 'bilibili' || /bilibili/.test(u.hostname)) u.searchParams.set('t', t); else u.searchParams.set('t', t + 's'); return u.href; } catch (e) { return v[1]; } };
  function hl(text, terms) {
    let out = esc(text);
    for (const w of terms) out = out.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), m => '<mark>' + m + '</mark>');
    return out;
  }
  // 简介很长：只留命中的那一段
  const snip = (t, w) => { const i = t.toLowerCase().indexOf(w); if (i < 0 || t.length < 90) return t; const a = Math.max(0, i - 36); return (a ? '…' : '') + t.slice(a, i + w.length + 50) + (i + w.length + 50 < t.length ? '…' : ''); };
  function run() {
    const s = q.value.trim().toLowerCase();
    if (!s || !data) { box.hidden = true; return; }
    const terms = s.split(/\s+/).filter(Boolean);
    const groups = new Map(); let n = 0;
    for (let i = 0; i < data.s.length && n < 120; i++) {
      if (!terms.every(w => data.low[i].includes(w))) continue;
      const [id, t, text, kind] = data.s[i];
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id).push({ t, text, kind }); n++;
    }
    if (!n) { box.innerHTML = '<div class="more">没有找到。换个说法，或者用英文术语试试（如 Fresnel、Parallax）。</div>'; box.hidden = false; return; }
    let html = '';
    for (const [id, hits] of groups) {
      const v = data.v[id];
      html += `<div class="grp">${esc(v[3])} · <a href="${R}v/${id}.html">${esc(v[0])}</a></div>`;
      for (const h of hits.slice(0, 6)) {
        const href = h.t >= 0 ? tlink(v, h.t) : `${R}v/${id}.html`;
        html += `<a class="hit" href="${href}"${h.t >= 0 ? ' target="_blank" rel="noopener"' : ''}><i>${h.t >= 0 ? fmt(h.t) : h.kind === 0 ? '标题' : '简介'}</i><span>${hl(h.kind === 1 ? snip(h.text, terms[0]) : h.text, terms)}</span></a>`;
      }
      if (hits.length > 6) html += `<a class="more" href="${R}v/${id}.html">这个视频里还有 ${hits.length - 6} 条 →</a>`;
    }
    if (n >= 120) html += '<div class="more">结果太多，只显示前 120 条，加个关键词缩小范围。</div>';
    box.innerHTML = html; box.hidden = false; sel = -1;
  }
  let timer = 0;
  q.addEventListener('focus', load);
  q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => load().then(run), 120); });
  q.addEventListener('keydown', e => {
    const items = [...box.querySelectorAll('.hit')];
    if (e.key === 'Escape') { box.hidden = true; q.blur(); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); if (!items.length) return;
      sel = (sel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach((x, i) => x.classList.toggle('on', i === sel)); items[sel].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && items[Math.max(sel, 0)]) items[Math.max(sel, 0)].click();
  });
  document.addEventListener('click', e => { if (!e.target.closest('.sbox')) box.hidden = true; });
  document.addEventListener('keydown', e => { if (e.key === '/' && document.activeElement !== q) { e.preventDefault(); q.focus(); } });
  const pre = new URLSearchParams(location.search).get('q');
  if (pre) { q.value = pre; load().then(run); }
})();
