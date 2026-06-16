import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function exists(file) {
  return fs.existsSync(path.join(root, file));
}

const showroomHtml = read("showroom/report.html");
const showroomJs = read("showroom/scripts/full-exemplar.js");
const reportCss = read("engines/token-report/styles/report.css");
const themesDir = path.join(root, "engines/token-report/styles/themes");
const manifest = read("showroom/scripts/theme-manifest.js");
const openaiAgent = read("agents/openai.yaml");

const canvasIds = [...showroomHtml.matchAll(/<canvas\s+[^>]*id="([^"]+)"/g)].map((m) => m[1]).sort();
const domIds = [...showroomHtml.matchAll(/id="([^"]+)"/g)].map((m) => m[1]).sort();
const jsRefs = [...showroomJs.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map((m) => m[1]).sort();

const missingCanvasInit = canvasIds.filter((id) => !jsRefs.includes(id));
const missingDomIds = jsRefs.filter((id) => !domIds.includes(id));

const window = {};
new Function("window", manifest)(window);
const manifestThemes = window.REPORT_THEMES || [];
const manifestSlugs = manifestThemes.map((theme) => theme.slug).sort();
const themeFiles = fs.readdirSync(themesDir).filter((file) => file.endsWith(".css")).sort();
const themeSlugs = themeFiles.map((file) => file.replace(/\.css$/, "")).sort();
const missingThemeFiles = manifestSlugs.filter((slug) => !themeSlugs.includes(slug));
const orphanThemeFiles = themeSlugs.filter((slug) => !manifestSlugs.includes(slug));

const rootMatch = reportCss.match(/:root\s*\{([\s\S]*?)\n\s*\}/);
const requiredThemeTokens = [...new Set([...(rootMatch?.[1] || "").matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((match) => match[1]))].sort();
const missingThemeTokens = themeFiles
  .map((file) => {
    const css = fs.readFileSync(path.join(themesDir, file), "utf8");
    const missing = requiredThemeTokens.filter((token) => !new RegExp(`${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:`).test(css));
    return { file, missing };
  })
  .filter((entry) => entry.missing.length);

const grammarMissing = manifestSlugs.filter((slug) => !exists(`references/style-grammar/${slug}.md`));

const requiredReferenceDocs = [
  "references/workflow.md",
  "references/workspace-contract.md",
  "references/output-package.md",
  "references/report-contract.md",
  "references/theme-selection.md",
  "references/theme-contract.md",
  "references/quality-checklist.md",
];
const missingReferenceDocs = requiredReferenceDocs.filter((file) => !exists(file));

const requiredOpenaiAgentFields = [
  "display_name",
  "short_description",
  "default_prompt",
];
const missingOpenaiAgentFields = requiredOpenaiAgentFields.filter(
  (field) => !new RegExp(`\\b${field}\\s*:`).test(openaiAgent),
);

const moduleRoot = path.join(root, "viz-modules/token-report");
const moduleDirs = fs.readdirSync(moduleRoot)
  .filter((name) => fs.statSync(path.join(moduleRoot, name)).isDirectory())
  .sort();
const invalidModules = moduleDirs
  .map((name) => {
    const dir = path.join(moduleRoot, name);
    const missing = ["README.md", "section.html"].filter((file) => !fs.existsSync(path.join(dir, file)));
    return { name, missing };
  })
  .filter((entry) => entry.missing.length);

const result = {
  showroomCanvasCount: canvasIds.length,
  showroomGetElementByIdRefs: jsRefs.length,
  missingCanvasInit,
  missingDomIds,
  manifestThemeCount: manifestThemes.length,
  themeFileCount: themeFiles.length,
  missingThemeFiles,
  orphanThemeFiles,
  requiredThemeTokenCount: requiredThemeTokens.length,
  missingThemeTokens,
  grammarMissing,
  missingReferenceDocs,
  missingOpenaiAgentFields,
  tokenReportModuleCount: moduleDirs.length,
  invalidModules,
};

console.log(JSON.stringify(result, null, 2));

if (
  missingCanvasInit.length ||
  missingDomIds.length ||
  missingThemeFiles.length ||
  orphanThemeFiles.length ||
  missingThemeTokens.length ||
  grammarMissing.length ||
  missingReferenceDocs.length ||
  missingOpenaiAgentFields.length ||
  invalidModules.length
) {
  process.exitCode = 1;
}
