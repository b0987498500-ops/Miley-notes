/**
 * 麥麥筆記 互動前端應用程式 (大字尊榮版 + 完美遮蔽背誦系統 v1.1.0)
 */

let currentSubject = "all";
let currentSearch = "";
// 預設字體縮放：1.0 (對應 html 根字級 22px，大字清晰護眼)
let currentFontScale = 1.0;
try {
  const savedScale = parseFloat(localStorage.getItem("maimai_notes_font_scale"));
  if (!isNaN(savedScale) && savedScale >= 0.8 && savedScale <= 2.2) {
    currentFontScale = savedScale;
  }
} catch (e) {}

document.addEventListener("DOMContentLoaded", () => {
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
// 每次按 + 或 - 調整 0.2 (20%)，並直接修改 html 的 fontSize 與 --font-scale
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
  // 同步設定 CSS 變數與根節點像素大小，保證全站 rem 元素 100% 立即有感放大！
  document.documentElement.style.setProperty("--font-scale", scale.toString());
  document.documentElement.style.fontSize = (22 * scale) + "px";
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
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      renderNotes();
    });
  }

  document.querySelectorAll(".subject-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".subject-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSubject = btn.dataset.subject;
      renderNotes();
    });
  });
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

// Render Notes
function renderNotes() {
  const container = document.getElementById("notes-container");
  const statsLabel = document.getElementById("stats-label");
  if (!container) return;

  const dataList = (typeof NOTES_DATA !== "undefined" && Array.isArray(NOTES_DATA)) ? NOTES_DATA : [];

  const filtered = dataList.filter(item => {
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

  if (statsLabel) {
    const subjName = SUBJECT_NAMES[currentSubject] || currentSubject;
    statsLabel.innerHTML = `<i class="fa-solid fa-bookmark"></i> 目前顯示 <b>${filtered.length}</b> 則重點筆搞 ${currentSubject !== "all" ? `（學科：${subjName}）` : ""}`;
  }

  updateTabCounts();

  // Empty State
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

  container.innerHTML = filtered.map(note => createNoteCardHtml(note)).join("");

  // Attach Quiz event listeners
  attachQuizListeners(container, dataList);

  // Render KaTeX
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

// ========================================================
// 🃏 翻牌遮蔽背誦功能 (單一切換按鈕，100% 零漏字)
// ========================================================

window.toggleMaskMode = function(tableId) {
  const table = document.getElementById(tableId);
  const btn = document.getElementById(`btn-mask-${tableId}`);
  if (!table) return;

  const isMasked = table.classList.toggle("is-masked");
  if (btn) {
    if (isMasked) {
      // 進入背誦模式：全部答案預設蓋住
      btn.classList.add("is-active");
      btn.innerHTML = `<i class="fa-solid fa-eye"></i> 退出背誦模式（顯示全部答案）`;
      table.querySelectorAll("tbody td.mask-cell").forEach(cell => {
        cell.classList.remove("is-revealed");
      });
    } else {
      // 退出背誦模式：恢復正常查看
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

  // 點擊翻開或蓋住
  cell.classList.toggle("is-revealed");
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

function createNoteCardHtml(note) {
  // Table HTML with Single Toggle Mask & Reveal Button
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

  // Quiz HTML
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

      <!-- 核心觀念精粹 -->
      <div class="section-block">
        <div class="section-label"><i class="fa-solid fa-lightbulb"></i> 核心觀念精粹</div>
        <ul class="concepts-list">
          ${note.coreConcepts.map(c => `<li>${formatRichText(c)}</li>`).join("")}
        </ul>
      </div>

      <!-- 關鍵速查比較大表 (含單一按鈕翻牌背誦模式) -->
      ${tableHtml}

      <!-- 黃金記憶口訣 -->
      ${note.mnemonic ? `
        <div class="mnemonic-box">
          <div class="box-title"><i class="fa-solid fa-star"></i> 黃金記憶口訣與秒殺密碼</div>
          <div>${note.mnemonic}</div>
        </div>
      ` : ''}

      <!-- 隨堂即時自我檢測 -->
      ${quizHtml}
    </article>
  `;
}
