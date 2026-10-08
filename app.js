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
  // 支援 URL Hash 深度連結 (例如 #p=2 或 #science-2)
  if (window.location.hash) {
    const hash = window.location.hash.replace("#", "");
    if (hash.startsWith("p=") || hash.startsWith("page=")) {
      const pNum = parseInt(hash.split("=")[1], 10);
      if (!isNaN(pNum) && pNum > 0) {
        currentPage = pNum - 1;
      }
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

  // 手機與平板觸控左右滑動翻頁
  window.addEventListener("touchstart", (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }
  }, { passive: true });

  window.addEventListener("touchend", (e) => {
    if (currentViewMode !== "book") return;
    if (document.getElementById("image-lightbox")?.classList.contains("active")) return;
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
}

function setViewMode(mode) {
  currentViewMode = mode;
  document.getElementById("btn-mode-book")?.classList.toggle("active", mode === "book");
  document.getElementById("btn-mode-list")?.classList.toggle("active", mode === "list");
  renderNotes();
}

// 翻頁控制核心函式
window.nextPage = function() {
  const filtered = getFilteredNotes();
  if (currentPage < filtered.length - 1) {
    flipDirection = "next";
    currentPage++;
    renderNotes();
    scrollToBookTop();
  }
};

window.prevPage = function() {
  if (currentPage > 0) {
    flipDirection = "prev";
    currentPage--;
    renderNotes();
    scrollToBookTop();
  }
};

window.goToPage = function(pageIndex) {
  const filtered = getFilteredNotes();
  if (pageIndex >= 0 && pageIndex < filtered.length && pageIndex !== currentPage) {
    flipDirection = pageIndex > currentPage ? "next" : "prev";
    currentPage = pageIndex;
    renderNotes();
    scrollToBookTop();
  }
};

function scrollToBookTop() {
  const container = document.getElementById("notes-container");
  if (container) {
    const topPos = container.getBoundingClientRect().top + window.pageYOffset - 90;
    window.scrollTo({ top: Math.max(0, topPos), behavior: "smooth" });
  }
}

// Format bold text
function formatRichText(str) {
  if (!str) return "";
  return str.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

// Format symbols ○ and × with high-end badges
function formatTableCell(str) {
  if (!str) return "";
  if (str === "○") return '<span class="sym-check">✓</span>';
  if (str === "×") return '<span class="sym-cross">✕</span>';
  return str;
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

  // 空狀態判斷
  if (filtered.length === 0) {
    const subjName = SUBJECT_NAMES[currentSubject] || "該學科";
    container.innerHTML = `
      <div class="empty-subject-card">
        <div class="empty-subject-icon">
          <i class="fa-solid fa-pen-nib"></i>
        </div>
        <h3 class="empty-subject-title">目前尚無【${subjName}】科筆記</h3>
        <p class="empty-subject-desc">
          當您在看教學影片時，只要隨時截圖傳到對話中，AI 就會立即為您提煉精華重點、翻牌比較大表與隨堂互動測驗！
        </p>
        <div class="empty-action-hint">
          <i class="fa-regular fa-lightbulb"></i> 隨看隨記 · 免手抄更輕鬆
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
    // 📜 清單連續瀏覽模式
    container.innerHTML = `
      <div class="notes-list">
        ${filtered.map(note => createNoteCardHtml(note)).join("")}
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
// 📖 產生精裝立體翻書模式 HTML (含頁碼、快捷標籤與插圖)
// ========================================================
function createOpenBookHtml(filtered, pageIdx) {
  const currentNote = filtered[pageIdx];
  const totalPages = filtered.length;
  const prevNote = pageIdx > 0 ? filtered[pageIdx - 1] : null;
  const nextNote = pageIdx < totalPages - 1 ? filtered[pageIdx + 1] : null;

  const animClass = flipDirection === "next" ? "page-flip-next-enter" : "page-flip-prev-enter";

  // 1. 書頂快捷頁數標籤條 (Book Tabs Ribbon)
  const tabsBarHtml = `
    <div class="book-tabs-bar" role="tablist" aria-label="章節頁數快捷導覽">
      ${filtered.map((note, idx) => `
        <button class="book-tab-item ${idx === pageIdx ? 'active' : ''}" 
          onclick="goToPage(${idx})" 
          title="前往第 ${idx + 1} 頁：${note.title}">
          <span class="tab-page-num">第 ${idx + 1} 頁</span>
          <span>${note.title.length > 15 ? note.title.substring(0, 15) + '...' : note.title}</span>
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

  // 3. 關鍵速查比較大表 (含單鍵翻牌背誦)
  let tableHtml = "";
  if (currentNote.table && currentNote.table.rows && currentNote.table.rows.length > 0) {
    const tableId = `table-${currentNote.id}`;
    tableHtml = `
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
          <table class="note-table" id="${tableId}">
            <thead>
              <tr>${currentNote.table.headers.map(h => `<th>${h}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${currentNote.table.rows.map(row => `
                <tr>
                  ${row.map((c, colIndex) => {
                    if (colIndex === 0) {
                      return `<td style="font-weight: 900; white-space: nowrap; background-color: var(--bg-secondary);">${c}</td>`;
                    } else {
                      return `
                        <td class="mask-cell" onclick="toggleCell(this)">
                          <div class="cell-wrapper">
                            <span class="cell-mask-card"><i class="fa-solid fa-lock"></i> 點擊揭曉</span>
                            <span class="cell-real-answer">${formatTableCell(c)}</span>
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

  // 4. 隨堂自我檢測 (Quiz Panel)
  let quizHtml = "";
  if (currentNote.quiz && currentNote.quiz.length > 0) {
    quizHtml = currentNote.quiz.map((q, qIndex) => `
      <div class="quiz-panel" id="quiz-${currentNote.id}-${qIndex}">
        <div class="quiz-header">
          <span class="quiz-header-title"><i class="fa-solid fa-circle-question"></i> 隨堂觀念自我檢測</span>
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

  // 5. 底部主翻頁控制列
  const bottomNavHtml = `
    <div class="book-bottom-nav">
      <div class="flip-btn-group">
        <!-- 上一頁大按鈕 -->
        <button class="book-flip-btn btn-prev-action" onclick="prevPage()" ${pageIdx === 0 ? 'disabled' : ''} title="翻到上一頁">
          <span class="btn-main-label"><i class="fa-solid fa-arrow-left"></i> 上一頁</span>
          <span class="btn-sub-label">${prevNote ? `第 ${pageIdx} 頁：${prevNote.title}` : '已是第一頁'}</span>
        </button>

        <!-- 中間頁數與進度圓點 -->
        <div class="page-indicator-center">
          <div class="page-indicator-text">
            <i class="fa-solid fa-book-open"></i> 第 ${pageIdx + 1} 頁 / 共 ${totalPages} 頁
          </div>
          <div class="page-dots-list" title="頁碼跳頁">
            ${filtered.map((_, idx) => `
              <button class="page-dot-btn ${idx === pageIdx ? 'active' : ''}" 
                onclick="goToPage(${idx})" 
                title="跳至第 ${idx + 1} 頁"></button>
            `).join('')}
          </div>
        </div>

        <!-- 下一頁大按鈕 (醒目亮麗漸層) -->
        <button class="book-flip-btn btn-next-action" onclick="nextPage()" ${pageIdx === totalPages - 1 ? 'disabled' : ''} title="翻到下一頁">
          <span class="btn-main-label">下一頁 <i class="fa-solid fa-arrow-right"></i></span>
          <span class="btn-sub-label">${nextNote ? `第 ${pageIdx + 2} 頁：${nextNote.title}` : '🎉 本單元全部完成'}</span>
        </button>
      </div>

      <div class="flip-shortcut-hint">
        <i class="fa-solid fa-keyboard"></i> 鍵盤快速鍵：可使用左右方向鍵 <b>← / →</b> 翻頁 · 手機平板支援左右滑動
      </div>
    </div>
  `;

  // 組合手帳質感立體翻開書本 (外露彩色便籤標記貼 + 左側露出的青色外殼與橫線活頁紙)
  return `
    <div class="open-book-container">
      ${tabsBarHtml}

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
          <!-- Running Header (頁首資訊含頂部快捷翻頁控制列) -->
          <div class="book-running-head">
            <div class="book-running-left">
              <span class="subject-badge badge-${currentNote.subject}">
                <i class="fa-solid ${currentNote.subjectIcon || 'fa-tag'}"></i> ${currentNote.subjectName}
              </span>
              <span class="unit-tag">${currentNote.unit}</span>
              <span class="concept-tag">${currentNote.gradeVersion}</span>
            </div>

            <!-- 頂部即時翻頁控制區塊 (免滾動至底部即可翻頁) -->
            <div class="book-top-flip-bar">
              <button class="book-top-btn" onclick="prevPage()" ${pageIdx === 0 ? 'disabled' : ''} title="上一頁">
                <i class="fa-solid fa-arrow-left"></i> 上一頁
              </button>
              <div class="book-page-stamp">
                <i class="fa-solid fa-bookmark"></i> 第 ${pageIdx + 1} 頁 / 共 ${totalPages} 頁
              </div>
              <button class="book-top-btn next-top-btn" onclick="nextPage()" ${pageIdx === totalPages - 1 ? 'disabled' : ''} title="下一頁">
                下一頁 <i class="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </div>

          <!-- 筆記大標題 -->
          <h2 class="note-title">${currentNote.title}</h2>

          <!-- 精選教學插圖區塊 -->
          ${illustrationHtml}

          <!-- 核心觀念精粹 -->
          <div class="section-block">
            <div class="section-label"><i class="fa-solid fa-lightbulb"></i> 核心觀念精粹</div>
            <ul class="concepts-list">
              ${currentNote.coreConcepts.map(c => `<li>${formatRichText(c)}</li>`).join("")}
            </ul>
          </div>

          <!-- 關鍵速查比較大表 -->
          ${tableHtml}

          <!-- 黃金記憶口訣 -->
          ${currentNote.mnemonic ? `
            <div class="mnemonic-box">
              <div class="box-title"><i class="fa-solid fa-star"></i> 黃金記憶口訣與秒殺密碼</div>
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

  let tableHtml = "";
  if (note.table && note.table.rows && note.table.rows.length > 0) {
    const tableId = `table-${note.id}`;
    tableHtml = `
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
          <table class="note-table" id="${tableId}">
            <thead>
              <tr>${note.table.headers.map(h => `<th>${h}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${note.table.rows.map(row => `
                <tr>
                  ${row.map((c, colIndex) => {
                    if (colIndex === 0) {
                      return `<td style="font-weight: 900; white-space: nowrap; background-color: var(--bg-secondary);">${c}</td>`;
                    } else {
                      return `
                        <td class="mask-cell" onclick="toggleCell(this)">
                          <div class="cell-wrapper">
                            <span class="cell-mask-card"><i class="fa-solid fa-lock"></i> 點擊揭曉</span>
                            <span class="cell-real-answer">${formatTableCell(c)}</span>
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
          <div style="font-weight: 800; font-size: 1.25rem; margin-bottom: 8px;"><i class="fa-solid fa-circle-check"></i> 🎉 答對了！太厲害了！</div>
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
