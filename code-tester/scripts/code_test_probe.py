#!/usr/bin/env python3
"""探测本地代码仓库，并给出测试策略和可运行命令。"""

from __future__ import annotations

import argparse
import json
import os
import re
from pathlib import Path
from typing import Any


MANIFESTS = {
    "package.json",
    "pyproject.toml",
    "requirements.txt",
    "requirements-dev.txt",
    "go.mod",
    "pom.xml",
    "build.gradle",
    "build.gradle.kts",
    "Cargo.toml",
    "composer.json",
    "Gemfile",
}

BASE_IGNORED_DIRS = {
    ".git",
    ".hg",
    ".svn",
    "node_modules",
    "uni_modules",
    "dist",
    "build",
    ".next",
    ".nuxt",
    ".svelte-kit",
    ".venv",
    "venv",
    "__pycache__",
    ".pytest_cache",
    "target",
    "coverage",
    "htmlcov",
    ".idea",
    ".vscode",
}

TEST_FILE_PATTERNS = (
    re.compile(r"(^test_.*|.*_test)\.py$"),
    re.compile(r".*\.(test|spec)\.(js|jsx|ts|tsx|mjs|cjs)$"),
    re.compile(r".*_test\.go$"),
    re.compile(r".*(Test|Tests)\.(java|kt|cs)$"),
    re.compile(r".*(_spec|_test)\.(rb|php|exs)$"),
    re.compile(r".*\.feature$"),
)

API_ROUTE_PATTERNS = {
    "express": re.compile(r"\b(app|router)\.(get|post|put|patch|delete|all)\s*\("),
    "fastapi": re.compile(r"@(app|router)\.(get|post|put|patch|delete)\s*\("),
    "django": re.compile(r"\burlpatterns\b|\b(re_)?path\s*\("),
    "spring-boot": re.compile(
        r"@(RestController|Controller|RequestMapping|GetMapping|PostMapping|PutMapping|PatchMapping|DeleteMapping)\b"
    ),
}

CONFIG_FILE_PATTERNS = (
    re.compile(r"application[-\w]*\.(ya?ml|properties)$"),
    re.compile(r"bootstrap[-\w]*\.(ya?ml|properties)$"),
    re.compile(r"docker-compose[-\w]*\.ya?ml$"),
)

MYSQL_MARKERS = (
    "jdbc:mysql",
    "mysql-connector",
    "com.mysql",
    "mysql:",
    "mysql8",
    "mariadb",
)

DB_TOOL_MARKERS = {
    "flyway": ("flyway",),
    "liquibase": ("liquibase",),
    "testcontainers": ("testcontainers", "mysqlcontainer"),
    "mybatis": ("mybatis", "mybatis-plus"),
    "jpa": ("spring-boot-starter-data-jpa", "hibernate"),
}


def rel(path: Path, root: Path) -> str:
    try:
        value = str(path.relative_to(root))
        return value or "."
    except ValueError:
        return str(path)


def read_text(path: Path, max_bytes: int = 1_000_000) -> str:
    try:
        if path.stat().st_size > max_bytes:
            return ""
        return path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return ""


def read_json(path: Path) -> dict[str, Any]:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return {}


def unique(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if value and value not in seen:
            result.append(value)
            seen.add(value)
    return result


def package_manager(root: Path, project_dir: Path) -> str:
    for name, manager in (
        ("pnpm-lock.yaml", "pnpm"),
        ("yarn.lock", "yarn"),
        ("package-lock.json", "npm"),
        ("bun.lockb", "bun"),
        ("bun.lock", "bun"),
    ):
        if (project_dir / name).exists() or (root / name).exists():
            return manager
    return "npm"


def script_command(manager: str, script: str) -> str:
    if manager == "yarn":
        return f"yarn {script}"
    if manager == "pnpm":
        return "pnpm test" if script == "test" else f"pnpm run {script}"
    if manager == "bun":
        return "bun test" if script == "test" else f"bun run {script}"
    return "npm test" if script == "test" else f"npm run {script}"


def package_commands(root: Path, package_json: Path) -> list[str]:
    data = read_json(package_json)
    scripts = data.get("scripts") or {}
    manager = package_manager(root, package_json.parent)
    preferred = (
        "test",
        "test:unit",
        "unit",
        "test:integration",
        "integration",
        "test:e2e",
        "e2e",
        "test:smoke",
        "smoketest",
        "coverage",
        "test:coverage",
        "lint",
        "typecheck",
        "type:check",
        "ts:check",
        "build",
    )
    commands = [script_command(manager, script) for script in preferred if script in scripts]

    deps = js_dependencies(data)
    if not any("playwright" in command for command in commands) and {
        "@playwright/test",
        "playwright",
    } & deps:
        commands.append("npx playwright test")
    if not any("vitest" in command for command in commands) and "vitest" in deps:
        commands.append("npx vitest run")
    if not any("jest" in command for command in commands) and "jest" in deps:
        commands.append("npx jest")

    return unique(commands)


def js_dependencies(package_data: dict[str, Any]) -> set[str]:
    return set(js_dependency_versions(package_data).keys())


def js_dependency_versions(package_data: dict[str, Any]) -> dict[str, str]:
    versions: dict[str, str] = {}
    for key in ("dependencies", "devDependencies", "peerDependencies", "optionalDependencies"):
        value = package_data.get(key)
        if isinstance(value, dict):
            versions.update({str(name): str(version) for name, version in value.items()})
    return versions


def detect_js_signals(package_data: dict[str, Any]) -> tuple[list[str], list[str]]:
    dependency_versions = js_dependency_versions(package_data)
    deps = set(dependency_versions)
    scripts_text = " ".join((package_data.get("scripts") or {}).values()).lower()
    frameworks: list[str] = []
    tests: list[str] = []
    vue_version = str(dependency_versions.get("vue") or "")

    framework_markers = {
        "next": {"next"},
        "react": {"react"},
        "vue": {"vue", "@vue/runtime-core"},
        "vite-vue": {"@vitejs/plugin-vue"},
        "pinia": {"pinia"},
        "vue-router": {"vue-router"},
        "nuxt": {"nuxt"},
        "svelte": {"svelte"},
        "vite": {"vite"},
        "angular": {"@angular/core"},
        "express": {"express"},
        "fastify": {"fastify"},
        "koa": {"koa"},
        "nestjs": {"@nestjs/core"},
        "msw": {"msw"},
    }
    test_markers = {
        "playwright": {"@playwright/test", "playwright"},
        "cypress": {"cypress"},
        "vitest": {"vitest"},
        "jest": {"jest"},
        "mocha": {"mocha"},
        "testcafe": {"testcafe"},
        "vue-test-utils": {"@vue/test-utils"},
        "testing-library": {"@testing-library/react", "@testing-library/vue", "@testing-library/dom"},
    }

    for name, markers in framework_markers.items():
        if deps & markers or name in scripts_text:
            frameworks.append(name)
    if "vue" in deps and (vue_version.startswith("3") or re.search(r"[\^~>=< ]3\.", vue_version)):
        frameworks.append("vue3")
    for name, markers in test_markers.items():
        if deps & markers or name in scripts_text:
            tests.append(name)

    return sorted(set(frameworks)), sorted(set(tests))


def detect_python_signals(project_dir: Path, manifest: Path) -> tuple[list[str], list[str]]:
    text = read_text(manifest)
    lower = text.lower()
    frameworks: list[str] = []
    tests: list[str] = []

    if "fastapi" in lower or (project_dir / "main.py").exists():
        frameworks.append("fastapi")
    if "django" in lower or (project_dir / "manage.py").exists():
        frameworks.append("django")
    if "flask" in lower:
        frameworks.append("flask")
    if "pytest" in lower or (project_dir / "pytest.ini").exists():
        tests.append("pytest")
    if "unittest" in lower:
        tests.append("unittest")

    return sorted(set(frameworks)), sorted(set(tests))


def is_config_file(path: Path) -> bool:
    return any(pattern.match(path.name) for pattern in CONFIG_FILE_PATTERNS)


def collect_config_text(project_dir: Path, root: Path, max_depth: int = 4) -> tuple[str, list[str]]:
    chunks: list[str] = []
    examples: list[str] = []
    ignored = ignored_dirs(root)
    for current, dirs, files in os.walk(project_dir):
        current_path = Path(current)
        try:
            depth = len(current_path.relative_to(project_dir).parts)
        except ValueError:
            continue
        dirs[:] = [d for d in dirs if d not in ignored and depth < max_depth]
        for file_name in files:
            path = current_path / file_name
            if not is_config_file(path):
                continue
            text = read_text(path, max_bytes=250_000)
            if text:
                chunks.append(text)
                if len(examples) < 8:
                    examples.append(rel(path, root))
    return "\n".join(chunks), examples


def detect_database_signals(project_dir: Path, root: Path, manifest_text: str = "") -> dict[str, Any]:
    config_text, config_examples = collect_config_text(project_dir, root)
    haystack = f"{manifest_text}\n{config_text}".lower()
    databases: list[str] = []
    tools: list[str] = []
    examples: list[str] = []
    unsafe_profile_hints: list[str] = []

    if any(marker in haystack for marker in MYSQL_MARKERS):
        databases.append("mysql")
    for tool, markers in DB_TOOL_MARKERS.items():
        if any(marker in haystack for marker in markers):
            tools.append(tool)
    if config_examples:
        examples.extend(config_examples)
    if re.search(r"\b(prod|production)\b", haystack) and "spring.datasource" in haystack:
        unsafe_profile_hints.append("production-like datasource config detected")
    if re.search(r"(jdbc:mysql://)(?!localhost|127\.0\.0\.1)", haystack):
        unsafe_profile_hints.append("mysql datasource may point outside localhost")

    return {
        "databases": sorted(set(databases)),
        "tools": sorted(set(tools)),
        "examples": examples[:8],
        "unsafeProfileHints": unsafe_profile_hints,
    }


def detect_java_signals(project_dir: Path, root: Path, manifest: Path) -> tuple[list[str], list[str], dict[str, Any]]:
    manifest_text = read_text(manifest)
    lower = manifest_text.lower()
    frameworks: list[str] = []
    tests: list[str] = []

    if "spring-boot" in lower or (project_dir / "src/main").exists() and "springframework" in lower:
        frameworks.append("spring-boot")
    if "spring-boot-starter-web" in lower:
        frameworks.append("spring-web")
    if "spring-boot-starter-security" in lower:
        frameworks.append("spring-security")
    if "mybatis" in lower:
        frameworks.append("mybatis")
    if "spring-boot-starter-data-jpa" in lower or "hibernate" in lower:
        frameworks.append("jpa")

    if "spring-boot-starter-test" in lower:
        tests.append("spring-boot-test")
    if "junit" in lower or "spring-boot-starter-test" in lower:
        tests.append("junit")
    if "mockito" in lower:
        tests.append("mockito")
    if "testcontainers" in lower:
        tests.append("testcontainers")

    return sorted(set(frameworks)), sorted(set(tests)), detect_database_signals(project_dir, root, manifest_text)


def ignored_dirs(root: Path) -> set[str]:
    ignored = set(BASE_IGNORED_DIRS)
    if root.name == ".cursor":
        ignored.add("extensions")
    return ignored


def should_descend(current: Path, root: Path, max_depth: int) -> bool:
    return len(current.relative_to(root).parts) < max_depth


def find_manifests(root: Path, max_depth: int) -> list[Path]:
    results: list[Path] = []
    ignored = ignored_dirs(root)
    for current, dirs, files in os.walk(root):
        current_path = Path(current)
        dirs[:] = [d for d in dirs if d not in ignored and should_descend(current_path, root, max_depth)]
        for file_name in files:
            if file_name in MANIFESTS:
                results.append(current_path / file_name)
    return sorted(results)


def count_test_files(project_dir: Path, root: Path, max_depth: int = 6) -> tuple[int, list[str]]:
    count = 0
    examples: list[str] = []
    ignored = ignored_dirs(root)
    for current, dirs, files in os.walk(project_dir):
        current_path = Path(current)
        try:
            depth = len(current_path.relative_to(project_dir).parts)
        except ValueError:
            continue
        dirs[:] = [d for d in dirs if d not in ignored and depth < max_depth]
        for file_name in files:
            if any(pattern.match(file_name) for pattern in TEST_FILE_PATTERNS):
                count += 1
                if len(examples) < 8:
                    examples.append(rel(current_path / file_name, root))
    return count, examples


def find_coverage_reports(project_dir: Path, root: Path) -> list[str]:
    candidates = [
        "coverage/lcov.info",
        "lcov.info",
        "coverage/coverage-final.json",
        "coverage/coverage-summary.json",
        "coverage.xml",
        "htmlcov/index.html",
        "target/site/jacoco/jacoco.xml",
    ]
    return [rel(project_dir / candidate, root) for candidate in candidates if (project_dir / candidate).exists()]


def detect_api_signals(project_dir: Path, root: Path, max_depth: int = 5) -> dict[str, Any]:
    signals: dict[str, Any] = {
        "count": 0,
        "kinds": [],
        "examples": [],
    }
    kinds: set[str] = set()
    ignored = ignored_dirs(root)

    for current, dirs, files in os.walk(project_dir):
        current_path = Path(current)
        try:
            depth = len(current_path.relative_to(project_dir).parts)
        except ValueError:
            continue
        dirs[:] = [d for d in dirs if d not in ignored and depth < max_depth]
        parts = current_path.relative_to(project_dir).parts

        for file_name in files:
            path = current_path / file_name
            suffix = path.suffix.lower()
            rel_path = rel(path, root)
            matched_kind = ""

            if "app" in parts and "api" in parts and file_name in {"route.ts", "route.js", "route.tsx", "route.jsx"}:
                matched_kind = "next-app-api"
            elif len(parts) >= 2 and parts[0] == "pages" and parts[1] == "api" and suffix in {".ts", ".js", ".tsx", ".jsx"}:
                matched_kind = "next-pages-api"
            elif rel_path.endswith("config/routes.rb"):
                matched_kind = "rails"
            elif suffix in {".js", ".ts", ".mjs", ".cjs", ".py", ".rb", ".java", ".kt"}:
                text = read_text(path, max_bytes=250_000)
                if suffix in {".js", ".ts", ".mjs", ".cjs"}:
                    allowed_kinds = ("express",)
                elif suffix == ".py":
                    allowed_kinds = ("fastapi", "django")
                elif suffix == ".rb":
                    allowed_kinds = ("rails",)
                elif suffix in {".java", ".kt"}:
                    allowed_kinds = ("spring-boot",)
                else:
                    allowed_kinds = tuple(API_ROUTE_PATTERNS)
                for kind in allowed_kinds:
                    pattern = API_ROUTE_PATTERNS[kind]
                    if pattern.search(text):
                        matched_kind = kind
                        break

            if matched_kind:
                signals["count"] += 1
                kinds.add(matched_kind)
                if len(signals["examples"]) < 8:
                    signals["examples"].append(rel_path)

    signals["kinds"] = sorted(kinds)
    return signals


def detect_static_html(root: Path) -> dict[str, Any]:
    candidates = [root / "index.html", *sorted(root.glob("*/index.html"))[:8]]
    paths = [rel(path, root) for path in candidates if path.exists()]
    return {
        "present": bool(paths),
        "examples": paths[:8],
    }


def detect_project(root: Path, manifest: Path) -> dict[str, Any]:
    name = manifest.name
    project_dir = manifest.parent
    test_count, test_examples = count_test_files(project_dir, root)
    info: dict[str, Any] = {
        "root": rel(project_dir, root),
        "manifest": rel(manifest, root),
        "kind": "unknown",
        "commands": [],
        "frameworks": [],
        "testFrameworks": [],
        "testFileCount": test_count,
        "testFileExamples": test_examples,
        "coverageReports": find_coverage_reports(project_dir, root),
        "apiSignals": detect_api_signals(project_dir, root),
        "databaseSignals": {"databases": [], "tools": [], "examples": [], "unsafeProfileHints": []},
    }

    if name == "package.json":
        data = read_json(manifest)
        frameworks, test_frameworks = detect_js_signals(data)
        info.update(
            {
                "kind": "javascript",
                "packageName": data.get("name"),
                "packageManager": package_manager(root, project_dir),
                "scripts": sorted((data.get("scripts") or {}).keys()),
                "commands": package_commands(root, manifest),
                "frameworks": frameworks,
                "testFrameworks": test_frameworks,
            }
        )
    elif name in {"pyproject.toml", "requirements.txt", "requirements-dev.txt"}:
        frameworks, test_frameworks = detect_python_signals(project_dir, manifest)
        info["kind"] = "python"
        info["commands"] = ["pytest"] if "pytest" in test_frameworks or test_count else ["python -m unittest"]
        info["frameworks"] = frameworks
        info["testFrameworks"] = test_frameworks or (["pytest"] if test_count else [])
    elif name == "go.mod":
        info["kind"] = "go"
        info["commands"] = ["go test ./..."]
        info["testFrameworks"] = ["go-test"] if test_count else []
    elif name == "pom.xml":
        frameworks, test_frameworks, database_signals = detect_java_signals(project_dir, root, manifest)
        info["kind"] = "java-maven"
        info["commands"] = ["mvn test"]
        info["frameworks"] = frameworks
        info["testFrameworks"] = test_frameworks or (["junit"] if test_count else [])
        info["databaseSignals"] = database_signals
    elif name in {"build.gradle", "build.gradle.kts"}:
        frameworks, test_frameworks, database_signals = detect_java_signals(project_dir, root, manifest)
        info["kind"] = "java-gradle"
        info["commands"] = ["./gradlew test" if (project_dir / "gradlew").exists() else "gradle test"]
        info["frameworks"] = frameworks
        info["testFrameworks"] = test_frameworks or (["junit"] if test_count else [])
        info["databaseSignals"] = database_signals
    elif name == "Cargo.toml":
        info["kind"] = "rust"
        info["commands"] = ["cargo test"]
        info["testFrameworks"] = ["cargo-test"] if test_count else []
    elif name == "composer.json":
        data = read_json(manifest)
        scripts = data.get("scripts") or {}
        info["kind"] = "php"
        info["commands"] = ["composer test"] if "test" in scripts else ["vendor/bin/phpunit"]
        info["testFrameworks"] = ["phpunit"] if test_count else []
    elif name == "Gemfile":
        info["kind"] = "ruby"
        info["commands"] = ["bundle exec rake test", "bundle exec rspec"]
        info["testFrameworks"] = ["minitest", "rspec"] if test_count else []

    return info


def project_score(project: dict[str, Any]) -> int:
    root_value = project.get("root") or "."
    depth = 0 if root_value == "." else len(Path(root_value).parts)
    score = max(0, 20 - depth * 3)
    score += min(len(project.get("commands", [])), 6) * 3
    score += min(int(project.get("testFileCount") or 0), 20)
    score += len(project.get("testFrameworks") or []) * 6
    score += len(project.get("frameworks") or []) * 2
    score += min((project.get("apiSignals") or {}).get("count", 0), 5)
    score += len((project.get("databaseSignals") or {}).get("databases", [])) * 4
    if "spring-boot" in set(project.get("frameworks") or []):
        score += 6
    if "vue3" in set(project.get("frameworks") or []):
        score += 6
    if any("test" in command for command in project.get("commands", [])):
        score += 8
    return score


def choose_primary_project(projects: list[dict[str, Any]]) -> dict[str, Any] | None:
    if not projects:
        return None
    return sorted(projects, key=project_score, reverse=True)[0]


def build_stack_profile(projects: list[dict[str, Any]]) -> dict[str, Any]:
    frontend_projects: list[str] = []
    backend_projects: list[str] = []
    database_projects: list[str] = []
    frameworks = {item for project in projects for item in project.get("frameworks", [])}
    test_frameworks = {item for project in projects for item in project.get("testFrameworks", [])}
    databases = {
        item
        for project in projects
        for item in (project.get("databaseSignals") or {}).get("databases", [])
    }
    db_tools = {
        item
        for project in projects
        for item in (project.get("databaseSignals") or {}).get("tools", [])
    }

    for project in projects:
        project_frameworks = set(project.get("frameworks") or [])
        project_databases = set((project.get("databaseSignals") or {}).get("databases", []))
        if {"vue", "vue3", "vite-vue"} & project_frameworks:
            frontend_projects.append(project["root"])
        if "spring-boot" in project_frameworks:
            backend_projects.append(project["root"])
        if project_databases:
            database_projects.append(project["root"])

    return {
        "vue3": "vue3" in frameworks,
        "springBoot": "spring-boot" in frameworks,
        "mysql": "mysql" in databases,
        "frontendProjects": frontend_projects,
        "backendProjects": backend_projects,
        "databaseProjects": database_projects,
        "frameworks": sorted(frameworks),
        "testFrameworks": sorted(test_frameworks),
        "databases": sorted(databases),
        "databaseTools": sorted(db_tools),
        "fullStackVueSpringBootMysql": bool("vue3" in frameworks and "spring-boot" in frameworks and "mysql" in databases),
    }


def aggregate_commands(projects: list[dict[str, Any]]) -> list[str]:
    commands: list[str] = []
    selected: list[dict[str, Any]] = []
    sorted_projects = sorted(projects, key=lambda project: len(Path(project.get("root") or ".").parts))
    for project in sorted_projects:
        root_value = project.get("root") or "."
        kind = project.get("kind")
        nested_same_kind = False
        for chosen in selected:
            chosen_root = chosen.get("root") or "."
            if kind != chosen.get("kind") or root_value == chosen_root:
                continue
            if chosen_root == "." or root_value.startswith(f"{chosen_root}/"):
                nested_same_kind = True
                break
        if nested_same_kind:
            continue
        selected.append(project)

    for project in selected:
        root_value = project.get("root") or "."
        for command in project.get("commands") or []:
            commands.append(command if root_value == "." else f"(cd {root_value} && {command})")
    return unique(commands)


def recommend_strategy(payload: dict[str, Any]) -> dict[str, Any]:
    primary = payload.get("primaryProject")
    static_html = payload.get("staticHtml", {})
    projects = payload.get("projects") or []
    stack_profile = payload.get("stackProfile") or {}
    if not primary:
        if static_html.get("present"):
            return {
                "mode": "cursor-browser-smoke",
                "reason": "Found static HTML and no project manifest.",
                "commands": [],
                "referenceFiles": [],
            }
        return {
            "mode": "native-scripts",
            "reason": "No supported project manifest found.",
            "commands": [],
            "referenceFiles": [],
        }

    commands = primary.get("commands") or []
    frameworks = set(primary.get("frameworks") or [])
    test_frameworks = set(primary.get("testFrameworks") or [])
    api_count = (primary.get("apiSignals") or {}).get("count", 0)
    test_count = int(primary.get("testFileCount") or 0)
    scripts = set(primary.get("scripts") or [])
    databases = set((primary.get("databaseSignals") or {}).get("databases", []))

    if stack_profile.get("fullStackVueSpringBootMysql"):
        return {
            "mode": "full-stack-vue3-springboot-mysql",
            "reason": "Vue 3 frontend, Spring Boot backend, and MySQL database signals detected.",
            "commands": aggregate_commands(projects),
            "referenceFiles": [
                "references/full-stack-vue3-springboot-mysql.md",
                "references/vue3-testing.md",
                "references/springboot-testing.md",
                "references/mysql-testing.md",
                "references/api-smoke-testing.md",
                "references/playwright-conventions.md",
                "references/test-report-archive.md",
            ],
        }

    if "vue3" in frameworks:
        return {
            "mode": "vue3-unit-component",
            "reason": "Vue 3 project detected; run existing unit/component checks before browser or E2E expansion.",
            "commands": commands,
            "referenceFiles": [
                "references/vue3-testing.md",
                "references/playwright-conventions.md",
                "references/test-report-archive.md",
            ],
        }

    if "spring-boot" in frameworks and "mysql" in databases:
        return {
            "mode": "springboot-mysql-test",
            "reason": "Spring Boot project with MySQL signals detected; prioritize JUnit/MockMvc plus safe DB integration checks.",
            "commands": commands,
            "referenceFiles": [
                "references/springboot-testing.md",
                "references/mysql-testing.md",
                "references/api-smoke-testing.md",
                "references/test-report-archive.md",
            ],
        }

    if "spring-boot" in frameworks:
        return {
            "mode": "springboot-test",
            "reason": "Spring Boot project detected; prioritize Maven/Gradle tests and MockMvc/API smoke.",
            "commands": commands,
            "referenceFiles": [
                "references/springboot-testing.md",
                "references/api-smoke-testing.md",
                "references/test-report-archive.md",
            ],
        }

    if "playwright" in test_frameworks or any("playwright" in command for command in commands) or {"test:e2e", "e2e"} & scripts:
        return {
            "mode": "playwright-e2e",
            "reason": "Playwright or E2E scripts detected.",
            "commands": commands,
            "referenceFiles": ["references/playwright-conventions.md", "references/test-report-archive.md"],
        }

    if test_count or any("test" in command for command in commands):
        return {
            "mode": "unit-integration",
            "reason": "Existing test files or test commands detected.",
            "commands": commands,
            "referenceFiles": ["references/unit-test-patterns.md", "references/test-report-archive.md"],
        }

    if api_count:
        return {
            "mode": "api-smoke",
            "reason": "API route signals detected but no existing tests were found.",
            "commands": commands,
            "referenceFiles": ["references/api-smoke-testing.md", "references/test-report-archive.md"],
        }

    web_frameworks = {"next", "react", "vue", "nuxt", "svelte", "vite", "angular"}
    if frameworks & web_frameworks or static_html.get("present"):
        return {
            "mode": "scaffold-or-browser",
            "reason": "Web project detected without an existing test suite.",
            "commands": commands,
            "referenceFiles": ["references/playwright-conventions.md", "references/test-report-archive.md"],
        }

    if primary.get("kind") in {"python", "go", "java-maven", "java-gradle", "rust", "php", "ruby", "javascript"}:
        return {
            "mode": "write-focused-tests",
            "reason": "Known project type detected, but existing tests are shallow or absent.",
            "commands": commands,
            "referenceFiles": ["references/unit-test-patterns.md", "references/test-report-archive.md"],
        }

    return {
        "mode": "native-scripts",
        "reason": "Falling back to manifest-provided commands.",
        "commands": commands,
        "referenceFiles": [],
    }


def build_payload(root: Path, max_depth: int) -> dict[str, Any]:
    manifests = find_manifests(root, max_depth)
    projects = [detect_project(root, manifest) for manifest in manifests]
    primary = choose_primary_project(projects)
    stack_profile = build_stack_profile(projects)
    payload: dict[str, Any] = {
        "root": str(root),
        "manifestCount": len(manifests),
        "projects": projects,
        "primaryProject": primary,
        "frameworks": sorted({item for project in projects for item in project.get("frameworks", [])}),
        "testFrameworks": sorted({item for project in projects for item in project.get("testFrameworks", [])}),
        "testFileCount": sum(int(project.get("testFileCount") or 0) for project in projects),
        "coverageReports": unique([item for project in projects for item in project.get("coverageReports", [])]),
        "databaseSignals": {
            "databases": stack_profile["databases"],
            "tools": stack_profile["databaseTools"],
            "projects": stack_profile["databaseProjects"],
        },
        "stackProfile": stack_profile,
        "staticHtml": detect_static_html(root),
    }
    payload["recommendedStrategy"] = recommend_strategy(payload)
    return payload


def print_human(payload: dict[str, Any]) -> None:
    print(f"根目录: {payload['root']}")
    strategy = payload["recommendedStrategy"]
    print(f"推荐策略: {strategy['mode']} - {strategy['reason']}")
    stack_profile = payload.get("stackProfile") or {}
    if stack_profile:
        print(
            "栈画像: "
            f"Vue3={stack_profile.get('vue3')}, "
            f"SpringBoot={stack_profile.get('springBoot')}, "
            f"MySQL={stack_profile.get('mysql')}"
        )
    primary = payload.get("primaryProject")
    if primary:
        print(f"主要项目: {primary['root']} ({primary['kind']}, {primary['manifest']})")
        for command in primary.get("commands", []):
            print(f"  命令: {command}")
    for project in payload["projects"]:
        print(f"- {project['kind']} 项目: {project['root']} ({project['manifest']})")
        if project.get("frameworks"):
            print(f"  框架: {', '.join(project['frameworks'])}")
        if project.get("testFrameworks"):
            print(f"  测试框架: {', '.join(project['testFrameworks'])}")
        print(f"  测试文件: {project.get('testFileCount', 0)}")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("root", nargs="?", default=".", help="要检查的项目根目录")
    parser.add_argument("--max-depth", type=int, default=3)
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()

    root = Path(args.root).expanduser().resolve()
    payload = build_payload(root, args.max_depth)

    if args.json:
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    else:
        print_human(payload)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
