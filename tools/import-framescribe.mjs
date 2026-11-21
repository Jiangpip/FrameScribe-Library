// 从本机 FrameScribe 的数据里导入大纲到知识库（每个维护者在自己电脑上跑）
//   node tools/import-framescribe.mjs                       导入所有带播放列表分组、已有大纲的视频
//   node tools/import-framescribe.mjs --group "频道 - 列表名"  只导入这一组
//   node tools/import-framescribe.mjs --data D:\某处\data     指定 FrameScribe 数据目录
// 只取大纲和公开信息（标题、链接、时长、频道），不带字幕全文、截图、本机路径。
import fs from 'node:fs';
import path from 'node:path';
import { toLibraryVideo, courseSlug } from './schema.mjs';

const args = process.argv.slice(2);
const opt = k => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const appData = process.env.APPDATA || '';
const dataDir = opt('--data') || [path.join(appData, 'FrameScribe', 'data'), path.join(appData, 'BiliNotes', 'data')].find(d => fs.existsSync(d));
if (!dataDir) { console.error('没找到 FrameScribe 的数据目录，用 --data 指定'); process.exit(1); }
const onlyGroup = opt('--group');
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const sessions = path.join(dataDir, 'sessions');

let n = 0, skipped = 0;
const courses = new Map();
for (const id of fs.readdirSync(sessions)) {
  const dir = path.join(sessions, id);
  let s, o;
  try { s = JSON.parse(fs.readFileSync(path.join(dir, 'session.json'), 'utf8')); } catch { continue; }
  if (!fs.existsSync(path.join(dir, 'outline.json'))) continue;
  o = JSON.parse(fs.readFileSync(path.join(dir, 'outline.json'), 'utf8'));
  if (!s.group) { skipped++; continue; }        // 单个视频不进库（没有课程归属）；要收就先在 FrameScribe 里批量
  if (onlyGroup && s.group !== onlyGroup) continue;
  const v = toLibraryVideo(s, o);
  fs.mkdirSync(path.join(root, 'data', 'videos'), { recursive: true });
  fs.writeFileSync(path.join(root, 'data', 'videos', v.id + '.json'), JSON.stringify(v, null, 1) + '\n');
  courses.set(v.course, v.channel);
  n++;
}
// 新课程：建一张空的课程卡，等人来写评价
for (const [course, channel] of courses) {
  const f = path.join(root, 'data', 'courses', courseSlug(course) + '.md');
  if (fs.existsSync(f)) continue;
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, `---\ntitle: ${course}\nchannel: ${channel || ''}\nlink:\ntags: []\n---\n\n（还没有介绍。看过的人可以补一段：这门课讲什么、适合谁、从哪集开始看。）\n`);
  console.log('新课程卡：', path.relative(root, f));
}
console.log(`导入 ${n} 个视频${skipped ? `，跳过 ${skipped} 个没有分组的` : ''}`);
