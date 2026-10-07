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

  // Image HTML
  let imageHtml = "";
  if (note.imageUrl) {
    imageHtml = `
      <div class="section-block">
        <div class="section-label"><i class="fa-solid fa-image"></i> 影片重點截圖（點擊放大）</div>
        <div class="note-image-container">
          <img src="${note.imageUrl}" alt="${note.title}" class="note-thumb-img">
        </div>
      </div>
    `;
  }

  // Example HTML
  let exampleHtml = "";
  if (note.example && note.example.question) {
    exampleHtml = `
      <div class="example-box">
        <div class="box-title"><i class="fa-solid fa-bullseye"></i> 經典會考實戰示範</div>
        <div style="margin-bottom: 6px;"><b>題目：</b>${note.example.question}</div>
        <div><b>破題思路：</b>${note.example.solution}</div>
      </div>
    `;
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

      ${exampleHtml}
      ${imageHtml}
    </article>
  `;
}


function formatRichText(str) {
  if (!str) return "";
  return str.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}
