// 知识库的数据格式（schema 1）。import-framescribe.mjs 按这个格式从 FrameScribe 的数据导入。
//
// data/videos/<id>.json   一个视频一份：公开信息 + AI 大纲（不含字幕全文、截图、本机路径）
// data/courses/<slug>.md  一门课一张卡：介绍、标签（任何人都能补）
// data/reviews/<slug>/<GitHub 用户名>.md   一人一份评价：评分、适合谁、值得看哪几集

export const SCHEMA = 1;

export function courseSlug(name) {
  const s = String(name || '').toLowerCase().normalize('NFKD').replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '');
  if (s.replace(/-/g, '').length >= 3) return s.slice(0, 80);
  let h = 0; for (const c of String(name)) h = (h * 31 + c.codePointAt(0)) >>> 0;
  return 'c-' + h.toString(36);
}

// FrameScribe 的 session.json + outline.json → 知识库视频 JSON（只挑白名单字段）
export function toLibraryVideo(s, o) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(s.part || '') ? s.part : '';
  const subs = s.subs || {};
  return {
    schema: SCHEMA,
    id: String(s.id),
    site: s.site || 'youtube',
    url: String(s.url || ''),
    title: String(s.title || ''),
    date,
    channel: String(s.owner || ''),
    course: String(s.group || ''),
    index: (s.groups && s.groups[s.group]) || s.groupIdx || 0,
    duration: Math.round(+s.duration || 0),
    source: subs.lan === 'asr' ? '本机转写' : String(subs.lanDoc || '字幕').replace(/ \(自动生成\)/, ''),
    summary: String(o.summary || ''),
    chapters: (o.chapters || []).map(c => ({
      t: Math.round(+c.t || 0), title: String(c.title || ''),
      points: (c.points || []).map(p => ({ t: Math.round(+p.t || 0), text: String(p.text || '') }))
    })),
    generator: 'FrameScribe'
  };
}

// 视频某一秒的链接
export function timeLink(v, t) {
  t = Math.max(0, Math.round(t));
  try {
    const u = new URL(v.url);
    if (v.site === 'youtube' || /youtube\.com|youtu\.be/.test(u.hostname)) { u.searchParams.set('t', t + 's'); return u.href; }
    if (/bilibili\.com/.test(u.hostname)) { u.searchParams.set('t', String(t)); return u.href; }
    u.searchParams.set('bn_t', String(t)); return u.href;
  } catch { return v.url; }
}
