#!/usr/bin/env python3
"""为目标项目生成 doc/testing 标准测试文档结构（testing-init 使用）。

用法:
    python3 scaffold_testing_docs.py <项目根> [--docroot doc/testing] [--force]

行为:
    1. 调用 code_test_probe 探测项目，得到栈画像与命令。
    2. 从 manifest 提取并锁定关键版本。
    3. 创建标准目录结构与控制层文件（JSON + MD）。
    4. 复制自包含脚本到 00-控制层/_scripts，供 testing-run 调用。
    5. 打印生成摘要。

设计为可重复运行：默认不覆盖已存在的叙述类 MD（除非 --force），
但总是刷新机器生成的 JSON（测试画像/指纹/命令清单/报告结构）。
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_DIR = SCRIPT_DIR.parent
TEMPLATES_DIR = SKILL_DIR / "templates"

sys.path.insert(0, str(SCRIPT_DIR))
import code_test_probe  # noqa: E402

DIRS = [
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


def now_iso() -> str:
    return datetime.now(timezone.utc).astimezone().replace(microsecond=0).isoformat()


def sha256_text(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def read_template(name: str) -> str:
    return (TEMPLATES_DIR / name).read_text(encoding="utf-8")


def first_match(pattern: str, text: str) -> str | None:
    m = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
    return m.group(1).strip() if m else None


def extract_versions(root: Path, payload: dict[str, Any]) -> dict[str, Any]:
    versions: dict[str, Any] = {
        "java": None,
        "springBoot": None,
        "node": None,
        "vue": None,
        "mysqlConnector": None,
        "buildTools": {},
    }
    for project in payload.get("projects", []):
        manifest_rel = project.get("manifest")
        if not manifest_rel:
            continue
        manifest = root / manifest_rel
        text = code_test_probe.read_text(manifest)
        name = manifest.name
        if name == "pom.xml":
            versions["buildTools"][manifest_rel] = "maven"
            versions["java"] = versions["java"] or first_match(
                r"<java\.version>([^<]+)</java\.version>", text
            ) or first_match(r"<maven\.compiler\.source>([^<]+)<", text)
            versions["springBoot"] = versions["springBoot"] or first_match(
                r"<spring\.boot\.version>([^<]+)<", text
            ) or first_match(r"spring-boot-starter-parent.*?<version>([^<]+)<", text)
            versions["mysqlConnector"] = versions["mysqlConnector"] or first_match(
                r"mysql-connector-[java]*[^<]*</artifactId>\s*<version>([^<]+)<", text
            )
        elif name in {"build.gradle", "build.gradle.kts"}:
            versions["buildTools"][manifest_rel] = "gradle"
            versions["springBoot"] = versions["springBoot"] or first_match(
                r"org\.springframework\.boot['\"]?\s*version\s*['\"]([^'\"]+)", text
            )
        elif name == "package.json":
            data = code_test_probe.read_json(manifest)
            versions["buildTools"][manifest_rel] = code_test_probe.package_manager(
                root, manifest.parent
            )
            deps = code_test_probe.js_dependency_versions(data)
            versions["vue"] = versions["vue"] or deps.get("vue")
            engines = data.get("engines") or {}
            if isinstance(engines, dict) and engines.get("node"):
                versions["node"] = versions["node"] or str(engines["node"])
    nvmrc = root / ".nvmrc"
    if nvmrc.exists() and not versions["node"]:
        versions["node"] = code_test_probe.read_text(nvmrc).strip() or None
    return versions


def classify_layer(project: dict[str, Any]) -> str | None:
    frameworks = set(project.get("frameworks") or [])
    dbs = set((project.get("databaseSignals") or {}).get("databases", []))
    if "spring-boot" in frameworks:
        return "backend"
    if {"vue", "vue3", "vite-vue", "react", "nuxt"} & frameworks:
        return "frontend"
    if dbs and not frameworks:
        return "database"
    return None


def build_command_list(payload: dict[str, Any]) -> dict[str, Any]:
    projects = payload.get("projects", [])
    backend = next((p for p in projects if classify_layer(p) == "backend"), None)
    frontend = next((p for p in projects if classify_layer(p) == "frontend"), None)
    databases = payload.get("databaseSignals", {}).get("databases", [])

    def layer(project: dict[str, Any] | None, readonly: list[str]) -> dict[str, Any]:
        return {
            "cwd": (project.get("root") if project else ".") or ".",
            "readonly": readonly,
            "smoke": [],
        }

    backend_cmds = list(backend.get("commands")) if backend else []
    frontend_cmds = list(frontend.get("commands")) if frontend else []

    layers: dict[str, Any] = {
        "backend": layer(backend, backend_cmds),
        "database": {
            "cwd": (backend.get("root") if backend else ".") or ".",
            "readonly": [],
            "notes": "只用 test/local profile / Testcontainers / 临时 schema；禁止 DROP/TRUNCATE/全表 DELETE",
        },
        "frontend": layer(frontend, frontend_cmds),
        "api-contract": {
            "cwd": (backend.get("root") if backend else ".") or ".",
            "readonly": [],
            "smoke": ["curl -sS -o /tmp/api-smoke.out -w '%{http_code}' http://localhost:<port>/actuator/health"]
            if backend
            else [],
        },
        "e2e": {
            "cwd": (frontend.get("root") if frontend else ".") or ".",
            "readonly": [c for c in frontend_cmds if "playwright" in c or "e2e" in c],
            "smoke": [],
        },
    }
    if databases and "mysql" not in databases:
        layers["database"]["notes"] += f"（检测到数据库：{', '.join(databases)}）"
    return {"generatedAt": now_iso(), "layers": layers}


def build_profile(root: Path, payload: dict[str, Any]) -> dict[str, Any]:
    stack = payload.get("stackProfile", {})
    modules = []
    for project in payload.get("projects", []):
        layer = classify_layer(project)
        kind_map = {"backend": "backend", "frontend": "frontend", "database": "database"}
        modules.append(
            {
                "name": Path(project.get("root", ".")).name or root.name,
                "root": project.get("root", "."),
                "kind": kind_map.get(layer or "", project.get("kind", "unknown")),
                "layer": layer,
            }
        )
    primary = payload.get("primaryProject") or {}
    return {
        "project": root.name,
        "generatedAt": now_iso(),
        "strategy": payload.get("recommendedStrategy", {}).get("mode", "native-scripts"),
        "stack": {
            "vue3": bool(stack.get("vue3")),
            "springBoot": bool(stack.get("springBoot")),
            "mysql": bool(stack.get("mysql")),
        },
        "modules": modules,
        "layers": ["backend", "database", "frontend", "api-contract", "frontend-backend", "e2e"],
        "primaryProject": primary.get("root", "."),
    }


def build_fingerprint(root: Path, payload: dict[str, Any], versions: dict[str, Any], command_list: dict[str, Any]) -> dict[str, Any]:
    manifests = []
    for project in payload.get("projects", []):
        manifest_rel = project.get("manifest")
        if not manifest_rel:
            continue
        manifest = root / manifest_rel
        text = code_test_probe.read_text(manifest)
        if text:
            manifests.append({"path": manifest_rel, "sha256": sha256_text(text)})
    command_signature = sha256_text(json.dumps(command_list.get("layers", {}), sort_keys=True, ensure_ascii=False))
    return {
        "generatedAt": now_iso(),
        "lockedVersions": versions,
        "manifests": manifests,
        "commandSignature": command_signature,
        "probeSummary": {
            "frameworks": payload.get("frameworks", []),
            "testFrameworks": payload.get("testFrameworks", []),
            "databases": payload.get("databaseSignals", {}).get("databases", []),
            "testFileCount": payload.get("testFileCount", 0),
        },
    }


def report_structure() -> dict[str, Any]:
    return {
        "outputDir": "doc/testing/07-测试报告",
        "pathPattern": "{date}/{time}-{mode}-测试报告.md",
        "sections": ["结论", "执行命令", "失败项", "未运行项", "证据", "下一步"],
    }


def commands_block(command_list: dict[str, Any]) -> str:
    lines: list[str] = []
    for layer, cfg in command_list["layers"].items():
        cmds = cfg.get("readonly") or []
        smoke = cfg.get("smoke") or []
        all_cmds = cmds + [f"[smoke] {c}" for c in smoke]
        cwd = cfg.get("cwd", ".")
        if not all_cmds:
            lines.append(f"- **{layer}**（{cwd}）：暂无锁定命令")
            continue
        lines.append(f"- **{layer}**（{cwd}）：")
        for c in all_cmds:
            lines.append(f"  - `{c}`")
    return "\n".join(lines)


def commands_doc(command_list: dict[str, Any]) -> str:
    blocks: list[str] = []
    for layer, cfg in command_list["layers"].items():
        blocks.append(f"## {layer}\n")
        blocks.append(f"- 工作目录：`{cfg.get('cwd', '.')}`")
        if cfg.get("notes"):
            blocks.append(f"- 说明：{cfg['notes']}")
        ro = cfg.get("readonly") or []
        sm = cfg.get("smoke") or []
        if ro:
            blocks.append("- 只读命令：")
            blocks.extend(f"  - `{c}`" for c in ro)
        if sm:
            blocks.append("- 冒烟命令：")
            blocks.extend(f"  - `{c}`" for c in sm)
        if not ro and not sm:
            blocks.append("- 暂无锁定命令，待补充。")
        blocks.append("")
    return "\n".join(blocks)


def modules_table(profile: dict[str, Any]) -> str:
    rows = ["| 模块 | 路径 | 类型 | 层 |", "|------|------|------|----|"]
    for m in profile["modules"]:
        rows.append(f"| {m['name']} | `{m['root']}` | {m['kind']} | {m.get('layer') or '-'} |")
    return "\n".join(rows)


def stack_line(profile: dict[str, Any]) -> str:
    s = profile["stack"]
    parts = []
    if s["vue3"]:
        parts.append("Vue 3")
    if s["springBoot"]:
        parts.append("Spring Boot")
    if s["mysql"]:
        parts.append("MySQL")
    return " + ".join(parts) if parts else "（按 probe 探测结果）"


def write_if_absent(path: Path, content: str, force: bool) -> str:
    if path.exists() and not force:
        return "skip"
    path.write_text(content, encoding="utf-8")
    return "write"


def write_json(path: Path, data: dict[str, Any]) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def render(template_name: str, mapping: dict[str, str]) -> str:
    text = read_template(template_name)
    for key, value in mapping.items():
        text = text.replace("{{" + key + "}}", value)
    return text


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root")
    parser.add_argument("--docroot", default="doc/testing")
    parser.add_argument("--max-depth", type=int, default=3)
    parser.add_argument("--force", action="store_true", help="覆盖已存在的叙述类 MD")
    args = parser.parse_args()

    root = Path(args.root).expanduser().resolve()
    if not root.exists():
        print(f"项目根不存在: {root}", file=sys.stderr)
        return 1

    docroot = root / args.docroot
    payload = code_test_probe.build_payload(root, args.max_depth)
    versions = extract_versions(root, payload)
    command_list = build_command_list(payload)
    profile = build_profile(root, payload)
    fingerprint = build_fingerprint(root, payload, versions, command_list)

    for d in DIRS:
        (docroot / d).mkdir(parents=True, exist_ok=True)

    control = docroot / "00-控制层"
    write_json(control / "测试画像.json", profile)
    write_json(control / "代码事实指纹.json", fingerprint)
    write_json(control / "命令清单.json", command_list)
    write_json(control / "报告结构.json", report_structure())

    for script in ("code_test_probe.py", "validate_testing_docs.py"):
        src = SCRIPT_DIR / script
        if src.exists():
            shutil.copy2(src, control / "_scripts" / script)

    date = profile["generatedAt"][:10]
    strategy = profile["strategy"]
    stk = stack_line(profile)
    layers_line = " → ".join(profile["layers"])
    cmd_block = commands_block(command_list)

    common = {
        "PROJECT": profile["project"],
        "DATE": date,
        "STRATEGY": strategy,
        "STACK_LINE": stk,
    }

    actions: list[tuple[str, str]] = []

    actions.append(("00-控制层/必读顺序.md",
                    write_if_absent(control / "必读顺序.md", render("必读顺序.md", common), True)))
    actions.append(("00-控制层/测试画像.md",
                    write_if_absent(control / "测试画像.md", render("测试画像.md", {
                        **common,
                        "MODULES_TABLE": modules_table(profile),
                        "LAYERS_LINE": layers_line,
                        "COMMANDS_BLOCK": cmd_block,
                    }), True)))
    actions.append(("08-测试SOP/测试SOP.md",
                    write_if_absent(docroot / "08-测试SOP" / "测试SOP.md", render("08-测试SOP.md", {
                        **common,
                        "STACK_LINE": stk,
                    }), True)))

    dbs = payload.get("databaseSignals", {}).get("databases", []) or ["未检测到"]
    db_tools = payload.get("databaseSignals", {}).get("tools", []) or ["未检测到"]
    backend = next((p for p in payload.get("projects", []) if classify_layer(p) == "backend"), None)
    frontend = next((p for p in payload.get("projects", []) if classify_layer(p) == "frontend"), None)

    narrative = [
        ("01-测试矩阵/测试矩阵.md", "01-测试矩阵.md", {"MATRIX_ROWS": "| 待补充 | | | | | | | |"}),
        ("02-环境配置/环境配置.md", "02-环境配置.md", {
            "BACKEND_RUN": f"`(cd {backend['root']} && mvn spring-boot:run)`" if backend else "待补充",
            "DATABASES": ", ".join(dbs),
            "DB_TOOLS": ", ".join(db_tools),
            "FRONTEND_RUN": f"`(cd {frontend['root']} && pnpm dev)`" if frontend else "待补充",
        }),
        ("03-测试数据/测试数据.md", "03-测试数据.md", {}),
        ("04-测试场景/测试场景.md", "04-测试场景.md", {"SCENARIOS": "- 待 testing-init 读代码后补充"}),
        ("05-流程图谱/流程图谱.md", "05-流程图谱.md", {"FLOWS": "- 待 testing-init 读代码后补充"}),
        ("06-执行命令/执行命令.md", "06-执行命令.md", {"COMMANDS_DOC": commands_doc(command_list)}),
        ("09-历史归档/README.md", "09-历史归档.md", {}),
    ]
    for rel_path, template, extra in narrative:
        target = docroot / rel_path
        actions.append((rel_path, write_if_absent(target, render(template, {**common, **extra}), args.force)))

    print(f"项目: {profile['project']}  策略: {strategy}  栈: {stk}")
    print(f"文档根: {docroot}")
    print("控制层 JSON: 测试画像/代码事实指纹/命令清单/报告结构 已刷新")
    for rel_path, status in actions:
        print(f"  [{status}] {rel_path}")
    print("\n锁定版本:")
    for k, v in versions.items():
        if k == "buildTools":
            print(f"  buildTools: {json.dumps(v, ensure_ascii=False)}")
        else:
            print(f"  {k}: {v}")
    print("\n下一步：用 validate_testing_docs.py 校验结构，再由 testing-init 读代码补充 01/04/05。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
