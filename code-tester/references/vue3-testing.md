# Vue 3 测试

用于 Vue 3 前端，包括 Vite + Vue 3、Vue Router、Pinia、Element Plus、Naive UI 和管理后台。

## 首轮只读测试

除非用户已经授权，不要在首轮创建测试或修改源码。

1. 检查 `package.json`、lockfile、`vite.config.*`、`vitest.config.*`、`tsconfig.*` 和 `src/`。
2. 识别 Vue 3 信号：`vue` 版本 `3.x`、`@vitejs/plugin-vue`、`@vue/test-utils`、`pinia`、`vue-router`。
3. 只运行已有的低成本命令：
   - `npm test` / `pnpm test` / `yarn test`
   - `npm run test:unit` / `pnpm run test:unit`
   - `npm run lint`
   - `npm run typecheck`
   - `npm run build`
4. 如果应用已经运行，做浏览器冒烟：根路由、主要页面、控制台错误、失败网络请求。

## 测什么

| 目标 | 测试类型 | 示例 |
|---|---|---|
| `utils/`、格式化、校验 | 单元测试 | 日期/金额格式化、空输入、手机号非法 |
| `composables/` | 单元测试 | loading/error 状态、清理逻辑、派生值 |
| Pinia store | 单元/集成测试 | action、持久化、权限状态 |
| Vue 组件 | 组件测试 | 渲染状态、表单校验、事件 emit |
| 路由守卫 | 集成测试 | 未登录跳转、角色权限 |
| 关键后台流程 | E2E | 登录、列表搜索、新增/编辑表单、无权限访问 |

## Vue 3 组件规则

- 组件和单元测试优先用 Vitest + `@vue/test-utils`。
- 断言用户可见行为：文本、role、label、emit 事件、路由变化、store 状态。
- 需要时用真实插件挂载：Pinia、Router、i18n、Element Plus。
- 只在 API 边界 mock 网络，不 mock 组件内部业务逻辑。
- 除非行为本身就是 DOM 结构，不要断言私有 ref、实现细节 class 或完整 DOM 树。

## 建议优先补的缺口

| 优先级 | Vue 3 缺口 |
|---|---|
| P0 | 登录/权限守卫、token 过期、破坏性表单提交、核心 API 失败态 |
| P1 | 重要表单校验、表格搜索/筛选、Pinia action 分支 |
| P2 | 纯展示组件、样式 class |

## 授权补测试后

先跑窄范围测试：

```bash
npm run test:unit -- path/to/file.spec.ts
pnpm vitest run src/path/file.spec.ts
```

通过后再扩大范围：

```bash
npm run test:unit
npm run typecheck
npm run build
```
