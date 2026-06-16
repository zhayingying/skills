/* 示例片段来自 showroom/scripts/full-exemplar.js。
   使用时复制到 report.js 的 window.ReportTheme.ready(() => { ... }) 内。
   必须把示例数据替换为当前报告的内容契约。 */

// ============ §34 流图 ============
(function(){
  const months = ['2024-09','2024-12','2025-03','2025-06','2025-09','2025-12','2026-03','2026-05'];
  // Mock cumulative star counts for top 5 tools over time
  // OpenCode and Claude Code only emerge in 2025
  const datasets = [
    {label: 'OpenCode', data: [0,0,5,30,80,90,140,160], color: COLORS.sunset},
    {label: 'Claude Code', data: [0,0,10,40,75,90,110,123], color: COLORS.bigtech},
    {label: 'Gemini CLI', data: [0,0,8,25,50,70,95,104], color: COLORS.indie},
    {label: 'Codex CLI', data: [0,0,5,18,40,60,72,76], color: window.ReportTheme.cssVar("--ochre")},
    {label: 'OpenHands', data: [25,40,50,55,62,68,72,73], color: window.ReportTheme.cssVar("--plum")},
  ];
  new Chart(document.getElementById('streamChart'), {
    type: 'line',
    data: {
      labels: months,
      datasets: datasets.map(d => ({
        label: d.label,
        data: d.data,
        borderColor: d.color,
        backgroundColor: d.color + 'cc',
        borderWidth: 1,
        fill: true,
        tension: 0.42,
        pointRadius: 0,
        pointHoverRadius: 4,
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {mode: 'index', intersect: false},
      plugins: {
        legend: {position: 'top', labels: {usePointStyle: true, boxWidth: 12, padding: 14, font: {size: 12}}},
        tooltip: {
          callbacks: {label: c => `${c.dataset.label}: ${c.parsed.y}k`}
        }
      },
      scales: {
        x: {
          grid: {color: 'rgba(20,17,15,0.05)'},
          ticks: {font: {family: "'JetBrains Mono'", size: 10}, color: window.ReportTheme.cssVar("--ink-soft")}
        },
        y: {
          stacked: true,
          title: {display: true, text: '累积 stars (千)', font: {weight: 500}},
          beginAtZero: true,
          ticks: {font: {family: "'JetBrains Mono'"}, callback: v => v + 'k'},
          grid: {color: 'rgba(20,17,15,0.06)'}
        }
      }
    }
  });
})();
