# Vue 3 + Spring Boot + MySQL 全栈测试

用于前端 Vue 3、后端 Spring Boot、数据库 MySQL 的本地项目或多项目仓库。

## 分层顺序

不要一开始就跑全量 E2E。先把失败范围切小：

1. **后端基础**：`mvn test` / `./gradlew test`，确认编译、单测、MockMvc、Repository 测试。
2. **数据库隔离**：确认 test/local profile、Testcontainers 或临时 schema；再跑 migration/repository 相关测试。
3. **前端基础**：`npm/pnpm/yarn test`、lint、typecheck、build。
4. **API 契约**：运行中的后端做健康检查、鉴权边界、参数校验和核心只读接口冒烟。
5. **前后端联调**：前端 dev server 指向本地后端，做登录、列表、搜索、表单提交等关键流程冒烟。
6. **E2E 回归**：已有 Playwright 时跑高价值路径；没有时先浏览器冒烟，用户授权后再 scaffold。

## 首轮只读命令候选

后端：

```bash
mvn test
./gradlew test
```

前端：

```bash
npm test
npm run lint
npm run typecheck
npm run build
pnpm test
pnpm run build
```

服务已运行时：

```bash
lsof -iTCP -sTCP:LISTEN -n -P
curl -sS -o /tmp/api-smoke.out -w "%{http_code}" http://localhost:<port>/actuator/health
```

## 优先级

| 优先级 | 覆盖目标 |
|---|---|
| P0 | 登录/鉴权、权限守卫、核心写入、删除/支付/订单状态、数据库事务回滚 |
| P1 | 列表分页/筛选、表单校验、API 失败态、Repository 查询条件 |
| P2 | 展示组件、纯格式化、低风险静态页面 |

## 常见故障定位

- 前端构建失败：先看 TypeScript、路径 alias、环境变量、组件导入。
- 浏览器白屏：查 console error、路由 base、接口 base URL、资源 404。
- 后端测试失败：先看 active profile、bean 缺失、数据库连接、migration。
- API 冒烟 401/403：通常是鉴权符合预期；500 才优先看服务端日志。
- MySQL 连接失败：确认不是生产库，再看端口、用户名、schema、驱动版本和时区参数。

## 报告结构

报告按层写结果，避免把所有失败混在一起：

```markdown
## 后端
## 数据库
## 前端
## API 冒烟
## E2E / 浏览器
## 未运行项
## 建议下一步
```
