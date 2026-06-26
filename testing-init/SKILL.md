---
name: testing-init
description: 一次性初始化项目的测试体系：探测技术栈、锁定框架/工具/命令版本，并在被测项目的 doc/testing/ 下交付一整套标准测试文档结构（00-控制层 ~ 09-历史归档）。适用于 Vue 3 + Spring Boot + MySQL 全栈项目（如 fast_saas / yudao 框架）。一个项目通常只在首次搭建测试体系、或代码事实大幅变化需要重建时运行一次。触发词：初始化测试、搭建测试体系、锁定测试版本、生成 doc/testing 结构、testing-init、testing init。之后每轮执行用 testing-run。
---

# 测试体系初始化（testing-init）

把"这个项目该怎么测"一次性想清楚、锁死，沉淀成 `doc/testing/` 下确定性的文档结构。之后 `testing-run` 每次只按这套文档执行，不再重新决策。

**何时用**：项目首次搭建测试体系，或重构/升级后代码事实大幅漂移需要重建。**一个项目通常只跑一次。** 日常简单改动用单元测试直接覆盖即可，不需要本 skill。

**不用于**：每轮跑测试（那是 `testing-run`）、生产部署、数据库重置、深度安全渗透。

## 交付物

被测项目根目录下的 `doc/testing/` 标准结构，结构契约见 [references/doc-structure.md](references/doc-structure.md)：

```text
doc/testing/
├── 00-控制层/  必读顺序.md｜测试画像.md/.json｜代码事实指纹.json｜命令清单.json｜报告结构.json｜_scripts/
├── 01-测试矩阵/  02-环境配置/  03-测试数据/  04-测试场景/  05-流程图谱/
├── 06-执行命令/  07-测试报告/  08-测试SOP/  09-历史归档/
```

控制层的 4 个 JSON + 自包含脚本由脚本确定性生成；叙述类文档（矩阵/场景/流程图）由你读代码后补充。

## 安全规则

- 不打印、提交、硬编码 API key/token/密码；用户贴出密钥时不要复述，建议轮换并只放进 git 忽略的本地 `.env`。
- 数据库相关只写 test/local profile、临时 schema、Testcontainers；禁止 DROP/TRUNCATE/全表 DELETE/生产 seed。
- 本 skill 只创建 `doc/testing/` 下的文档与脚本，不修改业务源码、配置或依赖。

## 工作流

```text
- [ ] 步骤 1：确认目标项目根
- [ ] 步骤 2：跑 scaffold 生成结构 + 锁版本
- [ ] 步骤 3：校验结构完整
- [ ] 步骤 4：读代码补充叙述类文档（01/04/05，必要时 02/03）
- [ ] 步骤 5：复核并汇报
```

### 步骤 1：确认目标项目根

先 `pwd`。被测项目是用户的实际仓库（如 fast_saas），不是本 skill 目录。确认根目录里能找到 manifest（pom.xml / package.json 等）。

### 步骤 2：生成结构并锁版本

```bash
python3 <skill>/scripts/scaffold_testing_docs.py <项目根> --docroot doc/testing
```

脚本会：探测栈 → 从 manifest 提取并锁定版本（Java/Spring Boot/Node/Vue/MySQL 连接器/构建工具）→ 创建目录 → 写控制层 4 个 JSON → 从模板写 MD → 把 `code_test_probe.py` 和 `validate_testing_docs.py` 复制进 `00-控制层/_scripts/`。

- 重复运行安全：总是刷新机器生成的 JSON；叙述类 MD 默认不覆盖（要覆盖加 `--force`）。
- 读脚本输出里的"锁定版本"和"策略"，确认探测正确。

### 步骤 3：校验结构

```bash
python3 <skill>/scripts/validate_testing_docs.py <项目根> --docroot doc/testing
```

必须看到 `STRUCTURE: OK`。失败则按提示修复后重跑步骤 2。

### 步骤 4：读代码补充叙述类文档

脚本生成的是骨架。现在读被测项目代码，把下列文档填实（这是 init 的核心价值）：

- `01-测试矩阵/`：列出关键模块 × 测试类型 × 优先级，标注现状（✅/⚠️/❌）。
- `04-测试场景/`：写 P0/P1/P2 关键业务流程的前置、步骤、断言。
- `05-流程图谱/`：用 mermaid 画核心业务与前后端联调流程。
- 必要时校正 `02-环境配置/`（profile、端口、启动命令）和 `03-测试数据/`（账号、seed、隔离策略）。

按栈选择参考文档辅助判断深度与优先级：

| 文件 | 何时读 |
|------|--------|
| [references/full-stack-vue3-springboot-mysql.md](references/full-stack-vue3-springboot-mysql.md) | 全栈分层顺序与优先级（fast_saas 主用） |
| [references/vue3-testing.md](references/vue3-testing.md) | Vue 3 组件/composable/Pinia/路由 |
| [references/springboot-testing.md](references/springboot-testing.md) | Spring Boot 单测/MockMvc/集成 |
| [references/mysql-testing.md](references/mysql-testing.md) | MySQL migration/repository/事务/隔离 |
| [references/api-smoke-testing.md](references/api-smoke-testing.md) | API 路由发现与接口冒烟 |
| [references/playwright-conventions.md](references/playwright-conventions.md) | Playwright/E2E |
| [references/unit-test-patterns.md](references/unit-test-patterns.md) | 单元/集成测试模式与覆盖缺口 |
| [references/test-report-archive.md](references/test-report-archive.md) | 报告归档规则 |

### 步骤 5：复核并汇报

- 再跑一次校验确认 `STRUCTURE: OK`。
- 汇报：交付的 `doc/testing/` 路径、探测到的栈与策略、锁定版本、补充了哪些叙述文档、还有哪些 `待补充` 留给后续。
- 提示用户：之后每轮复杂测试用 `testing-run`；简单改动直接单元测试即可。

## 脚本

- **scaffold_testing_docs.py**：探测 + 锁版本 + 生成结构。执行它。
- **validate_testing_docs.py**：结构与漂移校验。执行它（也会被复制进项目供 `testing-run` 调用）。
- **code_test_probe.py**：栈探测引擎，被上面两个脚本调用，一般不单独跑（需要时可 `--json` 查看原始探测结果）。
