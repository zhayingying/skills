# Spring Boot 测试

用于 Spring Boot 后端，尤其是 Maven/Gradle 项目和 REST API 服务。

## 首轮只读测试

除非用户授权，不要在首轮修改 Java 代码、SQL 迁移、YAML 配置、lockfile 或生成物。

1. 检查 `pom.xml` 或 `build.gradle*`、`src/main`、`src/test`、`application*.yml` 和 README 运行说明。
2. 识别 Spring Boot 信号：`spring-boot-starter`、`spring-boot-starter-test`、`@SpringBootApplication`、`@RestController`。
3. 优先运行测试命令：
   - Maven：`mvn test`
   - Gradle wrapper：`./gradlew test`
   - Gradle 兜底：`gradle test`
4. 如果后端已经在运行，先确认端口和 profile，再做 API 冒烟。
5. 没有明确授权时，不要运行数据库重置、migration repair、生产 profile 或破坏性 seed 脚本。

## 测什么

| 层级 | 测试类型 | 示例 |
|---|---|---|
| 工具/领域逻辑 | 单元测试 | 校验、状态流转、权限规则 |
| Service 层 | 单元/集成测试 | 事务分支、repository 交互、错误处理 |
| Controller REST | `@WebMvcTest` / MockMvc | 状态码、鉴权失败、参数校验、响应结构 |
| Repository | `@DataJpaTest` / mapper 测试 | 查询过滤、分页、唯一约束 |
| 全链路 | `@SpringBootTest` | 使用 local/test profile 的关键流程 |
| 运行中的服务 | API 冒烟 | `/actuator/health`、`/app-api/...`、需要鉴权的接口 |

## API 冒烟规则

- 只使用本地/test profile 和本地数据。
- 受保护接口返回 401/403 通常符合预期。
- 空请求体或非法参数返回 400/422 通常符合预期。
- 已知 Controller 路由返回 404、任何 500，都是问题候选。
- 汇报时记录第一条有用服务端日志、方法、路径和状态码。

## 建议优先补的缺口

| 优先级 | Spring Boot 缺口 |
|---|---|
| P0 | 鉴权/权限、写入/删除、支付/订单类状态变化、数据丢失路径 |
| P1 | 参数校验、分页/过滤、Service 错误分支、幂等 |
| P2 | 简单 getter、纯 DTO 映射、展示元数据 |

## 授权补测试后

优先选择最小切片：

- 纯逻辑：JUnit 单元测试
- Controller 行为：MockMvc
- DB 查询行为：Repository slice test
- 跨层行为：有限范围的 `@SpringBootTest`

先跑窄范围，再扩大：

```bash
mvn -Dtest=ClassNameTest test
mvn test
./gradlew test --tests ClassNameTest
./gradlew test
```
