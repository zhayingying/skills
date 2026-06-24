# 平台来源判断链

作者: ziye

生态调研涉及开源项目、论文、社区、课程、产品或前端 UI 参考时读取本文件。

## 核心模式

先定义真正的决策问题，不要从清单开始。

```text
差: 有哪些项目？
好: 哪些生态层正在活跃，什么证据能证明，读者应该如何理解这些差异？
```

不要停在 inventory。生态报告必须在完整来源清单之前或同时，提供稳定维度下的横向比较。

三项默认强化：

- **Evidence Ledger**: 平台来源必须映射到 claim；不要只存 URL。
- **Reflect Loop**: 每个平台采集后检查该平台能证明什么、不能证明什么；不能证明的部分生成 delta query 或降级为 caveat。
- **Comparison First**: 先交付 layer/capability/scenario/tradeoff/evidence matrix，再交付完整清单。

每个平台都记录：

| 字段 | 含义 |
| --- | --- |
| Platform | GitHub、arXiv、HN、Reddit、X、课程站、产品官网 |
| Why this platform matters | 这个平台能证明什么，不能证明什么 |
| Selection rule | 来源纳入和排除规则 |
| Evidence fields | 必填元数据 |
| Output role | 表格、时间线、monitor list、产品模式、风险信号 |

平台采集后补一行判断：

```text
This source supports / contradicts / contextualizes / only suggests which claim?
```

视觉输出规则：

- 开源生态：先给 layer map / capability heatmap / scenario selector，再给仓库表。
- 运行框架：用 system board 表达 gate、拓扑、控制面、反馈回路和生命周期；不要只列组件。
- 论文：先用 decision board 说明工程读法，再用 evidence lanes 连接论文、结论和工程动作，最后用 source ribbon 放来源速览；不要做标题卡片墙。
- 课程：用 learning path 或 prerequisite ladder 表达先后关系；不要只列课程名。
- 社区：先用 signal funnel 区分事实源、实践信号和监控线索，再用 topic cluster 表达重复痛点；账号、帖子、subreddit 只能放在 community ledger 明细里。
- 用户要求“图”时，以上主视觉优先落成 SVG/diagram；卡片网格只能作为明细，不算主视觉。

## 平台判断链

### GitHub

用于判断开源活跃度、技术栈、license、维护状态、生态成熟度和实现模式。

必填字段：

- `repo`
- `url`
- `stars`
- `forks`，如果相关
- `primary_language`
- `license`
- `pushed_at`
- `description`
- `topics`
- `ecosystem_layer`
- `sdk_or_protocol_dependency`
- `why_it_matters`

判断规则：

- stars 是受欢迎程度信号，不是生产成熟度证明。
- 项目是否 active 要看报告时间窗口内的 push、release、issue 等证据。
- 区分 protocol、SDK/runtime、orchestration framework、app/product、UI/frontend、domain demo。
- 闭源产品标为 product benchmark，不放进 GitHub 开源排名。
- 不要把闭源产品发布时间和开源 stars 直接放在同一个排名里比较。

### 论文

用于判断机制、benchmark、失败分类和研究方向。

必填字段：

- `title`
- `url`
- `venue_or_preprint`
- `organization_or_university`
- `date`
- `claim_supported`
- `method`
- `limitations`
- `ecosystem_relevance`

判断规则：

- 优先 arXiv、OpenReview、会议页面、官方研究博客、高校页面。
- 区分实证 benchmark 结果和框架式猜想。
- 抽取机制和失败模式，不把论文当装饰性权威。
- 论文板块必须聚合成 decision board 或 evidence map：至少包含 `decision_question`、`mechanism_proven`、`limitation`、`engineering_implication`，再进入论文明细。
- 用户限制地域或机构类型时，必须显式执行。

### Hacker News

用于判断开发者关注度、采用摩擦、怀疑意见、发布声量和竞争心智模型。

必填字段：

- `story_title`
- `url`
- `points`
- `comments`
- `date`
- `linked_project_or_source`
- `signal`
- `caveat`

判断规则：

- points/comments 衡量关注度，不证明正确性。
- 评论适合提取反对意见和 adoption blockers。
- 匿名评论不能在没有一手确认时当事实证据。
- HN 板块先聚合成 adoption blocker / controversy / launch signal，再列具体帖子。

### Reddit

用于发现实践痛点、重复失败模式、社区集群和生产经验。

必填字段：

- `subreddit`
- `thread_url`
- `date`
- `topic`
- `practical_signal`
- `claim_strength`
- `caveat`

判断规则：

- 优先近期、有具体 workflow、工具名、日志或失败描述的帖子。
- Reddit 是实践信号，不是重大结论的唯一支撑。
- 当单帖证据弱但主题反复出现时，把社区本身作为 monitoring target。
- Reddit 板块必须说明反复出现的 topic cluster；不要只列 subreddit。

### X / Twitter

用于 builder 监控、发布追踪和项目作者发现。

必填字段：

- `account`
- `project_affiliation`
- `why_monitor`
- `source_link`
- `confidence`

判断规则：

- 优先官方项目账号和身份明确的 builder。
- 除非用户明确要求，不按 follower count 排名。
- 如果平台搜索受限，说明这是 monitor list，不是穷尽事实证据。
- X 板块默认放进 monitor list；不要把账号列表包装成事实结论。

### 高校课程

用于判断教育信号、主题成熟度和学习路径。

必填字段：

- `university`
- `course`
- `official_url`
- `topics`
- `level`
- `what_to_learn`
- `maps_to_report_layer`

判断规则：

- 使用高校官方页面或官方课程站。
- 用人话解释课程：学什么、为什么重要、对应生态哪一层。
- 不把第三方课程整理当主证据。
- 课程超过 4 门时，先做 learning path 和 coverage bars，再放课程表；课程表只做明细审计。

### 产品 / 前端参考

用于判断界面模式、产品定位、工作流设计和用户交互模型。

必填字段：

- `product`
- `url`
- `open_or_closed`
- `ui_shape`
- `workflow_pattern`
- `borrowable_pattern`
- `caveat`

判断规则：

- 区分 UI pattern 和 technical architecture。
- 闭源产品引用官方页面和可靠二手来源，但标记为 product benchmark。
- 除非授权和持久性明确，不把第三方截图复制进生成产物。
- 截图权利或链接稳定性不确定时，视觉报告优先用 CSS/diagrammatic thumbnails。

## 生态层级分类

使用稳定层级标签，保证表格可比较。

| Layer | 含义 |
| --- | --- |
| Protocol | 互操作 spec、消息/事件协议、发现/认证 contract |
| SDK / runtime | 执行 agent 或暴露 primitive 的代码包 / runtime |
| Orchestration framework | graph、crew、handoff、planning、memory、workflow control |
| Observability / eval | tracing、dataset、judge、regression、metrics |
| App / product | 面向终端用户或开发者的 agent 产品 |
| Frontend / UI | 用户交互层、canvas、chat、IDE、trace view |
| Domain demo | 窄场景样例；可做案例，不能当核心基础设施 |

## 横向比较要求

生态报告至少在长 inventory table 之前加入两个比较视图。

推荐比较视图：

| 视图 | 适用场景 | 必填输出 |
| --- | --- | --- |
| Layer map | 工具位于不同技术栈层级 | 图或表：protocol -> SDK/runtime -> orchestration -> eval/observability -> product/UI |
| Capability matrix | 读者需要在项目之间选择 | 行是代表项目；列是稳定能力；值使用 `strong / medium / weak` 或等价符号 |
| Scenario selection matrix | 读者有场景而不是指定工具 | 行是场景；列包含 best fit、why、caveat、fallback |
| Tradeoff matrix | 选项可比较但成本不同 | 列包含 benefit、downside、red flag、evidence strength |
| Evidence matrix | 论文或来源支撑不同发现 | 行是来源；列包含 mechanism proven、limitation、engineering implication |
| Learning path | 报告列出课程或文档 | 排序路径：先学什么、下一步学什么、为什么 |
| System board | 报告解释运行框架或组织协作 | gate、topology、control plane、feedback loop、lifecycle |

反平铺质量门：

- 如果一个章节只有 4 个以上同质卡片，它不是最终结构。
- 先判断该章节是层级、能力、场景、证据、时间、流程还是社区信号，再选视觉结构。
- 视觉结构失败时，宁可回到高质量表格，也不要做装饰性图形。

规则：

- 填矩阵前先定义比较维度。
- 所有行使用同一套维度。
- 表格前解释这个比较证明什么。
- 颜色、chip、score、`strong / medium / weak` 都必须有图例。
- inventory table 放在比较视图之后，让读者先理解 landscape shape。
- 无法公平比较的来源，单独标为 benchmark、monitor target 或 excluded。
- 如果某个维度只对部分项目适用，不要硬塞进同一个排名；拆成 product benchmark、protocol comparison 或 monitor list。

## Reflect Loop 要求

平台调研至少检查这些 gap：

| Gap | 处理 |
| --- | --- |
| 只有 stars 没有活跃度 | 补 pushed_at、release、issue 或维护证据；补不了则降级 |
| 只有社区热度没有一手来源 | 改为 adoption signal，不写事实结论 |
| 闭源产品和开源仓库混排 | 闭源产品标为 product benchmark，不进入 GitHub 排名 |
| 论文只被当作权威引用 | 抽取 method、limitation、engineering implication |
| 课程列表只有链接 | 解释学什么、为什么重要、映射到哪个生态层 |
| 前端参考只有项目名 | 写清 ui_shape、workflow_pattern、borrowable_pattern |

## 报告输出块

每个主要类别都写：

```text
What this platform can prove:
What it cannot prove:
Selection rule:
Top findings:
Evidence table:
Caveats:
```

可视化 HTML 报告要加：

- 语义高亮的颜色图例。
- 行颜色或 conclusion chip 有含义时，加表格图例。
- 生态混合 protocols、SDKs、frameworks、products 时，加 layer map。
- 用户需要做选型时，加 capability matrix 或 scenario selection matrix。
- 前端参考使用 CSS 或 diagrammatic UI thumbnails。
- 图表和 JS 生成视图要有静态文本等价物。
- QA notes 记录跑过的命令和没做的渲染检查。

## 常见失败模式

- 只列项目，没有横向比较视图。
- 把闭源产品 benchmark 混进开源排名。
- 把 stars 当成熟度。
- 把 HN、Reddit、X 当事实源。
- 列来源但不解释每个来源证明什么。
- 使用权利或持久性不明确的截图和媒体。
- 课程列表没有解释，读者看不出每门课该学什么。
- 隐藏未解决的覆盖 gap。
