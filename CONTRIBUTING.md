# 投稿

这里的每一份大纲、每一条评价都是一个单独的文件，你加你的，不会和别人冲突。投稿会以「合并请求（Pull Request）」的形式进来，维护者看一眼就合并。

## 投一门课的大纲

**最省事：用 FrameScribe。**
1. 在 [FrameScribe](https://github.com/Jiangpip/FrameScribe) 里对一个 YouTube 播放列表点「📒 批量大纲」，等大纲全部生成。
2. 笔记本里选中这门课的任意一条记录，点「提交到知识库」。
3. 装了 GitHub CLI（`gh`）并登录过：自动建好合并请求，浏览器会打开它。没装：软件会把文件放进一个文件夹并打开 GitHub 的上传页，把文件夹里的文件拖进网页、点提交即可。

**收什么：**
- 公开免费的视频（YouTube、B 站等）的大纲：章节、知识点、时间戳。
- 不收：完整字幕 / 逐字稿、视频截图、付费课程的内容。大纲里点时间就能回原视频看画面。

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

最简单的提交方法：在 GitHub 网页上打开这个仓库 → 进到 `data/reviews/` → Add file → Create new file，文件名写 `<课程>/<你的用户名>.md`，粘贴上面的内容，提交时选「Create a new branch and start a pull request」。

## 改课程介绍、改大纲里的错

- 课程介绍和标签：`data/courses/<课程>.md`。
- 大纲有识别错误：`data/videos/<视频 id>.json` 里改对应的文字（`t` 是秒数，别动）。

## 格式（给写工具的人）

- `data/videos/<id>.json`：`schema`、`id`、`site`、`url`、`title`、`date`、`channel`、`course`、`index`、`duration`、`source`、`summary`、`chapters[{t,title,points[{t,text}]}]`、`generator`。生成规则在 `tools/schema.mjs`。
- 网站由 `node tools/build.mjs` 生成，合并到 main 后自动发布。本地预览：`node tools/build.mjs --serve`。
