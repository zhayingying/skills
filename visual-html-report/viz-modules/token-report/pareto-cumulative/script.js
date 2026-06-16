/* 示例片段来自 showroom/scripts/full-exemplar.js。
   使用时复制到 report.js 的 window.ReportTheme.ready(() => { ... }) 内。
   必须把示例数据替换为当前报告的内容契约。 */

// ============ §42 Pareto 图 ============
(function(){
  // Sort by stars desc, compute cumulative %
  const sorted = [...TOOLS].sort((a,b) => b.stars - a.stars);
  const total = sorted.reduce((s,t) => s + t.stars, 0);
  let cum = 0;
  const cumPct = sorted.map(t => {cum += t.stars; return (cum / total * 100).toFixed(1);});
  
  new Chart(document.getElementById('paretoChart'), {
    data: {
      labels: sorted.map(t => t.name),
      datasets: [
        {
          type: 'bar',
          label: 'Stars (千)',
          data: sorted.map(t => t.stars),
          backgroundColor: sorted.map((t,i) => i < 4 ? COLORS.sunset : window.ReportTheme.alpha("--slate", 0.5)),
          borderWidth: 0,
          yAxisID: 'y',
          order: 2,
        },
        {
          type: 'line',
          label: '累计百分比',
          data: cumPct,
          borderColor: COLORS.bigtech,
          backgroundColor: window.ReportTheme.alpha("--indigo", 0.08),
          borderWidth: 2.5,
          fill: false,
          tension: 0.2,
          pointBackgroundColor: COLORS.bigtech,
          pointBorderColor: window.ReportTheme.cssVar("--paper-card"),
          pointBorderWidth: 2,
          pointRadius: 4,
          yAxisID: 'y1',
          order: 1,
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {mode: 'index', intersect: false},
      plugins: {
        legend: {position: 'top', labels: {usePointStyle: true, boxWidth: 12, padding: 14, font: {size: 12}}},
        tooltip: {
          callbacks: {
            label: c => c.dataset.type === 'bar' ? `${c.parsed.y}k stars` : `${c.parsed.y}% 累计`
          }
        },
        annotation: false
      },
      scales: {
        x: {
          grid: {display: false},
          ticks: {font: {family: "'IBM Plex Sans'", size: 10}, color: window.ReportTheme.cssVar("--ink-soft"), maxRotation: 50, minRotation: 50}
        },
        y: {
          type: 'linear', position: 'left',
          title: {display: true, text: '单项 stars (千)', font: {weight: 500}},
          beginAtZero: true,
          ticks: {font: {family: "'JetBrains Mono'"}, callback: v => v + 'k'},
          grid: {color: 'rgba(20,17,15,0.06)'}
        },
        y1: {
          type: 'linear', position: 'right',
          title: {display: true, text: '累计百分比', font: {weight: 500}},
          min: 0, max: 100,
          ticks: {font: {family: "'JetBrains Mono'"}, callback: v => v + '%'},
          grid: {display: false}
        }
      }
    }
  });
})();
