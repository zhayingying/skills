# Structured Research 检查表

作者: ziye

宽泛调研、任务书式调研或 HTML 报告时读取本文件。

## 调研章程

没有任务书时，先生成任务书草案，再采集和写报告。任务书草案至少包含：

| 块 | 必填内容 |
| --- | --- |
| 调研目标 | 一句话主问题、报告服务的判断或认知框架 |
| 交付要求 | 格式、密度、结构、证据、口吻、验证 |
| 问题树 | Part / Q 编号，区分事实、机制、比较、社区、课程、产品等问题 |
| 覆盖地图 | 每个问题对应章节、输出形态、证据类型和状态 |
| 来源计划 | 平台、优先级、用途、不能证明什么 |
| 证据口径 | A/B/C 或 strong/medium/weak 的定义 |
| 可视化计划 | 主图、横向对比表、来源台账分别放在哪里 |
| 验证标准 | HTML、JSON、链接、排版、反平铺 selector、移动端溢出 |

| 字段 | 调研前填写 |
| --- | --- |
| Main question | 报告必须回答的一句话主问题 |
| Audience | 读者知识水平、角色、为什么需要这份报告 |
| Scope | 地域、语言、时间范围、包含主题 |
| Exclusions | 避免讨论的主题、案例、来源类型或建议风格 |
| Output | Markdown、HTML、表格、PPT 或混合包 |
| Freshness | 哪些事实需要当前网页或官方来源确认 |
| Verification | 需要运行的命令、渲染检查、链接检查或人工 QA |

## 覆盖地图

| question_id | research_question | section | required_output | evidence_needed | status | note |
| --- | --- | --- | --- | --- | --- | --- |
| Q1.1 |  |  | table / timeline / mechanism / case / calculation | primary / secondary / current / historical | pending |  |

状态值：`pending`、`researched`、`drafted`、`answered`、`partial`、`blocked`。

## 三项强化检查

| 强化项 | 必须产出 | 不合格表现 |
| --- | --- | --- |
| Evidence Ledger | claim 到 source 的映射，包含 grade、采集日期、支撑问题、冲突备注 | 只有来源列表，没有说明来源支撑哪个结论 |
| Reflect Loop | 缺口审计、delta query、补采集结果或未补齐原因 | 搜完直接写，没有说明哪些缺口被发现和处理 |
| Comparison First | 在 inventory 前放 layer map、capability matrix、scenario selection、tradeoff matrix 或 evidence matrix | 只列项目、课程、论文或产品，让读者自己比较 |

## 来源层级

优先使用能支撑该 claim 的最强来源。

| 等级 | 来源类型 | 用途 |
| --- | --- | --- |
| Strong | 监管机构、法院、法规、备案/披露、官方标准、公司正式披露、官方数据集 | 事实、规则、日期、数字、确定性 claim |
| Medium | 严肃媒体、分析报告、高校来源、可信行业数据库 | 市场背景、解释、交叉验证 |
| Weak | 博客、论坛、社交帖、无来源 slide、营销文案 | 只用于发现线索；不能单独支撑重大结论 |
| Excluded | 失效链接、无来源 AI 摘要、不可验证转载 | 不引用 |

## 证据台账

| claim_id | claim | source_id | source_title | url | source_type | grade | source_date | collected_on | supports_question | claim_role | contradiction_note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

规则：

- 每个外部数字都需要 `claim_id`。
- 每个重大发现至少引用一个 strong 或 medium `claim_id`。
- 来源日期和采集日期分开记录。
- `claim_role` 使用 `supports`、`contradicts`、`context`、`lead_only`。
- HN、Reddit、X 默认是 `context` 或 `lead_only`，除非另有一手来源交叉验证。

## Reflect Loop 记录

| loop_id | trigger | gap_type | delta_query | action_taken | result | remaining_risk |
| --- | --- | --- | --- | --- | --- | --- |
| R1 |  | missing_primary_source / conflicting_claims / stale_fact / weak_support / unfair_comparison |  | searched / excluded / downgraded / rewritten | answered / partial / unresolved |  |

规则：

- 每次大型调研至少做一轮 Reflect Loop。
- 如果用户要求“深度调研”“穷尽”“高价值来源”，至少记录 2 轮：初始采集后、初稿后。
- critical gap 不补齐时，报告限制里必须显式写出。

## 章节块

每个重要概念或机制包含：

| 块 | 必填内容 |
| --- | --- |
| Essence | 一句话说清机制核心逻辑 |
| Mechanism | 它如何工作、参与方、输入、输出、时间线、失败模式 |
| Local context | 地域、法律、市场、文化、平台或领域 caveat |
| Case | 一个有来源的案例，证明或澄清机制 |
| Benefit | 什么时候帮助目标 stakeholder |
| Downside | 什么时候伤害目标 stakeholder |
| Red flag | 可观察的预警信号 |
| Source notes | 本块使用的 claim IDs |

## 表格优先输出规则

- 用比较表呈现类别、工具、路径、案例和取舍。
- 用时间线呈现历史、流程、生命周期或市场演变。
- 用流程图呈现多参与方序列。
- 数字影响结论时，给 worked calculation。
- 每个密集表格前放一段短解释，说明这个表证明什么。
- 生态/工具报告必须在 inventory list 前加入 capability matrix 或 scenario selection matrix。
- 横向比较必须使用稳定维度；不能每一行换一套 rubric。
- 如果报告已经有完整 inventory，但没有横向比较，必须先补比较再交付。

## 可视化反平铺检查

每个主章节交付前做一次扫描：如果该章节由 4 个以上同质卡片、链接或段落组成，先判断能否改成关系图。清单可以保留，但不能是主表达。

| 章节类型 | 推荐视觉结构 | 必须回答的问题 |
| --- | --- | --- |
| 运行框架 / 系统架构 | system board、topology map、control plane、feedback loop | 谁调度谁，状态在哪里，验证在哪里，如何进化 |
| 生命周期 / 流程 | rail、timeline、state machine、swimlane | 顺序是什么，哪里分叉，哪里回流，停止条件是什么 |
| 论文 / 来源 | decision board、evidence lanes、source ribbon、claim-source matrix | 这篇来源证明什么，限制是什么，对工程判断有什么用 |
| 开源生态 / 产品 | layer map、capability heatmap、scenario selector | 它位于哪一层，强项是什么，什么场景不适合 |
| 课程 / 学习路径 | prerequisite ladder、learning path、topic coverage map | 先学什么，为什么重要，对应报告哪一层 |
| 社区 / 舆情 | signal funnel、topic cluster、monitor list | 哪些只是线索，哪些是重复痛点，哪些需要一手验证 |

质量门：

- 视觉结构必须放在明细表之前。
- 颜色、强弱、chip、bar、轴线含义必须有图例或直接标签。
- 不能用装饰图替代分析；每个视觉模块都要支撑一个研究问题。
- 用户明确要“图”时，主表达必须是 SVG/diagram 或等价关系图；卡片网格、信息块和普通表格不算图。
- 用户指出“平铺”后，优先重写 HTML 结构和数据组织，再改 CSS。
- 用户指出“排版不合理”后，必须用 Playwright 或等价浏览器截图验证；不能只靠静态阅读 CSS。
- 每轮报告视觉迭代必须同步更新 skill 主文件或 references，沉淀成下一次可复用规则。
- 中文报告中的英文图必须中文可读：轴名、节点名、图例、缩写和动作标签用中文主标签，英文只作为论文名、项目名、协议名或辅助对照；`title`、`desc`、`figcaption` 同步中文化。
- 主图不能替代来源审计：如果把论文、社区、案例或项目清单改成 SVG/diagram，图后必须保留横向对比或证据台账，包含可点击来源、证据级别、分析结论、工程含义和局限说明。
- 两栏视觉板必须检查侧栏是否被 grid stretch 拉出大空白；必要时使用 `align-items: start` 或 `align-self: start`。
- 如果两栏高度明显不同，不要给整个 grid 外层画大边框；让各个语义块自己成卡片，避免出现被框住的空白区域。
- 用户同时点名多个导航板块时，把它们当作 section suite：统一主视觉层级、色彩语义、明细下沉策略和响应式断点。
- section suite 验证必须加入旧 class 反向检查，例如旧的 grid/card/guide/rail 结构不能继续留在 HTML 主表达里。

## 报告骨架

1. 调研任务书或任务书摘要。
2. 执行摘要。
3. 研究问题和读者。
4. 范围和排除项。
5. 问题到章节的映射。
6. 证据标准和来源计划。
7. Evidence Ledger 摘要。
8. Reflect Loop 记录或缺口审计摘要。
9. 核心 landscape 或 process map。
10. 横向比较表。
11. 按问题顺序展开主章节。
12. 必要时加入 stakeholder risk blocks。
13. 阅读优先级或决策导航层。
14. 术语表。
15. 限制和未解决 gap。
16. 来源附录。
17. 验证记录。

## HTML QA

交付前检查：

- 导航锚点可用。
- 表格在移动端不会出现不受控横向溢出。
- 长标签换行正常，不重叠。
- 证据标签和引用在静态 HTML 中可见。
- 图表或图示有文本替代，或附近有等价表格。
- 外链、本地资源路径可解析。
- JavaScript 失败时，主报告仍可读。
- 颜色、chip、icon、bar 等视觉编码都有图例解释。
- 英文图、SVG 图和 diagram 在图内就能被中文读者读懂；不要只在正文补翻译。
- 论文和社区章节不能只剩图：论文至少保留可点击论文源和证据分析；社区至少保留 HN/Reddit/X 的可点击入口、信号强度、能分析什么和不能证明什么。
- 删除重复视觉区块；同一概念只出现一次，除非第二个视图增加新的分析层。
- UI/产品参考要说明界面长什么样，而不是只说项目做什么。
- 生态报告不能只是 source inventory；至少包含一个 layer map 和一个 cross-comparison matrix。
- 运行框架、论文、课程、社区等章节不能只有卡片墙；至少一个主视觉必须表达关系、顺序、强弱或证据作用。
- 社区板块必须先展示 signal funnel 或 topic cluster；X/HN/Reddit 链接明细只能作为 community ledger。
- 证据台账摘要、反思循环和横向比较入口要静态可见，不能只藏在 JSON 或 JS 状态里。
- 论文板块如果超过 5 篇来源，优先使用 decision board + evidence lanes + source ribbon；不要把所有论文放进同一张卡片网格。

## 最终回复契约

说明：

- 产物路径或已安装 skill 路径。
- 创建或修改了什么。
- 跑了哪些验证。
- 未解决的来源、渲染或覆盖风险。

不要以“要不要我继续”结尾。
