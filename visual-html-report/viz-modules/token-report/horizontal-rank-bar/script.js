/* 示例片段来自 showroom/scripts/full-exemplar.js。
   使用时复制到 report.js 的 window.ReportTheme.ready(() => { ... }) 内。
   必须把示例数据替换为当前报告的内容契约。 */

// ============ 图表 1：Star 排名 ============
new Chart(document.getElementById('starRank'), {
  type: 'bar',
  data: {
    labels: TOOLS.map(t => t.name),
    datasets: [{
      data: TOOLS.map(t => t.stars),
      backgroundColor: TOOLS.map(t => COLORS[t.vendor]),
      borderWidth: 0,
      borderRadius: 2,
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {display: false},
      tooltip: {
        callbacks: {
          label: c => c.parsed.x.toFixed(1) + 'k stars'
        }
      }
    },
    scales: {
      x: {
        title: {display: true, text: 'GitHub stars (千)', font: {size: 12, weight: 500}},
        grid: {color: 'rgba(20,17,15,0.06)'},
        ticks: {callback: v => v + 'k', font: {family: "'JetBrains Mono'"}}
      },
      y: {
        grid: {display: false},
        ticks: {font: {size: 13, family: "'IBM Plex Sans'"}}
      }
    }
  }
});
