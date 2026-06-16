---
create_time: 2026-05-17 11:18 CST
update_time: 2026-05-17 12:56 CST
---

# 报告契约

这个 skill 接收已准备好的材料。如果输入仍是原始调研，只做轻量大纲整理；深度抽取属于另一个“语料拆解”skill。最终进入报告生成的结构化材料放在项目工作区的 `content/`。

## 最小输入

```json
{
  "title": "报告标题",
  "subtitle": "一句话定调",
  "byline": {
    "researcher": "调研者",
    "method": "数据方法",
    "data_cutoff": "YYYY-MM-DD",
    "sample": "N 个样本"
  },
  "kpis": [
    {"value": "160k", "label": "最高 star 数", "note": "OpenCode 领先"}
  ],
  "sections": [
    {
      "id": "rank",
      "question": "谁领先？",
      "module": "horizontal-rank-bar",
      "title": "GitHub Star 排名",
      "description": "说明这个图回答什么问题。",
      "data": []
    }
  ],
  "methodology": {
    "sources": [],
    "limitations": []
  }
}
```

## 章节选择

按内容问题选择可视化模块：

| 内容问题 | 模块方向 |
|---|---|
| 排名 | `horizontal-rank-bar`, `podium-ranking`, `lollipop-comparison` |
| 分布 | `histogram-distribution`, `box-distribution`, `swarm-distribution` |
| 占比 / 构成 | `waffle-proportion`, `triple-doughnut-composition`, `stacked-100-bar` |
| 矩阵 / 表格 | `matrix-table`, `feature-heatmap` |
| 时间线 / 趋势 | `line-time-series`, `annotated-timeline`, `gantt-timeline`, `step-chart` |
| 流动 / 转化 | `sankey-flow`, `rank-ribbon`, `conversion-funnel` |
| 关系 / 血缘 | `network-map`, `chord-relationship`, `genealogy-tree` |
| 编辑解释 / 文字论点 | `insight-card-grid`, `spotlight-two-column`, `editorial-quote`, `multi-column-copy` |

## 必须收尾

每份报告都需要一个方法论 / 局限章节。如果输入没有提供局限，补一段简短诚实的限制说明。

`content/sources.json` 记录来源清单和证据路径；`content/content.json` 只放报告实际使用的结构化内容，不把爬取原文塞进去。
