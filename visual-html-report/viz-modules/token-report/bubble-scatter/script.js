/* 示例片段来自 showroom/scripts/full-exemplar.js。
   使用时复制到 report.js 的 window.ReportTheme.ready(() => { ... }) 内。
   必须把示例数据替换为当前报告的内容契约。 */

// ============ 图表 2：气泡散点（stars vs forks） ============
new Chart(document.getElementById('bubble'), {
  type: 'bubble',
  data: {
    datasets: [
      {
        label: '大厂',
        data: TOOLS.filter(t => t.vendor === 'bigtech').map(t => ({x: t.stars, y: t.forks, r: Math.sqrt(t.stars) * 1.2, label: t.name})),
        backgroundColor: window.ReportTheme.alpha("--indigo", 0.6),
        borderColor: COLORS.bigtech,
        borderWidth: 1
      },
      {
        label: '独立 / 创业',
        data: TOOLS.filter(t => t.vendor === 'indie').map(t => ({x: t.stars, y: t.forks, r: Math.sqrt(t.stars) * 1.2, label: t.name})),
        backgroundColor: window.ReportTheme.alpha("--forest", 0.6),
        borderColor: COLORS.indie,
        borderWidth: 1
      },
      {
        label: '基金会',
        data: TOOLS.filter(t => t.vendor === 'foundation').map(t => ({x: t.stars, y: t.forks, r: Math.sqrt(t.stars) * 1.2, label: t.name})),
        backgroundColor: window.ReportTheme.alpha("--rust", 0.6),
        borderColor: COLORS.foundation,
        borderWidth: 1
      },
      {
        label: '即将停服',
        data: TOOLS.filter(t => t.vendor === 'sunset').map(t => ({x: t.stars, y: t.forks, r: Math.sqrt(t.stars) * 1.2, label: t.name})),
        backgroundColor: window.ReportTheme.alpha("--vermillion", 0.6),
        borderColor: COLORS.sunset,
        borderWidth: 1
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    layout: {padding: 30},
    plugins: {
      legend: {position: 'top', labels: {usePointStyle: true, pointStyle: 'circle', font: {size: 12}, padding: 16}},
      tooltip: {
        callbacks: {
          label: c => `${c.raw.label}: ${c.raw.x}k★ · ${c.raw.y}k forks`
        }
      }
    },
    scales: {
      x: {
        title: {display: true, text: 'Stars (千)', font: {weight: 500}},
        grid: {color: 'rgba(20,17,15,0.06)'},
        ticks: {callback: v => v + 'k', font: {family: "'JetBrains Mono'"}}
      },
      y: {
        title: {display: true, text: 'Forks (千)', font: {weight: 500}},
        grid: {color: 'rgba(20,17,15,0.06)'},
        ticks: {callback: v => v + 'k', font: {family: "'JetBrains Mono'"}}
      }
    }
  }
});
