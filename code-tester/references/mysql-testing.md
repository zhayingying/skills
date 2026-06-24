# MySQL 测试

用于 Spring Boot + MySQL、MyBatis/MyBatis-Plus、JPA、Flyway/Liquibase 或本地 Docker MySQL 项目。

## 安全边界

- 默认只读探测，不修改数据库 schema 或数据。
- 不连接生产库；如果配置里出现线上域名、公网 IP、`prod` profile 或真实凭据，立即停止并汇报。
- 不执行 `DROP`、`TRUNCATE`、全表 `DELETE`、migration repair、生产 seed、清空缓存等破坏性命令。
- 优先使用 Testcontainers MySQL、临时 schema、事务回滚、`@Sql` 测试数据或本地专用 test profile。

## 首轮检查

1. 读取 `application*.yml`、`application*.properties`、`docker-compose*.yml`、`pom.xml` / `build.gradle*`。
2. 识别数据库信号：`jdbc:mysql`、`mysql-connector-j`、`com.mysql`、`spring.datasource`、`flyway`、`liquibase`、`testcontainers`。
3. 如果有 migration 工具，优先运行安全验证命令：
   - Flyway：项目已有脚本中的 `flywayValidate` 或 Maven/Gradle test 间接验证。
   - Liquibase：项目已有脚本中的 validate/status。
4. 如果没有隔离测试库，不跑 repository 写入测试，只汇报缺口。

## 应该覆盖的数据库行为

| 层级 | 测试重点 |
|---|---|
| Migration | 新库能从零迁移；重复迁移幂等；字段类型和索引符合查询 |
| Repository/Mapper | 查询条件、分页、排序、唯一约束、软删除、多租户过滤 |
| 事务 | 成功提交、异常回滚、幂等重试、并发更新冲突 |
| 数据边界 | 空值、超长字符串、金额精度、时区、枚举非法值 |
| 性能风险 | N+1 查询、缺索引慢查询、大分页 |

## 推荐测试形态

- JPA：`@DataJpaTest` + Testcontainers MySQL；需要真实 MySQL 语义时不要用 H2 替代。
- MyBatis/MyBatis-Plus：mapper slice test 或 `@SpringBootTest` 限定 profile。
- 事务逻辑：Service 层测试，准备最小数据，断言提交/回滚后的数据库状态。
- 只需要 mock 外部 HTTP、消息队列、支付/短信/邮件，不 mock repository 本身来证明 SQL 行为。

## 汇报要点

- 当前使用的 profile、数据库地址是否本地/隔离。
- 跑了哪些 migration/repository/service 测试。
- 是否发现生产库风险、硬编码凭据、缺少 test profile。
- 如果未跑 DB 写入测试，明确原因：没有隔离库、没有 Testcontainers、配置不可信或用户未授权。
