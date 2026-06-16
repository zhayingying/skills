/* 示例片段来自 showroom/scripts/full-exemplar.js。
   使用时复制到 report.js 的 window.ReportTheme.ready(() => { ... }) 内。
   必须把示例数据替换为当前报告的内容契约。 */

// ============ §43 小图阵列 ============
(function(){
  const container = document.getElementById('smallMult');
  if (!container) return;
  
  // Group tools by language
  const groups = {
    'TypeScript': TOOLS.filter(t => t.lang === 'TypeScript'),
    'Python': TOOLS.filter(t => t.lang === 'Python'),
    'Rust': TOOLS.filter(t => t.lang === 'Rust'),
    'Go': TOOLS.filter(t => t.lang === 'Go'),
    'Go / TS 混合': TOOLS.filter(t => t.lang === 'Go/TS'),
  };
  const groupColors = {
    'TypeScript': COLORS.bigtech,
    'Python': window.ReportTheme.cssVar("--ochre"),
    'Rust': COLORS.foundation,
    'Go': COLORS.indie,
    'Go / TS 混合': COLORS.sunset,
  };
  
  // Find global max for consistent scale
  const globalMax = Math.max(...TOOLS.map(t => t.stars));
  
  let html = '';
  for (const [lang, items] of Object.entries(groups)) {
    if (items.length === 0) continue;
    const color = groupColors[lang];
    const sorted = [...items].sort((a,b) => b.stars - a.stars);
    const total = items.reduce((s,t) => s + t.stars, 0);
    const avg = (total / items.length).toFixed(1);
    
    // Build mini horizontal bar chart as SVG
    const barH = 14, gap = 4, padTop = 8, padBottom = 8;
    const svgH = padTop + padBottom + items.length * (barH + gap) - gap;
    const svgW = 280;
    const labelW = 90;
    const barAreaW = svgW - labelW - 10;
    
    let bars = '';
    sorted.forEach((t, i) => {
      const y = padTop + i * (barH + gap);
      const w = (t.stars / globalMax) * barAreaW;
      bars += `<rect x="${labelW}" y="${y}" width="${w}" height="${barH}" fill="${color}" opacity="0.85" rx="1"/>`;
      bars += `<text x="${labelW - 6}" y="${y + barH * 0.72}" text-anchor="end" font-family="'IBM Plex Sans'" font-size="10" fill="${window.ReportTheme.cssVar("--ink-soft")}">${t.name.length > 12 ? t.name.slice(0,11)+'…' : t.name}</text>`;
      bars += `<text x="${labelW + w + 4}" y="${y + barH * 0.72}" font-family="'JetBrains Mono'" font-size="9" fill="${window.ReportTheme.cssVar("--ink-mute")}">${t.stars}k</text>`;
    });
    
    html += `
      <div style="background:var(--paper-card);border:1px solid var(--rule);padding:14px 16px;display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid var(--rule);padding-bottom:6px">
          <div style="font-family:var(--serif);font-weight:600;font-size:14px;color:${color}">${lang}</div>
          <div style="font-family:var(--mono);font-size:10px;color:var(--ink-mute)">${items.length} 个 · 均值 ${avg}k</div>
        </div>
        <svg viewBox="0 0 ${svgW} ${svgH}" width="100%" style="display:block">${bars}</svg>
      </div>
    `;
  }
  container.innerHTML = html;
})();
