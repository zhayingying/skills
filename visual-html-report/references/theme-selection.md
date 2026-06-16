---
create_time: 2026-05-17 11:18 CST
update_time: 2026-05-17 12:09 CST
---

# 风格选择

默认风格：`editorial-paper`。

## 判断流程

```mermaid
flowchart TD
    A([需要报告风格]) --> B{用户指定?}
    B -->|是| C[匹配 slug 或别名]
    B -->|否| D[使用 editorial-paper]
    C --> E{风格存在?}
    E -->|是| F[加载一个风格语法]
    E -->|否| G[使用最接近风格]
    D --> F
    G --> F
```

## 默认提示

如果用户没有指定风格，说：

> 未指定报告风格，我先用默认 `editorial-paper` 生成；后续可以直接说“换成 xxx 风格”。

然后继续生成。不要停下来等确认。

## 换风格

当用户说“换成 xxx 风格”：

1. 优先替换 `styles/theme.css`。
2. 更新 `report.config.json.style`。
3. 重新检查字体排版、表格宽度、图表对比度和模块密度。
4. 只有新风格破坏可读性或层级时，才改写布局。

## 引擎扩展口

每个风格语法都会声明 `engine`。如果选中的风格使用不同引擎，就使用该引擎的 starter 和模块。不要强行把所有风格塞进 `token-report`。
