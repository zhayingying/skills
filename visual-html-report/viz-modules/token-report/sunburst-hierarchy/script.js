/* 示例片段来自 showroom/scripts/full-exemplar.js。
   使用时复制到 report.js 的 window.ReportTheme.ready(() => { ... }) 内。
   必须把示例数据替换为当前报告的内容契约。 */

// ============ §17 旭日图（用双数据集环形图实现） ============
(function() {
  // Inner ring: categories  Outer ring: individual tools
  // Categories: CLI-first (8) / IDE-ext (4) / Hybrid (4) / Self-hosted (2)
  const ctx = document.getElementById('sunburst');
  
  // Outer ring data — slice sizes = stars (in k)
  const outerData = [
    160, 123, 104, 75.6, 73.4, 44.8, 27, 23.4,  // CLI-first
    61.2, 33.1, 24, 19.2,                          // IDE extension
    63.5, 24.4, 17, 15.3,                          // Hybrid
    23, 19                                          // Self-hosted / Browser
  ];
  const outerLabels = [
    'OpenCode 160k', 'Claude Code 123k', 'Gemini CLI 104k', 'Codex 75.6k', 'OpenHands 73k', 'Aider 44.8k', 'Goose 27k', 'Crush 23.4k',
    'Cline 61.2k', 'Continue 33.1k', 'Roo Code 24k', 'Kilo 19.2k',
    'Open Interpreter 63.5k', 'Qwen Code 24.4k', 'SWE-agent 17k', 'Plandex 15.3k',
    'Tabby 23k', 'bolt.diy 19k'
  ];
  const outerColors = [
    // CLI-first: red ramp
    COLORS.sunset,'#d35a44','#dc6f5a','#e58270','#ec9485','#f1a89a','#f4bcb0','#f7d0c5',
    // IDE: blue ramp
    COLORS.bigtech,'#3a5c95','#4970ae','#5c87c5',
    // Hybrid: forest ramp
    COLORS.indie,'#558759','#6da479','#88c19c',
    // Self-host: amber
    window.ReportTheme.cssVar("--ochre"),'#d4af69'
  ];
  
  // Inner ring data — category totals
  const innerData = [
    160+123+104+75.6+73.4+44.8+27+23.4,  // CLI 631
    61.2+33.1+24+19.2,                    // IDE 137.5
    63.5+24.4+17+15.3,                    // Hybrid 120.2
    23+19                                  // Self-host 42
  ];
  const innerLabels = ['终端原生 · 631k', 'IDE 扩展 · 137k', 'Agent 平台 · 120k', '自部署/浏览器 · 42k'];
  const innerColors = [COLORS.sunset, COLORS.bigtech, COLORS.indie, window.ReportTheme.cssVar("--ochre")];
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: outerLabels,
      datasets: [
        // Inner ring (drawn first, smaller)
        {label: '类别', data: innerData, backgroundColor: innerColors, borderColor: window.ReportTheme.cssVar("--paper-card"), borderWidth: 2, weight: 1},
        // Outer ring
        {label: '工具', data: outerData, backgroundColor: outerColors, borderColor: window.ReportTheme.cssVar("--paper-card"), borderWidth: 1.5, weight: 1.4}
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '30%',
      plugins: {
        legend: {display: false},
        tooltip: {
          callbacks: {
            label: c => {
              if (c.datasetIndex === 0) return innerLabels[c.dataIndex];
              return outerLabels[c.dataIndex];
            }
          }
        }
      }
    }
  });
})();
