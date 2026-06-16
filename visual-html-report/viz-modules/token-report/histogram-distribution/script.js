/* 示例片段来自 showroom/scripts/full-exemplar.js。
   使用时复制到 report.js 的 window.ReportTheme.ready(() => { ... }) 内。
   必须把示例数据替换为当前报告的内容契约。 */

// ============ §50 直方图 ============
(function(){
  const bins = [
    {range: '0–20k', count: 5, label: 'Plandex, SWE-agent, bolt.diy, Kilo, Tabby'},
    {range: '20–40k', count: 5, label: 'Crush, Roo, Qwen, Goose, Continue'},
    {range: '40–60k', count: 1, label: 'Aider'},
    {range: '60–80k', count: 4, label: 'Cline, Open Interp., OpenHands, Codex'},
    {range: '80–100k', count: 0, label: ''},
    {range: '100–120k', count: 1, label: 'Gemini CLI'},
    {range: '120–140k', count: 1, label: 'Claude Code'},
    {range: '140–160k', count: 0, label: ''},
    {range: '≥ 160k', count: 1, label: 'OpenCode'},
  ];
  new Chart(document.getElementById('histogram'), {
    type: 'bar',
    data: {
      labels: bins.map(b => b.range),
      datasets: [{
        data: bins.map(b => b.count),
        backgroundColor: bins.map(b => b.count === 0 ? 'rgba(20,17,15,0.05)' : COLORS.sunset),
        borderColor: bins.map(b => b.count === 0 ? 'transparent' : COLORS.sunset),
        borderWidth: 1,
        borderRadius: 1,
        barPercentage: 0.98,
        categoryPercentage: 0.98,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {display: false},
        tooltip: {
          callbacks: {
            label: c => `${c.parsed.y} 个项目`,
            afterLabel: c => bins[c.dataIndex].label
          }
        }
      },
      scales: {
        x: {
          title: {display: true, text: 'GitHub Stars 区间', font: {weight: 500}},
          grid: {display: false},
          ticks: {font: {family: "'JetBrains Mono'", size: 11}, color: window.ReportTheme.cssVar("--ink-soft")}
        },
        y: {
          title: {display: true, text: '项目数', font: {weight: 500}},
          beginAtZero: true,
          ticks: {stepSize: 1, font: {family: "'JetBrains Mono'"}, callback: v => Number.isInteger(v) ? v : ''},
          grid: {color: 'rgba(20,17,15,0.06)'}
        }
      }
    }
  });
})();
