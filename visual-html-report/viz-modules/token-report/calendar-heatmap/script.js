/* 示例片段来自 showroom/scripts/full-exemplar.js。
   使用时复制到 report.js 的 window.ReportTheme.ready(() => { ... }) 内。
   必须把示例数据替换为当前报告的内容契约。 */

// ============ §13 日历热力图 ============
(function() {
  const grid = document.getElementById('calGrid');
  const months = document.getElementById('calMonths');
  const monthNames = ['Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar','Apr','May'];
  months.innerHTML = monthNames.map(m => `<span>${m}</span>`).join('');
  
  // 53 weeks × 7 days = 371 cells. Fill first ~365 with data.
  const cells = 53 * 7;
  // Build calendar with seasonal patterns and a spike around week 40 (March bump)
  let html = '';
  for (let i = 0; i < cells; i++) {
    const week = Math.floor(i / 7);
    const day = i % 7;
    let intensity = 0;
    // Weekend dip
    const isWeekend = (day === 0 || day === 6);
    // Base seasonal pattern
    const seasonal = Math.sin(week / 53 * Math.PI * 2) * 0.5 + 0.5;
    // March bump (around week 40)
    const marchBump = Math.exp(-Math.pow(week - 40, 2) / 8) * 1.5;
    let value = seasonal * 2 + marchBump + Math.random() * 1.5;
    if (isWeekend) value *= 0.4;
    if (Math.random() < 0.08) value = 0;
    
    if (value < 0.5) intensity = 0;
    else if (value < 1.4) intensity = 1;
    else if (value < 2.2) intensity = 2;
    else if (value < 3.0) intensity = 3;
    else intensity = 4;
    
    html += `<div class="cal-cell cal-l${intensity}" title="Week ${week + 1}, Day ${day + 1}"></div>`;
  }
  grid.innerHTML = html;
})();
