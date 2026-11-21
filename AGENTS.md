# AGENTS.md

这是几个朋友维护的技术美术课程大纲库。用户让你「把某门课导入知识库」时：

1. 确认用户本机有 FrameScribe 数据（`%APPDATA%\FrameScribe\data`，旧版是 `%APPDATA%\BiliNotes\data`），并且这门课已经用「批量大纲」生成过。
2. 运行 `node tools/import-framescribe.mjs --group "<频道 - 播放列表名>"`。组名不确定时，先不带参数看输出里的课程名，或看导出文件夹名。
3. 打开新建的 `data/courses/<slug>.md`：根据 `data/videos/` 里这门课各集的 summary 写两三句事实性的介绍（讲了什么、用什么软件、什么年份、什么语言），补 `tags`。不要编评分，评价由看过的人自己写在 `data/reviews/`。
4. 运行 `node tools/build.mjs` 确认能生成。
5. 只收技术美术相关的公开课程；不要提交字幕全文、截图或付费课程内容。
6. `git add -A`、提交、推送到 main。提交信息写「添加课程：<课程名>」。
