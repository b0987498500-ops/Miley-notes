/**
 * 麥麥筆記 互動前端應用程式 (UI/UX 大字版)
 */

let currentSubject = "all";
let currentSearch = "";
let currentFontScale = 1.12;

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initFontScale();
  initEventListeners();
  renderNotes();
});

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem("maimai_notes_theme") || "light";
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
  localStorage.setItem("maimai_notes_theme", theme);
  document.querySelectorAll(".theme-btn").forEach(b => {
    b.classList.toggle("active", b.dataset.theme === theme);
  });
}

// Font Scale Management
function initFontScale() {
  const savedScale = parseFloat(localStorage.getItem("maimai_notes_font_scale")) || 1.12;
  setFontScale(savedScale);

  document.getElementById("btn-font-dec")?.addEventListener("click", () => {
    if (currentFontScale > 0.85) setFontScale(Math.round((currentFontScale - 0.1) * 100) / 100);
  });
  document.getElementById("btn-font-reset")?.addEventListener("click", () => {
    setFontScale(1.12);
  });
  document.getElementById("btn-font-inc")?.addEventListener("click", () => {
    if (currentFontScale < 1.9) setFontScale(Math.round((currentFontScale + 0.1) * 100) / 100);
  });
}

function setFontScale(scale) {
  currentFontScale = scale;
  document.documentElement.style.setProperty("--font-scale", scale.toString());
  localStorage.setItem("maimai_notes_font_scale", scale.toString());
  const label = document.getElementById("font-scale-label");
  if (label) label.textContent = `${Math.round((scale / 1.12) * 100)}%`;
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

  // Update counts
  if (statsLabel) {
    const subjName = SUBJECT_NAMES[currentSubject] || currentSubject;
    statsLabel.innerHTML = `<i class="fa-solid fa-bookmark"></i> 目前顯示 <b>${filtered.length}</b> 則重點筆記 ${currentSubject !== "all" ? `（學科：${subjName}）` : ""}`;
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
          當您在看教學影片時，只要隨時截圖傳到對話中，AI 就會立即為您提煉精華重點、比較大表與隨堂互動測驗！
        </p>
        <div class="empty-action-hint">
          <i class="fa-regular fa-lightbulb"></i> 隨看隨記 · 免手抄更輕鬆
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(note => createNoteCardHtml(note)).join("");

  // Attach Interactive Quiz event listeners
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
          <div style="font-weight: 800; font-size: 1.15rem; margin-bottom: 6px;"><i class="fa-solid fa-circle-check"></i> 🎉 答對了！太厲害了！</div>
          <div>${selectedOpt.explanation}</div>
        `;
      } else {
        btn.classList.add("is-wrong");
        feedbackBox.className = "quiz-feedback-box show-wrong";
        feedbackBox.innerHTML = `
          <div style="font-weight: 800; font-size: 1.15rem; margin-bottom: 6px;"><i class="fa-solid fa-circle-xmark"></i> ❌ 答案不太對喔！再想想看～</div>
          <div>${selectedOpt.explanation}</div>
          <button class="retry-quiz-btn" onclick="retryQuiz('${noteId}', ${qIdx})"><i class="fa-solid fa-rotate-left"></i> 重新作答</button>
        `;
      }
    });
  });

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
  // Full-width Table HTML
  let tableHtml = "";
  if (note.table && note.table.rows && note.table.rows.length > 0) {
    tableHtml = `
      <div class="section-block">
        <div class="section-label"><i class="fa-solid fa-table"></i> 關鍵速查比較大表</div>
        <div class="table-responsive">
          <table class="note-table">
            <thead>
              <tr>${note.table.headers.map(h => `<th>${h}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${note.table.rows.map(row => `<tr>${row.map(c => `<td>${formatTableCell(c)}</td>`).join("")}</tr>`).join("")}
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

      <!-- 關鍵速查比較大表 -->
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
