/* 示例片段来自 showroom/scripts/full-exemplar.js。
   使用时复制到 report.js 的 window.ReportTheme.ready(() => { ... }) 内。
   必须把示例数据替换为当前报告的内容契约。 */

// ============ §26 华夫格图 ============
(function() {
  const grid = document.getElementById('waffleGrid');
  // 100 cells filled in this order: claude 38, codex 25, opencode 14, gemini 9, cline 7, other 5, goose 2
  const dist = [
    {cls: 'w-bigtech', n: 38},
    {cls: 'cust', n: 25, color: COLORS.bigtech},
    {cls: 'w-indie', n: 14},
    {cls: 'cust', n: 9, color: window.ReportTheme.alpha("--indigo", 0.7)},
    {cls: 'cust', n: 7, color: window.ReportTheme.alpha("--forest", 0.7)},
    {cls: 'cust', n: 5, color: window.ReportTheme.alpha("--forest", 0.45)},
    {cls: 'w-fdn', n: 2}
  ];
  
  let html = '';
  let count = 0;
  dist.forEach(d => {
    for (let i = 0; i < d.n; i++) {
      if (d.cls === 'cust') {
        html += `<div class="waffle-cell" style="background:${d.color}"></div>`;
      } else {
        html += `<div class="waffle-cell ${d.cls}"></div>`;
      }
      count++;
    }
  });
  // 补齐剩余单元格
  while (count < 100) {
    html += `<div class="waffle-cell w-none"></div>`;
    count++;
  }
  grid.innerHTML = html;
})();
