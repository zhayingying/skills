---
create_time: 2026-05-17 11:18 CST
update_time: 2026-05-17 12:09 CST
---

# 主题契约

当前默认引擎：`token-report`。

对 `token-report` 引擎来说，一个主题就是一份 token CSS 文件：

```text
engines/token-report/styles/themes/{slug}.css
```

主题 CSS 负责颜色、字体、间距、密度、圆角、阴影和图表色板。它不改变报告内容。

## 必填 Token

`tools/verify-report.mjs` 会从这里读取必填 token：

```text
engines/token-report/styles/report.css
```

每个主题文件必须定义该引擎要求的全部 root token。

## 风格语法配套

每个可用风格都应该配套：

```text
references/style-grammar/{slug}.md
```

CSS 是视觉 token 源；风格语法是给 AI 读的使用规则。

## 未来引擎

如果某个风格需要不同结构，新增：

```text
engines/{engine}/
viz-modules/{engine}/
references/style-grammar/{slug}.md
```

Then declare in the grammar:
然后在风格语法里声明：

```yaml
engine: new-engine
```

不要把某个引擎专用的选择器塞进无关引擎。
