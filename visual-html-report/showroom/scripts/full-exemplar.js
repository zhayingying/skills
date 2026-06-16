window.ReportTheme.ready(() => {
// ============ DATA ============
const TOOLS = [
  {name:'OpenCode',stars:160,forks:18.8,vendor:'indie',lang:'Go/TS',license:'MIT',monthsOld:11},
  {name:'Claude Code',stars:123,forks:20.3,vendor:'bigtech',lang:'TypeScript',license:'专有',monthsOld:15},
  {name:'Gemini CLI',stars:104,forks:14,vendor:'bigtech',lang:'TypeScript',license:'Apache 2.0',monthsOld:11},
  {name:'Codex CLI',stars:75.6,forks:10.7,vendor:'bigtech',lang:'Rust',license:'Apache 2.0',monthsOld:13},
  {name:'OpenHands',stars:73.4,forks:9.3,vendor:'indie',lang:'Python',license:'MIT',monthsOld:18},
  {name:'Open Interpreter',stars:63.5,forks:5.5,vendor:'indie',lang:'Python',license:'AGPL-3.0',monthsOld:30},
  {name:'Cline',stars:61.2,forks:9,vendor:'indie',lang:'TypeScript',license:'Apache 2.0',monthsOld:17},
  {name:'Aider',stars:44.8,forks:4.4,vendor:'indie',lang:'Python',license:'Apache 2.0',monthsOld:32},
  {name:'Continue',stars:33.1,forks:4.5,vendor:'indie',lang:'TypeScript',license:'Apache 2.0',monthsOld:24},
  {name:'Goose',stars:27,forks:2.5,vendor:'foundation',lang:'Rust',license:'Apache 2.0',monthsOld:14},
  {name:'Qwen Code',stars:24.4,forks:2.4,vendor:'bigtech',lang:'TypeScript',license:'Apache 2.0',monthsOld:9},
  {name:'Roo Code',stars:24,forks:3.2,vendor:'sunset',lang:'TypeScript',license:'Apache 2.0',monthsOld:14},
  {name:'Crush',stars:23.4,forks:1.7,vendor:'indie',lang:'Go',license:'MIT',monthsOld:9},
  {name:'Tabby',stars:23,forks:2,vendor:'indie',lang:'Rust',license:'Apache 2.0',monthsOld:36},
  {name:'Kilo Code',stars:19.2,forks:2.5,vendor:'indie',lang:'TypeScript',license:'MIT',monthsOld:10},
  {name:'bolt.diy',stars:19,forks:5,vendor:'indie',lang:'TypeScript',license:'MIT',monthsOld:14},
  {name:'SWE-agent',stars:17,forks:2,vendor:'indie',lang:'Python',license:'MIT',monthsOld:20},
  {name:'Plandex',stars:15.3,forks:1.1,vendor:'indie',lang:'Go',license:'MIT',monthsOld:18},
];

const COLORS = window.ReportTheme.categoryColors();
const PALETTE = window.ReportTheme.palette();

window.ReportTheme.applyChartDefaults();

// ============ CHART 1: STAR RANKING ============
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

// ============ CHART 2: BUBBLE (stars vs forks) ============
new Chart(document.getElementById('bubble'), {
  type: 'bubble',
  data: {
    datasets: [
      {
        label: '大厂',
        data: TOOLS.filter(t => t.vendor === 'bigtech').map(t => ({x: t.stars, y: t.forks, r: Math.sqrt(t.stars) * 1.2, label: t.name})),
        backgroundColor: window.ReportTheme.alpha("--indigo", 0.6),
        borderColor: COLORS.bigtech,
        borderWidth: 1
      },
      {
        label: '独立 / 创业',
        data: TOOLS.filter(t => t.vendor === 'indie').map(t => ({x: t.stars, y: t.forks, r: Math.sqrt(t.stars) * 1.2, label: t.name})),
        backgroundColor: window.ReportTheme.alpha("--forest", 0.6),
        borderColor: COLORS.indie,
        borderWidth: 1
      },
      {
        label: '基金会',
        data: TOOLS.filter(t => t.vendor === 'foundation').map(t => ({x: t.stars, y: t.forks, r: Math.sqrt(t.stars) * 1.2, label: t.name})),
        backgroundColor: window.ReportTheme.alpha("--rust", 0.6),
        borderColor: COLORS.foundation,
        borderWidth: 1
      },
      {
        label: '即将停服',
        data: TOOLS.filter(t => t.vendor === 'sunset').map(t => ({x: t.stars, y: t.forks, r: Math.sqrt(t.stars) * 1.2, label: t.name})),
        backgroundColor: window.ReportTheme.alpha("--vermillion", 0.6),
        borderColor: COLORS.sunset,
        borderWidth: 1
      }
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    layout: {padding: 30},
    plugins: {
      legend: {position: 'top', labels: {usePointStyle: true, pointStyle: 'circle', font: {size: 12}, padding: 16}},
      tooltip: {
        callbacks: {
          label: c => `${c.raw.label}: ${c.raw.x}k★ · ${c.raw.y}k forks`
        }
      }
    },
    scales: {
      x: {
        title: {display: true, text: 'Stars (千)', font: {weight: 500}},
        grid: {color: 'rgba(20,17,15,0.06)'},
        ticks: {callback: v => v + 'k', font: {family: "'JetBrains Mono'"}}
      },
      y: {
        title: {display: true, text: 'Forks (千)', font: {weight: 500}},
        grid: {color: 'rgba(20,17,15,0.06)'},
        ticks: {callback: v => v + 'k', font: {family: "'JetBrains Mono'"}}
      }
    }
  }
});

// ============ CHART 3-5: PIE/DOUGHNUTS ============

function getCounts(arr, key) {
  const c = {};
  arr.forEach(t => {
    let k = t[key];
    if (key === 'lang') {
      if (k.includes('Go') && k.includes('TS')) k = 'Go + TS (混合)';
      else if (k === 'Go/TS') k = 'Go + TS (混合)';
    }
    if (key === 'license') {
      if (k === '专有') k = '专有 (issue 跟踪)';
    }
    c[k] = (c[k] || 0) + 1;
  });
  return c;
}

const langCounts = getCounts(TOOLS, 'lang');
new Chart(document.getElementById('langPie'), {
  type: 'doughnut',
  data: {
    labels: Object.keys(langCounts),
    datasets: [{
      data: Object.values(langCounts),
      backgroundColor: [COLORS.sunset,COLORS.bigtech,COLORS.indie,window.ReportTheme.cssVar("--ochre"),window.ReportTheme.cssVar("--plum"),COLORS.foundation],
      borderWidth: 2,
      borderColor: window.ReportTheme.cssVar("--paper-card")
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    plugins: {
      legend: {position: 'bottom', labels: {font: {size: 11}, padding: 10, boxWidth: 12}},
      tooltip: {
        callbacks: {
          label: c => `${c.label}: ${c.parsed} 个`
        }
      }
    }
  }
});

const licCounts = getCounts(TOOLS, 'license');
new Chart(document.getElementById('licPie'), {
  type: 'doughnut',
  data: {
    labels: Object.keys(licCounts),
    datasets: [{
      data: Object.values(licCounts),
      backgroundColor: [COLORS.indie,window.ReportTheme.cssVar("--ochre"),COLORS.sunset,window.ReportTheme.cssVar("--slate")],
      borderWidth: 2,
      borderColor: window.ReportTheme.cssVar("--paper-card")
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    plugins: {
      legend: {position: 'bottom', labels: {font: {size: 11}, padding: 10, boxWidth: 12}},
      tooltip: {
        callbacks: {
          label: c => `${c.label}: ${c.parsed} 个`
        }
      }
    }
  }
});

const vendorLabels = {bigtech: '大厂', indie: '独立 / 创业', foundation: 'Linux 基金会', sunset: '即将停服'};
const vendorCounts = {};
TOOLS.forEach(t => {
  const k = vendorLabels[t.vendor];
  vendorCounts[k] = (vendorCounts[k] || 0) + 1;
});
new Chart(document.getElementById('vendorPie'), {
  type: 'doughnut',
  data: {
    labels: Object.keys(vendorCounts),
    datasets: [{
      data: Object.values(vendorCounts),
      backgroundColor: [COLORS.bigtech,COLORS.indie,COLORS.foundation,COLORS.sunset],
      borderWidth: 2,
      borderColor: window.ReportTheme.cssVar("--paper-card")
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    plugins: {
      legend: {position: 'bottom', labels: {font: {size: 11}, padding: 10, boxWidth: 12}},
      tooltip: {
        callbacks: {
          label: c => `${c.label}: ${c.parsed} 个`
        }
      }
    }
  }
});

// ============ CHART 6: QUADRANT ============
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

// ============ §11 RADAR CHART ============
new Chart(document.getElementById('radar'), {
  type: 'radar',
  data: {
    labels: ['多模型支持', 'MCP 生态', '终端易用', '子代理', '自部署', '社区活跃'],
    datasets: [
      {label: 'Claude Code', data: [3, 5, 5, 5, 1, 5], borderColor: COLORS.bigtech, backgroundColor: window.ReportTheme.alpha("--indigo", 0.15), borderWidth: 2, pointBackgroundColor: COLORS.bigtech},
      {label: 'OpenCode', data: [5, 5, 5, 4, 5, 5], borderColor: COLORS.sunset, backgroundColor: window.ReportTheme.alpha("--vermillion", 0.12), borderWidth: 2, pointBackgroundColor: COLORS.sunset},
      {label: 'Aider', data: [5, 3, 4, 2, 5, 4], borderColor: COLORS.indie, backgroundColor: window.ReportTheme.alpha("--forest", 0.12), borderWidth: 2, pointBackgroundColor: COLORS.indie},
      {label: 'Cline', data: [5, 5, 3, 5, 3, 5], borderColor: window.ReportTheme.cssVar("--ochre"), backgroundColor: window.ReportTheme.alpha("--ochre", 0.12), borderWidth: 2, pointBackgroundColor: window.ReportTheme.cssVar("--ochre")},
      {label: 'Goose', data: [4, 5, 4, 4, 5, 3], borderColor: COLORS.foundation, backgroundColor: window.ReportTheme.alpha("--rust", 0.12), borderWidth: 2, pointBackgroundColor: COLORS.foundation}
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {position: 'bottom', labels: {usePointStyle: true, pointStyle: 'circle', padding: 16, font: {size: 12}}}
    },
    scales: {
      r: {
        min: 0, max: 5,
        ticks: {stepSize: 1, font: {family: "'JetBrains Mono'", size: 10}, color: window.ReportTheme.cssVar("--ink-mute"), backdropColor: 'transparent'},
        grid: {color: 'rgba(20,17,15,0.1)'},
        angleLines: {color: 'rgba(20,17,15,0.15)'},
        pointLabels: {font: {family: "'Source Serif 4'", size: 13, weight: 500}, color: window.ReportTheme.cssVar("--ink")}
      }
    }
  }
});

// ============ §12 LINE / AREA: STAR HISTORY ============
const months12 = ['2025.5','2025.6','2025.7','2025.8','2025.9','2025.10','2025.11','2025.12','2026.1','2026.2','2026.3','2026.4','2026.5'];
new Chart(document.getElementById('starHist'), {
  type: 'line',
  data: {
    labels: months12,
    datasets: [
      {label: 'OpenCode', data: [3,5,9,18,38,62,88,108,128,142,152,158,160], borderColor: COLORS.sunset, backgroundColor: window.ReportTheme.alpha("--vermillion", 0.12), fill: true, tension: 0.35, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: COLORS.sunset},
      {label: 'Claude Code', data: [38,48,58,68,76,84,92,100,108,115,119,121,123], borderColor: COLORS.bigtech, backgroundColor: window.ReportTheme.alpha("--indigo", 0.1), fill: true, tension: 0.35, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: COLORS.bigtech},
      {label: 'Gemini CLI', data: [null,null,12,28,46,62,76,84,90,96,100,102,104], borderColor: window.ReportTheme.cssVar("--ochre"), backgroundColor: window.ReportTheme.alpha("--ochre", 0.1), fill: true, tension: 0.35, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: window.ReportTheme.cssVar("--ochre")},
      {label: 'Codex CLI', data: [20,28,38,46,52,58,62,66,70,72,74,75,75.6], borderColor: COLORS.indie, backgroundColor: window.ReportTheme.alpha("--forest", 0.1), fill: true, tension: 0.35, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: COLORS.indie},
      {label: 'OpenHands', data: [42,48,52,56,60,62,65,67,69,71,72,73,73.4], borderColor: window.ReportTheme.cssVar("--plum"), backgroundColor: window.ReportTheme.alpha("--plum", 0.1), fill: true, tension: 0.35, borderWidth: 2.5, pointRadius: 3, pointBackgroundColor: window.ReportTheme.cssVar("--plum")}
    ]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {mode: 'index', intersect: false},
    plugins: {
      legend: {position: 'top', align: 'end', labels: {usePointStyle: true, pointStyle: 'circle', padding: 12, font: {size: 11}}},
      tooltip: {callbacks: {label: c => `${c.dataset.label}: ${c.parsed.y}k★`}}
    },
    scales: {
      x: {grid: {display: false}, ticks: {font: {family: "'JetBrains Mono'", size: 10}, color: window.ReportTheme.cssVar("--ink-mute")}},
      y: {grid: {color: 'rgba(20,17,15,0.06)'}, ticks: {callback: v => v + 'k', font: {family: "'JetBrains Mono'"}}, title: {display: true, text: 'Stars (千)', font: {weight: 500}}}
    }
  }
});

// ============ §13 CALENDAR HEATMAP ============
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

// ============ §17 SUNBURST (using doughnut with 2 datasets) ============
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

// ============ §20 SPARKLINE TABLE ============
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

// ============ §26 WAFFLE CHART ============
(function() {
  const grid = document.getElementById('waffleGrid');
  // 100 cells filled in this order: claude 38, codex 25, opencode 14, gemini 9, cline 7, other 5, goose 2
  const dist = [
    {cls: 'w-bigtech', n: 38},
    {cls: 'cust', n: 25, color: COLORS.bigtech},
    {cls: 'w-indie', n: 14},
    {cls: 'cust', n: 9, color: window.ReportTheme.alpha("--indigo", 0.7)},
    {cls: 'cust', n: 7, color: window.ReportTheme.alpha("--forest", 0.7)},
    {cls: 'cust', n: 5, color: window.ReportTheme.alpha("--forest", 0.45)},
    {cls: 'w-fdn', n: 2}
  ];
  
  let html = '';
  let count = 0;
  dist.forEach(d => {
    for (let i = 0; i < d.n; i++) {
      if (d.cls === 'cust') {
        html += `<div class="waffle-cell" style="background:${d.color}"></div>`;
      } else {
        html += `<div class="waffle-cell ${d.cls}"></div>`;
      }
      count++;
    }
  });
  // 补齐剩余单元格
  while (count < 100) {
    html += `<div class="waffle-cell w-none"></div>`;
    count++;
  }
  grid.innerHTML = html;
})();

// ============ §28 POLAR AREA CHART ============
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

// ============ §34 STREAM GRAPH ============
(function(){
  const months = ['2024-09','2024-12','2025-03','2025-06','2025-09','2025-12','2026-03','2026-05'];
  // Mock cumulative star counts for top 5 tools over time
  // OpenCode and Claude Code only emerge in 2025
  const datasets = [
    {label: 'OpenCode', data: [0,0,5,30,80,90,140,160], color: COLORS.sunset},
    {label: 'Claude Code', data: [0,0,10,40,75,90,110,123], color: COLORS.bigtech},
    {label: 'Gemini CLI', data: [0,0,8,25,50,70,95,104], color: COLORS.indie},
    {label: 'Codex CLI', data: [0,0,5,18,40,60,72,76], color: window.ReportTheme.cssVar("--ochre")},
    {label: 'OpenHands', data: [25,40,50,55,62,68,72,73], color: window.ReportTheme.cssVar("--plum")},
  ];
  new Chart(document.getElementById('streamChart'), {
    type: 'line',
    data: {
      labels: months,
      datasets: datasets.map(d => ({
        label: d.label,
        data: d.data,
        borderColor: d.color,
        backgroundColor: d.color + 'cc',
        borderWidth: 1,
        fill: true,
        tension: 0.42,
        pointRadius: 0,
        pointHoverRadius: 4,
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {mode: 'index', intersect: false},
      plugins: {
        legend: {position: 'top', labels: {usePointStyle: true, boxWidth: 12, padding: 14, font: {size: 12}}},
        tooltip: {
          callbacks: {label: c => `${c.dataset.label}: ${c.parsed.y}k`}
        }
      },
      scales: {
        x: {
          grid: {color: 'rgba(20,17,15,0.05)'},
          ticks: {font: {family: "'JetBrains Mono'", size: 10}, color: window.ReportTheme.cssVar("--ink-soft")}
        },
        y: {
          stacked: true,
          title: {display: true, text: '累积 stars (千)', font: {weight: 500}},
          beginAtZero: true,
          ticks: {font: {family: "'JetBrains Mono'"}, callback: v => v + 'k'},
          grid: {color: 'rgba(20,17,15,0.06)'}
        }
      }
    }
  });
})();

// ============ §42 PARETO CHART ============
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

// ============ §43 SMALL MULTIPLES ============
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

// ============ §50 HISTOGRAM ============
(function(){
  const bins = [
    {range: '0–20k', count: 5, label: 'Plandex, SWE-agent, bolt.diy, Kilo, Tabby'},
    {range: '20–40k', count: 5, label: 'Crush, Roo, Qwen, Goose, Continue'},
    {range: '40–60k', count: 1, label: 'Aider'},
    {range: '60–80k', count: 4, label: 'Cline, Open Interp., OpenHands, Codex'},
    {range: '80–100k', count: 0, label: ''},
    {range: '100–120k', count: 1, label: 'Gemini CLI'},
    {range: '120–140k', count: 1, label: 'Claude Code'},
    {range: '140–160k', count: 0, label: ''},
    {range: '≥ 160k', count: 1, label: 'OpenCode'},
  ];
  new Chart(document.getElementById('histogram'), {
    type: 'bar',
    data: {
      labels: bins.map(b => b.range),
      datasets: [{
        data: bins.map(b => b.count),
        backgroundColor: bins.map(b => b.count === 0 ? 'rgba(20,17,15,0.05)' : COLORS.sunset),
        borderColor: bins.map(b => b.count === 0 ? 'transparent' : COLORS.sunset),
        borderWidth: 1,
        borderRadius: 1,
        barPercentage: 0.98,
        categoryPercentage: 0.98,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {display: false},
        tooltip: {
          callbacks: {
            label: c => `${c.parsed.y} 个项目`,
            afterLabel: c => bins[c.dataIndex].label
          }
        }
      },
      scales: {
        x: {
          title: {display: true, text: 'GitHub Stars 区间', font: {weight: 500}},
          grid: {display: false},
          ticks: {font: {family: "'JetBrains Mono'", size: 11}, color: window.ReportTheme.cssVar("--ink-soft")}
        },
        y: {
          title: {display: true, text: '项目数', font: {weight: 500}},
          beginAtZero: true,
          ticks: {stepSize: 1, font: {family: "'JetBrains Mono'"}, callback: v => Number.isInteger(v) ? v : ''},
          grid: {color: 'rgba(20,17,15,0.06)'}
        }
      }
    }
  });
})();

// ============ §58 CUMULATIVE AREA ============
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
