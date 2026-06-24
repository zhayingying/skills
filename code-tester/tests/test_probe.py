from __future__ import annotations

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


MODULE_PATH = Path(__file__).resolve().parents[1] / "scripts" / "code_test_probe.py"
SPEC = importlib.util.spec_from_file_location("code_test_probe", MODULE_PATH)
assert SPEC and SPEC.loader
probe = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(probe)


class ProbeStrategyTest(unittest.TestCase):
    def test_detects_vue3_springboot_mysql_stack(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            frontend = root / "frontend"
            backend = root / "backend"
            frontend.mkdir()
            (backend / "src/main/java/com/example").mkdir(parents=True)
            (backend / "src/test/java/com/example").mkdir(parents=True)
            (backend / "src/main/resources").mkdir(parents=True)

            (frontend / "package.json").write_text(
                json.dumps(
                    {
                        "scripts": {
                            "test:unit": "vitest run",
                            "lint": "eslint .",
                            "typecheck": "vue-tsc --noEmit",
                            "build": "vite build",
                        },
                        "dependencies": {
                            "vue": "^3.5.0",
                            "pinia": "^2.0.0",
                            "vue-router": "^4.0.0",
                        },
                        "devDependencies": {
                            "vite": "^5.0.0",
                            "@vitejs/plugin-vue": "^5.0.0",
                            "vitest": "^1.0.0",
                            "@vue/test-utils": "^2.0.0",
                        },
                    }
                ),
                encoding="utf-8",
            )
            (backend / "pom.xml").write_text(
                """
<project>
  <dependencies>
    <dependency><artifactId>spring-boot-starter-web</artifactId></dependency>
    <dependency><artifactId>spring-boot-starter-test</artifactId></dependency>
    <dependency><artifactId>mysql-connector-j</artifactId></dependency>
    <dependency><artifactId>testcontainers</artifactId></dependency>
    <dependency><artifactId>mybatis-plus-boot-starter</artifactId></dependency>
  </dependencies>
</project>
""",
                encoding="utf-8",
            )
            (backend / "src/main/resources/application-test.yml").write_text(
                "spring:\n  datasource:\n    url: jdbc:mysql://localhost:3306/app_test\n",
                encoding="utf-8",
            )
            (backend / "src/main/java/com/example/UserController.java").write_text(
                """
package com.example;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
@RestController
class UserController {
  @GetMapping("/users")
  String users() { return "ok"; }
}
""",
                encoding="utf-8",
            )
            (backend / "src/test/java/com/example/UserControllerTest.java").write_text(
                "package com.example; class UserControllerTest {}\n",
                encoding="utf-8",
            )

            payload = probe.build_payload(root, max_depth=5)

        self.assertEqual(payload["recommendedStrategy"]["mode"], "full-stack-vue3-springboot-mysql")
        self.assertTrue(payload["stackProfile"]["vue3"])
        self.assertTrue(payload["stackProfile"]["springBoot"])
        self.assertTrue(payload["stackProfile"]["mysql"])
        self.assertIn("references/mysql-testing.md", payload["recommendedStrategy"]["referenceFiles"])

    def test_detects_springboot_mysql_without_frontend(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "src/main/resources").mkdir(parents=True)
            (root / "pom.xml").write_text(
                """
<project>
  <dependencies>
    <dependency><artifactId>spring-boot-starter-web</artifactId></dependency>
    <dependency><artifactId>spring-boot-starter-test</artifactId></dependency>
    <dependency><artifactId>mysql-connector-j</artifactId></dependency>
  </dependencies>
</project>
""",
                encoding="utf-8",
            )
            (root / "src/main/resources/application-local.properties").write_text(
                "spring.datasource.url=jdbc:mysql://127.0.0.1:3306/app_test\n",
                encoding="utf-8",
            )

            payload = probe.build_payload(root, max_depth=4)

        self.assertEqual(payload["recommendedStrategy"]["mode"], "springboot-mysql-test")
        self.assertTrue(payload["stackProfile"]["springBoot"])
        self.assertTrue(payload["stackProfile"]["mysql"])

    def test_detects_vue3_project(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "src/router").mkdir(parents=True)
            (root / "package.json").write_text(
                json.dumps({"dependencies": {"vue": "3.4.0"}, "devDependencies": {"vite": "^5.0.0"}}),
                encoding="utf-8",
            )
            (root / "src/router/index.ts").write_text(
                "export const routes = [{ path: '/home', component: {} }];\n",
                encoding="utf-8",
            )

            payload = probe.build_payload(root, max_depth=3)

        self.assertEqual(payload["recommendedStrategy"]["mode"], "vue3-unit-component")
        self.assertTrue(payload["stackProfile"]["vue3"])
        self.assertEqual(payload["primaryProject"]["apiSignals"]["count"], 0)


if __name__ == "__main__":
    unittest.main()
