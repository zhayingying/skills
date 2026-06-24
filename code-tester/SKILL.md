---
name: code-tester
description: 在本地开发时测试代码：自动识别项目技术栈与测试框架，特别支持 Vue 3 前端、Spring Boot 后端、MySQL 数据库和它们组成的全栈项目，选择单元/集成/E2E/API 冒烟/浏览器冒烟策略，默认首轮只运行和汇报、不改代码，用户授权后再补测试或修复失败，并将每轮测试报告按时间归档到被测项目的 doc/test/。适用于“测试代码”“测一下项目”“跑 QA”“继续测试”“生成 Playwright 用例”“写测试”“测接口”“测试 Vue3 + SpringBoot + MySQL”“用 AI 辅助测试代码”等场景。
---

# 代码测试助手

编排本地测试流程。核心原则：先用确定性命令证明状态，再让 AI 辅助分析和补测试。**不用于**：生产部署、数据库重置、仅做 code review、深度安全渗透或完整 WCAG 审计。

## 决策树（第一步必走）

```text
用户要测试
  |
  ├─ 运行 probe，读取 recommendedStrategy.mode 和 primaryProject
  ├─ full-stack-vue3-springboot-mysql -> Vue 3 + Spring Boot + MySQL：分层测试 + API 契约 + E2E 冒烟
  ├─ vue3-unit-component -> Vue 3：Vitest / @vue/test-utils / 组件与 composable 测试
  ├─ springboot-mysql-test -> Spring Boot + MySQL：JUnit/MockMvc + Repository/MySQL 集成测试
  ├─ springboot-test ----> Spring Boot：Maven/Gradle test + MockMvc/API 冒烟
  ├─ cursor-browser-smoke -> 静态 HTML / 无测试框架：浏览器冒烟
  ├─ playwright-e2e -----> 已有 Playwright：跑 E2E，必要时读 references/playwright-conventions.md
  ├─ api-smoke ----------> 有 API 路由但测试浅：读 references/api-smoke-testing.md
  ├─ unit-integration ---> 已有单元/集成测试：跑 test、lint、typecheck、build
  ├─ scaffold-or-browser -> JS Web 无测试：先浏览器冒烟，再决定是否补 Playwright
  ├─ write-focused-tests -> 后端/库无测试：读 references/unit-test-patterns.md
  └─ native-scripts -----> 默认：跑 probe 给出的命令
```

## 安全规则

- 不要打印、提交、硬编码或持久化 API key、token、cookie、密码、私有凭据。
- 如果用户在聊天中贴出了 API key，不要复述这个 key；建议用户轮换密钥，新密钥只放在被 git 忽略的本地 `.env` 文件里。
- 不要运行数据库重置、清空数据、强制 checkout、生产部署等破坏性命令，除非用户明确要求执行该具体操作。
- MySQL 项目默认不执行 `DROP`、`TRUNCATE`、`DELETE` 全表、migration repair、生产 seed、真实支付/通知回调；只允许 test/local profile、临时 schema、事务回滚或 Testcontainers。
- 生成测试用例也算代码变更：保持范围聚焦，并说明它保护了什么行为。
- 默认首轮是只读测试轮：除非用户明确说“修复”“直接改”“补测试”“生成测试文件”或同等授权，不要修改源码、测试、配置、lockfile、快照或依赖。
- 每轮测试结束要写一份 Markdown 测试报告到被测项目的 `doc/test/`；这只记录测试证据，不等同于授权修改业务代码。

## 默认执行模式

首轮测试默认只做观察和汇报：

- 可以读文件、运行 probe、运行已有 test/lint/typecheck/build、使用已有浏览器或本地服务做冒烟。
- 不要执行会写文件的格式化、快照更新、代码生成、依赖安装或迁移命令。
- 不要进入修复循环；把失败命令、错误摘要、疑似原因和建议修复方案先汇报给用户。
- 可以创建 `doc/test/` 下的测试报告；除此之外不要写文件。
- 如果用户一开始已经明确授权修复，才可以在失败后进入“最小修复 -> 重跑”流程。

## 工作流

1. 确认测试目标。
   - 先运行 `pwd`。
   - 运行 `python3 <this skill>/scripts/code_test_probe.py <target-root> --json`。
   - 读取 `recommendedStrategy.mode`、`recommendedStrategy.reason`、`primaryProject.commands`、`frameworks`、`testFileCount`、`apiSignals`、`databaseSignals`、`stackProfile`、`coverageReports`。
   - 选择命令前，先读最近的 manifest 文件和 README；多项目仓库优先测试用户触达的子项目。
   - 如果应用已经在本地运行，通过 `lsof` 或开发服务器输出确认端口和路由。

2. 先跑已有的低成本检查和现有测试。
   - Vue 3：读 `references/vue3-testing.md`；优先跑 Vitest/组件测试，再跑 lint、typecheck、build；需要 UI 验证时用浏览器冒烟或 Playwright。
   - Spring Boot：读 `references/springboot-testing.md`；优先跑 `mvn test` / `./gradlew test`，再按需要做 MockMvc/API 冒烟。
   - MySQL：读 `references/mysql-testing.md`；只使用 test/local profile、Testcontainers 或临时 schema，验证 migration、repository 查询、事务和约束。
   - Vue 3 + Spring Boot + MySQL 全栈：读 `references/full-stack-vue3-springboot-mysql.md`；按后端、数据库、前端、API 契约、E2E 冒烟的顺序分层收敛。
   - 其他 JavaScript/TypeScript：先跑包管理器里的测试脚本，再按项目配置跑 lint、typecheck、build。
   - Python：跑 pytest/unittest；只有项目已配置时再跑格式化或类型检查。
   - 其他 Java/Kotlin：跑 Maven 或 Gradle 测试。
   - Go：跑 `go test ./...`。
   - Rust：跑 `cargo test`。
   - PHP/Ruby：跑项目已配置的测试脚本。
   - 有覆盖率脚本或报告时，先看关键分支缺口，不为数字盲目补低价值测试。

3. 当已有检查太浅时，先汇报缺口；只有用户授权后才补充或优化测试。
   - Bug 修复：先写能复现问题的失败测试，再改实现，最后跑全量相关检查。
   - 前端/UI：使用 Playwright，优先语义化 locator，并检查 page error、console error 和关键用户流程。
   - 后端/API：读 `references/api-smoke-testing.md`，测试健康检查、鉴权边界、参数校验失败和核心 CRUD 路径。
   - 公共逻辑：读 `references/unit-test-patterns.md`，围绕变更函数、边界条件或 bug 复现路径补窄范围单元测试。
   - 优先测试失败行为本身，不要过度绑定实现细节。

4. 如果 Web 应用已经在本地运行。
   - 使用运行中的地址作为 `TEST_BASE_URL`。
   - 先做冒烟检查：页面标题、根内容、浏览器无 page error。
   - 再测试一个有意义的流程，例如登录校验、导航、表单提交或 API 健康检查。
   - 失败时保留截图、视频和 trace。

5. 失败时按授权决定是否进入修复循环。
   - 对目标命令最多循环 10 轮：运行 -> 读第一个失败 -> 最小修复 -> 重跑。
   - 一次修一个错误；错误数量持续增加时停下，换分析路径。
   - 不删测试来变绿，除非断言明显过时；不要用 `@ts-ignore`、`eslint-disable` 或扩大 mock 来掩盖真实失败。
   - 多个互不相关的失败文件可以并行分配给可用子代理；共享同一源码文件的失败要合并处理，避免互相覆盖。

6. 如果使用 AI 辅助测试。
   - 把模型当成审查员和测试用例生成器，不把它当作通过/失败的最终裁判。
   - 只发送相关代码片段、文件树、错误日志和测试意图。
   - 默认不要发送密钥、大体积私有文件或无关源码。
   - 最终结论必须来自本地确定性命令的执行结果。

7. 归档测试报告。
   - 读 `references/test-report-archive.md`。
   - 每轮测试在被测项目根目录创建一份时间归档报告：`doc/test/YYYY-MM-DD/HHmmss-<mode>-测试报告.md`。
   - 报告只写命令、结果、关键失败、建议、未跑项和证据路径；不要塞完整长日志。
   - 不自动删除旧报告；如果 `doc/test/` 报告过多，只统计数量并建议清理方案，等用户确认。

8. 汇报结果。
   - 先说通过/失败数量和实际运行的命令。
   - 对失败项给出文件/行号、错误摘要和最小修复建议。
   - 说明哪些检查没有跑，以及原因。
   - 把无关的既有失败和本次测试目标分开说明。
   - 最后给出本轮报告文件路径。

## 命令选择

先用探测脚本找候选命令，再手动核对 manifest 中的脚本配置。

常见默认命令：

```bash
npm test
pnpm test
yarn test
npm run lint
npm run typecheck
npm run build
pytest
go test ./...
mvn test
./gradlew test
cargo test
```

对于 Playwright，优先使用已有本地测试 harness，并用 base URL 注入运行地址：

```bash
TEST_BASE_URL=http://localhost:5173 npm run test:e2e
```

把 URL 替换成用户当前运行中的应用地址。

## 参考文档

| 文件 | 何时读 |
|------|--------|
| `references/playwright-conventions.md` | 写、改、排查 Playwright/E2E 测试 |
| `references/unit-test-patterns.md` | 补单元/集成测试、TDD、覆盖率缺口 |
| `references/api-smoke-testing.md` | 后端/API 路由发现和接口冒烟 |
| `references/vue3-testing.md` | Vue 3 前端组件、composable、Pinia、路由和 E2E 策略 |
| `references/springboot-testing.md` | Spring Boot 单测、MockMvc、集成测试、本地 profile/API 冒烟 |
| `references/mysql-testing.md` | MySQL migration、repository、事务、约束、测试数据隔离 |
| `references/full-stack-vue3-springboot-mysql.md` | Vue 3 + Spring Boot + MySQL 全栈项目的分层测试顺序 |
| `references/test-report-archive.md` | 每轮测试报告在 `doc/test/` 下按时间归档 |
