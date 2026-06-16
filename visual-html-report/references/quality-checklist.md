---
create_time: 2026-05-17 11:18 CST
update_time: 2026-05-17 12:56 CST
---

# 质量检查清单

交付前运行。

## 静态检查

- `node tools/verify-report.mjs` 通过。
- `report.config.json` 记录了项目、报告、run、工作区、风格、引擎、模块和三端验收尺寸。
- `index.html` 只引用本地 CSS/JS；如有需要，可以引用已批准的 Chart.js CDN。
- 每个 `<canvas id="...">` 都有对应初始化代码。
- 模块脚本不初始化不存在的 DOM id。

## 视觉检查

- 主题 CSS 正常加载。
- 首屏能建立报告主题、日期/方法和核心判断。
- KPI 行桌面端可读，移动端能合理折叠。
- 表格要么适配宽度，要么明确横向滚动。
- 图表有单位、标签和 ARIA 文本。
- 没有不回答报告问题的装饰性图表。

## 多端检查

默认检查三个尺寸：

```text
desktop: 1440 x 900
tablet: 820 x 1180
mobile: 390 x 844
```

- 页面整体不出现横向滚动；宽表、矩阵、时间轴可以在模块内部横向滚动。
- desktop 可以多列，tablet 必须减少列数，mobile 默认单列。
- 图表容器随父容器缩放，`canvas` 不写死实际像素宽高。
- 长标题、长标签、长表头不能遮挡后续内容。
- `qa/{report-slug}/` 记录三端截图或检查结果。

## 输出包检查

- 默认交付源码包。
- 只有用户要求时才生成单文件包。
- 生成文件放在 `visual-report-workspace/projects/{project-slug}/dist/{report-slug}/`，不要写进 `showroom/`、`engines/` 或 `viz-modules/`。
- 过程文件放在 `scratch/{run-id}/`，最终结构化语料放在 `content/`，验证记录放在 `qa/{report-slug}/`。
