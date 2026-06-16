/* 示例片段来自 showroom/scripts/full-exemplar.js。
   使用时复制到 report.js 的 window.ReportTheme.ready(() => { ... }) 内。
   必须把示例数据替换为当前报告的内容契约。 */

// ============ §11 雷达图 ============
new Chart(document.getElementById('radar'), {
  type: 'radar',
  data: {
    labels: ['多模型支持', 'MCP 生态', '终端易用', '子代理', '自部署', '社区活跃'],
    datasets: [
      {label: 'Claude Code', data: [3, 5, 5, 5, 1, 5], borderColor: COLORS.bigtech, backgroundColor: window.ReportTheme.alpha("--indigo", 0.15), borderWidth: 2, pointBackgroundColor: COLORS.bigtech},
      {label: 'OpenCode', data: [5, 5, 5, 4, 5, 5], borderColor: COLORS.sunset, backgroundColor: window.ReportTheme.alpha("--vermillion", 0.12), borderWidth: 2, pointBackgroundColor: COLORS.sunset},
      {label: 'Aider', data: [5, 3, 4, 2, 5, 4], borderColor: COLORS.indie, backgroundColor: window.ReportTheme.alpha("--forest", 0.12), borderWidth: 2, pointBackgroundColor: COLORS.indie},
      {label: 'Cline', data: [5, 5, 3, 5, 3, 5], borderColor: window.ReportTheme.cssVar("--ochre"), backgroundColor: window.ReportTheme.alpha("--ochre", 0.12), borderWidth: 2, pointBackgroundColor: window.ReportTheme.cssVar("--ochre")},
      {label: 'Goose', data: [4, 5, 4, 4, 5, 3], borderColor: COLORS.foundation, backgroundColor: window.ReportTheme.alpha("--rust", 0.12), borderWidth: 2, pointBackgroundColor: COLORS.foundation}
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {position: 'bottom', labels: {usePointStyle: true, pointStyle: 'circle', padding: 16, font: {size: 12}}}
    },
    scales: {
      r: {
        min: 0, max: 5,
        ticks: {stepSize: 1, font: {family: "'JetBrains Mono'", size: 10}, color: window.ReportTheme.cssVar("--ink-mute"), backdropColor: 'transparent'},
        grid: {color: 'rgba(20,17,15,0.1)'},
        angleLines: {color: 'rgba(20,17,15,0.15)'},
        pointLabels: {font: {family: "'Source Serif 4'", size: 13, weight: 500}, color: window.ReportTheme.cssVar("--ink")}
      }
    }
  }
});
