window.ReportTheme.ready(() => {
// ============ Chart.js 默认配置（必需） ============
window.ReportTheme.applyChartDefaults();

// ============ 色板（图表配置使用这里的颜色） ============
const COLORS = window.ReportTheme.categoryColors();
const PALETTE = window.ReportTheme.palette();

// ============ 示例：横向条形图 ============
new Chart(document.getElementById('sampleBar'), {
  type: 'bar',
  data: {
    labels: ['项目 A','项目 B','项目 C','项目 D','项目 E'],
    datasets: [{
      data: [160, 123, 104, 76, 73],
      backgroundColor: [COLORS.indie, COLORS.bigtech, COLORS.bigtech, COLORS.bigtech, COLORS.indie],
      borderWidth: 0,
      borderRadius: 2,
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: c => c.parsed.x + 'k stars' } }
    },
    scales: {
      x: {
        title: { display: true, text: '指标单位', font: { size: 12, weight: 500 } },
        grid: { color: 'rgba(20,17,15,0.06)' },
        ticks: { callback: v => v + 'k', font: { family: "'JetBrains Mono'" } }
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 13, family: "'IBM Plex Sans'" } }
      }
    }
  }
});

// 在这里继续添加图表初始化代码；每个使用 canvas 的章节对应一段。
// 重要：每个 <canvas id="X"> 都必须有匹配的 new Chart(document.getElementById('X'))，否则该章节会空白。
});
