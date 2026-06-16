/* 示例片段来自 showroom/scripts/full-exemplar.js。
   使用时复制到 report.js 的 window.ReportTheme.ready(() => { ... }) 内。
   必须把示例数据替换为当前报告的内容契约。 */

// ============ §12 折线 / 面积：Star 历史 ============
const months12 = ['2025.5','2025.6','2025.7','2025.8','2025.9','2025.10','2025.11','2025.12','2026.1','2026.2','2026.3','2026.4','2026.5'];
new Chart(document.getElementById('starHist'), {
  type: 'line',
  data: {
    labels: months12,
    datasets: [
      {label: 'OpenCode', data: [3,5,9,18,38,62,88,108,128,142,152,158,160], borderColor: COLORS.sunset, backgroundColor: window.ReportTheme.alpha("--vermillion", 0.12), fill: true, tension: 0.35, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: COLORS.sunset},
      {label: 'Claude Code', data: [38,48,58,68,76,84,92,100,108,115,119,121,123], borderColor: COLORS.bigtech, backgroundColor: window.ReportTheme.alpha("--indigo", 0.1), fill: true, tension: 0.35, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: COLORS.bigtech},
      {label: 'Gemini CLI', data: [null,null,12,28,46,62,76,84,90,96,100,102,104], borderColor: window.ReportTheme.cssVar("--ochre"), backgroundColor: window.ReportTheme.alpha("--ochre", 0.1), fill: true, tension: 0.35, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: window.ReportTheme.cssVar("--ochre")},
      {label: 'Codex CLI', data: [20,28,38,46,52,58,62,66,70,72,74,75,75.6], borderColor: COLORS.indie, backgroundColor: window.ReportTheme.alpha("--forest", 0.1), fill: true, tension: 0.35, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: COLORS.indie},
      {label: 'OpenHands', data: [42,48,52,56,60,62,65,67,69,71,72,73,73.4], borderColor: window.ReportTheme.cssVar("--plum"), backgroundColor: window.ReportTheme.alpha("--plum", 0.1), fill: true, tension: 0.35, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: window.ReportTheme.cssVar("--plum")}
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {mode: 'index', intersect: false},
    plugins: {
      legend: {position: 'top', align: 'end', labels: {usePointStyle: true, pointStyle: 'circle', padding: 12, font: {size: 11}}},
      tooltip: {callbacks: {label: c => `${c.dataset.label}: ${c.parsed.y}k★`}}
    },
    scales: {
      x: {grid: {display: false}, ticks: {font: {family: "'JetBrains Mono'", size: 10}, color: window.ReportTheme.cssVar("--ink-mute")}},
      y: {grid: {color: 'rgba(20,17,15,0.06)'}, ticks: {callback: v => v + 'k', font: {family: "'JetBrains Mono'"}}, title: {display: true, text: 'Stars (千)', font: {weight: 500}}}
    }
  }
});
