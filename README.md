# skills

个人 Cursor Agent Skills 集合，用于扩展 AI 在特定场景下的工作流与能力。

## Skills

| Skill | 说明 |
| --- | --- |
| [code-tester](./code-tester/) | 本地开发测试编排：识别技术栈、选择测试策略、运行检查与冒烟测试 |
| [structured-research](./structured-research/) | 把宽泛调研任务或任务书转成有证据台账、反思循环、横向比较和验证记录的问题型调研报告 |
| [visual-html-report](./visual-html-report/) | 从调研材料生成可维护的可视化 HTML 调研报告 |

## 安装

将需要的 skill 目录复制到 Cursor 个人 skills 目录：

```bash
cp -r code-tester ~/.cursor/skills/
cp -r structured-research ~/.cursor/skills/
cp -r visual-html-report ~/.cursor/skills/
```

或在 Codex 环境中：

```bash
cp -r code-tester ~/.codex/skills/
cp -r structured-research ~/.codex/skills/
cp -r visual-html-report ~/.codex/skills/
```

## 结构

每个 skill 是一个独立目录，至少包含 `SKILL.md`：

```
skill-name/
├── SKILL.md          # 必需：主指令与触发说明
├── references/       # 可选：详细文档
├── scripts/          # 可选：辅助脚本
└── ...
```

## License

MIT
