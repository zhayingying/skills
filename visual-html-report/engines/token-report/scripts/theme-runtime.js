(function () {
  const DEFAULT_THEME = "editorial-paper";
  const themeLink = document.getElementById("report-theme");
  const urlTheme = new URLSearchParams(window.location.search).get("theme");
  const selectedTheme = urlTheme || document.documentElement.dataset.reportTheme || DEFAULT_THEME;
  let readyCallbacks = [];
  let isReady = false;

  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function hexToRgb(value) {
    const hex = value.replace("#", "").trim();
    if (hex.length === 3) {
      return hex.split("").map((x) => parseInt(x + x, 16));
    }
    if (hex.length === 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
    }
    return null;
  }

  function alpha(tokenName, opacity) {
    const value = cssVar(tokenName);
    const rgb = hexToRgb(value);
    if (rgb) return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity})`;
    if (value.startsWith("rgb(")) return value.replace("rgb(", "rgba(").replace(")", `,${opacity})`);
    return value;
  }

  function palette() {
    return [
      cssVar("--accent-1"),
      cssVar("--accent-2"),
      cssVar("--accent-3"),
      cssVar("--accent-4"),
      cssVar("--accent-5"),
      cssVar("--accent-6"),
      cssVar("--slate"),
      cssVar("--ink"),
    ];
  }

  function categoryColors() {
    return {
      bigtech: cssVar("--indigo"),
      indie: cssVar("--forest"),
      foundation: cssVar("--rust"),
      sunset: cssVar("--vermillion"),
    };
  }

  function applyChartDefaults() {
    if (!window.Chart) return;
    Chart.defaults.font.family = cssVar("--sans");
    Chart.defaults.font.size = 12;
    Chart.defaults.color = cssVar("--ink-soft");
    Chart.defaults.borderColor = alpha("--ink", 0.08);
  }

  function flushReady() {
    if (isReady) return;
    isReady = true;
    for (const cb of readyCallbacks) cb();
    readyCallbacks = [];
  }

  function ready(cb) {
    if (isReady) {
      cb();
      return;
    }
    readyCallbacks.push(cb);
  }

  function themeHref(slug) {
    const current = themeLink?.getAttribute("href") || "";
    const match = current.match(/^(.*\/themes\/)[^/]+\.css$/);
    if (match) return `${match[1]}${slug}.css`;
    return `styles/themes/${slug}.css`;
  }

  if (themeLink && selectedTheme) {
    const href = themeHref(selectedTheme);
    document.documentElement.dataset.reportTheme = selectedTheme;
    if (!themeLink.getAttribute("href")?.endsWith(href)) {
      themeLink.setAttribute("href", href);
      themeLink.addEventListener("load", flushReady, { once: true });
      themeLink.addEventListener("error", flushReady, { once: true });
      window.setTimeout(flushReady, 600);
    } else {
      if (themeLink.sheet) {
        queueMicrotask(flushReady);
      } else {
        themeLink.addEventListener("load", flushReady, { once: true });
        window.setTimeout(flushReady, 600);
      }
    }
  } else {
    queueMicrotask(flushReady);
  }

  window.ReportTheme = {
    alpha,
    applyChartDefaults,
    categoryColors,
    cssVar,
    palette,
    ready,
    selectedTheme,
  };

  function inferVizType(section) {
    const canvasCount = section.querySelectorAll("canvas").length;
    if (canvasCount > 1) return `${canvasCount}x Canvas`;
    if (canvasCount === 1) return "Canvas";
    if (section.querySelector("table.matrix")) return "Matrix";
    if (section.querySelector("table.heat")) return "Heatmap";
    if (section.querySelector(".spark-table")) return "Sparkline";
    if (section.querySelector(".full-toc")) return "TOC";
    if (section.querySelector(".svg-card svg") || section.querySelector(":scope > svg")) return "SVG";
    if (section.querySelector(".waffle")) return "Waffle";
    if (section.querySelector(".treemap")) return "Treemap";
    if (section.querySelector(".tagcloud")) return "Tag Cloud";
    if (section.querySelector(".picto")) return "Pictogram";
    if (section.querySelector(".funnel-wrap")) return "Funnel";
    if (section.querySelector(".small-mult")) return "Small Mult";
    return "Editorial";
  }

  function initVizJumpDeck() {
    const deck = document.getElementById("vizJumpDeck");
    if (!deck) return;

    const sections = [...document.querySelectorAll("section")]
      .map((section, index) => {
        const num = section.querySelector(".section-num")?.textContent.trim();
        const title = section.querySelector(".section-title")?.textContent.trim();
        if (!num || !title) return null;

        const code = num.match(/§\s*([0-9]+[A-Z]?)/i)?.[1]?.toLowerCase() || String(index + 1).padStart(2, "0");
        if (!section.id) section.id = `viz-${code}`;

        return {
          href: `#${section.id}`,
          num: `§ ${code.toUpperCase()}`,
          title,
          type: inferVizType(section),
        };
      })
      .filter(Boolean);

    deck.innerHTML = sections.map((item) => `
      <a class="viz-jump" href="${item.href}">
        <span class="vj-num">${item.num}</span>
        <span>
          <span class="vj-name">${item.title}</span>
          <span class="vj-type">${item.type}</span>
        </span>
      </a>
    `).join("");
  }

  function initBackTop() {
    const button = document.getElementById("backTop");
    if (!button) return;

    let ticking = false;
    function syncVisibility() {
      ticking = false;
      button.classList.toggle("is-visible", window.scrollY > 420);
    }

    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    });

    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(syncVisibility);
    }, { passive: true });

    syncVisibility();
  }

  initVizJumpDeck();
  initBackTop();

  if (window.parent !== window) {
    let scrollTicking = false;

    function currentScrollState() {
      const root = document.scrollingElement || document.documentElement;
      const max = Math.max(0, root.scrollHeight - root.clientHeight);
      const y = window.scrollY || root.scrollTop || 0;
      return {
        ratio: max > 0 ? y / max : 0,
        theme: selectedTheme,
        y,
      };
    }

    function postScrollState() {
      window.parent.postMessage({
        type: "visual-report-scroll",
        payload: currentScrollState(),
      }, "*");
    }

    function restoreScroll(payload) {
      if (!payload) return;
      const root = document.scrollingElement || document.documentElement;
      const max = Math.max(0, root.scrollHeight - root.clientHeight);
      const targetY = max > 0 ? Math.round(max * (payload.ratio || 0)) : (payload.y || 0);
      window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
      postScrollState();
    }

    window.addEventListener("scroll", () => {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(() => {
        scrollTicking = false;
        postScrollState();
      });
    }, { passive: true });

    window.addEventListener("message", (event) => {
      if (event.data?.type !== "visual-report-restore-scroll") return;
      restoreScroll(event.data.payload);
      window.setTimeout(() => restoreScroll(event.data.payload), 120);
      window.setTimeout(() => restoreScroll(event.data.payload), 420);
    });

    window.addEventListener("load", () => {
      window.setTimeout(postScrollState, 80);
    });
  }
})();
