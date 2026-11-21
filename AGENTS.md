# AGENTS.md（给维护者的 AI 看）

公开的 FrameScribe 大纲示例库。**不开放投稿**，只有维护者让你加课时才加。

加一门课：
1. 确认本机有 FrameScribe 数据（`%APPDATA%\FrameScribe\data`，旧版是 `%APPDATA%\BiliNotes\data`），并且这门课已经用「批量大纲」生成过。
2. `node tools/import-framescribe.mjs --group "<频道 - 播放列表名>"`。
3. 打开新建的 `data/courses/<slug>.md`：根据 `data/videos/` 里这门课各集的 summary 写两三句事实性的介绍（讲了什么、用什么软件、什么年份、什么语言），补 `tags`。不要编评分。
4. `node tools/build.mjs` 确认能生成。
5. 只收公开免费视频；不要提交字幕全文、截图或付费课程内容。
6. 运行 `powershell -ExecutionPolicy Bypass -File scripts\check-privacy.ps1`，零命中再提交、推送到 main。

许可证：`data/` 和网站文字是 CC BY-NC-SA 4.0，`tools/` 是 PolyForm Noncommercial 1.0.0。不许商用。
