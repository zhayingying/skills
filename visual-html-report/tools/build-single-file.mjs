import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const args = new Map();
for (let i = 2; i < process.argv.length; i += 2) {
  args.set(process.argv[i], process.argv[i + 1]);
}

const input = path.resolve(root, args.get("--input") || "showroom/report.html");
const output = path.resolve(root, args.get("--out") || "dist/report.bundled.html");
const theme = args.get("--theme");
const inputDir = path.dirname(input);

let html = fs.readFileSync(input, "utf8");

if (theme) {
  html = html.replace(
    /(<link[^>]*id="report-theme"[^>]*href=")([^"]+)("[^>]*>)/,
    (all, before, href, after) => {
      const next = href.replace(/[^/]+\.css$/, `${theme}.css`);
      return `${before}${next}${after}`;
    },
  );
}

function resolveLocal(ref) {
  if (/^(https?:)?\/\//.test(ref) || ref.startsWith("data:")) return null;
  return path.resolve(inputDir, ref);
}

html = html.replace(/<link([^>]*?)rel="stylesheet"([^>]*?)href="([^"]+)"([^>]*?)>/g, (all, a, b, href) => {
  const file = resolveLocal(href);
  if (!file || !fs.existsSync(file)) return all;
  const css = fs.readFileSync(file, "utf8");
  return `<style data-source="${href}">\n${css}\n</style>`;
});

html = html.replace(/<script([^>]*?)src="([^"]+)"([^>]*)><\/script>/g, (all, a, src) => {
  const file = resolveLocal(src);
  if (!file || !fs.existsSync(file)) return all;
  const js = fs.readFileSync(file, "utf8");
  return `<script data-source="${src}">\n${js}\n</script>`;
});

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, html);
console.log(output);
