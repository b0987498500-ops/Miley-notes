/**
 * 麥麥筆記 互動前端應用程式
 * (精裝立體翻書模式 + 大字清晰版 + 完美遮蔽背誦系統 + 高清插圖燈箱 v1.2.0)
 */

let currentStage = "review"; // "review" (第1~4冊複習手帳) 或 "progress" (第5~6冊進度手帳)
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
  const urlParams = new URLSearchParams(window.location.search);
  const qScale = parseFloat(urlParams.get("fontScale"));
  if (!isNaN(qScale) && qScale >= 0.8 && qScale <= 2.2) {
    currentFontScale = qScale;
  } else {
    const savedScale = parseFloat(localStorage.getItem("maimai_notes_font_scale"));
    if (!isNaN(savedScale) && savedScale >= 0.8 && savedScale <= 2.2) {
      currentFontScale = savedScale;
    }
  }

  // 讀取 URL 參數 stage=review 或 stage=progress
  const qStage = urlParams.get("stage");
  if (qStage === "review" || qStage === "progress") {
    currentStage = qStage;
  } else {
    const savedStage = localStorage.getItem("maimai_notes_stage");
    if (savedStage === "review" || savedStage === "progress") {
      currentStage = savedStage;
    }
  }
} catch (e) {}


// ========================================================
// 🚪 麥麥筆記自訂手帳資料庫與【錯題傳送門】跨站同步系統
// ========================================================

/**
 * 取得使用者自訂傳送門筆記 (存於 localStorage)
 */
function getCustomNotes() {
  try {
    const raw = localStorage.getItem("maimai_custom_notes");
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("解析自訂筆記失敗:", e);
    return [];
  }
}

const DELETED_NOTES_STORAGE_KEY = "maimai_deleted_note_ids";

/**
 * 讀取已刪除筆記 ID 陣列
 */
function getDeletedNoteIds() {
  try {
    const raw = localStorage.getItem(DELETED_NOTES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("讀取已刪除筆記清單失敗:", e);
    return [];
  }
}

/**
 * 儲存已刪除筆記 ID 陣列
 */
function saveDeletedNoteIds(ids) {
  try {
    localStorage.setItem(DELETED_NOTES_STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error("儲存已刪除筆記清單失敗:", e);
  }
}

/**
 * 取得未經刪除過濾之全站所有筆記清單
 */
function getRawAllNotesData() {
  const baseList = (typeof NOTES_DATA !== "undefined" && Array.isArray(NOTES_DATA)) ? NOTES_DATA : [];
  const customList = getCustomNotes();
  return [...customList, ...baseList];
}

/**
 * 取得全站整合筆記清單 (自動過濾已放入回收桶之筆記)
 */
function getAllNotesData() {
  const rawList = getRawAllNotesData();
  const deletedIds = getDeletedNoteIds();
  if (!deletedIds || deletedIds.length === 0) return rawList;
  return rawList.filter(n => !deletedIds.includes(n.id));
}

/**
 * 取得已放入回收桶之筆記資料列表
 */
function getDeletedNotes() {
  const rawList = getRawAllNotesData();
  const deletedIds = getDeletedNoteIds();
  if (!deletedIds || deletedIds.length === 0) return [];
  return rawList.filter(n => deletedIds.includes(n.id));
}

/**
 * 播放輕柔撕紙/刪除音效 (Web Audio API)
 */
function playDeleteSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const bufferSize = Math.floor(ctx.sampleRate * 0.12);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.035));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(1.2, ctx.currentTime);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start();
  } catch (e) {
    // 忽略音效異常
  }
}

/**
 * 播放清脆星星復原音效 (Web Audio API)
 */
function playRestoreSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch (e) {
    // 忽略音效異常
  }
}

let pendingDeleteNoteId = null;

/**
 * 開啟刪除本頁筆記確認彈窗
 */
window.openDeleteConfirmModal = function(noteId) {
  const allNotes = getRawAllNotesData();
  const note = allNotes.find(n => n.id === noteId);
  if (!note) return;

  pendingDeleteNoteId = noteId;
  const previewEl = document.getElementById("delete-note-preview-title");
  if (previewEl) {
    const stageName = note.stage === "progress" ? "📙 進度手帳" : "📘 複習手帳";
    previewEl.innerHTML = `
      <div class="delete-preview-badge-row">
        <span class="delete-preview-pill pill-stage">${stageName} · ${note.volume || ''}</span>
        <span class="delete-preview-pill pill-subj">${note.subjectName || ''}</span>
        <span class="delete-preview-pill pill-unit">${note.unit || ''}</span>
      </div>
      <div class="delete-preview-title-text">${note.title}</div>
    `;
  }

  const modal = document.getElementById("delete-confirm-modal");
  if (modal) {
    modal.classList.add("active");
  }
};

window.deleteCurrentPageNote = function(noteId) {
  openDeleteConfirmModal(noteId);
};

/**
 * 關閉刪除本頁筆記確認彈窗
 */
window.closeDeleteModal = function(e) {
  if (e && e.target && e.target !== e.currentTarget && !e.target.classList.contains("modal-close-icon") && !e.target.classList.contains("btn-modal-cancel")) {
    return;
  }
  const modal = document.getElementById("delete-confirm-modal");
  if (modal) {
    modal.classList.remove("active");
  }
  pendingDeleteNoteId = null;
};

/**
 * 執行確認刪除本頁筆記
 */
window.executeDeleteCurrentNote = function() {
  if (!pendingDeleteNoteId) return;
  const noteId = pendingDeleteNoteId;
  
  // 取得已刪除清單並將其加入
  const deletedIds = getDeletedNoteIds();
  if (!deletedIds.includes(noteId)) {
    deletedIds.push(noteId);
    saveDeletedNoteIds(deletedIds);
  }

  // 播放撕紙音效
  playDeleteSound();

  // 關閉確認視窗
  const modal = document.getElementById("delete-confirm-modal");
  if (modal) modal.classList.remove("active");
  pendingDeleteNoteId = null;

  // 自動調整當前頁碼防呆
  const filtered = getFilteredNotes();
  if (currentPage >= filtered.length) {
    currentPage = Math.max(0, filtered.length - 1);
  }

  // 刷新畫面與統計
  renderNotes();
  updateTabCounts();
  updateTrashCountBadge();

  // 彈出帶有一鍵復原的 Toast
  showToast("🗑️ 已將本頁筆記移至回收桶", { canUndo: true, noteId: noteId });
};

/**
 * 更新頂端導航回收桶計數徽章
 */
function updateTrashCountBadge() {
  const badge = document.getElementById("trash-count-badge");
  if (!badge) return;
  const count = getDeletedNoteIds().length;
  if (count > 0) {
    badge.textContent = count;
    badge.style.display = "inline-flex";
    badge.classList.remove("badge-pulse");
    void badge.offsetWidth;
    badge.classList.add("badge-pulse");
  } else {
    badge.style.display = "none";
  }
}

/**
 * 開啟手帳筆記回收桶彈窗
 */
window.openTrashModal = function(e) {
  renderTrashNotesList();
  const modal = document.getElementById("trash-bin-modal");
  if (modal) modal.classList.add("active");
};

/**
 * 關閉手帳筆記回收桶彈窗
 */
window.closeTrashModal = function(e) {
  if (e && e.target && e.target !== e.currentTarget && !e.target.classList.contains("modal-close-icon") && !e.target.classList.contains("btn-modal-cancel")) {
    return;
  }
  const modal = document.getElementById("trash-bin-modal");
  if (modal) modal.classList.remove("active");
};

/**
 * 渲染回收桶內的筆記清單
 */
function renderTrashNotesList() {
  const listEl = document.getElementById("trash-notes-list");
  const restoreAllBtn = document.getElementById("btn-restore-all");
  if (!listEl) return;

  const deletedNotes = getDeletedNotes();
  if (deletedNotes.length === 0) {
    if (restoreAllBtn) restoreAllBtn.style.display = "none";
    listEl.innerHTML = `
      <div class="trash-empty-state">
        <div class="trash-empty-mascot-box">
          <img src="images/illustrations/empty_state_cat.png" alt="等待記錄的可愛貓咪" class="trash-empty-cat-img">
          <img src="images/illustrations/sticker_book.png" alt="魔法手帳" class="trash-empty-book-sticker">
        </div>
        <h4>回收桶目前乾乾淨淨 🌱</h4>
        <p>所有重點筆記都在手帳中整齊收錄著，沒有被刪除的頁面喔！</p>
      </div>
    `;
    return;
  }

  if (restoreAllBtn) restoreAllBtn.style.display = "inline-flex";

  listEl.innerHTML = deletedNotes.map(note => {
    const stageName = note.stage === "progress" ? "📙 進度手帳" : "📘 複習手帳";
    return `
      <div class="trash-item-card" id="trash-item-${note.id}">
        <div class="trash-item-info">
          <div class="trash-item-tags">
            <span class="trash-pill pill-stage">${stageName} · ${note.volume || ''}</span>
            <span class="trash-pill pill-subj">${note.subjectName || ''}</span>
            <span class="trash-pill pill-unit">${note.unit || ''}</span>
          </div>
          <h4 class="trash-item-title">${note.title}</h4>
        </div>
        <div class="trash-item-actions">
          <button type="button" class="btn-restore-single" onclick="restoreNote('${note.id}')" title="將這頁復原回手帳">
            <span class="btn-wood-sprout-mini">🌱</span>
            <i class="fa-solid fa-rotate-left"></i> 復原此頁
          </button>
        </div>
      </div>
    `;
  }).join("");
}

/**
 * 單筆復原筆記
 */
window.restoreNote = function(noteId) {
  let deletedIds = getDeletedNoteIds();
  deletedIds = deletedIds.filter(id => id !== noteId);
  saveDeletedNoteIds(deletedIds);

  playRestoreSound();
  renderNotes();
  updateTabCounts();
  updateTrashCountBadge();

  // 若回收桶彈窗開啟中，重新渲染回收桶列表
  const trashModal = document.getElementById("trash-bin-modal");
  if (trashModal && trashModal.classList.contains("active")) {
    renderTrashNotesList();
  }

  showToast("✨ 筆記已成功復原回手帳！");
};

/**
 * 全部一鍵復原
 */
window.restoreAllNotes = function() {
  const count = getDeletedNoteIds().length;
  if (count === 0) return;

  saveDeletedNoteIds([]);
  playRestoreSound();
  
  if (typeof confetti === "function") {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  }

  renderNotes();
  updateTabCounts();
  updateTrashCountBadge();
  renderTrashNotesList();

  showToast("🎉 所有筆記已全部復原回手帳！");
};

/**
 * 學科對應 Icon 輔助函式
 */
function getSubjectIcon(subj) {
  const map = {
    science: "fa-flask",
    math: "fa-calculator",
    chinese: "fa-book-bookmark",
    social: "fa-landmark",
    english: "fa-language"
  };
  return map[subj] || "fa-bookmark";
}

/**
 * 刪除自訂傳送門筆記 (相容原功能)
 */
window.deletePortalNote = function(id) {
  openDeleteConfirmModal(id);
};

/**
 * 輕量化全站浮動 Toast 提示 (支援復原按鈕)
 */
function showToast(msg, options = {}) {
  let toast = document.getElementById("portal-floating-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "portal-floating-toast";
    toast.className = "portal-floating-toast";
    document.body.appendChild(toast);
  }

  if (options.canUndo && options.noteId) {
    toast.innerHTML = `
      <span class="toast-msg-text">${msg}</span>
      <button type="button" class="toast-undo-btn" onclick="restoreNote('${options.noteId}')">
        <i class="fa-solid fa-rotate-left"></i> 立即復原
      </button>
    `;
    toast.classList.add("has-undo");
  } else {
    toast.textContent = msg;
    toast.classList.remove("has-undo");
  }

  toast.classList.add("show");
  clearTimeout(toast._timer);
  const duration = (options.canUndo) ? 6000 : 2800;
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

/**
 * 接收傳送門筆記歡迎彈窗與動效
 */
function showPortalWelcomeToast(note) {
  const toast = document.createElement("div");
  toast.className = "portal-welcome-toast";
  toast.innerHTML = `
    <div class="toast-portal-icon">🚪✨</div>
    <div class="toast-portal-body">
      <div class="toast-portal-title">已成功接收來自錯題本的新筆記！</div>
      <div class="toast-portal-desc"><b>【${note.stageName} · ${note.subjectName}】</b> ${note.title}</div>
    </div>
    <button class="toast-portal-close" onclick="this.parentElement.remove()" title="關閉">&times;</button>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 60);

  if (typeof confetti === "function") {
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.2 } });
  }

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 5500);
}

/**
 * 核心：解析 URL 參數並收錄來自麥麥錯題網站的【筆記傳送門】資料
 */
function handleIncomingPortalNote() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get("action");
    if (action !== "add_note") return false;

    const stageParam = urlParams.get("stage") || "review";
    const subjParam = urlParams.get("subject") || "science";
    const titleParam = urlParams.get("title");
    const contentParam = urlParams.get("content");
    const conceptParam = urlParams.get("concept") || "";
    const unitParam = urlParams.get("unit") || "錯題精華速記";
    const qidParam = urlParams.get("qid") || "";

    if (!titleParam && !contentParam) return false;

    const finalTitle = titleParam || (conceptParam ? conceptParam : "錯題重點速記");
    const stageName = stageParam === "progress" ? "進度手帳" : "複習手帳";
    const volume = stageParam === "progress" ? "第 5～6 冊" : "第 1～4 冊";
    const subjectName = SUBJECT_NAMES[subjParam] || "自然";
    const subjectIcon = getSubjectIcon(subjParam);

    const coreConcepts = contentParam
      ? contentParam.split("\n").map(s => s.trim()).filter(Boolean)
      : [finalTitle];

    const newNote = {
      id: "portal-" + Date.now(),
      stage: stageParam,
      volume: volume,
      stageName: stageName,
      subject: subjParam,
      subjectName: subjectName,
      subjectIcon: subjectIcon,
      gradeVersion: "錯題傳送門 · 重點速記",
      unit: unitParam,
      title: finalTitle,
      concept: conceptParam || finalTitle,
      coreConcepts: coreConcepts,
      isPortalNote: true,
      createdTime: new Date().toLocaleString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }),
      sourceQuestionId: qidParam
    };

    let customList = getCustomNotes();
    const isDupe = customList.some(n => n.title === newNote.title && JSON.stringify(n.coreConcepts) === JSON.stringify(newNote.coreConcepts));
    if (!isDupe) {
      customList.unshift(newNote);
      localStorage.setItem("maimai_custom_notes", JSON.stringify(customList));
    }

    // 自動切換至對應手帳與科目，並置於第一頁
    currentStage = stageParam;
    currentSubject = subjParam;
    currentPage = 0;

    // 清除 URL 參數防重整重複加入
    try {
      const cleanUrl = window.location.pathname + (window.location.hash || "");
      window.history.replaceState({}, document.title, cleanUrl);
    } catch(e) {}

    setTimeout(() => {
      showPortalWelcomeToast(newNote);
    }, 350);

    return true;
  } catch (err) {
    console.error("處理傳送門筆記時發生異常:", err);
    return false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // 🚪 優先檢查並處理來自錯題網站的【筆記傳送門】資料
  handleIncomingPortalNote();

  // 支援 URL Hash 深度連結 (例如 #stage=progress 或 #p=2 或 #social-1)
  if (window.location.hash) {
    const hash = window.location.hash.replace("#", "");
    if (hash.includes("stage=progress")) currentStage = "progress";
    if (hash.includes("stage=review")) currentStage = "review";
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
    } else {
      const allNotes = getAllNotesData();
      const idx = allNotes.findIndex(n => n.id === hash);
      if (idx !== -1) {
        currentPage = idx;
        if (allNotes[idx].stage) {
          currentStage = allNotes[idx].stage;
        }
      }
    }
  }

  initTheme();
  initFontScale();
  initStageSwitcher();
  initEventListeners();
  renderNotes();
  updateTrashCountBadge();

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

// 📚 學習手帳階段切換管理 (複習 1~4 冊 vs. 進度 5~6 冊)
function initStageSwitcher() {
  document.getElementById("nb-card-review")?.addEventListener("click", () => {
    setStage("review");
  });
  document.getElementById("nb-card-progress")?.addEventListener("click", () => {
    setStage("progress");
  });
  updateStageUI();
}

function setStage(stage) {
  if (stage !== "review" && stage !== "progress") return;
  currentStage = stage;
  try {
    localStorage.setItem("maimai_notes_stage", stage);
  } catch (e) {}

  updateStageUI();
  updateTabCounts();

  // 若當前所選科目在該手帳中沒有內容，自動切換至 "all"
  const dataList = getAllNotesData();
  const stageNotes = dataList.filter(n => n.stage === currentStage);
  if (currentSubject !== "all") {
    const hasSubjectInStage = stageNotes.some(n => n.subject === currentSubject);
    if (!hasSubjectInStage) {
      currentSubject = "all";
      document.querySelectorAll(".subject-tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.subject === "all");
      });
    }
  }

  currentPage = 0;
  renderNotes();
}

function updateStageUI() {
  document.querySelectorAll(".notebook-card").forEach(card => {
    const isAct = card.dataset.stage === currentStage;
    card.classList.toggle("active", isAct);
    card.setAttribute("aria-pressed", isAct ? "true" : "false");
  });

  const indicator = document.getElementById("current-stage-indicator");
  if (indicator) {
    if (currentStage === "review") {
      indicator.innerHTML = `目前筆記本：<b>📗 複習筆記本（第 1～4 冊 會考總複習）</b>`;
    } else {
      indicator.innerHTML = `目前筆記本：<b>📘 進度筆記本（第 5 冊開始 國三進度）</b>`;
    }
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
  const dataList = getAllNotesData();
  return dataList.filter(item => {
    // 嚴格分流：先依當前選中手帳階段篩選 (複習 vs. 進度)
    if (item.stage && item.stage !== currentStage) return false;

    if (currentSubject !== "all" && item.subject !== currentSubject) return false;

    if (currentSearch) {
      const matchText = [
        item.title,
        item.unit,
        item.concept,
        item.subjectName,
        item.gradeVersion,
        item.volume || "",
        item.stageName || "",
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

  const dataList = getAllNotesData();
  const filtered = getFilteredNotes();

  // 更新統計文字
  if (statsLabel) {
    const subjName = SUBJECT_NAMES[currentSubject] || currentSubject;
    const stagePrefix = currentStage === "review" ? "【第 1～4 冊 複習手帳】" : "【第 5～6 冊 進度手帳】";
    if (currentViewMode === "book" && filtered.length > 0) {
      statsLabel.innerHTML = `<i class="fa-solid fa-book-open"></i> ${stagePrefix} 正在閱讀【${subjName}】第 <b>${currentPage + 1}</b> 頁 / 共 <b>${filtered.length}</b> 頁`;
    } else {
      statsLabel.innerHTML = `<i class="fa-solid fa-bookmark"></i> ${stagePrefix} 目前顯示 <b>${filtered.length}</b> 則重點筆記 ${currentSubject !== "all" ? `（學科：${subjName}）` : ""}`;
    }
  }

  updateTabCounts();
  document.querySelectorAll(".subject-tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.subject === currentSubject);
  });

  // 空狀態判斷
  if (filtered.length === 0) {
    const subjName = SUBJECT_NAMES[currentSubject] || "該學科";
    const stageTitle = currentStage === "review" ? "📘 第 1～4 冊 複習手帳" : "📙 第 5～6 冊 進度手帳";
    container.innerHTML = `
      <div class="empty-subject-card">
        <div class="empty-mascot-wrapper">
          <img src="images/illustrations/empty_state_cat.png" alt="等待記錄的可愛貓咪" class="empty-mascot-img">
          <img src="images/illustrations/sticker_pencil.png" alt="魔法鉛筆" class="empty-pencil-badge">
        </div>
        <div class="empty-stage-pill">${stageTitle}</div>
        <h3 class="empty-subject-title">此手帳目前尚無【${subjName}】重點筆記</h3>
        <p class="empty-subject-desc">
          當您看書或讀講義看到重點時，只要隨手截圖傳到對話中，AI 就會立即為您提煉精華重點、翻牌比較大表與隨堂互動測驗！
        </p>
        <div class="empty-action-hint">
          <img src="images/illustrations/sticker_star.png" alt="笑臉星星" class="mini-inline-sticker">
          <span>1～4 冊自動收錄至「複習手帳」· 5～6 冊自動收錄至「進度手帳」</span>
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
  // UI/UX 深度優化：徹底移除兩側 160 張重複卡片干擾，回歸專注、純淨手帳空間
  return "";
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
            <i class="fa-solid fa-image"></i> 核心觀念插圖精華
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
              <span class="stage-badge badge-${currentNote.stage || 'review'}">
                <i class="fa-solid ${currentNote.stage === 'progress' ? 'fa-rocket' : 'fa-compass'}"></i> ${currentNote.stageName || (currentNote.stage === 'progress' ? '進度手帳' : '複習手帳')} · ${currentNote.volume || ''}
              </span>
              <span class="subject-badge badge-${currentNote.subject}">
                <i class="fa-solid ${currentNote.subjectIcon || 'fa-tag'}"></i> ${currentNote.subjectName}
              </span>
              <span class="unit-tag"><i class="fa-solid fa-seedling"></i> ${currentNote.unit}</span>
              <span class="concept-tag"><i class="fa-solid fa-feather-pointed"></i> ${currentNote.gradeVersion}</span>
              ${currentNote.isPortalNote ? `
                <span class="portal-badge-tag"><i class="fa-solid fa-door-open"></i> 錯題傳送門 · ${currentNote.createdTime || ''}</span>
                <button type="button" class="portal-delete-btn" onclick="deletePortalNote('${currentNote.id}')" title="刪除此則自訂筆記"><i class="fa-solid fa-trash-can"></i> 刪除</button>
              ` : ''}
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

          <!-- 核心觀念精粹 (若有) -->
          ${currentNote.coreConcepts && currentNote.coreConcepts.length > 0 ? `
          <div class="section-block">
            <div class="section-label">
              <img src="images/illustrations/sticker_pencil.png" class="section-label-sticker" alt="魔法鉛筆">
              <span>核心觀念精粹</span>
            </div>
            <ul class="concepts-list">
              ${currentNote.coreConcepts.map(c => `<li>${formatRichText(c)}</li>`).join("")}
            </ul>
          </div>
          ` : ''}

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

          <!-- 本頁筆記操作列：卡通手繪木牌刪除本頁筆記 (依使用者指示徹底告別膠囊與預設線條，融入可愛插圖) -->
          <div class="note-page-action-footer">
            <div class="footer-action-flank flank-left">
              <img src="images/illustrations/sticker_pencil.png" alt="魔法鉛筆" class="footer-sticker-icon sticker-pencil-dance">
              <span class="footer-cute-prompt">🌱 觀念記熟了？</span>
            </div>
            <button type="button" class="btn-delete-page-note" onclick="openDeleteConfirmModal('${currentNote.id}')" title="刪除本頁筆記">
              <span class="btn-wood-sprout-accent">🌸</span>
              <span class="btn-wood-icon-wrap"><i class="fa-solid fa-trash-can"></i></span>
              <span class="btn-wood-label">刪除本頁筆記</span>
              <span class="btn-wood-sparkle">✨</span>
            </button>
            <div class="footer-action-flank flank-right">
              <span class="footer-cute-prompt">可隨時安心移除 📖</span>
              <img src="images/illustrations/sticker_star.png" alt="星星獎章" class="footer-sticker-icon sticker-star-dance">
            </div>
          </div>

          <!-- Running Footer (頁尾資訊) -->
          <div class="book-running-footer">
            <div class="book-footer-branding">
              <img src="images/illustrations/sticker_book.png" alt="書本貼紙" class="footer-mini-sticker">
              <span>麥麥筆記 · 學科重點精華庫</span>
              <img src="images/illustrations/sticker_star.png" alt="星星貼紙" class="footer-mini-sticker">
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
          <span class="illustration-tag"><i class="fa-solid fa-image"></i> 核心觀念插圖精華</span>
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
          <span class="stage-badge badge-${note.stage || 'review'}">
            <i class="fa-solid ${note.stage === 'progress' ? 'fa-rocket' : 'fa-compass'}"></i> ${note.stageName || (note.stage === 'progress' ? '進度手帳' : '複習手帳')} · ${note.volume || ''}
          </span>
          <span class="subject-badge badge-${note.subject}">
            <i class="fa-solid ${note.subjectIcon || 'fa-tag'}"></i> ${note.subjectName}
          </span>
          <span class="unit-tag">${note.unit}</span>
          <span class="concept-tag">${note.gradeVersion}</span>
          ${note.isPortalNote ? `
            <span class="portal-badge-tag"><i class="fa-solid fa-door-open"></i> 錯題傳送門 · ${note.createdTime || ''}</span>
            <button type="button" class="portal-delete-btn" onclick="deletePortalNote('${note.id}')" title="刪除此則自訂筆記"><i class="fa-solid fa-trash-can"></i> 刪除</button>
          ` : ''}
        </div>
      </div>

      <h2 class="note-title">${note.title}</h2>

      ${illustrationHtml}

      ${note.coreConcepts && note.coreConcepts.length > 0 ? `
      <div class="section-block">
        <div class="section-label"><i class="fa-solid fa-lightbulb"></i> 核心觀念精粹</div>
        <ul class="concepts-list">
          ${note.coreConcepts.map(c => `<li>${formatRichText(c)}</li>`).join("")}
        </ul>
      </div>
      ` : ''}

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

      <!-- 本頁筆記操作列：卡通手繪木牌刪除本頁筆記 (依使用者指示徹底告別膠囊與預設線條，融入可愛插圖) -->
      <div class="note-page-action-footer">
        <div class="footer-action-flank flank-left">
          <img src="images/illustrations/sticker_pencil.png" alt="魔法鉛筆" class="footer-sticker-icon sticker-pencil-dance">
          <span class="footer-cute-prompt">🌱 觀念記熟了？</span>
        </div>
        <button type="button" class="btn-delete-page-note" onclick="openDeleteConfirmModal('${note.id}')" title="刪除本頁筆記">
          <span class="btn-wood-sprout-accent">🌸</span>
          <span class="btn-wood-icon-wrap"><i class="fa-solid fa-trash-can"></i></span>
          <span class="btn-wood-label">刪除本頁筆記</span>
          <span class="btn-wood-sparkle">✨</span>
        </button>
        <div class="footer-action-flank flank-right">
          <span class="footer-cute-prompt">可隨時安心移除 📖</span>
          <img src="images/illustrations/sticker_star.png" alt="星星獎章" class="footer-sticker-icon sticker-star-dance">
        </div>
      </div>
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
  const dataList = getAllNotesData();
  const currentStageNotes = (currentStage === "all") 
    ? dataList 
    : dataList.filter(n => (n.stage || "review") === currentStage);

  document.querySelectorAll(".subject-tab-btn").forEach(btn => {
    const subj = btn.dataset.subject;
    const badge = btn.querySelector(".badge-count");
    if (badge) {
      if (subj === "all") {
        badge.textContent = currentStageNotes.length;
      } else {
        const count = currentStageNotes.filter(n => n.subject === subj).length;
        badge.textContent = count;
      }
    }
  });

  // 更新筆記本書架上的重點總數計數徽章
  const reviewTotal = dataList.filter(n => (n.stage || "review") === "review").length;
  const progressTotal = dataList.filter(n => n.stage === "progress").length;
  const reviewCountEl = document.getElementById("badge-review-total");
  const progressCountEl = document.getElementById("badge-progress-total");
  if (reviewCountEl) reviewCountEl.textContent = `${reviewTotal} 則重點`;
  if (progressCountEl) progressCountEl.textContent = `${progressTotal} 則重點`;
}
