/* 示例片段来自 showroom/scripts/full-exemplar.js。
   使用时复制到 report.js 的 window.ReportTheme.ready(() => { ... }) 内。
   必须把示例数据替换为当前报告的内容契约。 */

// ============ §28 极坐标面积图 ============
(function() {
  // Top 14 tools (limit for readability)
  const polarData = TOOLS.slice(0, 14);
  new Chart(document.getElementById('polar'), {
    type: 'polarArea',
    data: {
      labels: polarData.map(t => t.name),
      datasets: [{
        data: polarData.map(t => t.stars),
        backgroundColor: polarData.map((t, i) => {
          const ramp = [COLORS.sunset,'#d35a44','#dc6f5a','#e58270',COLORS.bigtech,'#3a5c95','#4970ae','#5c87c5',COLORS.indie,'#558759','#6da479','#88c19c',window.ReportTheme.cssVar("--ochre"),'#d4af69'];
          return ramp[i] + 'cc';
        }),
        borderColor: window.ReportTheme.cssVar("--paper-card"),
        borderWidth: 1.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {position: 'right', labels: {font: {size: 11, family: "'IBM Plex Sans'"}, padding: 8, boxWidth: 14}}
      },
      scales: {
        r: {
          ticks: {font: {family: "'JetBrains Mono'", size: 10}, color: window.ReportTheme.cssVar("--ink-mute"), backdropColor: 'transparent', callback: v => v + 'k'},
          grid: {color: 'rgba(20,17,15,0.1)'},
          angleLines: {color: 'rgba(20,17,15,0.1)'},
          pointLabels: {display: false}
        }
      }
    }
  });
})();
