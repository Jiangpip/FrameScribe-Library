// 把 data/ 生成静态网站到 site/（不依赖任何 npm 包；页面不引用外部字体 / CDN，国内打开快）
//   node tools/build.mjs            生成 site/
//   node tools/build.mjs --serve    生成后在 http://127.0.0.1:8090 预览
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { courseSlug, timeLink } from './schema.mjs';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const D = p => path.join(root, 'data', p);
const OUT = path.join(root, 'site');
const SITE = { name: 'FrameScribe Library', repo: 'https://github.com/Jiangpip/FrameScribe-Library', tool: 'https://github.com/Jiangpip/FrameScribe' };

// —— 小工具 ——
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = t => { t = Math.max(0, Math.round(t)); const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = t % 60; return (h ? h + ':' + String(m).padStart(2, '0') : String(m).padStart(2, '0')) + ':' + String(s).padStart(2, '0'); };
const hours = t => t >= 3600 ? (t / 3600).toFixed(1) + ' 小时' : Math.round(t / 60) + ' 分钟';
const write = (f, s) => { f = path.join(OUT, f); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
const readDir = d => fs.existsSync(d) ? fs.readdirSync(d) : [];

// 极简 front matter：key: value / key: [a, b]
function frontMatter(text) {
  const m = String(text).replace(/^﻿/, '').match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w一-鿿-]+):\s*(.*?)\s*(#.*)?$/);
    if (!kv) continue;
    let v = kv[2];
    if (/^\[.*\]$/.test(v)) v = v.slice(1, -1).split(',').map(x => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    else v = v.replace(/^["']|["']$/g, '');
    meta[kv[1]] = v;
  }
  return { meta, body: m[2] };
}
// 极简 Markdown：标题、列表、段落、粗体、行内代码、链接
function md(text) {
  const inline = s => esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  const out = []; let list = null, para = [], fence = null;
  const flush = () => { if (para.length) { out.push('<p>' + para.map(inline).join('<br>') + '</p>'); para = []; } if (list) { out.push(`<${list.tag}>` + list.items.map(i => '<li>' + inline(i) + '</li>').join('') + `</${list.tag}>`); list = null; } };
  for (const raw of String(text || '').split(/\r?\n/)) {
    const line = raw.trimEnd();
    let m;
    if (/^```/.test(line)) { if (fence) { out.push('<pre><code>' + esc(fence.join('\n')) + '</code></pre>'); fence = null; } else { flush(); fence = []; } continue; }
    if (fence) { fence.push(raw); continue; }
    if (!line.trim()) { flush(); continue; }
    if ((m = line.match(/^(#{1,4})\s+(.*)/))) { flush(); const h = Math.min(6, m[1].length + 1); out.push(`<h${h} id="${esc(m[2].trim())}">${inline(m[2])}</h${h}>`); continue; }
    if ((m = line.match(/^\s*([-*]|\d+\.)\s+(.*)/))) {
      const tag = /\d/.test(m[1]) ? 'ol' : 'ul';
      if (para.length) { out.push('<p>' + para.map(inline).join('<br>') + '</p>'); para = []; }
      if (!list || list.tag !== tag) { flush(); list = { tag, items: [] }; }
      list.items.push(m[2]); continue;
    }
    if (list) flush();
    para.push(line);
  }
  flush();
  return out.join('\n');
}

// —— 读数据 ——
const videos = readDir(D('videos')).filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(D('videos/' + f), 'utf8')));
const courseMap = new Map();
for (const v of videos) {
  const slug = courseSlug(v.course || v.channel || '未分组');
  if (!courseMap.has(slug)) courseMap.set(slug, { slug, title: v.course || '未分组', channel: v.channel, videos: [], meta: {}, body: '', reviews: [] });
  courseMap.get(slug).videos.push(v);
}
for (const f of readDir(D('courses')).filter(f => f.endsWith('.md'))) {
  const slug = f.replace(/\.md$/, ''), c = courseMap.get(slug);
  if (!c) continue;
  const { meta, body } = frontMatter(fs.readFileSync(D('courses/' + f), 'utf8'));
  Object.assign(c, { meta, body, title: meta.title || c.title, channel: meta.channel || c.channel });
}
for (const slug of readDir(D('reviews'))) {
  const c = courseMap.get(slug);
  if (!c) continue;
  for (const f of readDir(D('reviews/' + slug)).filter(f => f.endsWith('.md'))) {
    const { meta, body } = frontMatter(fs.readFileSync(D(`reviews/${slug}/${f}`), 'utf8'));
    const rating = Math.max(0, Math.min(5, +meta.rating || 0));
    c.reviews.push({ user: f.replace(/\.md$/, ''), rating, level: meta.level || '', watch: meta.watch || '', skip: meta.skip || '', body });
  }
}
const courses = [...courseMap.values()];
for (const c of courses) {
  c.videos.sort((a, b) => (a.index || 0) - (b.index || 0) || a.title.localeCompare(b.title));
  c.duration = c.videos.reduce((s, v) => s + (v.duration || 0), 0);
  const rated = c.reviews.filter(r => r.rating);
  c.rating = rated.length ? rated.reduce((s, r) => s + r.rating, 0) / rated.length : 0;
  c.rated = rated.length;
}
courses.sort((a, b) => b.rated - a.rated || b.rating - a.rating || b.videos.length - a.videos.length);
const vCourse = new Map(); for (const c of courses) for (const v of c.videos) vCourse.set(v.id, c);

// —— 页面骨架 ——
const stars = (r, n) => n ? `<span class="stars" title="${r.toFixed(1)} / 5，${n} 人评">${'★'.repeat(Math.round(r))}${'☆'.repeat(5 - Math.round(r))}<em>${r.toFixed(1)} · ${n} 人</em></span>` : '<span class="stars none">还没人评分</span>';
function page({ title, R, body, desc = '' }) {
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc || 'FrameScribe 生成的视频课程大纲：按视频内容搜索，每个知识点带时间戳，点一下跳到视频那一秒。')}">
<link rel="stylesheet" href="${R}style.css"></head><body>
<header class="top"><a class="brand" href="${R}index.html"><span class="dot"></span>FrameScribe <b>Library</b></a>
<div class="sbox"><input id="q" type="search" placeholder="搜知识点：Fresnel、视差、PCG 样条…" autocomplete="off" spellcheck="false"><div id="hits" class="hits" hidden></div></div>
<nav><a href="${R}contribute.html">关于</a><a href="${SITE.repo}" target="_blank" rel="noopener">GitHub</a></nav></header>
<main>${body}</main>
<footer>大纲由 AI 根据视频字幕生成，可能有错，以原视频为准 · 视频版权归原作者 · 大纲文字 <a href="${SITE.repo}/blob/main/LICENSE" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a> · 用 <a href="${SITE.tool}" target="_blank" rel="noopener">FrameScribe</a> 生成</footer>
<script>window.ROOT=${JSON.stringify(R)}</script><script src="${R}search.js" defer></script></body></html>`;
}

// —— 首页 ——
const totalPts = videos.reduce((s, v) => s + v.chapters.reduce((a, c) => a + c.points.length, 0), 0);
write('index.html', page({
  title: SITE.name, R: '', body: `
<section class="hero"><h1>按视频里讲了什么来找视频</h1>
<p>用 FrameScribe 把视频课程拆成章节和知识点，每条带时间戳，点一下跳到原视频那一秒。上面的搜索框能搜所有课程里的知识点。<a href="contribute.html">关于这个库 →</a></p>
<div class="stat"><span><b>${courses.length}</b> 门课</span><span><b>${videos.length}</b> 个视频</span><span><b>${totalPts}</b> 个知识点</span><span><b>${hours(videos.reduce((s, v) => s + v.duration, 0))}</b> 视频时长</span></div></section>
<section class="grid">${courses.map(c => `
<a class="card" href="c/${c.slug}.html"><div class="ch">${esc(c.channel || '')}</div><h2>${esc(c.title)}</h2>
<div class="meta">${c.videos.length} 个视频 · ${hours(c.duration)}</div>${stars(c.rating, c.rated)}
${(c.meta.tags || []).length ? `<div class="tags">${c.meta.tags.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}</a>`).join('')}
</section>`
}));

// —— 课程页 ——
for (const c of courses) {
  const intro = c.body.trim() ? md(c.body) : '<p class="dim">还没有介绍。</p>';
  const rev = c.reviews.length ? c.reviews.map(r => `<div class="rev"><div class="who"><b>${esc(r.user)}</b>${r.rating ? ' ' + '★'.repeat(r.rating) : ''}${r.level ? ` · 适合：${esc(r.level)}` : ''}</div>
${r.watch ? `<div><span class="k">值得看</span>${esc(r.watch)}</div>` : ''}${r.skip ? `<div><span class="k">可跳过</span>${esc(r.skip)}</div>` : ''}${r.body.trim() ? md(r.body) : ''}</div>`).join('')
    : `<p class="dim">还没有评价。看过这门课？<a href="../contribute.html#写一份评价">写一份评价</a>，一人一个文件，几分钟的事。</p>`;
  write(`c/${c.slug}.html`, page({
    title: c.title + ' · ' + SITE.name, R: '../', desc: `${c.title}：${c.videos.length} 个视频的章节大纲`, body: `
<div class="crumb"><a href="../index.html">全部课程</a> / ${esc(c.title)}</div>
<section class="chead"><div class="ch">${esc(c.channel || '')}${c.meta.link ? ` · <a href="${esc(c.meta.link)}" target="_blank" rel="noopener">频道 / 播放列表 ↗</a>` : ''}</div>
<h1>${esc(c.title)}</h1><div class="meta">${c.videos.length} 个视频 · ${hours(c.duration)} · ${stars(c.rating, c.rated)}</div>
<div class="intro">${intro}</div></section>
${c.reviews.length ? `<section><h3 class="sec">评价</h3>${rev}</section>` : ''}
<section><h3 class="sec">视频</h3><ol class="vlist">${c.videos.map((v, i) => `
<li><a class="vt" href="../v/${v.id}.html"><span class="n">${i + 1}</span>${esc(v.title)}</a><span class="dur">${fmt(v.duration)}</span>
<p>${esc(v.summary)}</p><div class="chips">${v.chapters.map(ch => `<a href="${esc(timeLink(v, ch.t))}" target="_blank" rel="noopener"><i>${fmt(ch.t)}</i>${esc(ch.title)}</a>`).join('')}</div></li>`).join('')}
</ol></section>`
  }));
}

// —— 视频页 ——
for (const c of courses) c.videos.forEach((v, i) => {
  const prev = c.videos[i - 1], next = c.videos[i + 1];
  const nav = `<div class="pn">${prev ? `<a href="${prev.id}.html">← ${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a href="${next.id}.html">${esc(next.title)} →</a>` : ''}</div>`;
  write(`v/${v.id}.html`, page({
    title: v.title + ' · 大纲', R: '../', desc: v.summary.slice(0, 120), body: `
<div class="crumb"><a href="../index.html">全部课程</a> / <a href="../c/${c.slug}.html">${esc(c.title)}</a></div>
<section class="vhead"><h1>${esc(v.title)}</h1>
<div class="meta">${esc(v.channel)} · ${fmt(v.duration)}${v.date ? ' · ' + v.date : ''} · 文字来源：${esc(v.source)} · <a href="${esc(v.url)}" target="_blank" rel="noopener">看原视频 ↗</a></div>
<p class="sum">${esc(v.summary)}</p>
<ol class="toc">${v.chapters.map((ch, k) => `<li><a href="#ch${k + 1}">${esc(ch.title)}</a><a class="tl" href="${esc(timeLink(v, ch.t))}" target="_blank" rel="noopener">${fmt(ch.t)}</a></li>`).join('')}</ol></section>
${v.chapters.map((ch, k) => `<section class="chap" id="ch${k + 1}"><h2><a class="tl" href="${esc(timeLink(v, ch.t))}" target="_blank" rel="noopener">${fmt(ch.t)}</a>${esc(ch.title)}</h2>
<ul>${ch.points.map(p => `<li id="t${p.t}"><a class="tl" href="${esc(timeLink(v, p.t))}" target="_blank" rel="noopener">${fmt(p.t)}</a><span>${esc(p.text)}</span></li>`).join('')}</ul></section>`).join('')}
${nav}`
  }));
});

// —— 投稿说明页（内容来自 CONTRIBUTING.md）——
write('contribute.html', page({ title: '关于 · ' + SITE.name, R: '', body: `<section class="doc">${md(fs.readFileSync(path.join(root, 'CONTRIBUTING.md'), 'utf8'))}</section>` }));
// GitHub Pages 的 404 可能出现在任何路径下：用脚本算出站点根目录再链回首页
write('404.html', '<!doctype html><meta charset="utf-8"><title>没找到</title><body style="background:#0d0f13;color:#e8ecf2;font:16px system-ui;padding:40px"><p>没找到这一页。</p><p><a id="h" style="color:#ff7a2f" href="/">回到首页</a></p><script>var p=location.pathname.split("/");if(location.hostname.endsWith("github.io"))document.getElementById("h").href="/"+p[1]+"/";</script>');

// —— 搜索索引 + 给 AI 用的数据 ——
const S = [];
for (const v of videos) {
  S.push([v.id, -1, v.title, 0]);
  S.push([v.id, -1, v.summary, 1]);
  for (const ch of v.chapters) { S.push([v.id, ch.t, ch.title, 2]); for (const p of ch.points) S.push([v.id, p.t, p.text, 3]); }
}
const vmeta = Object.fromEntries(videos.map(v => [v.id, [v.title, v.url, v.site, vCourse.get(v.id).title]]));
write('search.json', JSON.stringify({ v: vmeta, s: S }));
write('api/catalog.json', JSON.stringify({
  name: SITE.name, updated: new Date().toISOString().slice(0, 10),
  courses: courses.map(c => ({ slug: c.slug, title: c.title, channel: c.channel, rating: +c.rating.toFixed(2), ratings: c.rated, tags: c.meta.tags || [],
    videos: c.videos.map(v => ({ id: v.id, title: v.title, url: v.url, duration: v.duration, chapters: v.chapters.map(ch => ({ t: ch.t, title: ch.title })) })) }))
}, null, 1));
for (const v of videos) write(`api/videos/${v.id}.json`, JSON.stringify(v, null, 1));
write('llms.txt', `# ${SITE.name}

> 视频课程的章节大纲库（中文），每个知识点带视频时间戳。由 FrameScribe 根据字幕自动生成，维护者整理收录。

给 AI 的用法：
1. 先读 api/catalog.json：所有课程 → 视频 → 章节标题和起始秒数（体积小）。
2. 找到相关视频后读 api/videos/<id>.json：完整大纲（summary、chapters[].points[]，t 是秒）。
3. 要跳到原视频某一秒：YouTube 用 url + "&t=<秒>s"，B 站用 url + "?t=<秒>"。
4. 大纲是 AI 生成的，可能有错，以原视频为准。

课程：
${courses.map(c => `- ${c.title}（${c.videos.length} 个视频）：c/${c.slug}.html`).join('\n')}
`);
for (const f of ['style.css', 'search.js']) fs.copyFileSync(path.join(root, 'tools', 'web', f), path.join(OUT, f));
write('.nojekyll', '');
console.log(`site/：${courses.length} 门课，${videos.length} 个视频，搜索条目 ${S.length}`);

if (process.argv.includes('--serve')) {
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8' };
  http.createServer((q, r) => {
    let p = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
    const f = path.join(OUT, p);
    if (!f.startsWith(OUT) || !fs.existsSync(f)) { r.statusCode = 404; return r.end(fs.readFileSync(path.join(OUT, '404.html'))); }
    r.setHeader('content-type', types[path.extname(f)] || 'application/octet-stream'); r.end(fs.readFileSync(f));
  }).listen(8090, '127.0.0.1', () => console.log('预览：http://127.0.0.1:8090/'));
}
