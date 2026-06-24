---
name: structured-research
description: 把宽泛调研任务、任务书、问题清单或模糊研究请求转成有来源、有证据分级、表格优先、机制解释充分、可审计覆盖、避免平铺清单的问题型调研报告。适用于通用调研 skill 制作、任务书式调研、HTML/Markdown 报告、问题覆盖审计、生态横向比较、证据台账、案例、图表和验证清单。
---

# Structured Research

作者: ziye

## 目标

把调研请求转成完整交付物：调研范围、问题树、来源计划、证据台账、机制解释、利益相关方风险块、表格优先写作、可视化比较和覆盖验证。

可与其他 skill 配合使用：

- 最终产物是 HTML 报告时，配合 `visual-html-report`。
- 如果当前环境存在 `research-report`，需要证据分级和来源分类时再配合使用；不存在时，本 skill 自行维护 Evidence Ledger。
- 如果当前环境存在 `parallel-deep-research`，且用户明确要求 deep research、exhaustive、comprehensive research 时再配合使用；不存在时，用分轮采集和 Reflect Loop 替代。

## 运行契约

写报告前，必须先有任务书。用户已经提供任务书时，按任务书执行并保留其章节编号；用户没有提供任务书时，先把用户的一句话需求整理成任务书草案，再进入采集、分析和报告生成。任务书草案不需要等待用户确认，除非存在真正会导致方向相反的歧义。

任务书必须先明确这些项：

| 项目 | 必填内容 |
| --- | --- |
| Audience | 谁读、当前认知水平、报告支持什么决策或心智模型 |
| Scope | 地域、时间窗口、语言、包含主题、排除主题、来源新鲜度要求 |
| Question tree | 分组编号的问题树；每个问题有目标输出形态 |
| Evidence standard | 来源优先级、引用要求、数字出处、证据分级规则 |
| Delivery form | Markdown、HTML、表格、PPT 或混合包；需要时给本地路径 |

没有任务书时，至少产出这 8 块：

1. 调研目标：一句话主问题和报告支持的判断。
2. 交付要求：格式、密度、结构、证据、口吻、验证。
3. 问题树：把模糊需求拆成 Part / Q 编号。
4. 问题到章节映射：每个问题对应章节和输出形态。
5. 来源计划：每类来源的优先级、用途和不能证明什么。
6. 证据口径：A/B/C 或 strong/medium/weak 的定义。
7. 可视化计划：哪些章节用图，哪些保留表格和来源台账。
8. 验证标准：HTML、链接、数据、排版、反平铺检查。

如果用户给了任务书，保留任务书里的章节编号。没有任务书时，创建稳定 ID，例如 `Q1.1`、`Q1.2`，并建立 question-to-section map。大型报告的第一份本地产物优先命名为 `research-brief.md` 或 `调研任务书_*.md`。

## 三条强化规则

每份调研报告默认执行这三条规则，除非用户明确要求只做快速摘要：

1. **Evidence Ledger**: 每个重大结论必须记录 `claim`、`source`、`grade`、`collected_on`、`supports_question` 和 `contradiction_note`。来源列表不是证据台账；证据台账必须说明每条来源支撑哪个判断。
2. **Reflect Loop**: 每轮采集后做缺口审计，检查一手来源缺失、结论冲突、过期事实、弱证据支撑强结论、闭源/开源混排和比较维度不公平。发现 critical gap 时生成 delta queries，回到采集和证据更新。
3. **Comparison First**: 生态、工具、产品、论文或课程类报告必须先给横向比较视图，再给 inventory list。至少包含 layer map、capability matrix、scenario selection、tradeoff matrix 或 evidence matrix 中的一种；大型报告至少两种。

## 本地产物规则

大型报告默认保持可维护源码包，而不是只交付单个 HTML。项目目录按实际产物创建，至少包含有内容的 `README.md`、`content/` 和一个报告输出目录：

```text
{research-topic}/
├── README.md
├── content/
│   ├── research-brief.md 或 调研任务书_*.md
│   └── sources.json 或 evidence-ledger.json
├── report/ 或 dist/
├── qa/          # 只有产生验证截图 / JSON / 日志时创建
├── scripts/     # 只有产生项目级脚本时创建
└── output/      # 只有确实有通用输出物时创建
```

规则：

- 禁止为了满足目录树而预创建空目录或 0 字节占位文件；目录必须在写入第一个实际文件时创建。
- `qa/`、`scripts/`、`output/` 三者按需要选择，不是必须同时出现。没有验证产物时不要创建 `qa/`；没有脚本时不要创建 `scripts/`；没有通用输出物时不要创建 `output/`。
- 统一使用复数 `scripts/`，不要新建单数 `script/`。
- `README.md` 说明报告入口、任务书、来源台账、验证命令和未解决风险。
- 重大来源不要只藏在 HTML 附录；同步维护 `content/sources.json` 或 `content/evidence-ledger.json`。
- 验证脚本路径必须从脚本自身定位到当前项目目录，不能硬编码临时桌面路径、旧构建目录或一次性 workspace。
- 链接检查要区分 `HEAD`/`GET`、403/412/5xx 和真实坏链；官网反爬导致的失败写入 caveat，不直接当作内容错误。
- QA 输出放进 `output/`，截图和 JSON 结果可以复跑覆盖。

## 可视化反平铺规则

用户要求“更加可视化”“不要平铺”“横向比较”或报告章节出现大量同质卡片/列表时，不能只调 CSS。必须先判断该章节表达的关系类型，再替换结构：

| 内容类型 | 平铺风险 | 优先改写成 |
| --- | --- | --- |
| 运行框架、架构、团队协作 | 只列组件，读者看不出控制关系 | system board、control plane、topology map、feedback loop |
| 生命周期、流程、课程路径 | 阶段卡片互相独立 | rail、timeline、state machine、swimlane |
| 论文、来源、案例 | 标题列表像 bibliography，证据和工程动作断开 | decision board、evidence lanes、source ribbon、claim-source matrix |
| 项目生态、产品对比 | inventory 压倒判断 | layer map、capability heatmap、scenario selection、tradeoff chart |
| 社区和舆情 | 链接列表没有信号强度 | signal funnel、topic cluster、monitor list with caveat |

改写顺序：

1. 标出每个章节的核心判断：它要证明什么。
2. 抽取稳定维度：层级、时间、能力、证据强度、因果、风险或场景。
3. 先放视觉比较或关系图，再放必要表格；表格只承担细节和审计。
4. 所有颜色、chip、bar、强/中/弱都必须有图例或文字解释。
5. 验证 HTML 中不再出现旧的平铺结构作为主表达；保留清单只能作为附录或明细。

用户明确说“我要的是图”“不是平铺卡片”时，主表达必须优先使用真正的 diagram：SVG、流程图、网络图、路径图、漏斗图、Sankey-like flow、系统拓扑或矩阵热力图。卡片只能作为次级明细，不能把加了边框、颜色和阴影的网格称为可视化图。

面向中文读者的报告里，SVG/图表中的英文标签必须有中文解释。优先使用中文主标签，英文作为括号、辅助行或项目原名保留；不要只在正文解释英文图，也不要让读者离开图本身才能读懂含义。`title`、`desc`、`figcaption` 也要中文化或中英双语化。

把平铺清单改成图时，不能丢掉原来的可点击来源、证据分析和局限说明。正确结构是：主图回答关系和强弱，图后保留 source comparison table 或 evidence ledger，列出可点击链接、证据级别、分析结论、工程含义和不可过度解读项。

## 迭代同步规则

用户对报告结构、排版、视觉表达或调研流程提出修改后，必须同步沉淀到 skill：

1. 报告改什么，skill 至少补一条可复用规则、检查项或平台判断链。
2. 如果是视觉迭代，优先用 Playwright 做截图或布局验证；Playwright 被 sandbox 阻断时，按当前环境规则申请沙箱外运行，并在最终回复说明结果。
3. 验证脚本要增加反向检查，防止旧的平铺结构回流。
4. QA 文档要记录本轮为什么改，不只记录改了哪个 class。

相邻导航板块被用户一起点名时，按一个 section suite 处理：统一视觉语法、统一断点策略、统一 QA 反向检查。不要只把其中一个板块改精致，其他板块保留旧卡片墙。

## 工作流

1. 建立调研章程。
   - 如果没有任务书，先生成任务书草案：调研目标、交付要求、问题树、覆盖地图、来源计划、证据口径、可视化计划和验证标准。
   - 提取主目标、读者、约束、排除项和交付物。
   - 区分事实问题、机制问题、比较问题、时间线问题和风险问题。
   - 识别时效性事实。涉及近期价格、法律、政策、版本、发布、融资、领导层、榜单或市场数据时，先查当前来源再写结论。

2. 把请求转成覆盖地图。
   - 创建表格：`question_id`、`research_question`、`section`、`required_output`、`evidence_needed`、`status`。
   - 标记用户要求的案例、地域、时间范围、指标和禁区。
   - 大型报告要加阅读优先级，让目标读者知道先看哪里。
   - 生态/工具报告先定义横向比较维度；不要等到写完清单后再补比较。

3. 先规划来源，再采集。
   - 优先一手来源：监管机构、备案/披露、官方文档、法院判决、标准、公司报告、官方数据集。
   - 二手来源只能用于解释和市场背景，不能覆盖一手来源。
   - 每个数字都记录来源 URL、来源日期或采集日期，以及这个数字支撑哪个 claim。
   - 每个案例都说明它证明了什么机制；不要把案例当装饰。

4. 研究并维护证据台账。
   - 记录 source type、grade、date、URL、支持的 claim、矛盾备注。
   - 证据等级使用 `strong`、`medium`、`weak`、`excluded`。
   - 重大结论不能只靠 weak evidence。
   - 原始事实和综合判断分开存放。
   - 每个关键 claim 都要有 `claim_id`；每个来源要说明它支撑、反驳或仅提示了什么。

5. 执行 Reflect Loop。
   - 对 coverage map、evidence ledger 和章节草稿做缺口审计。
   - 标记 `missing_primary_source`、`conflicting_claims`、`stale_fact`、`weak_support`、`unfair_comparison`。
   - 对关键缺口生成 delta queries，补采集后再进入综合。
   - 无法补齐时，在报告限制里写清楚，不用模糊语气掩盖。

6. 用任务书块模式综合每个章节。
   - 每个关键概念或机制都包含：
     - 一句话本质。
     - 详细机制。
     - 本地语境或领域 caveat。
     - 有来源的案例或 worked example。
   - 涉及利益相关方影响时，加 risk triad：
     - Benefit: 什么情况下帮助这个 stakeholder。
     - Downside: 什么情况下伤害这个 stakeholder。
     - Red flag: 哪些可观察信号需要警惕。
   - 语气以解释为主。用户没明确要建议时，不主动给行动建议。

7. 让报告表格优先。
   - 先用比较表、时间线、流程图、评分卡和计算过程，再写 prose。
   - 每个密集表格前放一段短解释，说明这个表证明什么。
   - prose 用来解释机制和 caveat，不复述表格。
   - 使用专业术语时加 glossary；必要时第一次出现给中文/英文对照。
   - 清单类报告必须先展示横向比较结果，再进入完整 inventory。
   - 对运行框架、论文、课程、社区、产品 UI 等章节做反平铺扫描；如果只是同质卡片，必须改成关系图、证据图、轨道、热力图或场景选择图。

8. 打包交付物。
   - Markdown: 包含执行摘要、问题地图、发现、证据地图、限制、术语表和来源。
   - HTML: 导航、表格、图示、证据标签、引用和响应式渲染必须在静态页面中可见，不能只依赖隐藏 JS 状态。
   - 可视化报告: 每个视觉模块都必须回答研究问题。禁止装饰性图表和 filler illustration。

9. 交付前验证。
   - 检查 coverage map 里的每个问题是 `answered`、`partially answered` 或 `unanswered with reason`。
   - 检查每个外部数字都有引用。
   - 检查每个重大发现都映射到 strong 或 medium evidence。
   - 检查 evidence ledger 是否覆盖关键 claim，且社区/X 信号没有被当成事实源。
   - 检查 reflect loop 是否记录已补齐的缺口和未补齐原因。
   - 检查报告是否先给横向比较，再给 inventory list。
   - 检查主要章节是否仍是平铺卡片或链接列表；如果是，改成能表达关系的视觉模块。
   - 检查中文报告里的英文图：每个英文轴、节点、图例、缩写和动作标签是否有中文主解释；保留英文时必须是项目名、论文名、协议名或辅助对照。
   - 检查从清单改成图的章节是否仍保留可点击来源与分析；不能为了视觉化删除 source links、evidence notes 或 caveat。
   - 检查链接、本地文件、HTML 渲染、响应式布局和表格 overflow。
   - 最终回复说明 unresolved evidence gaps。

## 详细模板

读取 `references/report-checklists.md` 的情况：

- 请求包含 5 个以上研究问题。
- 用户提供任务书。
- 输出需要审计、渲染或交付为 HTML。
- 需要覆盖地图、证据台账、章节块或 QA 的可复用模板。

读取 `references/platform-source-playbook.md` 的情况：

- 报告比较开源项目、SDK、协议、产品、论文、社区、课程或前端参考。
- 用户要求穷尽互联网、高价值来源、生态全景或横向比较。
- 需要 GitHub、arXiv、Hacker News、Reddit、X/Twitter、高校课程、产品官网、前端 UI 参考的平台判断链。
- 交付物不只要说明“有什么”，还要说明“生态信号证明了什么”。

## 硬规则

- 不要把来源列表当报告交付。
- 不要把证据台账省略成普通来源列表。
- 不要先堆 inventory 再让读者自己比较。
- 不要把运行框架、论文、课程或社区章节做成同质卡片墙；必须表达关系、顺序、强弱或证据作用。
- 不要跳过 Reflect Loop；搜完直接写通常会遗漏关键反证。
- 不要编造引用、日期、数字范围、截图或案例细节。
- 不要把一手事实、分析解读和社区讨论放在同一置信度。
- 不要把限制藏在脚注里。
- 不要用过期记忆回答近期事实。
- 不要加用户没要求的泛泛免责声明或 filler summary。
