/**
 * 麥麥筆記 互動前端應用程式
 * (精裝立體翻書模式 + 大字清晰版 + 完美遮蔽背誦系統 + 高清插圖燈箱 v1.2.0)
 */

let currentSubject = "all";
let currentSearch = "";
let currentPage = 0; // 當前正在閱讀的頁碼 (0-indexed)
let currentViewMode = "book"; // "book" (預設精裝翻書) 或 "list" (長頁清單)
let flipDirection = "next"; // "next" 或 "prev" 驅動翻頁動效方向

// 觸控滑動翻頁紀錄
let touchStartX = 0;
let touchStartY = 0;

// 預設字體縮放：1.0 (對應 html 根字級 23px，大字清晰護眼)
let currentFontScale = 1.0;
try {
  const savedScale = parseFloat(localStorage.getItem("maimai_notes_font_scale"));
  if (!isNaN(savedScale) && savedScale >= 0.8 && savedScale <= 2.2) {
    currentFontScale = savedScale;
  }
} catch (e) {}

document.addEventListener("DOMContentLoaded", () => {
  // 支援 URL Hash 深度連結 (例如 #p=2 或 #math, #chinese, #science-2)
  if (window.location.hash) {
    const hash = window.location.hash.replace("#", "");
    if (hash.startsWith("p=") || hash.startsWith("page=")) {
      const pNum = parseInt(hash.split("=")[1], 10);
      if (!isNaN(pNum) && pNum > 0) {
        currentPage = pNum - 1;
      }
    } else if (hash.startsWith("subj=")) {
      const s = hash.split("=")[1];
      if (["math", "science", "chinese", "social", "english", "all"].includes(s)) currentSubject = s;
    } else if (["math", "science", "chinese", "social", "english"].includes(hash)) {
      currentSubject = hash;
    } else if (typeof NOTES_DATA !== "undefined") {
      const idx = NOTES_DATA.findIndex(n => n.id === hash);
      if (idx !== -1) {
        currentPage = idx;
      }
    }
  }

  initTheme();
  initFontScale();
  initEventListeners();
  renderNotes();

  // 支援 URL 參數與 Hash 滾動跳轉 (例如 ?scroll=800 或 ?scroll=bottom 或 ?test_visible=1)
  const urlParams = new URLSearchParams(window.location.search);
  const scrollParam = urlParams.get("scroll");
  if (scrollParam) {
    setTimeout(() => {
      const scrollPos = scrollParam === "bottom" ? (document.documentElement.scrollHeight || 5000) : (parseInt(scrollParam, 10) || 0);
      window.scrollTo(0, scrollPos);
      checkBackToTopVisibility();
    }, 200);
  }
  if (urlParams.get("test_visible") === "1") {
    document.getElementById("btn-back-to-top")?.classList.add("is-visible");
  }

  if (window.location.hash && window.location.hash.includes("scroll=")) {
    const rawVal = window.location.hash.split("scroll=")[1];
    setTimeout(() => {
      const scrollPos = rawVal === "bottom" ? (document.documentElement.scrollHeight || 5000) : (parseInt(rawVal, 10) || 0);
      window.scrollTo(0, scrollPos);
      checkBackToTopVisibility();
    }, 250);
  }
});

// Theme Management
function initTheme() {
  let savedTheme = "light";
  try {
    savedTheme = localStorage.getItem("maimai_notes_theme") || "light";
  } catch (e) {}
  setTheme(savedTheme);

  document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const theme = btn.dataset.theme;
      setTheme(theme);
    });
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("maimai_notes_theme", theme);
  } catch (e) {}
  document.querySelectorAll(".theme-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.theme === theme);
  });
}

// Font Scale Management: 超有感字體放大器！
function initFontScale() {
  setFontScale(currentFontScale);

  document.getElementById("btn-font-dec")?.addEventListener("click", () => {
    if (currentFontScale > 0.8) {
      setFontScale(Math.round((currentFontScale - 0.2) * 10) / 10);
    }
  });

  document.getElementById("font-scale-label")?.addEventListener("click", () => {
    setFontScale(1.0); // 點擊百分比重設為 100%
  });

  document.getElementById("btn-font-inc")?.addEventListener("click", () => {
    if (currentFontScale < 2.0) {
      setFontScale(Math.round((currentFontScale + 0.2) * 10) / 10);
    }
  });
}

function setFontScale(scale) {
  currentFontScale = scale;
  document.documentElement.style.setProperty("--font-scale", scale.toString());
  // 保持 html 根字級固定為 16px，僅放大筆記內文字、題目與表格，確保整體排版比例與外框不會變形！
  try {
    localStorage.setItem("maimai_notes_font_scale", scale.toString());
  } catch (e) {}

  const label = document.getElementById("font-scale-label");
  if (label) {
    const pct = Math.round(scale * 100);
    label.textContent = `${pct}%`;
    label.title = `點擊重設為 100% (目前: ${pct}%)`;
  }
}

// Event Listeners
function initEventListeners() {
  // 搜尋欄
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      currentPage = 0; // 搜尋時重設至第 1 頁
      renderNotes();
    });
  }

  // 科目標籤切換
  document.querySelectorAll(".subject-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".subject-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSubject = btn.dataset.subject;
      currentPage = 0; // 切換科目時一律由第 1 頁開始
      renderNotes();
    });
  });

  // 閱讀版面切換：翻書模式 vs 清單模式
  document.getElementById("btn-mode-book")?.addEventListener("click", () => {
    setViewMode("book");
  });
  document.getElementById("btn-mode-list")?.addEventListener("click", () => {
    setViewMode("list");
  });

  // 鍵盤左右鍵與 PageUp/PageDown 翻頁
  window.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
    
    // Lightbox 開啟時按 ESC 關閉
    if (document.getElementById("image-lightbox")?.classList.contains("active")) {
      if (e.key === "Escape") closeLightbox();
      return;
    }

    if (currentViewMode !== "book") return;

    if (e.key === "ArrowRight" || e.key === "PageDown") {
      nextPage();
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      prevPage();
    }
  });

  // 手機與平板觸控左右滑動翻頁 (防呆機制：排除表格、標籤列與時間軸膠囊滑動)
  let touchTarget = null;
  window.addEventListener("touchstart", (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
      touchTarget = e.target;
    }
  }, { passive: true });

  window.addEventListener("touchend", (e) => {
    if (currentViewMode !== "book") return;
    if (document.getElementById("image-lightbox")?.classList.contains("active")) return;
    if (touchTarget && touchTarget.closest('.table-responsive, .tabs-scroll-container, .timeline-nav-pills, .book-tabs-bar')) return;
    if (e.changedTouches && e.changedTouches[0]) {
      const diffX = e.changedTouches[0].screenX - touchStartX;
      const diffY = e.changedTouches[0].screenY - touchStartY;
      // 水平位移大於 60px 且垂直偏離小於 60px 時判定為翻頁手勢
      if (Math.abs(diffX) > 60 && Math.abs(diffY) < 60) {
        if (diffX < 0) {
          nextPage(); // 往左滑：看下一頁
        } else {
          prevPage(); // 往右滑：看上一頁
        }
      }
    }
  }, { passive: true });

  // 🚀 回到頂端懸浮精靈按鈕事件監聽與滑動偵測
  const backToTopBtn = document.getElementById("btn-back-to-top");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", () => {
      scrollToTop();
    });
  }

  let isScrollTicking = false;
  window.addEventListener("scroll", () => {
    if (!isScrollTicking) {
      window.requestAnimationFrame(() => {
        checkBackToTopVisibility();
        isScrollTicking = false;
      });
      isScrollTicking = true;
    }
  }, { passive: true });

  // 初始載入時檢查一次顯示狀態
  checkBackToTopVisibility();
}

function checkBackToTopVisibility() {
  const btn = document.getElementById("btn-back-to-top");
  if (!btn) return;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  if (scrollY > 220) {
    btn.classList.add("is-visible");
  } else {
    btn.classList.remove("is-visible");
  }
}

function setViewMode(mode) {
  currentViewMode = mode;
  document.getElementById("btn-mode-book")?.classList.toggle("active", mode === "book");
  document.getElementById("btn-mode-list")?.classList.toggle("active", mode === "list");
  renderNotes();
}

// Web Audio API 柔和紙張翻頁沙沙音效
function playPageTurnSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const duration = 0.12;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(650, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch (e) {}
}

let isFlipping = false;

function flipToPage(newIndex, direction) {
  if (isFlipping) return;
  const filtered = getFilteredNotes();
  if (newIndex < 0 || newIndex >= filtered.length || newIndex === currentPage) return;

  isFlipping = true;
  playPageTurnSound();

  const spread = document.querySelector(".open-book-spread");
  if (spread) {
    spread.classList.add(direction === "next" ? "turning-page-next" : "turning-page-prev");
  }

  // 翻折至半空約 220ms 時切換內容並觸發落地平鋪
  setTimeout(() => {
    flipDirection = direction;
    currentPage = newIndex;
    renderNotes();
    scrollToBookTop();

    setTimeout(() => {
      isFlipping = false;
      document.querySelector(".open-book-spread")?.classList.remove("turning-page-next", "turning-page-prev");
    }, 400);
  }, 220);
}

// 翻頁控制核心函式
window.nextPage = function() {
  const filtered = getFilteredNotes();
  if (currentPage < filtered.length - 1) {
    flipToPage(currentPage + 1, "next");
  }
};

window.prevPage = function() {
  if (currentPage > 0) {
    flipToPage(currentPage - 1, "prev");
  }
};

window.goToPage = function(pageIndex) {
  const filtered = getFilteredNotes();
  if (pageIndex >= 0 && pageIndex < filtered.length && pageIndex !== currentPage) {
    const dir = pageIndex > currentPage ? "next" : "prev";
    flipToPage(pageIndex, dir);
  }
};

function scrollToBookTop() {
  const container = document.getElementById("notes-container");
  if (container) {
    const topPos = container.getBoundingClientRect().top + window.pageYOffset - 90;
    window.scrollTo({ top: Math.max(0, topPos), behavior: "smooth" });
  }
}

// 🚀 一鍵平滑回到網頁最頂端 (不管在哪裡都能秒回頂端)
window.scrollToTop = function() {
  const btn = document.getElementById("btn-back-to-top");
  if (btn) {
    btn.classList.add("launching");
    setTimeout(() => {
      btn.classList.remove("launching");
    }, 700);
  }
  window.scrollTo({ top: 0, behavior: "smooth" });
};

// Format bold text
function formatRichText(str) {
  if (!str) return "";
  return str.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

// 優化表頭排版：若包含括號副標（例如「被子植物 (開花植物)」），分拆為主標與小標籤，整齊不擠字
function formatTableHeader(h) {
  if (!h) return "";
  const m = h.match(/^([^\(（]+)[\(（](.+?)[\)）]$/);
  if (m) {
    return `<div class="th-content-stack"><span class="th-main-title">${m[1].trim()}</span><span class="th-sub-badge">${m[2].trim()}</span></div>`;
  }
  return `<span class="th-main-title">${h}</span>`;
}

// 格式化單元格：精美符號徽章與直向緊湊排版，杜絕文字水平暴撐
function formatTableCell(str) {
  if (!str) return "";

  // 1. 單純的 ○ 或 × / ✓ / ✕
  if (str === "○" || str === "✓") {
    return '<span class="sym-check">✓</span>';
  }
  if (str === "×" || str === "✕") {
    return '<span class="sym-cross">✕</span>';
  }

  // 2. 組合型連三符號，如 "× / × / ×" 或 "○ / ○ / ○ (唯一開花結實)"
  if (str.startsWith("× / × / ×")) {
    const note = str.replace("× / × / ×", "").replace(/[()（）]/g, "").trim();
    return `
      <div class="cell-stack">
        <div class="cell-combo-trio">
          <span class="sym-cross sym-mini">✕</span><span class="sym-sep">/</span>
          <span class="sym-cross sym-mini">✕</span><span class="sym-sep">/</span>
          <span class="sym-cross sym-mini">✕</span>
        </div>
        ${note ? `<span class="cell-note-pill note-red">${note}</span>` : ""}
      </div>
    `;
  }
  if (str.startsWith("○ / ○ / ○") || str.startsWith("✓ / ✓ / ✓")) {
    const note = str.replace(/^[○✓] \/ [○✓] \/ [○✓]/, "").replace(/[()（）]/g, "").trim();
    return `
      <div class="cell-stack">
        <div class="cell-combo-trio">
          <span class="sym-check sym-mini">✓</span><span class="sym-sep">/</span>
          <span class="sym-check sym-mini">✓</span><span class="sym-sep">/</span>
          <span class="sym-check sym-mini">✓</span>
        </div>
        ${note ? `<span class="cell-note-pill note-green">${note}</span>` : ""}
      </div>
    `;
  }

  // 3. 帶有補充註解的符號，例如 "× (無真根莖葉)", "○ (首度演化出)", "○ (免水受精)"
  const checkMatch = str.match(/^[○✓]\s*[\(（](.+?)[\)）]$/);
  if (checkMatch) {
    return `
      <div class="cell-stack">
        <span class="sym-check">✓</span>
        <span class="cell-note-pill note-green">${checkMatch[1]}</span>
      </div>
    `;
  }
  const crossMatch = str.match(/^[×✕]\s*[\(（](.+?)[\)）]$/);
  if (crossMatch) {
    return `
      <div class="cell-stack">
        <span class="sym-cross">✕</span>
        <span class="cell-note-pill note-red">${crossMatch[1]}</span>
      </div>
    `;
  }

  // 4. 關鍵字標籤，如 "孢子" / "種子"
  if (str === "孢子") {
    return '<span class="cell-keyword-tag tag-spore">孢子</span>';
  }
  if (str === "種子") {
    return '<span class="cell-keyword-tag tag-seed">種子</span>';
  }

  // 5. 一般文字：若包含括號補充說明，分層垂直排版
  const textWithNoteMatch = str.match(/^([^\(（]+)[\(（](.+?)[\)）]$/);
  if (textWithNoteMatch) {
    const mainText = textWithNoteMatch[1].trim();
    const subText = textWithNoteMatch[2].trim();
    return `
      <div class="cell-text-stack">
        <span class="cell-text-main">${formatRichText(mainText)}</span>
        <span class="cell-note-sub">(${subText})</span>
      </div>
    `;
  }

  return `<span class="cell-text-plain">${formatRichText(str)}</span>`;
}

// ========================================================
// ⏳ 產生縱貫時序全景時間線 HTML (Timeline Component)
// ========================================================
function renderTimelineHtml(timelineData, noteId) {
  if (!timelineData || !Array.isArray(timelineData) || timelineData.length === 0) return "";

  // 1. 分期快速定位膠囊
  const navPillsHtml = `
    <div class="timeline-nav-pills" role="tablist" aria-label="歷史時期快速導覽">
      <button type="button" class="timeline-nav-pill active" onclick="filterTimelineEra('${noteId}', 'all')">
        <i class="fa-solid fa-layer-group"></i> 全部時序全景
      </button>
      ${timelineData.map(era => `
        <button type="button" class="timeline-nav-pill" onclick="filterTimelineEra('${noteId}', '${era.eraId}')" style="--era-color: ${era.color};">
          <i class="fa-solid ${era.icon}"></i> ${era.eraName.replace(/第[一二三四五]階段：/, '')}
        </button>
      `).join('')}
    </div>
  `;

  // 2. 時期區塊與事件節點
  const erasHtml = timelineData.map((era, eraIdx) => `
    <div class="timeline-era-block" id="era-${noteId}-${era.eraId}" data-era-id="${era.eraId}">
      <!-- 時代大里程碑標頭 -->
      <div class="timeline-era-header" style="--era-theme: ${era.color};">
        <div class="timeline-era-icon-box">
          <i class="fa-solid ${era.icon}"></i>
        </div>
        <div class="timeline-era-meta">
          <div class="timeline-era-badge-row">
            <span class="timeline-era-badge">${era.badge || `階段 ${eraIdx + 1}`}</span>
            <span class="timeline-era-period"><i class="fa-regular fa-clock"></i> ${era.period}</span>
          </div>
          <h3 class="timeline-era-title">${era.eraName}</h3>
        </div>
      </div>

      <!-- 該時代事件垂直時間軌道 -->
      <div class="timeline-events-track">
        ${era.events.map((ev, evIdx) => `
          <div class="timeline-event-item" id="event-${noteId}-${era.eraId}-${evIdx}">
            <div class="timeline-node-stem" aria-hidden="true">
              <div class="timeline-node-dot" style="border-color: ${era.color}; color: ${era.color};">
                <i class="fa-solid ${ev.icon || 'fa-landmark'}"></i>
              </div>
            </div>

            <div class="timeline-event-card">
              <div class="timeline-event-top">
                <span class="timeline-time-badge">
                  <i class="fa-solid fa-calendar-days"></i> ${ev.time}
                </span>
                ${ev.tag ? `<span class="timeline-tag-pill">${ev.tag}</span>` : ''}
              </div>

              <h4 class="timeline-event-heading">${ev.title}</h4>

              ${ev.summary ? `<p class="timeline-event-summary">${formatRichText(ev.summary)}</p>` : ''}

              ${ev.highlights && ev.highlights.length > 0 ? `
                <div class="timeline-highlights-box">
                  <div class="timeline-hl-label">
                    <i class="fa-solid fa-star" style="color: #f59e0b;"></i> 會考核心考點精華
                  </div>
                  <ul class="timeline-hl-list">
                    ${ev.highlights.map(h => `<li>${formatRichText(h)}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              ${ev.tip ? `
                <div class="timeline-mnemonic-sticky">
                  <div class="sticky-pin">📌</div>
                  <span class="sticky-text">${formatRichText(ev.tip)}</span>
                </div>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  return `
    <div class="section-block timeline-section-wrapper" id="timeline-${noteId}">
      <div class="table-toolbar" style="margin-bottom: 14px;">
        <div class="table-toolbar-left">
          <span class="section-label" style="margin-bottom: 0;">
            <i class="fa-solid fa-hourglass-half" style="color: #0284c7;"></i> 縱貫時序全景時間線 (Historical Timeline)
          </span>
        </div>
        <div class="table-toolbar-actions">
          <span class="timeline-stage-chip"><i class="fa-solid fa-award"></i> 國三上第一次段考核心時序架構</span>
        </div>
      </div>

      ${navPillsHtml}

      <div class="timeline-tree-container">
        ${erasHtml}
      </div>
    </div>
  `;
}

window.filterTimelineEra = function(noteId, eraId) {
  const container = document.getElementById(`timeline-${noteId}`);
  if (!container) return;

  container.querySelectorAll(".timeline-nav-pill").forEach(pill => {
    const isAll = eraId === "all" && pill.textContent.includes("全部");
    const isThis = pill.getAttribute("onclick")?.includes(`'${eraId}'`);
    pill.classList.toggle("active", isAll || isThis);
  });

  const eraBlocks = container.querySelectorAll(".timeline-era-block");
  if (eraId === "all") {
    eraBlocks.forEach(b => {
      b.style.display = "";
      b.classList.remove("era-focused");
    });
  } else {
    eraBlocks.forEach(b => {
      if (b.dataset.eraId === eraId) {
        b.style.display = "";
        b.classList.add("era-focused");
        b.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        b.style.display = "none";
        b.classList.remove("era-focused");
      }
    });
  }
};

// 產生完整比較大表 HTML（百分之百寬度鎖定，零橫向捲軸）
function renderComparisonTableHtml(tableData, noteId) {
  if (!tableData || !tableData.rows || tableData.rows.length === 0) return "";
  const tableId = `table-${noteId}`;
  const colCount = tableData.headers ? tableData.headers.length : 0;
  
  return `
    <div class="section-block">
      <div class="table-toolbar">
        <div class="table-toolbar-left">
          <span class="section-label" style="margin-bottom: 0;">
            <i class="fa-solid fa-table"></i> 關鍵速查比較大表
          </span>
        </div>
        <div class="table-toolbar-actions">
          <button class="mask-mode-btn" id="btn-mask-${tableId}" onclick="toggleMaskMode('${tableId}')">
            <i class="fa-solid fa-graduation-cap"></i> 進入翻牌背誦模式
          </button>
        </div>
      </div>

      <div class="table-responsive">
        <table class="note-table col-count-${colCount}" id="${tableId}">
          <thead>
            <tr>
              ${tableData.headers.map((h, i) => `
                <th class="col-${i}">${formatTableHeader(h)}</th>
              `).join("")}
            </tr>
          </thead>
          <tbody>
            ${tableData.rows.map(row => `
              <tr>
                ${row.map((c, colIndex) => {
                  if (colIndex === 0) {
                    return `
                      <td class="cell-row-header col-0">
                        <div class="row-header-content">${formatRichText(c)}</div>
                      </td>
                    `;
                  } else {
                    return `
                      <td class="mask-cell col-${colIndex}" onclick="toggleCell(this)">
                        <div class="cell-wrapper">
                          <span class="cell-mask-card" title="點擊翻牌揭曉">
                            <i class="fa-solid fa-lock"></i>
                            <span class="mask-text">揭曉</span>
                          </span>
                          <div class="cell-real-answer">${formatTableCell(c)}</div>
                        </div>
                      </td>
                    `;
                  }
                }).join("")}
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

const SUBJECT_NAMES = {
  all: "全部",
  math: "數學",
  science: "自然",
  chinese: "國文",
  social: "社會",
  english: "英文"
};

function getFilteredNotes() {
  const dataList = (typeof NOTES_DATA !== "undefined" && Array.isArray(NOTES_DATA)) ? NOTES_DATA : [];
  return dataList.filter(item => {
    if (currentSubject !== "all" && item.subject !== currentSubject) return false;

    if (currentSearch) {
      const matchText = [
        item.title,
        item.unit,
        item.concept,
        item.subjectName,
        item.gradeVersion,
        item.mnemonic || "",
        ...(item.coreConcepts || [])
      ].join(" ").toLowerCase();
      if (!matchText.includes(currentSearch)) return false;
    }

    return true;
  });
}

// Render Notes 主進入點
function renderNotes() {
  const container = document.getElementById("notes-container");
  const statsLabel = document.getElementById("stats-label");
  if (!container) return;

  const dataList = (typeof NOTES_DATA !== "undefined" && Array.isArray(NOTES_DATA)) ? NOTES_DATA : [];
  const filtered = getFilteredNotes();

  // 更新統計文字
  if (statsLabel) {
    const subjName = SUBJECT_NAMES[currentSubject] || currentSubject;
    if (currentViewMode === "book" && filtered.length > 0) {
      statsLabel.innerHTML = `<i class="fa-solid fa-book-open"></i> 目前正在閱讀【${subjName}】第 <b>${currentPage + 1}</b> 頁 / 共 <b>${filtered.length}</b> 頁`;
    } else {
      statsLabel.innerHTML = `<i class="fa-solid fa-bookmark"></i> 目前顯示 <b>${filtered.length}</b> 則重點筆記 ${currentSubject !== "all" ? `（學科：${subjName}）` : ""}`;
    }
  }

  updateTabCounts();
  document.querySelectorAll(".subject-tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.subject === currentSubject);
  });

  // 空狀態判斷
  if (filtered.length === 0) {
    const subjName = SUBJECT_NAMES[currentSubject] || "該學科";
    container.innerHTML = `
      <div class="empty-subject-card">
        <div class="empty-mascot-wrapper">
          <img src="images/illustrations/empty_state_cat.png" alt="等待記錄的可愛貓咪" class="empty-mascot-img">
          <img src="images/illustrations/sticker_pencil.png" alt="魔法鉛筆" class="empty-pencil-badge">
        </div>
        <h3 class="empty-subject-title">目前尚無【${subjName}】科筆記</h3>
        <p class="empty-subject-desc">
          當您在看教學影片時，只要隨時截圖傳到對話中，AI 就會立即為您提煉精華重點、翻牌比較大表與隨堂互動測驗！
        </p>
        <div class="empty-action-hint">
          <img src="images/illustrations/sticker_star.png" alt="笑臉星星" class="mini-inline-sticker">
          <span>隨看隨記 · 免手抄更輕鬆</span>
        </div>
      </div>
    `;
    return;
  }

  // 校正當前頁碼防呆
  if (currentPage >= filtered.length) {
    currentPage = Math.max(0, filtered.length - 1);
  }

  if (currentViewMode === "book") {
    // 📖 精裝立體翻書模式
    container.innerHTML = createOpenBookHtml(filtered, currentPage);
  } else {
    // 📜 清單連續瀏覽模式 (同樣具備精美空白兩側手帳學習插圖)
    container.innerHTML = `
      <div class="notes-stage-layout list-stage-layout">
        ${createFlankDecorHtml()}
        <div class="notes-list">
          ${filtered.map(note => createNoteCardHtml(note)).join("")}
          <div class="list-bottom-back-top-wrap">
            <button type="button" class="book-bottom-back-top" onclick="scrollToTop()" title="平滑回到頂端">
              <i class="fa-solid fa-arrow-up"></i>
              <span>回到頂端</span>
              <span class="btn-top-sparkle">🚀</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // 綁定測驗監聽器
  attachQuizListeners(container, dataList);

  // KaTeX 數學公式優雅渲染
  if (window.renderMathInElement) {
    renderMathInElement(container, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false }
      ],
      throwOnError: false
    });
  }
}

// ========================================================
// 🌿 產生筆記空白兩側手帳學習與植物裝飾插圖 HTML (Flank Decor)
// ========================================================
// 🌿 產生筆記空白兩側手帳學習與可愛卡通藤蔓裝飾 HTML (Flank Decor)
// 支援向下超長無縫流動延展，多階層豐富插圖與藤蔓伴隨全文至最底部，保證兩側零空白、零碰撞！
// ========================================================
function createFlankDecorHtml() {
  return `
    <!-- 筆記本左側空白區插圖群：可愛卡通綠葉攀爬藤蔓群 ＋ 多階層學習插圖與小昆蟲 (一路延伸至最底部零空白) -->
    <aside class="book-flank-decor flank-left" aria-label="左側學習與卡通藤蔓飾物">
      <div class="flank-scroll-flow">
        <!-- 🌿 1. 可愛卡通主攀爬綠葉藤蔓 (頂部舒展) -->
        <div class="flank-card cartoon-side-vine vine-left" title="🌿 可愛卡通綠葉藤蔓 · 自然舒心">
          <img src="images/illustrations/cartoon_vine_left.png" alt="卡通綠葉藤蔓" class="vine-img">
        </div>

        <!-- 📚 2. 同款動漫小女孩風格之學習書堆與小芽 -->
        <div class="flank-card flank-book-stack" title="📚 點滴累積知識 · 快樂學習">
          <img src="images/illustrations/decor_books_stack.png" alt="動漫風學習書堆" class="flank-img">
          <span class="flank-badge"><i class="fa-solid fa-seedling"></i> 快樂學習</span>
        </div>

        <!-- 🐞 3. 向下延伸之攀爬綠藤蔓（含小瓢蟲與花朵） -->
        <div class="flank-card cartoon-side-vine-ext vine-left-ext" title="🐞 森林小瓢蟲與攀爬綠藤蔓">
          <img src="images/illustrations/cartoon_vine_extension.png" alt="延伸綠藤蔓與小瓢蟲" class="vine-img-ext">
        </div>

        <!-- 🧪 4. 探索求知魔法試劑燒瓶貼紙 -->
        <div class="flank-card flank-flask-sticker" title="🧪 勇於實驗探索 · 發現新知">
          <img src="images/illustrations/sticker_flask.png" alt="實驗燒瓶貼紙" class="flank-img-sticker">
          <span class="flank-badge badge-science"><i class="fa-solid fa-flask"></i> 探索求知</span>
        </div>

        <!-- 🌿 5. 繼續向下生長之曲折綠藤蔓 (自然盤繞延伸) -->
        <div class="flank-card cartoon-side-vine-ext vine-left-ext-flip" title="🌿 自然盤繞綠藤蔓">
          <img src="images/illustrations/cartoon_vine_extension_flip.png" alt="曲折綠藤蔓" class="vine-img-ext">
        </div>

        <!-- ✏️ 6. 勤做筆記手繪鉛筆貼紙 -->
        <div class="flank-card flank-pencil-sticker" title="✏️ 麥麥好記性不如爛筆頭">
          <img src="images/illustrations/sticker_pencil.png" alt="可愛鉛筆貼紙" class="flank-img-sticker">
          <span class="flank-badge"><i class="fa-solid fa-pencil"></i> 勤做筆記</span>
        </div>

        <!-- 🌿 7. 攀登延伸綠葉藤蔓末梢 -->
        <div class="flank-card cartoon-side-vine-ext vine-left-ext" title="🌿 向上攀爬生機盎然">
          <img src="images/illustrations/cartoon_vine_extension.png" alt="延伸綠藤蔓" class="vine-img-ext">
        </div>

        <!-- ⭐ 8. 榮耀金色成就星星 -->
        <div class="flank-card flank-star-sticker" title="⭐ 滿分達成 · 學習大贏家">
          <img src="images/illustrations/sticker_star.png" alt="榮耀之星" class="flank-img-sticker">
          <span class="flank-badge badge-star"><i class="fa-solid fa-star"></i> 學習大贏家</span>
        </div>

        <!-- 🌿 9. 繼續向下延伸之翠綠藤蔓 (深層流動) -->
        <div class="flank-card cartoon-side-vine-ext vine-left-ext-flip" title="🌿 翠綠藤蔓盤旋">
          <img src="images/illustrations/cartoon_vine_extension_flip.png" alt="深層翠綠藤蔓" class="vine-img-ext">
        </div>

        <!-- 📖 10. 可愛微笑翻開筆記本 -->
        <div class="flank-card flank-openbook-sticker" title="📖 融會貫通 · 知識在心">
          <img src="images/illustrations/sticker_book.png" alt="學習手帳貼紙" class="flank-img-sticker">
          <span class="flank-badge"><i class="fa-solid fa-book-open"></i> 融會貫通</span>
        </div>

        <!-- 🌿 11. 連續延伸攀爬藤蔓 -->
        <div class="flank-card cartoon-side-vine-ext vine-left-ext" title="🌿 向上攀爬藤蔓">
          <img src="images/illustrations/cartoon_vine_extension.png" alt="向上攀爬藤蔓" class="vine-img-ext">
        </div>

        <!-- 📚 12. 動漫風學習教材書堆 -->
        <div class="flank-card flank-book-stack" title="📚 博覽群書 · 積少成多">
          <img src="images/illustrations/decor_books_stack.png" alt="學習教材書堆" class="flank-img">
          <span class="flank-badge"><i class="fa-solid fa-seedling"></i> 積少成多</span>
        </div>

        <!-- 🌿 13. 自然盤繞翠綠枝藤 -->
        <div class="flank-card cartoon-side-vine-ext vine-left-ext-flip" title="🌿 盎然生機藤蔓">
          <img src="images/illustrations/cartoon_vine_extension_flip.png" alt="盎然生機藤蔓" class="vine-img-ext">
        </div>

        <!-- 🧪 14. 智慧探索科學燒瓶 -->
        <div class="flank-card flank-flask-sticker" title="🧪 理化自然觀念通">
          <img src="images/illustrations/sticker_flask.png" alt="科學燒瓶" class="flank-img-sticker">
          <span class="flank-badge badge-science"><i class="fa-solid fa-flask"></i> 觀念透徹</span>
        </div>

        <!-- 🌿 15. 延伸攀爬綠藤蔓 -->
        <div class="flank-card cartoon-side-vine-ext vine-left-ext" title="🌿 綠意常伴">
          <img src="images/illustrations/cartoon_vine_extension.png" alt="綠意常伴" class="vine-img-ext">
        </div>

        <!-- ✏️ 16. 彩色鉛筆手帳貼紙 -->
        <div class="flank-card flank-pencil-sticker" title="✏️ 點石成金 · 題題得分">
          <img src="images/illustrations/sticker_pencil.png" alt="彩色鉛筆" class="flank-img-sticker">
          <span class="flank-badge"><i class="fa-solid fa-pencil"></i> 題題得分</span>
        </div>

        <!-- 🌿 17. 底部延伸綠葉藤蔓 -->
        <div class="flank-card cartoon-side-vine-ext vine-left-ext-flip" title="🌿 枝繁葉茂生機勃勃">
          <img src="images/illustrations/cartoon_vine_extension_flip.png" alt="底部綠葉藤蔓" class="vine-img-ext">
        </div>

        <!-- ⭐ 18. 終點榮譽金色之星 -->
        <div class="flank-card flank-star-sticker" title="⭐ 滿分通關 · 學習成果棒！">
          <img src="images/illustrations/sticker_star.png" alt="滿分通關之星" class="flank-img-sticker">
          <span class="flank-badge badge-star"><i class="fa-solid fa-award"></i> 滿分通關</span>
        </div>
      </div>
    </aside>

    <!-- 筆記本右側空白區插圖群：可愛卡通櫻花攀爬藤蔓群 ＋ 智慧貓頭鷹與探索飾物 (一路延伸至最底部零空白) -->
    <aside class="book-flank-decor flank-right" aria-label="右側學習與卡通藤蔓飾物">
      <div class="flank-scroll-flow">
        <!-- 🌸 1. 可愛卡通主攀爬櫻花藤蔓 (頂部舒展) -->
        <div class="flank-card cartoon-side-vine vine-right" title="🌸 可愛卡通櫻花藤蔓 · 舒心陪伴">
          <img src="images/illustrations/cartoon_vine_right.png" alt="卡通櫻花藤蔓" class="vine-img">
        </div>

        <!-- 🦉 2. 戴博士帽認真讀書的智慧小貓頭鷹 -->
        <div class="flank-card flank-owl-reading" title="🦉 智慧貓頭鷹：麥麥今天表現超棒！">
          <img src="images/illustrations/decor_owl_reading.png" alt="智慧讀書小貓頭鷹" class="flank-img">
          <span class="flank-badge badge-owl"><i class="fa-solid fa-graduation-cap"></i> 每天進步一點點</span>
        </div>

        <!-- 🐝 3. 向下延伸之櫻花藤蔓（含嗡嗡小蜜蜂） -->
        <div class="flank-card cartoon-side-vine-ext vine-right-ext" title="🐝 嗡嗡小蜜蜂與櫻花藤蔓">
          <img src="images/illustrations/cartoon_vine_extension_right.png" alt="延伸櫻花藤蔓與小蜜蜂" class="vine-img-ext">
        </div>

        <!-- 🌍 4. 古典探知地球儀 -->
        <div class="flank-card flank-study-globe" title="✨ 探索世界 · 知識就是力量">
          <img src="images/illustrations/decor_study_globe.png" alt="古典探索地球儀" class="flank-img">
          <span class="flank-badge badge-globe"><i class="fa-solid fa-earth-americas"></i> 知識就是力量</span>
        </div>

        <!-- 🌸 5. 繼續向下綻放之櫻花藤蔓 (花苞朵朵綻放) -->
        <div class="flank-card cartoon-side-vine-ext vine-right-ext-flip" title="🌸 盛開春櫻藤蔓">
          <img src="images/illustrations/cartoon_vine_extension_right_flip.png" alt="盛開櫻花藤蔓" class="vine-img-ext">
        </div>

        <!-- 📖 6. 翻開的彩色學習筆記本貼紙 -->
        <div class="flank-card flank-openbook-sticker" title="📖 深入理解核心觀念">
          <img src="images/illustrations/sticker_book.png" alt="筆記手帳貼紙" class="flank-img-sticker">
          <span class="flank-badge"><i class="fa-solid fa-book-open"></i> 融會貫通</span>
        </div>

        <!-- 🌸 7. 攀登延伸櫻花藤蔓末梢 -->
        <div class="flank-card cartoon-side-vine-ext vine-right-ext" title="🌸 芬芳陪伴成長">
          <img src="images/illustrations/cartoon_vine_extension_right.png" alt="延伸櫻花藤蔓" class="vine-img-ext">
        </div>

        <!-- 🏆 8. 麥麥學業徽章獎章 -->
        <div class="flank-card flank-logo-sticker" title="🏆 麥麥專屬榮耀認證">
          <img src="images/illustrations/miley_brand_logo.png" alt="麥麥榮譽徽章" class="flank-img-sticker">
          <span class="flank-badge badge-badge"><i class="fa-solid fa-award"></i> 實力滿分</span>
        </div>

        <!-- 🌸 9. 繼續向下綻放之櫻花花瀑 -->
        <div class="flank-card cartoon-side-vine-ext vine-right-ext-flip" title="🌸 春櫻花瀑垂墜">
          <img src="images/illustrations/cartoon_vine_extension_right_flip.png" alt="春櫻花瀑" class="vine-img-ext">
        </div>

        <!-- ✏️ 10. 可愛學習鉛筆貼紙 -->
        <div class="flank-card flank-pencil-sticker" title="✏️ 專注筆耕 · 下筆有神">
          <img src="images/illustrations/sticker_pencil.png" alt="手繪筆記鉛筆" class="flank-img-sticker">
          <span class="flank-badge"><i class="fa-solid fa-pencil"></i> 下筆有神</span>
        </div>

        <!-- 🌸 11. 延伸櫻花蔓藤伴讀 -->
        <div class="flank-card cartoon-side-vine-ext vine-right-ext" title="🌸 櫻花繁茂蔓延">
          <img src="images/illustrations/cartoon_vine_extension_right.png" alt="櫻花繁茂蔓延" class="vine-img-ext">
        </div>

        <!-- 🦉 12. 鼓舞應援小貓頭鷹 -->
        <div class="flank-card flank-owl-reading" title="🦉 貓頭鷹導師：持之以恆，妳是最棒的！">
          <img src="images/illustrations/decor_owl_reading.png" alt="應援小貓頭鷹" class="flank-img">
          <span class="flank-badge badge-owl"><i class="fa-solid fa-graduation-cap"></i> 持之以恆</span>
        </div>

        <!-- 🌸 13. 盛開櫻花藤蔓反向曲折 -->
        <div class="flank-card cartoon-side-vine-ext vine-right-ext-flip" title="🌸 柔美櫻花藤蔓">
          <img src="images/illustrations/cartoon_vine_extension_right_flip.png" alt="柔美櫻花藤蔓" class="vine-img-ext">
        </div>

        <!-- 🌍 14. 探索世界地球儀 -->
        <div class="flank-card flank-study-globe" title="✨ 視野開闊 · 放眼世界">
          <img src="images/illustrations/decor_study_globe.png" alt="世界探索地球儀" class="flank-img">
          <span class="flank-badge badge-globe"><i class="fa-solid fa-earth-americas"></i> 放眼世界</span>
        </div>

        <!-- 🌸 15. 芬芳櫻花延伸藤蔓 -->
        <div class="flank-card cartoon-side-vine-ext vine-right-ext" title="🌸 芬芳花語陪伴">
          <img src="images/illustrations/cartoon_vine_extension_right.png" alt="芬芳櫻花" class="vine-img-ext">
        </div>

        <!-- 📖 16. 彩色手帳筆記貼紙 -->
        <div class="flank-card flank-openbook-sticker" title="📖 滿載智慧的筆記">
          <img src="images/illustrations/sticker_book.png" alt="智慧筆記本" class="flank-img-sticker">
          <span class="flank-badge"><i class="fa-solid fa-book-open"></i> 滿載智慧</span>
        </div>

        <!-- 🌸 17. 底部延伸櫻花藤蔓 -->
        <div class="flank-card cartoon-side-vine-ext vine-right-ext-flip" title="🌸 春櫻陪伴到最後一頁">
          <img src="images/illustrations/cartoon_vine_extension_right_flip.png" alt="底部櫻花藤蔓" class="vine-img-ext">
        </div>

        <!-- 🏆 18. 滿分榮譽徽章認證 -->
        <div class="flank-card flank-logo-sticker" title="🏆 金牌學霸 · 完美收官！">
          <img src="images/illustrations/miley_brand_logo.png" alt="金牌學霸徽章" class="flank-img-sticker">
          <span class="flank-badge badge-badge"><i class="fa-solid fa-award"></i> 完美收官</span>
        </div>
      </div>
    </aside>
  `;
}

// ========================================================
// 📖 產生精裝立體翻書模式 HTML (含頁碼、快捷標籤與插圖)
// ========================================================
function createOpenBookHtml(filtered, pageIdx) {
  const currentNote = filtered[pageIdx];
  const totalPages = filtered.length;
  const prevNote = pageIdx > 0 ? filtered[pageIdx - 1] : null;
  const nextNote = pageIdx < totalPages - 1 ? filtered[pageIdx + 1] : null;

  const animClass = flipDirection === "next" ? "page-flip-next-enter" : "page-flip-prev-enter";

  // 1. 書頂快捷頁數標籤條 (Book Tabs Ribbon) - 依使用者指示往內縮，純淨簡短標籤「第 1 頁」「第 2 頁」...
  const tabsBarHtml = `
    <div class="book-tabs-bar" role="tablist" aria-label="章節頁數快捷導覽">
      ${filtered.map((note, idx) => `
        <button class="book-tab-item ${idx === pageIdx ? 'active' : ''}" 
          onclick="goToPage(${idx})" 
          title="${note.title}">
          <span class="tab-page-num"><i class="fa-solid fa-bookmark"></i> 第 ${idx + 1} 頁</span>
        </button>
      `).join('')}
    </div>
  `;

  // 2. 教學插圖區塊 (Illustration Card)
  let illustrationHtml = "";
  if (currentNote.image) {
    const safeCaption = (currentNote.imageCaption || currentNote.title).replace(/'/g, "\\'");
    illustrationHtml = `
      <div class="book-illustration-block">
        <div class="illustration-header">
          <span class="illustration-tag">
            <i class="fa-solid fa-image"></i> 教學重點插圖精華
          </span>
          <button class="btn-zoom-img" onclick="openLightbox('${currentNote.image}', '${safeCaption}')" title="點擊放大全螢幕查看">
            <i class="fa-solid fa-magnifying-glass-plus"></i> 點擊放大查看
          </button>
        </div>
        <div class="illustration-frame" onclick="openLightbox('${currentNote.image}', '${safeCaption}')" title="點擊放大高清全螢幕對照">
          <img src="${currentNote.image}" alt="${currentNote.title}" class="illustration-img" loading="lazy">
          <div class="illustration-hover-overlay">
            <i class="fa-solid fa-expand"></i> 點擊放大高清全螢幕對照
          </div>
        </div>
        ${currentNote.imageCaption ? `<div class="illustration-caption"><i class="fa-solid fa-circle-info"></i> ${currentNote.imageCaption}</div>` : ''}
      </div>
    `;
  }

  // 3. 關鍵速查比較大表 (含單鍵翻牌背誦，100% 筆記本寬度自適應)
  const tableHtml = renderComparisonTableHtml(currentNote.table, currentNote.id);

  // 4. 隨堂自我檢測 (Quiz Panel)
  let quizHtml = "";
  if (currentNote.quiz && currentNote.quiz.length > 0) {
    quizHtml = currentNote.quiz.map((q, qIndex) => `
      <div class="quiz-panel" id="quiz-${currentNote.id}-${qIndex}">
        <div class="quiz-header">
          <span class="quiz-header-title"><img src="images/illustrations/sticker_flask.png" class="section-label-sticker" alt="隨堂測驗"> 隨堂觀念自我檢測</span>
          <span class="quiz-badge">點選即測即評</span>
        </div>
        <p class="quiz-question-text">${q.question}</p>
        <div class="quiz-options-list">
          ${q.options.map((opt, optIndex) => `
            <button class="quiz-opt-btn" 
              data-note-id="${currentNote.id}"
              data-q-idx="${qIndex}"
              data-opt-idx="${optIndex}"
              data-correct="${opt.correct}">
              <span class="quiz-opt-prefix">${opt.prefix}</span>
              <span class="quiz-opt-text">${opt.text}</span>
            </button>
          `).join("")}
        </div>
        <div class="quiz-feedback-box" id="feedback-${currentNote.id}-${qIndex}"></div>
      </div>
    `).join("");
  }

  // 5. 底部主翻頁控制列 (依據使用者圖二指示：全面升級為 3D 卡通立體木板招牌與手繪飾圖)
  const bottomNavHtml = `
    <div class="book-bottom-nav">
      <div class="flip-btn-group">
        <!-- 上一頁大木牌按鈕 (卡通手繪風格) -->
        <button class="book-flip-btn btn-prev-action" onclick="prevPage()" ${pageIdx === 0 ? 'disabled' : ''} title="翻到上一頁">
          <span class="wood-sprout-accent">🌱</span>
          <span class="btn-main-label"><i class="fa-solid fa-chevron-left"></i> 上一頁</span>
          <span class="btn-sub-label">${prevNote ? `第 ${pageIdx} 頁：${prevNote.title}` : '已是第一頁'}</span>
        </button>

        <!-- 中間頁數卡通木質告示牌與進度圓點 -->
        <div class="page-indicator-wood-sign">
          <div class="page-indicator-text">
            <i class="fa-solid fa-bookmark"></i> 第 ${pageIdx + 1} 頁 / 共 ${totalPages} 頁
          </div>
          <div class="page-dots-list" title="頁碼跳頁">
            ${filtered.map((_, idx) => `
              <button class="page-dot-btn ${idx === pageIdx ? 'active' : ''}" 
                onclick="goToPage(${idx})" 
                title="跳至第 ${idx + 1} 頁"></button>
            `).join('')}
          </div>
        </div>

        <!-- 下一頁大木牌按鈕 (藍色魔法探險木牌) -->
        <button class="book-flip-btn btn-next-action" onclick="nextPage()" ${pageIdx === totalPages - 1 ? 'disabled' : ''} title="翻到下一頁">
          <span class="wood-sprout-accent">🌸</span>
          <span class="btn-main-label">下一頁 <i class="fa-solid fa-chevron-right"></i></span>
          <span class="btn-sub-label">${nextNote ? `第 ${pageIdx + 2} 頁：${nextNote.title}` : '<img src="images/illustrations/sticker_star.png" class="btn-mini-star" alt="星星"> 🎉 本單元全部完成'}</span>
        </button>
      </div>

      <div class="flip-shortcut-hint">
        <div class="shortcut-tip-content">
          <img src="images/illustrations/sticker_pencil.png" class="hint-cute-sticker" alt="鉛筆">
          <span>鍵盤快速鍵：可使用左右方向鍵 <b>← / →</b> 翻頁 · 手機平板支援左右滑動</span>
        </div>
        <button type="button" class="book-bottom-back-top" onclick="scrollToTop()" title="滑動回到最頂端">
          <i class="fa-solid fa-arrow-up"></i>
          <span>回到頂端</span>
          <span class="btn-top-sparkle">🚀</span>
        </button>
      </div>
    </div>
  `;

  // 組合手帳質感立體翻開書本 (外露彩色便籤標記貼 + 左側露出的青色外殼與橫線活頁紙)
  return `
    <div class="open-book-container">
      ${tabsBarHtml}

      <div class="notes-stage-layout">
        ${createFlankDecorHtml()}

        <div class="open-book-wrapper">
        <!-- 頂部手帳便籤突出標記貼 (參考圖頂部的彩色便利貼標籤) -->
        <div class="notebook-top-tabs" aria-hidden="true">
          <div class="notebook-tab-flag flag-amber" title="核心重點標記"></div>
          <div class="notebook-tab-flag flag-rose" title="精選考點標記"></div>
          <div class="notebook-tab-flag flag-teal" title="圖解速查標記"></div>
        </div>

        <!-- 左側層疊筆記紙外露底層 (參考圖左側突出的青色封皮護板與橫線活頁紙) -->
        <div class="notebook-left-sheets" aria-hidden="true">
          <!-- 底層青色封皮護板 -->
          <div class="sheet-layer sheet-backing-cover"></div>
          <!-- 橫線活頁筆記紙露出一角 -->
          <div class="sheet-layer sheet-lined-paper">
            <div class="lined-paper-ruled"></div>
          </div>
          <!-- 堆疊紙張側緣多層厚度 -->
          <div class="sheet-layer sheet-stacked-leaves"></div>
        </div>

        <!-- 右側堆疊紙張厚度 -->
        <div class="notebook-right-sheets" aria-hidden="true">
          <div class="sheet-layer sheet-stacked-leaves-right"></div>
        </div>

        <!-- 主筆記紙本體 (乾淨平整白紙，絕無中央凹下折痕) -->
        <div class="open-book-spread">
          <!-- 可愛和紙膠帶角落飾貼 -->
          <div class="washi-tape-sticker washi-top-left" aria-hidden="true"></div>
          <div class="washi-tape-sticker washi-top-right" aria-hidden="true"></div>

          <!-- 可愛手帳書本插圖貼紙標籤 -->
          <img src="images/illustrations/sticker_book.png" alt="筆記貼紙" class="notebook-sticker-badge" aria-hidden="true">

          <!-- 復古金色書角裝飾 -->
          <div class="book-corner top-left"></div>
          <div class="book-corner top-right"></div>
          <div class="book-corner bottom-left"></div>
          <div class="book-corner bottom-right"></div>

          <!-- 絲質書籤飄帶 -->
          <div class="book-ribbon" style="background: linear-gradient(180deg, var(--subj-${currentNote.subject}) 0%, var(--primary-hover) 100%);"></div>

          <!-- 兩側層疊立體書頁頁緣飾邊 (Book Deck Edges) -->
          <div class="book-deck-pages left-deck"></div>
          <div class="book-deck-pages right-deck"></div>
          <div class="book-side-flourish left-flourish"><i class="fa-solid fa-leaf"></i></div>
          <div class="book-side-flourish right-flourish"><i class="fa-solid fa-leaf"></i></div>

          <!-- 懸浮左側翻頁翅膀 -->
          <button class="book-side-nav prev-side" onclick="prevPage()" ${pageIdx === 0 ? 'disabled' : ''} title="上一頁">
            <i class="fa-solid fa-chevron-left"></i>
          </button>

          <!-- 懸浮右側翻頁翅膀 -->
          <button class="book-side-nav next-side" onclick="nextPage()" ${pageIdx === totalPages - 1 ? 'disabled' : ''} title="下一頁">
            <i class="fa-solid fa-chevron-right"></i>
          </button>

        <!-- 書本內頁內容 -->
        <article class="book-page-body ${animClass}" id="${currentNote.id}">
          <!-- Running Header (頁首資訊含頂部快捷翻頁控制列 - 卡通手繪風格小木牌與花枝分隔線) -->
          <div class="book-running-head">
            <div class="book-running-left">
              <span class="subject-badge badge-${currentNote.subject}">
                <i class="fa-solid ${currentNote.subjectIcon || 'fa-tag'}"></i> ${currentNote.subjectName}
              </span>
              <span class="unit-tag"><i class="fa-solid fa-seedling"></i> ${currentNote.unit}</span>
              <span class="concept-tag"><i class="fa-solid fa-feather-pointed"></i> ${currentNote.gradeVersion}</span>
            </div>

            <!-- 頂部即時翻頁控制區塊 (免滾動至底部即可翻頁) -->
            <div class="book-top-flip-bar">
              <button class="book-top-btn" onclick="prevPage()" ${pageIdx === 0 ? 'disabled' : ''} title="上一頁">
                <i class="fa-solid fa-chevron-left"></i> 上一頁
              </button>
              <div class="book-page-stamp">
                <i class="fa-solid fa-bookmark"></i> 第 ${pageIdx + 1} 頁 / 共 ${totalPages} 頁
              </div>
              <button class="book-top-btn next-top-btn" onclick="nextPage()" ${pageIdx === totalPages - 1 ? 'disabled' : ''} title="下一頁">
                下一頁 <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <!-- 筆記大標題 -->
          <h2 class="note-title">${currentNote.title}</h2>

          <!-- 精選教學插圖區塊 -->
          ${illustrationHtml}

          <!-- 核心觀念精粹 -->
          <div class="section-block">
            <div class="section-label">
              <img src="images/illustrations/sticker_pencil.png" class="section-label-sticker" alt="魔法鉛筆">
              <span>核心觀念精粹</span>
            </div>
            <ul class="concepts-list">
              ${currentNote.coreConcepts.map(c => `<li>${formatRichText(c)}</li>`).join("")}
            </ul>
          </div>

          <!-- 縱貫時序全景時間線 (若有) -->
          ${currentNote.timeline ? renderTimelineHtml(currentNote.timeline, currentNote.id) : ''}

          <!-- 關鍵速查比較大表 -->
          ${tableHtml}

          <!-- 黃金記憶口訣 -->
          ${currentNote.mnemonic ? `
            <div class="mnemonic-box">
              <div class="box-title">
                <img src="images/illustrations/sticker_star.png" class="section-label-sticker" alt="星星">
                <span>黃金記憶口訣與秒殺密碼</span>
              </div>
              <div>${currentNote.mnemonic}</div>
            </div>
          ` : ''}

          <!-- 隨堂即時自我檢測 -->
          ${quizHtml}

          <!-- Running Footer (頁尾資訊) -->
          <div class="book-running-footer">
            <div class="book-footer-branding">
              <i class="fa-solid fa-graduation-cap"></i> 麥麥筆記 · 教學影片重點精華庫
            </div>
            <div class="book-footer-pagenum">
              - 第 ${pageIdx + 1} 頁 -
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>

  <!-- 底部翻頁主控制中心 -->
  ${bottomNavHtml}
</div>
`;
}

// 備用：清單連續瀏覽模式 Note Card HTML
function createNoteCardHtml(note) {
  let illustrationHtml = "";
  if (note.image) {
    const safeCaption = (note.imageCaption || note.title).replace(/'/g, "\\'");
    illustrationHtml = `
      <div class="book-illustration-block">
        <div class="illustration-header">
          <span class="illustration-tag"><i class="fa-solid fa-image"></i> 教學重點插圖精華</span>
          <button class="btn-zoom-img" onclick="openLightbox('${note.image}', '${safeCaption}')">
            <i class="fa-solid fa-magnifying-glass-plus"></i> 放大查看
          </button>
        </div>
        <div class="illustration-frame" onclick="openLightbox('${note.image}', '${safeCaption}')">
          <img src="${note.image}" alt="${note.title}" class="illustration-img" loading="lazy">
        </div>
        ${note.imageCaption ? `<div class="illustration-caption">${note.imageCaption}</div>` : ''}
      </div>
    `;
  }

  // 關鍵速查比較大表 (含單鍵翻牌背誦，100% 筆記本寬度自適應)
  const tableHtml = renderComparisonTableHtml(note.table, note.id);

  let quizHtml = "";
  if (note.quiz && note.quiz.length > 0) {
    quizHtml = note.quiz.map((q, qIndex) => `
      <div class="quiz-panel" id="quiz-${note.id}-${qIndex}">
        <div class="quiz-header">
          <span class="quiz-header-title"><i class="fa-solid fa-circle-question"></i> 隨堂觀念自我檢測</span>
          <span class="quiz-badge">點選即測即評</span>
        </div>
        <p class="quiz-question-text">${q.question}</p>
        <div class="quiz-options-list">
          ${q.options.map((opt, optIndex) => `
            <button class="quiz-opt-btn" 
              data-note-id="${note.id}"
              data-q-idx="${qIndex}"
              data-opt-idx="${optIndex}"
              data-correct="${opt.correct}">
              <span class="quiz-opt-prefix">${opt.prefix}</span>
              <span class="quiz-opt-text">${opt.text}</span>
            </button>
          `).join("")}
        </div>
        <div class="quiz-feedback-box" id="feedback-${note.id}-${qIndex}"></div>
      </div>
    `).join("");
  }

  return `
    <article class="note-card" id="${note.id}">
      <div class="card-top-header">
        <div class="tags-group">
          <span class="subject-badge badge-${note.subject}">
            <i class="fa-solid ${note.subjectIcon || 'fa-tag'}"></i> ${note.subjectName}
          </span>
          <span class="unit-tag">${note.unit}</span>
          <span class="concept-tag">${note.gradeVersion}</span>
        </div>
      </div>

      <h2 class="note-title">${note.title}</h2>

      ${illustrationHtml}

      <div class="section-block">
        <div class="section-label"><i class="fa-solid fa-lightbulb"></i> 核心觀念精粹</div>
        <ul class="concepts-list">
          ${note.coreConcepts.map(c => `<li>${formatRichText(c)}</li>`).join("")}
        </ul>
      </div>

      <!-- 縱貫時序全景時間線 (若有) -->
      ${note.timeline ? renderTimelineHtml(note.timeline, note.id) : ''}

      ${tableHtml}

      ${note.mnemonic ? `
        <div class="mnemonic-box">
          <div class="box-title"><i class="fa-solid fa-star"></i> 黃金記憶口訣與秒殺密碼</div>
          <div>${note.mnemonic}</div>
        </div>
      ` : ''}

      ${quizHtml}
    </article>
  `;
}

// 測驗答題監聽
function attachQuizListeners(container, dataList) {
  container.querySelectorAll(".quiz-opt-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const noteId = btn.dataset.noteId;
      const qIdx = parseInt(btn.dataset.qIdx);
      const optIdx = parseInt(btn.dataset.optIdx);
      const isCorrect = btn.dataset.correct === "true";

      const note = dataList.find(n => n.id === noteId);
      if (!note || !note.quiz || !note.quiz[qIdx]) return;
      const q = note.quiz[qIdx];
      const selectedOpt = q.options[optIdx];

      const quizPanel = document.getElementById(`quiz-${noteId}-${qIdx}`);
      const feedbackBox = document.getElementById(`feedback-${noteId}-${qIdx}`);
      if (!quizPanel || !feedbackBox) return;

      const allBtns = quizPanel.querySelectorAll(".quiz-opt-btn");

      if (isCorrect) {
        allBtns.forEach(b => {
          b.disabled = true;
          if (b.dataset.correct === "true") b.classList.add("is-correct");
          else b.classList.remove("is-wrong");
        });
        feedbackBox.className = "quiz-feedback-box show-correct";
        feedbackBox.innerHTML = `
          <div style="font-weight: 800; font-size: 1.25rem; margin-bottom: 8px; display: flex; align-items: center; gap: 10px;">
            <img src="images/illustrations/sticker_star.png" alt="星星獎章" class="quiz-correct-star">
            <span>🎉 答對了！太厲害了！</span>
          </div>
          <div>${selectedOpt.explanation}</div>
        `;
      } else {
        btn.classList.add("is-wrong");
        feedbackBox.className = "quiz-feedback-box show-wrong";
        feedbackBox.innerHTML = `
          <div style="font-weight: 800; font-size: 1.25rem; margin-bottom: 8px;"><i class="fa-solid fa-circle-xmark"></i> ❌ 答案不太對喔！再想想看～</div>
          <div>${selectedOpt.explanation}</div>
          <button class="retry-quiz-btn" onclick="retryQuiz('${noteId}', ${qIdx})"><i class="fa-solid fa-rotate-left"></i> 重新作答</button>
        `;
      }
    });
  });
}

window.retryQuiz = function(noteId, qIdx) {
  const quizPanel = document.getElementById(`quiz-${noteId}-${qIdx}`);
  const feedbackBox = document.getElementById(`feedback-${noteId}-${qIdx}`);
  if (!quizPanel || !feedbackBox) return;

  quizPanel.querySelectorAll(".quiz-opt-btn").forEach(b => {
    b.disabled = false;
    b.classList.remove("is-correct", "is-wrong");
  });
  feedbackBox.className = "quiz-feedback-box";
  feedbackBox.style.display = "none";
};

// 🃏 翻牌遮蔽背誦功能 (單一切換按鈕，100% 零漏字)
window.toggleMaskMode = function(tableId) {
  const table = document.getElementById(tableId);
  const btn = document.getElementById(`btn-mask-${tableId}`);
  if (!table) return;

  const isMasked = table.classList.toggle("is-masked");
  if (btn) {
    if (isMasked) {
      btn.classList.add("is-active");
      btn.innerHTML = `<i class="fa-solid fa-eye"></i> 退出背誦模式（顯示全部答案）`;
      table.querySelectorAll("tbody td.mask-cell").forEach(cell => {
        cell.classList.remove("is-revealed");
      });
    } else {
      btn.classList.remove("is-active");
      btn.innerHTML = `<i class="fa-solid fa-graduation-cap"></i> 進入翻牌背誦模式`;
      table.querySelectorAll("tbody td.mask-cell").forEach(cell => {
        cell.classList.remove("is-revealed");
      });
    }
  }
};

window.toggleCell = function(cell) {
  const table = cell.closest(".note-table");
  if (!table || !table.classList.contains("is-masked")) return;
  cell.classList.toggle("is-revealed");
};

// 🔍 高清插圖燈箱控制
window.openLightbox = function(imgSrc, caption) {
  const box = document.getElementById("image-lightbox");
  const img = document.getElementById("lightbox-img");
  const cap = document.getElementById("lightbox-caption");
  if (!box || !img) return;
  img.src = imgSrc;
  if (cap) cap.textContent = caption || "";
  box.classList.add("active");
  document.body.style.overflow = "hidden";
};

window.closeLightbox = function(e) {
  const box = document.getElementById("image-lightbox");
  if (!box) return;
  box.classList.remove("active");
  document.body.style.overflow = "";
};

function updateTabCounts() {
  const dataList = (typeof NOTES_DATA !== "undefined" && Array.isArray(NOTES_DATA)) ? NOTES_DATA : [];
  document.querySelectorAll(".subject-tab-btn").forEach(btn => {
    const subj = btn.dataset.subject;
    const badge = btn.querySelector(".badge-count");
    if (badge) {
      if (subj === "all") {
        badge.textContent = dataList.length;
      } else {
        const count = dataList.filter(n => n.subject === subj).length;
        badge.textContent = count;
      }
    }
  });
}
