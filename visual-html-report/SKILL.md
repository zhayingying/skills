---
create_time: 2026-05-17 11:18 CST
update_time: 2026-05-17 12:56 CST
name: visual-html-report
description: 从已准备好的调研材料、大纲、指标、表格和结论生成可维护的可视化 HTML 调研报告。适用于市场调研、数据新闻、行业全景、竞品分析、白皮书式报告和长篇可视化报告。流程会选择报告风格、只加载必要的可视化模块、组装 HTML/CSS/JS 源码包、验证结果，并可按需打包为单文件 HTML。不用于 App UI、CRUD 后台、游戏、PPT、单张图片或原始调研抽取。
---

# 可视化 HTML 调研报告

独立调研报告生成 skill。目标很窄：把已有语料 / 大纲 / 数据，按风格和可视化模块，组装成可维护的 HTML 报告源码包。

不要 overthinking。不要做数据平台。不要默认读全量展厅。

## 核心流水线

```text
语料/大纲输入 -> 建立项目工作区 -> 选风格 -> 选可视化模块 -> 组装源码包 -> 三端验证 -> 交付
```

默认产物是源码包，不是巨型内联 HTML。用户要求时再打包单文件。

## 加载规则

1. 先读本文件。
2. 再读 `references/workflow.md`、`references/workspace-contract.md` 和 `references/output-package.md`。
3. 判断风格：
   - 用户指定风格：读取 `references/style-grammar/{slug}.md`。
   - 用户未指定风格：提醒一句默认使用 `editorial-paper`，然后继续生成。
4. 读取 `viz-modules/INDEX.md`。
5. 按内容问题选择模块，只加载命中的 `viz-modules/{engine}/{module}/`。
6. 使用风格语法声明的 `engine`。当前默认引擎是 `token-report`。
7. 使用 `engines/{engine}/starter.html` 作为生产骨架。
8. 除非用户要求查看完整展厅，或模块缺失，否则不要读取 `showroom/report.html`。
9. 正常生成报告时禁止读取 `_maintenance/`。只有用户明确要求维护、改造、扩展这个 skill 时，才读取 `_maintenance/FRAMEWORK.md`。

## 源码地图

```text
visual-html-report/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── references/
│   ├── workflow.md
│   ├── workspace-contract.md
│   ├── output-package.md
│   ├── report-contract.md
│   ├── theme-selection.md
│   ├── theme-contract.md
│   ├── quality-checklist.md
│   └── style-grammar/
├── engines/
│   └── token-report/
├── showroom/
│   ├── index.html
│   └── report.html
├── viz-modules/
│   ├── INDEX.md
│   └── token-report/
└── tools/
```

## 引擎规则

未来某个风格可以使用完全不同的 HTML/CSS/JS 引擎。风格语法文件必须声明引擎：

```yaml
engine: token-report
theme_css: engines/token-report/styles/themes/editorial-paper.css
```

如果未来某个风格需要新结构，就新增 `engines/{new-engine}/` 和 `viz-modules/{new-engine}/`。不要强行把所有风格塞进 `token-report`。

## 输出规则

默认在项目工作区里创建：

```text
visual-report-workspace/projects/{project-slug}/dist/{report-slug}/
├── index.html
├── report.config.json
├── content.json
├── styles/
├── scripts/
└── modules/
```

可选创建：

```text
dist/{report-slug}/report.bundled.html
```

## 风格规则

- 风格不只是 CSS。必须加载选中的 `style-grammar`，让报告在信息密度、字体语气、图表气质和反模式边界上不跑偏。
- 用户生成后要求换风格时，优先只替换 `styles/theme.css`。只有新风格明显破坏密度、可读性或层级时，才调整布局。

## 可视化规则

- `showroom/report.html` 是完整展厅，不是生产源。
- 每个 `viz-modules/{engine}/{module}/` 目录包含模块说明、section HTML 和可选 JS 片段。
- 需要直方图才加载直方图，需要华夫格才加载华夫格。不要一次性加载 60 个模块。

## 硬禁令

- 用户没指定风格时不要停下来追问；默认用 `editorial-paper`。
- 不要做重型 App、CMS 或数据平台。
- 不要默认把所有代码内联进一个 HTML。
- 不要把完整展厅复制进每份报告。
- 不要读取全部风格语法或全部可视化模块。
- 正常使用 skill 生成报告时不要读取 `_maintenance/`。
- 除非现有脚本无法完成报告，不要新增构建系统。
- 不要使用装饰性图表；每个可视化模块必须回答一个报告问题。

## 验证

最终交付前运行：

```bash
node tools/verify-report.mjs
```

对生成的报告包，打开 `dist/{report-slug}/index.html` 检查：

- 控制台无错误。
- 选中的主题已加载。
- 所有模块脚本只初始化真实存在的 DOM id。
- desktop / tablet / mobile 三端不横向爆掉，故意横向滚动的宽表除外。
- `report.config.json` 准确记录风格、引擎、模块和打包状态。
