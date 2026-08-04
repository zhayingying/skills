---
name: outlook-archive-invoices
description: Manually invoked Outlook invoice assistant that searches invoice emails, archives every distinct invoice in a message, prefers one PDF representation when the same invoice has multiple formats, converts PNG invoice attachments to PDF when no PDF exists, can use authorized direct body links, deduplicates by content, and archives by invoice year/month in the user's iCloud invoice folder. Use only when the user explicitly invokes $outlook-archive-invoices or asks to run the Outlook invoice archive assistant.
---

# Outlook 发票归档助手

按以下流程处理，不改变 Outlook 邮件状态。

## 固定配置

- 归档根目录：`/Users/zhayingying/Library/Mobile Documents/com~apple~CloudDocs/invoice`
- 目录结构：`YYYY/MM`
- 日期依据：发票开票日期，不使用收件日期兜底。
- 最低归档金额：价税合计 `10.00` 元；低于 `10.00` 元的发票跳过，恰好 `10.00` 元仍归档。
- 邮件范围：每次同时扫描常规邮箱结果和 Outlook 的“垃圾邮件/Junk Email”文件夹，并按消息 ID 去重。
- 邮箱操作：只读；不标记、不分类、不移动、不删除邮件。
- 执行方式：仅手动调用。

## 工作流程

1. 使用 Outlook Email 工具搜索疑似发票邮件。先搜索常规邮箱，再精确定位“垃圾邮件/Junk Email”文件夹并在同一日期范围内单独列出邮件；合并后按消息 ID 去重。优先组合主题、正文预览、附件名中的 `发票`、`invoice`、`receipt`、`tax`、`账单` 等信号；不要仅凭单一模糊关键词认定。读取垃圾邮件时仍保持邮箱只读，不移动、不标记、不分类。
2. 先列出附件元数据，识别邮件中的每张独立发票，再逐张选择：
   - 使用发票号码作为首要身份键；无法取得号码时，使用开票日期、价税合计和销售方的组合判断是否为同一张发票。
   - 同一邮件含多张发票且金额或发票号码不同：每张分别归档，不限制一封邮件只能归档一份。
   - 同一张发票同时存在 PDF、PNG、OFD、XML 等格式：只归档一份并优先选择 PDF；有 PDF 时忽略该发票的其他格式。
   - 同一张发票没有 PDF 但有 PNG：选择该发票的全部非内嵌 PNG，按附件顺序合并成一份 PDF。
   - 排除行程单、报销单、附件清单、说明书等非发票文件，即使它们是 PDF。
   - 某张发票既无 PDF 也无 PNG：检查正文中的直接下载链接；选择与该发票明确对应的一个 PDF 链接。
   - 无法判断多个附件或链接分别属于哪张发票时，只跳过有歧义的项目并报告，不跳过已经明确的其他发票。
   - 正文链接要求登录、输入凭据、提交表单、执行脚本或发生不明跨域跳转时，跳过并报告；不得扩大授权或绕过认证。
3. 获取所选附件。把连接器返回的文件引用物化到临时目录，不要把邮件附件写入归档目录作为中间文件。
4. 从发票内容识别开票日期和价税合计金额。日期接受明确的 `YYYY-MM-DD`、`YYYY年MM月DD日` 或等价日期字段；金额统一为两位小数且不含货币符号。任一字段缺失、冲突或置信度不足时跳过并报告；禁止使用收件日期或其他金额兜底。价税合计低于 `10.00` 元时跳过并报告 `below_minimum`，不要下载或归档；无法在邮件正文可靠确认金额时再读取发票文件。
5. 执行 `scripts/archive_invoice.py`。PDF 输入只传一份；PNG 输入可传多份。
6. 汇总已归档、内容重复、低于最低金额、冲突、日期不明和不支持格式的邮件。不得声称处理未成功写入的文件。

## 写入约束

- 写入前确认归档根目录真实存在且为目录；不存在就立即报错，不自动改用其他位置。
- 使用 SHA-256 对根目录内现有 PDF 判重；内容重复则跳过，不覆盖、不复制。
- 文件名使用 `MMDD-金额¥.pdf`，例如 `0802-244.52¥.pdf`。金额固定保留两位小数。不同内容发生同名时追加内容哈希短后缀。
- 只允许脚本创建目标年月子目录和最终 PDF。禁止覆盖已有文件。
- 任何连接器、日期识别、转换或写入错误都显式报告，不静默兜底。

## 归档脚本

```bash
python3 scripts/archive_invoice.py \
  --root '/Users/zhayingying/Library/Mobile Documents/com~apple~CloudDocs/invoice' \
  --invoice-date 2026-08-04 \
  --amount 244.52 \
  --input '/tmp/attachment.pdf'
```

PNG 合并时重复 `--input`，并保持 Outlook 附件顺序。脚本在标准输出返回一行 JSON；仅以该结果判断 `archived`、`duplicate` 或 `below_minimum`。

## 按目标金额分组

只有当用户明确给出起始月份并说“需要 `<目标金额>` 元的发票”时，才使用 `scripts/batch_invoices.py`。一次指令产生一组按月份衔接的批次。

1. 从用户指定的起始月份开始，按月份先后扫描 `YYYY/MM` 直属规范命名 PDF；不读取已有总额文件夹。
2. 排除低于 `10.00` 元的旧文件。
3. 若当月合格发票总额低于尚未补足的金额，选择当月全部合格发票，并在当月目录创建 `<当月实际总额>¥` 文件夹；下个月继续补剩余金额。
4. 首个能够补足剩余金额的月份，只在该月选择总额不低于剩余金额且数学上最接近的精确组合，不设超额上限；多个组合总额相同时优先日期较早的发票。达到目标后停止，不再处理后续月份。
5. 从起始月份起的全部合格发票总额仍不足目标时，按月选择全部合格发票，并明确报告 `is_sufficient: false`。
6. 必须先运行 `plan` 并向用户报告每月选择清单、每月小计与累计总额；得到本次执行授权后才运行 `apply`。
7. 每个使用到的月份都在自己的 `YYYY/MM` 目录内创建 `<当月实际总额>¥` 文件夹，移动选中的 PDF 并保持原文件名。
8. 每个批次目录用隐藏 manifest 记录原路径和内容哈希；整个多月写入失败必须自动回滚。禁止覆盖已有总额文件夹或 PDF。

```bash
python3 scripts/batch_invoices.py plan \
  --root '/Users/zhayingying/Library/Mobile Documents/com~apple~CloudDocs/invoice' \
  --start-month 2026-07 \
  --target 1000

python3 scripts/batch_invoices.py apply \
  --root '/Users/zhayingying/Library/Mobile Documents/com~apple~CloudDocs/invoice' \
  --start-month 2026-07 \
  --target 1000
```

需要撤销时，对生成的每个月批次执行 `rollback --batch-dir '<归档根目录>/YYYY/MM/<当月实际总额>¥'`。不得把用户举例或规则说明中的月份、金额当作本次执行指令。
