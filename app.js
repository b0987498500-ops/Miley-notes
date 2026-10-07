/**
 * 麥麥筆記 互動前端應用程式
 */

let currentSubject = "all";
let currentSearch = "";
let currentFontScale = 1.0;

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
  const savedScale = parseFloat(localStorage.getItem("maimai_notes_font_scale")) || 1.0;
  setFontScale(savedScale);

  document.getElementById("btn-font-dec")?.addEventListener("click", () => {
    if (currentFontScale > 0.8) setFontScale(Math.round((currentFontScale - 0.1) * 10) / 10);
  });
  document.getElementById("btn-font-reset")?.addEventListener("click", () => {
    setFontScale(1.0);
  });
  document.getElementById("btn-font-inc")?.addEventListener("click", () => {
    if (currentFontScale < 1.8) setFontScale(Math.round((currentFontScale + 0.1) * 10) / 10);
  });
}

function setFontScale(scale) {
  currentFontScale = scale;
  document.documentElement.style.setProperty("--font-scale", scale.toString());
  localStorage.setItem("maimai_notes_font_scale", scale.toString());
  const label = document.getElementById("font-scale-label");
  if (label) label.textContent = `${Math.round(scale * 100)}%`;
}

// Event Listeners
function initEventListeners() {
  // Search
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      renderNotes();
    });
  }

  // Subject Tabs
  document.querySelectorAll(".subject-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".subject-tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentSubject = btn.dataset.subject;
      renderNotes();
    });
  });

  // Lightbox Close
  const modal = document.getElementById("lightbox-modal");
  const closeBtn = document.getElementById("lightbox-close");
  if (modal && closeBtn) {
    closeBtn.addEventListener("click", () => modal.classList.remove("active"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("active");
    });
  }
}

// Render Notes
function renderNotes() {
  const container = document.getElementById("notes-container");
  const statsLabel = document.getElementById("stats-label");
  if (!container) return;

  const dataList = (typeof NOTES_DATA !== "undefined" && Array.isArray(NOTES_DATA)) ? NOTES_DATA : [];
  const filtered = dataList.filter(item => {
    // Subject filter
    if (currentSubject !== "all" && item.subject !== currentSubject) return false;

    // Search filter
    if (currentSearch) {
      const matchText = [
        item.title,
        item.unit,
        item.concept,
        item.subjectName,
        item.gradeVersion,
        item.mnemonic || "",
        ...(item.coreConcepts || []),
        item.example?.question || "",
        item.example?.solution || ""
      ].join(" ").toLowerCase();
      if (!matchText.includes(currentSearch)) return false;
    }

    return true;
  });

  // Update counts
  if (statsLabel) {
    statsLabel.innerHTML = `共顯示 <b>${filtered.length}</b> 則重點筆記 ${currentSubject !== 'all' ? `（篩選：${currentSubject}）` : ''}`;
  }

  updateTabCounts();

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fa-solid fa-book-bookmark"></i>
        <h3>查無符合的筆記重點</h3>
        <p>請嘗試更換關鍵字或點選「全部」分類。</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(note => createNoteCardHtml(note)).join("");

  // Attach Lightbox event
  container.querySelectorAll(".note-thumb-img").forEach(img => {
    img.addEventListener("click", () => {
      const modal = document.getElementById("lightbox-modal");
      const fullImg = document.getElementById("lightbox-img");
      if (modal && fullImg) {
        fullImg.src = img.src;
        modal.classList.add("active");
      }
    });
  });

  
  // Attach Interactive Quiz event listeners
  container.querySelectorAll(".quiz-opt-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const noteId = btn.dataset.noteId;
      const qIdx = parseInt(btn.dataset.qIdx);
      const optIdx = parseInt(btn.dataset.optIdx);
      const isCorrect = btn.dataset.correct === "true";

      const note = NOTES_DATA.find(n => n.id === noteId);
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
          <div style="font-weight: 800; margin-bottom: 4px;"><i class="fa-solid fa-circle-check"></i> 🎉 答對了！太棒了！</div>
          <div>${selectedOpt.explanation}</div>
        `;
      } else {
        btn.classList.add("is-wrong");
        feedbackBox.className = "quiz-feedback-box show-wrong";
        feedbackBox.innerHTML = `
          <div style="font-weight: 800; margin-bottom: 4px;"><i class="fa-solid fa-circle-xmark"></i> ❌ 答案不太對喔！再想想看～</div>
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

function updateTabCounts() {
  document.querySelectorAll(".subject-tab-btn").forEach(btn => {
    const subj = btn.dataset.subject;
    const badge = btn.querySelector(".badge-count");
    if (badge) {
      if (subj === "all") {
        const dataList = (typeof NOTES_DATA !== "undefined" && Array.isArray(NOTES_DATA)) ? NOTES_DATA : [];
        badge.textContent = dataList.length;
      } else {
        const dataList = (typeof NOTES_DATA !== "undefined" && Array.isArray(NOTES_DATA)) ? NOTES_DATA : [];
        const count = dataList.filter(n => n.subject === subj).length;
        badge.textContent = count;
      }
    }
  });
}


function createNoteCardHtml(note) {
  // Table HTML
  let tableHtml = "";
  if (note.table && note.table.rows && note.table.rows.length > 0) {
    tableHtml = `
      <div class="section-block">
        <div class="section-label"><i class="fa-solid fa-table"></i> 關鍵速查比較表</div>
        <div class="table-responsive">
          <table class="note-table">
            <thead>
              <tr>${note.table.headers.map(h => `<th>${h}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${note.table.rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join("")}</tr>`).join("")}
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
          <span class="quiz-header-title"><i class="fa-solid fa-circle-question"></i> 觀念實戰速測</span>
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

      <div class="note-card-grid">
        <!-- 左欄：核心觀念、比較表格、黃金口訣 -->
        <div class="note-column-left">
          <div class="section-block">
            <div class="section-label"><i class="fa-solid fa-lightbulb"></i> 核心觀念精華</div>
            <ul class="concepts-list">
              ${note.coreConcepts.map(c => `<li>${formatRichText(c)}</li>`).join("")}
            </ul>
          </div>

          ${tableHtml}

          ${note.mnemonic ? `
            <div class="mnemonic-box">
              <div class="box-title"><i class="fa-solid fa-star"></i> 黃金記憶口訣與破題密碼</div>
              <div>${note.mnemonic}</div>
            </div>
          ` : ''}
        </div>

        <!-- 右欄：隨堂即時自我檢測 -->
        <div class="note-column-right">
          ${quizHtml}
        </div>
      </div>
    </article>
  `;
}



function formatRichText(str) {
  if (!str) return "";
  return str.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
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
