---
create_time: 2026-05-17 11:18 CST
update_time: 2026-05-17 12:09 CST
---

# Token Report 可视化模块

这些模块是 `token-report` 引擎的按需可视化积木。只加载报告内容真正需要的模块。`showroom/report.html` 仍然是完整视觉展厅，不应默认加载。

| § | 模块 | 适用场景 | 脚本 |
|---|---|---|---|
| 01 | [horizontal-rank-bar](horizontal-rank-bar/README.md) | 单指标直接排名 | 是 |
| 02 | [bubble-scatter](bubble-scatter/README.md) | Stars × Forks 散点 | 是 |
| 03 | [genealogy-tree](genealogy-tree/README.md) | 生态系谱： 谁 fork 自谁 | 否 |
| 04 | [triple-doughnut-composition](triple-doughnut-composition/README.md) | 按语言、许可证、维护方 切片 | 是 |
| 05 | [quadrant-scatter](quadrant-scatter/README.md) | 流行度 × 成熟度 | 是 |
| 06 | [matrix-table](matrix-table/README.md) | 完整字段对照 | 否 |
| 07 | [feature-heatmap](feature-heatmap/README.md) | 关键特性热图 | 否 |
| 08 | [insight-card-grid](insight-card-grid/README.md) | 五个值得记住的 规律 | 否 |
| 09 | [spotlight-two-column](spotlight-two-column/README.md) | Pi Agent · 你点名问到的"小而美" | 否 |
| 10 | [methodology-limits](methodology-limits/README.md) | 怎么搞的 | 否 |
| -- | [editorial-deepcut](editorial-deepcut/README.md) | 编辑型巨数断点 | 否 |
| 11 | [radar-profile](radar-profile/README.md) | 雷达图： 六维能力 对比 | 是 |
| 12 | [line-time-series](line-time-series/README.md) | Star 历史 曲线 | 是 |
| 13 | [calendar-heatmap](calendar-heatmap/README.md) | GitHub 风格 贡献日历 | 是 |
| 14 | [gantt-timeline](gantt-timeline/README.md) | 横向甘特： 发布时间轴 | 否 |
| 15 | [sankey-flow](sankey-flow/README.md) | 桑基图： 用户迁移流向 | 否 |
| 16 | [network-map](network-map/README.md) | 网络图： 共享特性 关系 | 否 |
| 17 | [sunburst-hierarchy](sunburst-hierarchy/README.md) | 旭日图： 生态层级 | 是 |
| 18 | [pictogram-grid](pictogram-grid/README.md) | 象形图阵列： 18 个个体 | 否 |
| 19 | [slope-rank-change](slope-rank-change/README.md) | 斜率图： 六个月排名变化 | 否 |
| 20 | [sparkline-table](sparkline-table/README.md) | Sparkline 数据 表格 | 是 |
| 21 | [bullet-chart](bullet-chart/README.md) | 子弹图： SWE-bench Verified | 否 |
| 22 | [editorial-quote](editorial-quote/README.md) | 大字引言（ Pullquote ） | 否 |
| 23 | [dumbbell-range](dumbbell-range/README.md) | 哑铃图： fork 比例对照 | 否 |
| 24 | [mosaic-marimekko](mosaic-marimekko/README.md) | Marimekko： 语言 × 维护方 | 否 |
| 25 | [tag-cloud](tag-cloud/README.md) | 标签云： 核心特性 词频 | 否 |
| 26 | [waffle-proportion](waffle-proportion/README.md) | 华夫格： 每 100 个用户 用哪类工具 | 是 |
| 27 | [annotated-timeline](annotated-timeline/README.md) | 注解时间轴： 关键事件 | 否 |
| 28 | [polar-area](polar-area/README.md) | 极坐标柱状图（ Polar Bars ） | 是 |
| 29 | [box-distribution](box-distribution/README.md) | 箱线图： 各语言阵营的 star 分布 | 否 |
| 30 | [tiered-maturity](tiered-maturity/README.md) | 阶梯进度： 四个成熟度档 | 否 |
| 31 | [kpi-tile-grid](kpi-tile-grid/README.md) | KPI 数据卡 组合 | 否 |
| 32 | [section-index-strip](section-index-strip/README.md) | 索引条： 整页快速跳转 | 否 |
| 33 | [stacked-100-bar](stacked-100-bar/README.md) | 100% 堆叠条： 每种语言内的维护方 | 否 |
| 34 | [stream-graph](stream-graph/README.md) | 流图： 市场份额随时间变化 | 是 |
| 35 | [lollipop-comparison](lollipop-comparison/README.md) | 棒棒糖图（ Lollipop ） | 否 |
| 36 | [swarm-distribution](swarm-distribution/README.md) | 蜂群图： 每个点都看得见 | 否 |
| 37 | [treemap-hierarchy](treemap-hierarchy/README.md) | 矩形树图（ Treemap ） | 否 |
| 38 | [conversion-funnel](conversion-funnel/README.md) | 漏斗图： 从感兴趣到真活跃 | 否 |
| 39 | [waterfall-breakdown](waterfall-breakdown/README.md) | 瀑布图： OpenCode 一年涨了多少 | 否 |
| 40 | [diverging-bar](diverging-bar/README.md) | 对称差异图： "喜欢" vs "吐槽" | 否 |
| 41 | [chord-relationship](chord-relationship/README.md) | 和弦图： 工具之间的"血亲度" | 否 |
| 42 | [pareto-cumulative](pareto-cumulative/README.md) | Pareto 图： 条 + 累计线 | 是 |
| 43 | [small-multiples](small-multiples/README.md) | 小图阵列（ Small Multiples ） | 是 |
| 44 | [step-chart](step-chart/README.md) | 阶梯图： Claude Code 版本里程碑 | 否 |
| 45 | [mega-number](mega-number/README.md) | "巨数"展示（ Mega Numeral ） | 否 |
| 46 | [dropcap-article](dropcap-article/README.md) | 报刊式开场段（ Newspaper Lede ） | 否 |
| 47 | [multi-column-copy](multi-column-copy/README.md) | 三栏报刊（ Three Column Newspaper ） | 否 |
| 48 | [ornamental-divider](ornamental-divider/README.md) | 章节分隔符（ Section Ornament ） | 否 |
| 49 | [quote-grid](quote-grid/README.md) | 引语阵列（ Quote Grid ） | 否 |
| 50 | [histogram-distribution](histogram-distribution/README.md) | 直方图（ Histogram ） | 是 |
| 51 | [radial-gauge](radial-gauge/README.md) | 仪表盘（ Gauge / Radial Progress ） | 否 |
| 52 | [center-kpi-doughnut](center-kpi-doughnut/README.md) | 环形图 + 中心数字（ Donut with Centered KPI ） | 否 |
| 53 | [podium-ranking](podium-ranking/README.md) | 排名颁奖台（ Leaderboard Podium ） | 否 |
| 54 | [parallel-coordinates](parallel-coordinates/README.md) | 平行坐标图（ Parallel Coordinates ） | 否 |
| 55 | [connected-scatter](connected-scatter/README.md) | 带箭头的连线散点（ Connected Scatter ） | 否 |
| 56 | [honeycomb-grid](honeycomb-grid/README.md) | 蜂巢图（ Hex Grid ） | 否 |
| 57 | [inverted-pyramid](inverted-pyramid/README.md) | 倒金字塔层级（ Inverted Pyramid ） | 否 |
| 58 | [cumulative-area](cumulative-area/README.md) | 累积面积图（ Cumulative Area ） | 是 |
| 59 | [rank-ribbon](rank-ribbon/README.md) | 排名彩带（ Ribbon Rank Flow ） | 否 |
| 60 | [full-toc](full-toc/README.md) | 全量可视化目录（ Full TOC Grid ） | 否 |
