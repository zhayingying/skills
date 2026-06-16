/* 示例片段来自 showroom/scripts/full-exemplar.js。
   使用时复制到 report.js 的 window.ReportTheme.ready(() => { ... }) 内。
   必须把示例数据替换为当前报告的内容契约。 */

// ============ §20 Sparkline 表格 ============
(function() {
  const tbody = document.getElementById('sparkBody');
  const sparkData = [
    {name: 'OpenCode', data: [62,68,75,82,98,118,140,158,160], total: 160, delta: '+8.0k'},
    {name: 'Claude Code', data: [88,93,98,104,110,115,118,121,123], total: 123, delta: '+2.5k'},
    {name: 'Gemini CLI', data: [76,80,84,88,92,96,99,102,104], total: 104, delta: '+2.0k'},
    {name: 'Codex CLI', data: [58,62,66,68,70,72,73,75,75.6], total: 75.6, delta: '+0.8k'},
    {name: 'OpenHands', data: [60,62,65,67,69,71,72,73,73.4], total: 73.4, delta: '+0.6k'},
    {name: 'Cline', data: [44,48,51,53,56,58,59,60,61.2], total: 61.2, delta: '+1.1k'},
    {name: 'Aider', data: [40,41,42,43,44,44.3,44.5,44.7,44.8], total: 44.8, delta: '+0.3k'},
    {name: 'Roo Code', data: [23,23.5,24,24.2,24.3,24.4,24.3,24.1,24], total: 24, delta: '−0.4k', down: true}
  ];
  
  let html = '';
  sparkData.forEach(d => {
    // Make sparkline SVG (160px wide, 36px tall)
    const max = Math.max(...d.data);
    const min = Math.min(...d.data);
    const range = max - min || 1;
    const pts = d.data.map((v, i) => {
      const x = (i / (d.data.length - 1)) * 140 + 10;
      const y = 30 - ((v - min) / range) * 24;
      return `${x},${y}`;
    }).join(' ');
    const fillPts = pts + ` 150,32 10,32`;
    const lastX = ((d.data.length - 1) / (d.data.length - 1)) * 140 + 10;
    const lastY = 30 - ((d.data[d.data.length - 1] - min) / range) * 24;
    const color = d.down ? COLORS.sunset : COLORS.indie;
    const fillColor = d.down ? window.ReportTheme.alpha("--vermillion", 0.1) : window.ReportTheme.alpha("--forest", 0.1);
    
    html += `<tr>
      <td style="padding-left:24px">${d.name}</td>
      <td class="spk-cell">
        <svg viewBox="0 0 160 36" width="160" height="36">
          <polygon points="${fillPts}" fill="${fillColor}"/>
          <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="${lastX}" cy="${lastY}" r="3" fill="${color}"/>
        </svg>
      </td>
      <td class="num" style="padding-right:12px">${d.total}k</td>
      <td class="num" style="padding-right:24px;color:${d.down ? COLORS.sunset : COLORS.indie}">${d.delta}</td>
    </tr>`;
  });
  tbody.innerHTML = html;
})();
