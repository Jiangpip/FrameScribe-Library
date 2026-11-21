# 一起维护

这是几个朋友的小仓库：你被加为协作者（Collaborator）后，直接改、直接提交就行，不用走审核。仓库很小，克隆下来约 1 MB。

## 收什么

- **技术美术相关**的公开课程：Shader / 材质、PCG / 程序化、UE / Unity / Houdini、TA 工具链等。
- 你自己看过、或者正在看、觉得值得记的。不求全，烂课也可以收，评价里写清楚哪里烂，帮别人避坑。
- 不收：字幕全文 / 逐字稿、视频截图、付费课程的内容。大纲里点时间就能回原视频看画面。

## 加一门课

1. 在 [FrameScribe](https://github.com/Jiangpip/FrameScribe) 里打开这门课的 YouTube 播放列表，点右下「📒 批量大纲」→「开始批量」，等大纲全部生成。
2. 克隆本仓库，在仓库目录里运行：
   ```
   node tools/import-framescribe.mjs --group "频道 - 播放列表名"
   ```
   组名就是 FrameScribe 导出文件夹的名字。脚本只取大纲和公开信息（标题、链接、时长、频道），不带字幕全文、截图和本机路径。
3. 打开新生成的 `data/courses/<课程>.md`，写两三句介绍、补上标签。
4. 本地预览（可选）：`node tools/build.mjs --serve`，打开 http://127.0.0.1:8090 。
5. 提交并推送。网站会在一两分钟后自动更新。

懒得自己敲命令？在仓库目录里对 Claude Code / Codex 说：「把 FrameScribe 里『频道 - 播放列表名』这门课导入知识库，写好课程卡，提交并推送」。仓库里的 `AGENTS.md` 告诉了它怎么做。

## 写一份评价

一门课一人一个文件：`data/reviews/<课程>/<你的 GitHub 用户名>.md`。课程文件夹名就是课程页地址里 `c/` 后面那一段。

```
---
rating: 4            # 1–5
level: 有 UE 基础      # 适合谁
watch: 第 2–9 集      # 值得看
skip: 第 1 集         # 可以跳过
---
一两段话：学到了什么、哪里讲得好、哪里过时了或有坑。
```

不想克隆也行：在 GitHub 网页上打开仓库 → 进到 `data/reviews/` → Add file → Create new file，文件名写 `<课程>/<你的用户名>.md`，粘贴上面的内容，直接提交到 main。

## 改错

- 课程介绍和标签：`data/courses/<课程>.md`。
- 大纲有识别错误：`data/videos/<视频 id>.json` 里改对应的文字（`t` 是秒数，别动）。

## 格式（给写工具的人）

- `data/videos/<id>.json`：`schema`、`id`、`site`、`url`、`title`、`date`、`channel`、`course`、`index`、`duration`、`source`、`summary`、`chapters[{t,title,points[{t,text}]}]`、`generator`。生成规则在 `tools/schema.mjs`。
- 网站由 `node tools/build.mjs` 生成，推送到 main 后 GitHub Actions 自动发布。
