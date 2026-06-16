/* 示例片段来自 showroom/scripts/full-exemplar.js。
   使用时复制到 report.js 的 window.ReportTheme.ready(() => { ... }) 内。
   必须把示例数据替换为当前报告的内容契约。 */

// ============ 图表 6：象限图 ============
new Chart(document.getElementById('quadrant'), {
  type: 'scatter',
  data: {
    datasets: [{
      label: '工具',
      data: TOOLS.map(t => ({x: t.stars, y: t.monthsOld, r: Math.sqrt(t.forks) * 3, label: t.name, vendor: t.vendor})),
      backgroundColor: TOOLS.map(t => COLORS[t.vendor] + '99'),
      borderColor: TOOLS.map(t => COLORS[t.vendor]),
      borderWidth: 1.5
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    layout: {padding: 30},
    plugins: {
      legend: {display: false},
      tooltip: {
        callbacks: {
          label: c => `${c.raw.label}: ${c.raw.x}k★ · ${c.raw.y}月`
        }
      }
    },
    scales: {
      x: {
        title: {display: true, text: '← 流行度 (stars 千)', font: {weight: 500}},
        grid: {color: 'rgba(20,17,15,0.06)'},
        ticks: {callback: v => v + 'k', font: {family: "'JetBrains Mono'"}}
      },
      y: {
        reverse: true,
        title: {display: true, text: '← 新发布 ｜ 老牌发布 → (月)', font: {weight: 500}},
        grid: {color: 'rgba(20,17,15,0.06)'},
        ticks: {font: {family: "'JetBrains Mono'"}}
      }
    }
  }
});
