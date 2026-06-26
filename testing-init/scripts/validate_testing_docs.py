#!/usr/bin/env python3
"""校验 doc/testing 标准结构完整性，并可选检测代码事实漂移。

用法:
    python3 validate_testing_docs.py <项目根> [--docroot doc/testing] [--check-drift]

退出码:
    0  结构完整（--check-drift 时若漂移仍返回 0，但会打印 DRIFT）
    2  结构缺失或 JSON 非法

仅依赖标准库，放进 doc/testing/00-控制层/_scripts 后可独立运行（供 testing-run 调用）。
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path

REQUIRED_DIRS = [
    "00-控制层",
    "00-控制层/_scripts",
    "01-测试矩阵",
    "02-环境配置",
    "03-测试数据",
    "04-测试场景",
    "05-流程图谱",
    "06-执行命令",
    "07-测试报告",
    "08-测试SOP",
    "09-历史归档",
]

REQUIRED_CONTROL_FILES = [
    "00-控制层/必读顺序.md",
    "00-控制层/测试画像.md",
    "00-控制层/测试画像.json",
    "00-控制层/代码事实指纹.json",
    "00-控制层/命令清单.json",
    "00-控制层/报告结构.json",
]

JSON_FILES = [
    "00-控制层/测试画像.json",
    "00-控制层/代码事实指纹.json",
    "00-控制层/命令清单.json",
    "00-控制层/报告结构.json",
]


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def check_structure(docroot: Path) -> list[str]:
    issues: list[str] = []
    if not docroot.exists():
        return [f"文档根不存在: {docroot}"]
    for d in REQUIRED_DIRS:
        if not (docroot / d).is_dir():
            issues.append(f"缺目录: {d}")
    for f in REQUIRED_CONTROL_FILES:
        if not (docroot / f).is_file():
            issues.append(f"缺文件: {f}")
    for f in JSON_FILES:
        path = docroot / f
        if path.is_file():
            try:
                json.loads(path.read_text(encoding="utf-8"))
            except Exception as exc:  # noqa: BLE001
                issues.append(f"JSON 非法: {f} ({exc})")
    return issues


def check_drift(root: Path, docroot: Path) -> list[str]:
    fp_path = docroot / "00-控制层" / "代码事实指纹.json"
    try:
        fp = json.loads(fp_path.read_text(encoding="utf-8"))
    except Exception as exc:  # noqa: BLE001
        return [f"无法读取指纹: {exc}"]
    drift: list[str] = []
    for entry in fp.get("manifests", []):
        rel = entry.get("path")
        stored = entry.get("sha256")
        if not rel:
            continue
        manifest = root / rel
        if not manifest.is_file():
            drift.append(f"manifest 已删除: {rel}")
            continue
        current = sha256_text(manifest.read_text(encoding="utf-8", errors="replace"))
        if current != stored:
            drift.append(f"manifest 变化: {rel}")
    return drift


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root")
    parser.add_argument("--docroot", default="doc/testing")
    parser.add_argument("--check-drift", action="store_true")
    args = parser.parse_args()

    root = Path(args.root).expanduser().resolve()
    docroot = root / args.docroot

    issues = check_structure(docroot)
    if issues:
        print("STRUCTURE: FAIL")
        for i in issues:
            print(f"  - {i}")
        print("建议：重跑 testing-init（scaffold_testing_docs.py）。")
        return 2
    print("STRUCTURE: OK")

    if args.check_drift:
        drift = check_drift(root, docroot)
        if drift:
            print("DRIFT: YES")
            for d in drift:
                print(f"  - {d}")
            print("建议：代码事实已变，重跑 testing-init 刷新画像/指纹/命令清单。")
        else:
            print("DRIFT: NO")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
