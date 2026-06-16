/* 示例片段来自 showroom/scripts/full-exemplar.js。
   使用时复制到 report.js 的 window.ReportTheme.ready(() => { ... }) 内。
   必须把示例数据替换为当前报告的内容契约。 */

// ============ 图表 3-5：饼图 / 环形图 ============

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
