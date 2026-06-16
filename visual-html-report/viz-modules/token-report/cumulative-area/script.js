/* 示例片段来自 showroom/scripts/full-exemplar.js。
   使用时复制到 report.js 的 window.ReportTheme.ready(() => { ... }) 内。
   必须把示例数据替换为当前报告的内容契约。 */

// ============ §58 累积面积图 ============
(function(){
  // mock cumulative monthly total
  const months = ['2024-06','2024-09','2024-12','2025-03','2025-06','2025-09','2025-12','2026-03','2026-05'];
  const cumulative = [85, 130, 195, 280, 410, 560, 680, 800, 872];
  new Chart(document.getElementById('cumArea'), {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: '累计 stars (千)',
        data: cumulative,
        borderColor: COLORS.sunset,
        backgroundColor: window.ReportTheme.alpha("--vermillion", 0.12),
        borderWidth: 2.5,
        fill: true,
        tension: 0.32,
        pointBackgroundColor: COLORS.sunset,
        pointBorderColor: window.ReportTheme.cssVar("--paper-card"),
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {display: false},
        tooltip: {
          callbacks: {
            label: c => `累计 ${c.parsed.y}k stars`,
            afterLabel: c => {
              if (c.dataIndex === 0) return '基期';
              const prev = cumulative[c.dataIndex - 1];
              const delta = c.parsed.y - prev;
              return `+${delta}k vs 上期`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {color: 'rgba(20,17,15,0.05)'},
          ticks: {font: {family: "'JetBrains Mono'", size: 11}, color: window.ReportTheme.cssVar("--ink-soft")}
        },
        y: {
          title: {display: true, text: '累计 stars (千)', font: {weight: 500}},
          beginAtZero: true,
          ticks: {font: {family: "'JetBrains Mono'"}, callback: v => v + 'k'},
          grid: {color: 'rgba(20,17,15,0.06)'}
        }
      }
    }
  });
})();

});
