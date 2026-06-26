---
name: testing-run
description: 按 testing-init 在 doc/testing/ 沉淀的固定流程执行一轮复杂测试：加载控制层、校验代码指纹漂移、分层执行锁定命令（后端→数据库→前端→API契约→联调→E2E）、写时间戳报告。适用于 Vue 3 + Spring Boot + MySQL 全栈项目（如 fast_saas / yudao 框架）的复杂联调与回归测试，保证每次都按同一 SOP 执行。触发词：跑测试、执行测试、回归测试、按 SOP 测试、testing-run、testing run。前置条件：项目已有 doc/testing/（否则先用 testing-init）。日常简单改动用单元测试直接覆盖即可，不需要本 skill。
---

# 测试执行（testing-run）

严格按被测项目 `doc/testing/` 里 `testing-init` 沉淀的文档执行一轮测试，保证每次流程一致、命令固定、报告统一。

**何时用**：复杂场景——全栈联调、跨模块回归、需要可复现且一致流程的测试。**简单改动（单元测试能直接覆盖的）不需要本 skill，直接写/跑单元测试即可。**

**前置条件**：被测项目存在 `doc/testing/`（由 `testing-init` 生成）。若没有，先运行 `testing-init`。

**不用于**：重新设计测试策略（那是 `testing-init`）、生产部署、数据库重置。

## 核心原则

- 一切以 `doc/testing/` 为准：命令只用 `命令清单.json` 锁定的，不临时发明。
- 首轮只读：除非用户明确授权"修复/改代码/补测试"，只运行命令、只写报告，不改源码。
- 分层收敛，不一上来跑全量 E2E。
- 流程固定：完全照 `08-测试SOP/测试SOP.md` 走，不跳步。

## 工作流

```text
- [ ] 步骤 0：定位 doc/testing 并按必读顺序加载控制层
- [ ] 步骤 1：校验结构与指纹漂移
- [ ] 步骤 2：照 SOP 分层执行锁定命令
- [ ] 步骤 3：服务在跑时按需冒烟
- [ ] 步骤 4：按授权决定是否进修复循环
- [ ] 步骤 5：按报告结构写报告
- [ ] 步骤 6：汇报结论
```

### 步骤 0：加载控制层

先 `pwd` 确认被测项目根。确认存在 `doc/testing/`；没有就提示用户先跑 `testing-init`，停止。

按 `doc/testing/00-控制层/必读顺序.md` 依次读：`测试画像.json` → `代码事实指纹.json` → `命令清单.json` → `08-测试SOP/测试SOP.md` → `报告结构.json`。

### 步骤 1：校验结构与漂移

运行项目内自带脚本（由 init 复制进去，不依赖任何 skill）：

```bash
python3 doc/testing/00-控制层/_scripts/validate_testing_docs.py <项目根> --check-drift
```

- `STRUCTURE: FAIL`：结构不完整，提示用户重跑 `testing-init`，停止。
- `DRIFT: YES`：代码事实已变，告知用户"建议重跑 testing-init 刷新"，由用户决定是带旧文档继续还是先刷新。
- `STRUCTURE: OK` 且 `DRIFT: NO`：继续。

### 步骤 2~6：照 SOP 执行

完全按 `doc/testing/08-测试SOP/测试SOP.md` 的步骤执行：分层跑 `命令清单.json` 各层的 `readonly` 命令，服务在跑时按需跑 `smoke`，按授权决定修复循环，最后按 `报告结构.json` 把报告写到 `07-测试报告/{date}/{time}-{mode}-测试报告.md`（不覆盖旧报告），并汇报通过/失败、未跑项与报告路径。

SOP 是该项目的唯一执行依据；本 skill 不另设流程，只负责忠实驱动它。

## 修复循环（仅在授权后）

对目标命令最多循环 10 轮：运行 → 读第一个失败 → 最小修复 → 重跑。一次修一个错误；错误持续增多就停下换思路。不删测试变绿，不用 `@ts-ignore`/`eslint-disable`/扩大 mock 掩盖真实失败。多个互不相关的失败文件可并行分配子代理；共享同一源文件的失败合并处理。

## 安全规则

- 不打印/提交/硬编码密钥；用户贴出密钥不要复述，建议轮换并只放进 git 忽略的本地 `.env`。
- 数据库只用 test/local profile、临时 schema、Testcontainers、事务回滚；禁止 DROP/TRUNCATE/全表 DELETE/生产 seed/真实支付回调。
- 写测试报告是允许的；除此之外首轮不改源码、测试、配置、lockfile、快照、依赖。
