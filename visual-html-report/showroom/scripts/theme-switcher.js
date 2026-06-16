const themes = window.REPORT_THEMES || [];
const themeList = document.getElementById("themeList");
const themeSearch = document.getElementById("themeSearch");
const modeFilter = document.getElementById("modeFilter");
const reportFrame = document.getElementById("reportFrame");
const activeName = document.getElementById("activeName");
const activeMode = document.getElementById("activeMode");
const activeVibe = document.getElementById("activeVibe");
const openReport = document.getElementById("openReport");

const state = {
  activeSlug: new URLSearchParams(window.location.search).get("theme") || "editorial-paper",
  query: "",
  mode: "all",
  frameScroll: null,
  pendingScroll: null,
};

function reportUrl(slug) {
  return `report.html?theme=${encodeURIComponent(slug)}`;
}

function modeLabel(mode) {
  if (mode === "dark") return "暗色";
  if (mode === "textured") return "纹理";
  return "明亮";
}

function matchesTheme(theme) {
  const q = state.query.trim().toLowerCase();
  const text = `${theme.slug} ${theme.name} ${theme.mode} ${theme.vibe}`.toLowerCase();
  const matchesQuery = !q || text.includes(q);
  const matchesMode = state.mode === "all" || theme.mode === state.mode;
  return matchesQuery && matchesMode;
}

function thumb(theme, index) {
  const isActive = theme.slug === state.activeSlug;
  return `
    <button class="theme-option ${isActive ? "is-active" : ""}" type="button" data-slug="${theme.slug}" aria-pressed="${isActive}">
      <div class="thumb-frame">
          <div class="thumb-preview ${theme.className}">
          <div class="thumb-kicker">§ ${String(index + 1).padStart(2, "0")} · ${modeLabel(theme.mode)}</div>
          <div class="thumb-title">终端<em>复兴</em></div>
          <div class="thumb-kpis"><span>160k</span><span>872k</span></div>
          <div class="thumb-bars">
            <div class="thumb-bar" style="width:100%"></div>
            <div class="thumb-bar"></div>
            <div class="thumb-bar"></div>
          </div>
        </div>
      </div>
      <div class="theme-meta">
        <strong>${theme.name}</strong>
        <span>${modeLabel(theme.mode)} · ${theme.slug}</span>
        <p>${theme.vibe}</p>
      </div>
    </button>
  `;
}

function renderList() {
  const filtered = themes.filter(matchesTheme);
  themeList.innerHTML = filtered.map(thumb).join("");
}

function getFrameScrollState(frame = reportFrame) {
  if (state.frameScroll) return state.frameScroll;
  try {
    const win = frame.contentWindow;
    const doc = frame.contentDocument;
    if (!win || !doc) return null;
    const root = doc.scrollingElement || doc.documentElement;
    const max = Math.max(0, root.scrollHeight - root.clientHeight);
    const y = win.scrollY || root.scrollTop || 0;
    return {
      ratio: max > 0 ? y / max : 0,
      y,
    };
  } catch {
    return null;
  }
}

function restoreFrameScroll(frame, scrollState) {
  if (!scrollState) return;
  frame.contentWindow?.postMessage({
    type: "visual-report-restore-scroll",
    payload: scrollState,
  }, "*");
  try {
    const win = frame.contentWindow;
    const doc = frame.contentDocument;
    if (!win || !doc) return;
    const root = doc.scrollingElement || doc.documentElement;
    const max = Math.max(0, root.scrollHeight - root.clientHeight);
    const targetY = max > 0 ? Math.round(max * scrollState.ratio) : scrollState.y;
    win.scrollTo({ top: targetY, left: 0, behavior: "auto" });
  } catch {
    // iframe may still be loading; later restore attempts will handle it.
  }
}

function setActive(slug, push = true) {
  const theme = themes.find((item) => item.slug === slug) || themes[0];
  if (!theme) return;

  const shouldPreserveScroll = push && reportFrame.getAttribute("src");
  const scrollState = shouldPreserveScroll ? getFrameScrollState() : null;
  state.activeSlug = theme.slug;
  activeName.textContent = theme.name;
  activeMode.textContent = modeLabel(theme.mode);
  activeVibe.textContent = theme.vibe;
  const url = reportUrl(theme.slug);
  if (reportFrame.getAttribute("src") !== url) {
    state.pendingScroll = scrollState;
    reportFrame.src = url;
  }
  openReport.href = url;

  for (const option of themeList.querySelectorAll(".theme-option")) {
    const active = option.dataset.slug === theme.slug;
    option.classList.toggle("is-active", active);
    option.setAttribute("aria-pressed", String(active));
  }

  if (push) {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("theme", theme.slug);
    window.history.replaceState(null, "", nextUrl);
  }
}

reportFrame.addEventListener("load", () => {
  const scrollState = state.pendingScroll;
  if (!scrollState) return;
  restoreFrameScroll(reportFrame, scrollState);
  window.setTimeout(() => restoreFrameScroll(reportFrame, scrollState), 120);
  window.setTimeout(() => {
    restoreFrameScroll(reportFrame, scrollState);
    if (state.pendingScroll === scrollState) state.pendingScroll = null;
  }, 420);
});

window.addEventListener("message", (event) => {
  if (event.data?.type !== "visual-report-scroll") return;
  if (event.source !== reportFrame.contentWindow) return;
  state.frameScroll = event.data.payload;
});

themeList.addEventListener("click", (event) => {
  const button = event.target.closest(".theme-option");
  if (!button) return;
  setActive(button.dataset.slug);
});

themeSearch.addEventListener("input", () => {
  state.query = themeSearch.value;
  renderList();
});

modeFilter.addEventListener("change", () => {
  state.mode = modeFilter.value;
  renderList();
});

renderList();
setActive(state.activeSlug, false);
