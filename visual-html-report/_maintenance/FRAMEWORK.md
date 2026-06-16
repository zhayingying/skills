---
create_time: 2026-05-17 12:17 CST
update_time: 2026-05-17 12:56 CST
---

# Visual HTML Report 维护框架

> 只在维护 / 改造 / 扩展 `visual-html-report` skill 时读取。正常生成报告时禁止读取本文件。

## 一句话架构

`visual-html-report` 是一个“报告生成生产线”：用轻量入口协议调度风格语法、渲染引擎和按需可视化模块，最终输出可维护的 HTML/CSS/JS 报告源码包。

## 一句话流程

```text
语料 / 大纲
-> 建立项目工作区 workspace
-> 选择风格 style-grammar
-> 风格声明 engine
-> engine 提供 HTML/CSS/JS 骨架
-> 按内容问题选择 viz-modules
-> 组装项目 dist/{report-slug}/ 源码包
-> 验证
-> 交付源码包
-> 可选打包单文件 HTML
```

扩展时只看这条主干：新风格先落到 `style-grammar`；如果只是换皮，复用现有 `engine`；如果结构不同，再新增 `engine`；如果只是新图表，新增对应 `viz-modules/{engine}/{module}`。

```text
SKILL.md              # 正常使用入口
agents/openai.yaml    # Codex 展示 / 触发适配元信息
references/           # 执行协议和选择规则
references/workspace-contract.md
                      # 项目输入 / 过程物 / 输出 / 验证目录标准
references/style-grammar/
                      # 风格语法，给 AI 复刻风格
engines/              # HTML/CSS/JS 渲染引擎
showroom/             # 风格展厅和全量示例
viz-modules/          # 按需加载的可视化积木
tools/                # 校验和打包脚本
_maintenance/         # 维护说明，正常使用禁止读取
```

## 核心边界

- `SKILL.md` 保持短，只写执行入口、加载顺序、硬禁令。
- `agents/openai.yaml` 只写 Codex 需要的展示和默认触发语，不承载流程规则。
- `references/` 写“怎么执行”，不放大段视觉样例。
- `references/workspace-contract.md` 固定项目工作区和多端验收，不放具体报告内容。
- `style-grammar/` 写“怎么保持风格成立”，不是模板代码。
- `engines/{engine}/` 写具体 HTML/CSS/JS 结构。
- `showroom/` 是展厅，不是生产入口。
- `viz-modules/{engine}/` 是生产时按需读取的模块库。
- `_maintenance/` 只给维护者看，不进入正常报告生成上下文。

## 正常使用加载链

```text
SKILL.md
-> references/workflow.md
-> references/workspace-contract.md
-> references/output-package.md
-> references/theme-selection.md
-> references/style-grammar/{slug}.md
-> viz-modules/INDEX.md
-> viz-modules/{engine}/INDEX.md
-> 命中的模块 README / section.html / script.js
-> engines/{engine}/starter.html
```

禁止正常使用时读取：

```text
_maintenance/**
showroom/report.html       # 除非用户要求看完整展厅，或模块缺失
全部 style-grammar
全部 viz-modules
```

## 维护入口

改这个 skill 时先读：

```text
_maintenance/FRAMEWORK.md
SKILL.md
references/workspace-contract.md
references/theme-contract.md
references/workflow.md
references/output-package.md
```

然后根据任务选择性读取：

| 维护任务 | 需要读取 |
|---|---|
| 加新主题 | `references/theme-contract.md`, `references/style-grammar/INDEX.md`, `showroom/scripts/theme-manifest.js`, `engines/{engine}/styles/themes/` |
| 改主题 token | 对应 `engines/{engine}/styles/themes/{slug}.css`, 对应 `references/style-grammar/{slug}.md` |
| 加新可视化模块 | `viz-modules/{engine}/INDEX.md`, 参考相近模块 |
| 拆 showroom 模块 | `showroom/report.html`, `showroom/scripts/full-exemplar.js`, 目标 `viz-modules/{engine}/` |
| 改输出包结构 | `references/output-package.md`, `tools/build-single-file.mjs`, `tools/verify-report.mjs` |
| 改项目工作区结构 | `references/workspace-contract.md`, `references/workflow.md`, `references/output-package.md`, `references/quality-checklist.md` |
| 加新引擎 | 新建 `engines/{new-engine}/`, `viz-modules/{new-engine}/`, 更新对应 `style-grammar` |

## 加新主题

1. 在对应引擎下新增主题 CSS：

```text
engines/token-report/styles/themes/{slug}.css
```

2. 在 `showroom/scripts/theme-manifest.js` 增加同名 slug。
3. 在 `references/style-grammar/{slug}.md` 增加风格语法，必须声明：

```yaml
slug: {slug}
engine: token-report
theme_css: engines/token-report/styles/themes/{slug}.css
```

4. 更新 `references/style-grammar/INDEX.md`。
5. 跑：

```bash
node tools/verify-report.mjs
```

## 加新可视化模块

模块目录固定为：

```text
viz-modules/{engine}/{module-slug}/
├── README.md
├── section.html
└── script.js       # 只有需要 JS 时才放
```

模块 README 必须说明：

- 什么时候用。
- 属于哪个引擎。
- 来源或参考。
- 是否需要 Canvas / DOM id / script。
- 交付前必须替换示例数据、文案、标签、单位和 ARIA 文本。

新增后更新：

```text
viz-modules/{engine}/INDEX.md
```

再跑：

```bash
node tools/verify-report.mjs
```

## 加新引擎

当一个新风格不能只靠 token CSS 表达，或者需要完全不同的 HTML/JS/CSS 结构时，加新引擎。

最小结构：

```text
engines/{engine}/
├── starter.html
├── styles/
│   ├── report.css
│   ├── theme-fonts.css
│   └── themes/
└── scripts/
    └── theme-runtime.js

viz-modules/{engine}/
└── INDEX.md
```

然后在使用该引擎的风格语法里声明：

```yaml
engine: {engine}
```

不要把新引擎的选择器、模块或 token 强塞进 `token-report`。

## 展厅维护

`showroom/index.html` 和 `showroom/report.html` 只负责展示能力：

- `showroom/index.html`：主题选择器。
- `showroom/report.html`：完整视觉展厅。
- `showroom/scripts/full-exemplar.js`：完整展厅示例 JS。

展厅可以很大，但正常生成报告时不读它。拆出可复用模块后，应把生产规则沉淀到 `viz-modules/`，而不是让 AI 每次去搜展厅。

## 输出包约定

默认输出：

```text
dist/{report-slug}/
├── index.html
├── report.config.json
├── content.json
├── styles/
├── scripts/
└── modules/
```

单文件只在用户要求时生成：

```text
dist/{report-slug}/report.bundled.html
```

不要默认内联所有 CSS/JS。

## 验证清单

每次维护后至少跑：

```bash
node tools/verify-report.mjs
```

如果改了 Mermaid 流程文档，跑：

```bash
bash /Users/ziye/project/persona/multi-agents/lyra/.agents/skills/viz/scripts/mermaid-lint.sh references/workflow.md
bash /Users/ziye/project/persona/multi-agents/lyra/.agents/skills/viz/scripts/mermaid-lint.sh references/output-package.md
bash /Users/ziye/project/persona/multi-agents/lyra/.agents/skills/viz/scripts/mermaid-lint.sh references/theme-selection.md
```

如果改了展厅路径或主题切换，启动本地静态服务检查：

```bash
python3 -m http.server 8765
```

然后打开：

```text
http://127.0.0.1:8765/showroom/index.html
```

## 反模式

- 把 `_maintenance/` 写进正常加载链。
- 让 `SKILL.md` 变成长篇教程。
- 每次生成报告都读取完整 `showroom/report.html`。
- 把所有可视化模块一次性加载进上下文。
- 为了“架构完整”引入复杂构建系统。
- 只加主题 CSS，不补对应 `style-grammar`。
- 加新引擎却污染已有 `token-report`。
