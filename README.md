# FrameScribe Library · 技术美术课程地图

**几个做技术美术的朋友一起攒的课程大纲。每个知识点带时间戳，点一下跳到原视频那一秒；看过的人写一句「值不值得看、看哪几集」。**

🔎 **网站**：<https://jiangpip.github.io/FrameScribe-Library/>（顶上能搜所有课程里的知识点）

不求大而全：只收我们自己看过、或者正在看的**技术美术**相关公开课程（Shader / 材质、PCG / 程序化、UE / Unity / Houdini、TA 工具链）。目标是少踩烂课，想学某个点时能直接找到哪个视频的第几分钟。

大纲用 [FrameScribe](https://github.com/Jiangpip/FrameScribe) 根据视频字幕生成。

## 现在有什么

| 课程 | 视频 |
|---|---|
| Ben Cloward - Advanced Materials | 41 |
| Ben Cloward - Procedural Content Generation (PCG) | 9 |

## 怎么用

- **查**：打开网站，在搜索框里搜（按 `/` 直接聚焦），比如「Fresnel」「视差」「PCG 样条」。结果列出视频和几分几秒，点一下就跳过去。
- **让 AI 查**：把网站地址给 Claude Code / Codex，让它先读 `llms.txt`。它会先看 `api/catalog.json`（课程 → 视频 → 章节），再只读需要的那一份 `api/videos/<id>.json`。

## 一起维护

见 [CONTRIBUTING.md](CONTRIBUTING.md)。仓库很小（约 1 MB），被加为协作者后直接提交就行。

## 版权

- 视频的版权归原作者。这里只收公开免费视频的**大纲**（章节和知识点概括），不收字幕全文、视频截图和付费课程内容。
- 大纲文字以 [CC BY-NC-SA 4.0](LICENSE) 发布：可以转载和改编，要署名、不能商用、改编后同样方式共享。
- 原作者如果不希望自己的视频被收录，开一个 issue，我们会删掉。
- `tools/` 里的脚本是 GPL-3.0。
