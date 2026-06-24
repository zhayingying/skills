---
create_time: 2026-05-17 12:56 CST
update_time: 2026-05-17 12:56 CST
---

# 项目工作区契约

这个 skill 可以反复生成很多份报告。所有输入、中间物、结构化语料、最终报告和验证记录必须按项目隔离，不要散落在 skill 源码目录里。

## 默认工作区

如果用户没有指定输出位置，在当前工作目录使用下面的逻辑结构：

```text
visual-report-workspace/
└── projects/
    └── {project-slug}/
        ├── README.md
        ├── input/
        ├── scratch/
        │   └── {run-id}/
        │       ├── fetches/
        │       ├── screenshots/
        │       └── extracts/
        ├── content/
        │   ├── outline.md
        │   ├── content.json
        │   └── sources.json
        ├── dist/
        │   └── {report-slug}/
        └── qa/
            └── {report-slug}/
```

注意：上面的树是产物语义图，不是预创建清单。禁止为了满足结构而创建空目录或 0 字节占位文件；`input/`、`scratch/`、`scratch/{run-id}/fetches/`、`screenshots/`、`extracts/` 必须在写入第一个真实输入、抓取、截图或抽取结果时才创建。

如果用户指定了目录，就在该目录下保持同样语义结构，同样按需创建目录：

```text
{workspace-root}/projects/{project-slug}/...
```

## 命名规则

| 名称 | 规则 | 示例 |
|---|---|---|
| `{project-slug}` | 一个调研项目，短横线命名，稳定不变 | `ai-cli-landscape` |
| `{run-id}` | 一次生成 / 拆解过程 | `20260517-1256-draft` |
| `{report-slug}` | 项目内某一份报告 | `github-star-overview` |

同一个 `{project-slug}` 下可以有多个 `run-id` 和多个 `report-slug`。不要用时间戳代替项目名，否则后续迭代会乱。

## 目录语义

| 目录 | 放什么 | 规则 |
|---|---|---|
| `input/` | 用户给的原始文件、链接清单、手动粘贴语料 | 原则上只追加不改写。 |
| `scratch/{run-id}/fetches/` | 爬取、下载、转存得到的 HTML、PDF、JSON、CSV | 只服务本次运行，可重建。 |
| `scratch/{run-id}/screenshots/` | 抓取截图、页面证据截图、过程截图 | 文件名带来源或页面名。 |
| `scratch/{run-id}/extracts/` | 从原始材料抽出的表格、正文片段、候选指标 | 不等于最终报告内容。 |
| `content/` | 已整理、可进入报告生成的结构化内容 | `content.json` 是报告生成主输入。 |
| `dist/{report-slug}/` | 最终 HTML/CSS/JS 报告源码包 | 默认交付这里。 |
| `qa/{report-slug}/` | 验证截图、控制台记录、多端检查记录 | 每次交付前更新。 |
| `README.md` | 报告入口、任务材料、来源台账、验证命令和未解决风险 | 项目级手册，不写成营销页。 |

## 空目录规则

- 不要预创建空目录、空文件或 `.keep` 文件。
- `content/`、`dist/{report-slug}/` 和 `qa/{report-slug}/` 也必须有实际文件后才算有效产物。
- 如果某次报告没有原始输入落盘，不创建 `input/`；没有临时抓取，不创建 `scratch/`；没有额外模块片段，不创建 `modules/`。
- README 只能列出实际存在且有内容的目录；不要把未来可能用到但当前为空的目录写成当前交付物。

## 流程主干

```text
用户语料 / URL / 文件
-> input/
-> scratch/{run-id}/ 临时抓取和拆解
-> content/ 固化报告内容合同
-> dist/{report-slug}/ 生成源码包
-> qa/{report-slug}/ 多端验证记录
```

## 输入输出边界

- `input/` 是原始证据，不要在里面写最终报告。
- `scratch/` 是过程物，可以重跑覆盖，但不要当交付物。
- `content/` 是生成报告的事实入口。换风格、换模块时优先复用这里。
- `dist/` 是交付源码包。不要把生成报告写入 `showroom/`、`engines/`、`viz-modules/`。
- `qa/` 是验收记录。没有多端检查记录时，不要声称已完成多端适配。
- `README.md` 是后续维护入口。报告有多个 dist 版本时，README 必须指出当前主入口。

## 多端适配合同

这套架构支持多端，但多端不是自动成立，必须由引擎、模块和最终报告共同保证。

| 层 | 职责 |
|---|---|
| `engine` | 定义全局响应式布局、断点、容器宽度、移动端单列策略。 |
| `theme` | 只提供视觉 token，不写破坏布局的固定宽度。 |
| `viz-module` | 声明桌面 / pad / 手机端的降级方式。 |
| `report` | 按实际内容验证三端，不让长标题、宽表、图表标签撑破布局。 |

默认验收尺寸：

```text
desktop: 1440 x 900
tablet: 820 x 1180
mobile: 390 x 844
```

硬规则：

- 页面整体不能出现横向滚动；宽表、时间轴、矩阵这类模块可以在模块内部横向滚动。
- 图表容器必须自适应宽度，不写死 `canvas` 的实际像素宽高。
- KPI、索引、卡片、图表组在 pad 和 mobile 端必须能减少列数。
- 手机端默认单列，除非模块 README 明确说明另一种合理降级。
- 模块 README 必须有“响应式规则”，说明 desktop / tablet / mobile 怎么呈现。
- `qa/{report-slug}/` 至少记录三端截图或三端检查结果。
