# FrameScribe Library

**视频课程的章节大纲库。每个知识点带时间戳，点一下跳到原视频那一秒。**

🔎 **网站**：<https://jiangpip.github.io/FrameScribe-Library/>（能搜所有课程里的知识点）

大纲由 [FrameScribe](https://github.com/Jiangpip/FrameScribe) 根据视频字幕自动生成，看过的人可以给课程打分、写「值得看哪几集」，慢慢攒成一个**大家验证过的**课程地图，少踩烂课。

## 现在有什么

| 课程 | 视频 |
|---|---|
| Ben Cloward - Advanced Materials | 41 |
| Ben Cloward - Procedural Content Generation (PCG) | 9 |

## 怎么用

- **查东西**：打开网站，在顶上搜索框里搜（按 `/` 直接聚焦），比如「Fresnel」「视差」「PCG 样条」。结果列出视频、几分几秒，点一下就跳过去。
- **让 AI 查**：把网站地址给 Claude Code / Codex，让它先读 `llms.txt`。它会先看 `api/catalog.json`（课程 → 视频 → 章节），再只读需要的那一份 `api/videos/<id>.json`。
- **不用下载仓库**：看和搜都在网页上；投稿也可以直接在 GitHub 网页上传。

## 投稿

见 [CONTRIBUTING.md](CONTRIBUTING.md)：投大纲（FrameScribe 一键提交）、写评价（一人一个文件）、改错。

## 版权

- 视频的版权归原作者。这里只收公开免费视频的**大纲**（章节和知识点概括），不收字幕全文、视频截图和付费课程内容。
- 大纲文字以 [CC BY-NC-SA 4.0](LICENSE) 发布：可以转载和改编，要署名、不能商用、改编后同样方式共享。
- 原作者如果不希望自己的视频被收录，开一个 issue，我们会删掉。
- `tools/` 里的脚本是 GPL-3.0，和 FrameScribe 一样。
