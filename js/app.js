/*
 * 提出書類AIアシスタント（モック）
 * 画面描画・ルーティング・疑似インタラクション
 */

/* ============================================================
   アイコン（インラインSVG / currentColorで着色）
   ============================================================ */
const ICONS = {
  dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
  sites: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21c4-4.5 7-8.2 7-11.5A7 7 0 0 0 5 9.5C5 12.8 8 16.5 12 21z"/><circle cx="12" cy="9.3" r="2.4"/></svg>`,
  workers: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="8.5" cy="7.5" r="3"/><path d="M2.5 20c0-3.6 2.7-6 6-6s6 2.4 6 6"/><circle cx="17" cy="8.3" r="2.3"/><path d="M15.3 14.1c2.4.5 4.1 2.6 4.4 5.9"/></svg>`,
  company: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="12.5" rx="1.5"/><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="3" y1="13.2" x2="21" y2="13.2"/></svg>`,
  certs: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="9" r="6"/><path d="M8.7 14.3L7 21l5-3 5 3-1.7-6.7"/></svg>`,
  submissions: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-10z"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.97 7.97 0 0 0 0-2l2.1-1.6-2-3.4-2.5 1a8 8 0 0 0-1.7-1L15 3h-4l-.4 2.5a8 8 0 0 0-1.7 1l-2.5-1-2 3.4L6.5 11a8 8 0 0 0 0 2l-2.1 1.6 2 3.4 2.5-1c.5.4 1.1.8 1.7 1L11 21h4l.4-2.5c.6-.3 1.2-.6 1.7-1l2.5 1 2-3.4L19.4 13z"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18a4 4 0 0 1-1-7.9 5 5 0 0 1 9.6-2A4.5 4.5 0 0 1 17 18H7z"/><path d="M12 12v6.5"/><path d="M9.3 14.3L12 11.6l2.7 2.7"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8a2 2 0 0 1 2-2h1.5l1-1.5h7l1 1.5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"/><circle cx="12" cy="13" r="3.5"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5-9 9"/></svg>`,
  arrowLeft: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  archive: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/></svg>`,
  warnTriangle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5l9.5 16.5H2.5z"/><line x1="12" y1="9.5" x2="12" y2="14"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/></svg>`,
  externalLink: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
};

function icon(name, cls) {
  return ICONS[name] || "";
}

/* ============================================================
   共通ユーティリティ
   ============================================================ */
function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function qs(sel, root) {
  return (root || document).querySelector(sel);
}
function qsa(sel, root) {
  return Array.from((root || document).querySelectorAll(sel));
}

function badgeForRequirementStatus(status) {
  switch (status) {
    case "ok":
    case "advisory":
      return { icon: "✓", cls: "check-icon" };
    case "dueSoon":
      return { icon: "△", cls: "warn-icon" };
    case "overdue":
    case "missing":
    default:
      return { icon: "！", cls: "cross-icon" };
  }
}

// 資格・教育マスタのdeadlineTypeごとの表示ラベル（実務上の誤解を避けるための区分）
const DEADLINE_TYPE_FIELD_LABEL = {
  none: "期限なし",
  legal: "有効期限",
  recommendedTraining: "次回教育推奨日",
  clientRule: "元請確認期限",
  companyRule: "自社確認期限",
};

// 作業員詳細の資格カードに表示するステータスバッジ（deadlineTypeとseverityから決定）
function certDeadlineBadge(certType, info) {
  const t = certType.deadlineType;
  if (t === "none") return `<span class="badge badge-neutral">期限なし</span>`;
  if (t === "recommendedTraining") {
    return info.severity === "advisory"
      ? `<span class="badge badge-warning">再教育推奨</span>`
      : `<span class="badge badge-neutral">次回教育予定</span>`;
  }
  if (t === "legal") {
    if (info.severity === "overdue") return `<span class="badge badge-danger">期限切れ</span>`;
    if (info.severity === "dueSoon") return `<span class="badge badge-warning">期限間近</span>`;
    return `<span class="badge badge-success">有効</span>`;
  }
  // clientRule / companyRule
  if (info.severity === "overdue") return `<span class="badge badge-danger">確認要</span>`;
  if (info.severity === "dueSoon") return `<span class="badge badge-warning">確認期限間近</span>`;
  return `<span class="badge badge-neutral">確認予定</span>`;
}

// 一覧・フィルター用の簡易分類： none(期限なし) | urgent(要対応) | soon(30日以内の確認) | ok(問題なし)
function getAttentionBucket(cert, certType) {
  if (!certType || certType.deadlineType === "none") return "none";
  const info = getCertDeadlineInfo(cert, certType);
  if (certType.deadlineType === "recommendedTraining") {
    if (info.severity !== "advisory") return "ok";
    return info.days < 0 ? "urgent" : "soon";
  }
  if (info.severity === "overdue") return "urgent";
  if (info.severity === "dueSoon") return "soon";
  return "ok";
}

function siteStatusBadge(status) {
  const map = {
    未着手: "badge-neutral",
    準備中: "badge-info",
    確認待ち: "badge-warning",
    提出可能: "badge-success",
    提出済: "badge-success",
  };
  return `<span class="badge ${map[status] || "badge-neutral"}">${status}</span>`;
}

function initialOf(name) {
  return (name || "").trim().charAt(0) || "?";
}

/* ============================================================
   モバイル行カード（600px以下でtable.data-tableの代わりに表示する共通部品）
   ============================================================ */
function mrcRow(label, valueHtml) {
  return `<div class="mrc-row"><span class="mrc-label">${escapeHtml(label)}</span><span class="mrc-value">${valueHtml}</span></div>`;
}

function mrcStats(items) {
  // items: [[num, label], ...]
  return `<div class="mrc-stats">${items
    .map(([num, label]) => `<div class="mrc-stat"><span class="mrc-stat-num">${num}</span><span class="mrc-stat-label">${escapeHtml(label)}</span></div>`)
    .join("")}</div>`;
}

function mobileEmptyState(text) {
  return `<div class="empty-state">${escapeHtml(text)}</div>`;
}

/* ============================================================
   トースト通知
   ============================================================ */
function showToast(message, type) {
  const wrap = qs("#toastWrap");
  const el = document.createElement("div");
  el.className = "toast" + (type === "success" ? " toast-success" : "");
  el.textContent = message;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.transition = "opacity 0.25s ease";
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 260);
  }, 2400);
}

/* ============================================================
   モーダル
   ============================================================ */
function openModal(bodyHtml, opts) {
  const overlay = qs("#modalOverlay");
  const box = qs("#modalBox");
  box.className = "modal-box" + (opts && opts.wide ? " modal-wide" : "");
  box.innerHTML = bodyHtml;
  overlay.classList.add("open");
}
function closeModal() {
  qs("#modalOverlay").classList.remove("open");
  qs("#modalBox").innerHTML = "";
}
function modalShell(title, bodyHtml, footerHtml) {
  return `
    <div class="modal-header">
      <div class="modal-title">${title}</div>
      <button class="modal-close" data-action="close-modal">${icon("close")}</button>
    </div>
    <div class="modal-body">${bodyHtml}</div>
    ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ""}
  `;
}

/* ============================================================
   サイドバー
   ============================================================ */
const NAV_ITEMS = [
  { key: "dashboard", label: "ホーム", href: "#/dashboard" },
  { group: "業務管理" },
  { key: "sites", label: "現場管理", href: "#/sites" },
  { key: "workers", label: "作業員管理", href: "#/workers" },
  { key: "certifications", label: "資格・証明書", href: "#/certifications" },
  { key: "submissions", label: "提出資料管理", href: "#/submissions" },
  { group: "基本情報" },
  { key: "company", label: "会社情報", href: "#/company" },
  { key: "clients", label: "元請・提出設定", href: "#/clients" },
  { group: "システム" },
  { key: "settings", label: "設定", href: "#/settings" },
];

function renderSidebar(activeKey) {
  qs("#sidebarNav").innerHTML = NAV_ITEMS.map((item) => {
    if (item.group) return `<div class="nav-group-label">${escapeHtml(item.group)}</div>`;
    return `<a class="nav-item ${item.key === activeKey ? "active" : ""}" href="${item.href}">${escapeHtml(item.label)}</a>`;
  }).join("");
}

/* ============================================================
   ルーター
   ============================================================ */
function currentRoute() {
  const hash = location.hash || "#/dashboard";
  const path = hash.replace(/^#\//, "");
  return path.split("/").filter(Boolean);
}

function navigate(href) {
  location.hash = href;
}

function renderApp() {
  const parts = currentRoute();
  const root = parts[0] || "dashboard";
  const app = qs("#app");
  let html = "";
  let activeNav = root;

  if (root === "dashboard") {
    html = renderDashboard();
  } else if (root === "sites" && parts.length === 1) {
    html = renderSitesList();
  } else if (root === "sites" && parts.length === 2) {
    html = renderSiteDetail(parts[1]);
  } else if (root === "sites" && parts.length === 3 && parts[2] === "generate") {
    html = renderSiteGenerate(parts[1]);
  } else if (root === "workers" && parts.length === 1) {
    html = renderWorkersList();
  } else if (root === "workers" && parts.length === 2) {
    html = renderWorkerDetail(parts[1]);
  } else if (root === "certifications") {
    html = renderCertifications();
  } else if (root === "submissions") {
    html = renderSubmissions();
  } else if (root === "company") {
    html = renderCompany();
  } else if (root === "clients") {
    html = renderClients();
  } else if (root === "settings") {
    html = renderSettings();
  } else {
    html = renderDashboard();
    activeNav = "dashboard";
  }

  app.innerHTML = html;
  renderSidebar(activeNav);
  renderNotifDropdown();
  window.scrollTo(0, 0);
  closeSidebarMobile();

  // 各種フィルターUIのイベントバインド（該当DOMが無いページでは何もしない）
  bindSitesListFilters();
  bindWorkersListFilters();
  bindCertificationsFilters();
}

/* ============================================================
   通知（ベル）
   ============================================================ */
function renderNotifDropdown() {
  const items = getActionItems();
  qs("#bellBadge").textContent = items.length > 9 ? "9+" : String(items.length);
  qs("#bellBadge").style.display = items.length === 0 ? "none" : "flex";

  const dd = qs("#notifDropdown");
  if (items.length === 0) {
    dd.innerHTML = `<div class="notif-dropdown-header">通知</div><div class="notif-empty">現在、対応が必要な項目はありません。</div>`;
    return;
  }
  dd.innerHTML =
    `<div class="notif-dropdown-header">対応が必要な項目（${items.length}件）</div>` +
    items
      .slice(0, 8)
      .map((it) => {
        const attrs =
          it.special === "review-submission"
            ? `data-action="review-submission" data-id="${it.pendingId}"`
            : `data-action="navigate" data-href="${it.actionHref}"`;
        return `
      <div class="notif-item" ${attrs}>
        <div class="notif-item-title">${escapeHtml(it.title)} - ${escapeHtml(it.subtitle)}</div>
        <div class="notif-item-sub">${escapeHtml(it.detail)}</div>
      </div>`;
      })
      .join("");
}

function toggleNotifDropdown() {
  qs("#notifDropdown").classList.toggle("open");
}
function closeNotifDropdown() {
  qs("#notifDropdown").classList.remove("open");
}

/* ============================================================
   モバイルサイドバー
   ============================================================ */
function toggleSidebarMobile() {
  qs("#sidebar").classList.toggle("open");
  qs("#sidebarBackdrop").classList.toggle("open");
}
function closeSidebarMobile() {
  qs("#sidebar").classList.remove("open");
  qs("#sidebarBackdrop").classList.remove("open");
}

/* ============================================================
   画面1: ダッシュボード
   ============================================================ */
function renderDashboard() {
  const { overdue, dueSoon } = getQualificationAttentionCounts();
  const missing = getGlobalMissingCount();
  const openSites = Store.state.sites.filter((s) => s.status !== "提出済");
  const urgentDeadlineCount = openSites.filter((s) => {
    const d = daysUntil(s.deadline);
    return d !== null && d <= 7;
  }).length;
  const readyCount = openSites.filter((s) => computeSiteStats(s).isComplete).length;
  const actionItems = getActionItems();

  const sortedSites = openSites
    .slice()
    .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline));

  return `
    <div class="page-header">
      <div>
        <div class="page-title">ダッシュボード</div>
        <div class="page-subtitle">提出期限や不足資料など、現在対応が必要な内容を確認できます。</div>
      </div>
    </div>

    <div class="card" style="margin-bottom:14px;">
      <div class="section-band">本日の確認事項</div>
      <div class="today-check">
        <div class="today-check-row">
          <div class="today-check-label"><span class="today-check-mark mark-danger">！</span>提出期限7日以内</div>
          <div class="today-check-value">${urgentDeadlineCount}現場</div>
        </div>
        <div class="today-check-row">
          <div class="today-check-label"><span class="today-check-mark mark-danger">！</span>現場別の不足項目</div>
          <div class="today-check-value">${missing}件</div>
        </div>
        <div class="today-check-row">
          <div class="today-check-label"><span class="today-check-mark mark-warning">△</span>資格・教育の確認</div>
          <div class="today-check-value">${overdue + dueSoon}件</div>
        </div>
        <div class="today-check-row">
          <div class="today-check-label"><span class="today-check-mark mark-success">○</span>提出可能</div>
          <div class="today-check-value">${readyCount}現場</div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom:14px;">
      <div class="section-band">対応が必要な現場</div>
      <div class="responsive-table">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>現場名</th><th>元請</th><th>提出期限</th><th>準備率</th><th>不足</th><th>状態</th></tr>
            </thead>
            <tbody>
              ${
                sortedSites.length === 0
                  ? `<tr><td colspan="6"><div class="empty-state">対応が必要な現場はありません</div></td></tr>`
                  : sortedSites
                      .map((site, idx) => {
                        const stats = computeSiteStats(site);
                        return `
                      <tr class="row-clickable" data-action="navigate" data-href="#/sites/${site.id}">
                        <td class="cell-name">${idx === 0 ? `<span class="priority-tag">優先</span>` : ""}${escapeHtml(site.name)}</td>
                        <td>${escapeHtml(Store.getClientName(site.clientId))}</td>
                        <td>${formatDateJP(site.deadline)}</td>
                        <td>${stats.percent}%</td>
                        <td>${stats.missingCount > 0 ? `<span class="text-danger" style="font-weight:700;">${stats.missingCount}件</span>` : "0件"}</td>
                        <td>${siteStatusBadge(site.status)}</td>
                      </tr>`;
                      })
                      .join("")
              }
            </tbody>
          </table>
        </div>
        <div class="mobile-list">
          ${
            sortedSites.length === 0
              ? mobileEmptyState("対応が必要な現場はありません")
              : sortedSites
                  .map((site, idx) => {
                    const stats = computeSiteStats(site);
                    return `
                  <div class="mobile-row-card" data-action="navigate" data-href="#/sites/${site.id}">
                    <div class="mrc-title">${idx === 0 ? `<span class="priority-tag">優先</span>` : ""}${escapeHtml(site.name)}</div>
                    <div class="mrc-subtitle">${escapeHtml(Store.getClientName(site.clientId))}</div>
                    <div class="mrc-body">
                      ${mrcRow("提出期限", formatDateJP(site.deadline))}
                      ${mrcRow("準備率", `${stats.percent}%`)}
                      ${mrcRow("不足", stats.missingCount > 0 ? `<span class="text-danger">${stats.missingCount}件</span>` : "0件")}
                    </div>
                    <div class="mrc-status">${siteStatusBadge(site.status)}</div>
                  </div>`;
                  })
                  .join("")
          }
        </div>
      </div>
    </div>

    <div class="card">
      <div class="section-band">新着・対応事項</div>
      <div class="activity-list">
        ${
          actionItems.length === 0
            ? `<div class="empty-state">現在、対応が必要な項目はありません。</div>`
            : actionItems
                .slice(0, 8)
                .map((it) => renderActivityRow(it))
                .join("")
        }
      </div>
    </div>
  `;
}

// 「新着・対応事項」の1行（日付 + 平文の1文）
function activitySentence(item) {
  switch (item.kind) {
    case "pending_submission":
      return `${item.title}${item.subtitle}`;
    case "missing_for_deadline":
      return `${item.siteName || item.title}の提出期限まで${item.days !== null && item.days < 0 ? "を超過しています" : `残り${item.days}日`}`;
    case "company_license":
      return `建設業許可の確認期限が近づいています（${item.badge}）`;
    case "company_doc_missing":
      return `${item.subtitle}が未提出です`;
    case "recommended_training":
      return `${item.title}さんの${item.subtitle}が再教育推奨の時期です`;
    default:
      return `${item.title}さんの${item.subtitle}をご確認ください`;
  }
}

function renderActivityRow(it) {
  const d = it.eventDate ? new Date(it.eventDate) : new Date();
  const dateLabel = `${d.getMonth() + 1}/${d.getDate()}`;
  const attrs =
    it.special === "review-submission"
      ? `data-action="review-submission" data-id="${it.pendingId}"`
      : `data-action="navigate" data-href="${it.actionHref}"`;
  return `
    <div class="activity-row">
      <span class="activity-date">${dateLabel}</span>
      <a class="activity-text" href="javascript:void(0)" ${attrs}>${escapeHtml(activitySentence(it))}</a>
    </div>
  `;
}

/* ============================================================
   画面2: 現場管理
   ============================================================ */
let sitesFilter = { q: "", clientId: "", status: "" };

function renderSitesList() {
  const filtered = Store.state.sites.filter((s) => {
    if (sitesFilter.q && !s.name.includes(sitesFilter.q)) return false;
    if (sitesFilter.clientId && s.clientId !== sitesFilter.clientId) return false;
    if (sitesFilter.status && s.status !== sitesFilter.status) return false;
    return true;
  });

  const clientOptions = Store.state.clients
    .map((c) => `<option value="${c.id}" ${sitesFilter.clientId === c.id ? "selected" : ""}>${escapeHtml(c.name)}</option>`)
    .join("");
  const statusList = ["未着手", "準備中", "確認待ち", "提出可能", "提出済"];
  const statusOptions = statusList
    .map((s) => `<option value="${s}" ${sitesFilter.status === s ? "selected" : ""}>${s}</option>`)
    .join("");

  const rows = filtered
    .map((site) => {
      const stats = computeSiteStats(site);
      return `
      <tr class="row-clickable" data-action="navigate" data-href="#/sites/${site.id}">
        <td>
          <div class="cell-name">${escapeHtml(site.name)}</div>
          <div class="cell-sub">${formatDateJP(site.periodStart)} 〜 ${formatDateJP(site.periodEnd)}</div>
        </td>
        <td>${escapeHtml(Store.getClientName(site.clientId))}</td>
        <td>${formatDateJP(site.deadline)}</td>
        <td>${site.plannedWorkerIds.length}名</td>
        <td>${stats.totalItems}件</td>
        <td>${stats.missingCount > 0 ? `<span class="text-danger" style="font-weight:700;">${stats.missingCount}件</span>` : `<span class="text-success" style="font-weight:700;">0件</span>`}</td>
        <td style="min-width:140px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="progress-track" style="width:70px;"><div class="progress-fill ${stats.isComplete ? "complete" : ""}" style="width:${stats.percent}%"></div></div>
            <span style="font-size:12.5px;font-weight:700;">${stats.percent}%</span>
          </div>
        </td>
        <td>${siteStatusBadge(site.status)}</td>
      </tr>`;
    })
    .join("");

  return `
    <div class="page-header">
      <div>
        <div class="page-title">現場管理</div>
        <div class="page-subtitle">全${Store.state.sites.length}件の現場を管理しています</div>
      </div>
      <button class="btn btn-secondary" data-action="not-implemented" data-msg="モック版では新規現場の登録はできません">新規現場登録</button>
    </div>

    <div class="filter-bar">
      <input type="text" class="input input-search" id="siteFilterQ" placeholder="現場名で検索" value="${escapeHtml(sitesFilter.q)}">
      <select class="select" id="siteFilterClient">
        <option value="">すべての元請</option>
        ${clientOptions}
      </select>
      <select class="select" id="siteFilterStatus">
        <option value="">すべてのステータス</option>
        ${statusOptions}
      </select>
    </div>

    <div class="card">
      <div class="responsive-table">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>現場名</th><th>元請会社</th><th>提出期限</th><th>配置予定</th>
                <th>必要書類数</th><th>不足数</th><th>準備率</th><th>ステータス</th>
              </tr>
            </thead>
            <tbody>
              ${rows || `<tr><td colspan="8"><div class="empty-state">条件に一致する現場がありません</div></td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="mobile-list">
          ${
            filtered.length === 0
              ? mobileEmptyState("条件に一致する現場がありません")
              : filtered
                  .map((site) => {
                    const stats = computeSiteStats(site);
                    return `
                  <div class="mobile-row-card">
                    <div class="mrc-title">${escapeHtml(site.name)}</div>
                    <div class="mrc-subtitle">${escapeHtml(Store.getClientName(site.clientId))}</div>
                    <div class="mrc-body">
                      ${mrcRow("提出期限", formatDateJP(site.deadline))}
                      ${mrcRow("準備率", `${stats.percent}%`)}
                      ${mrcRow("不足", stats.missingCount > 0 ? `<span class="text-danger">${stats.missingCount}件</span>` : `<span class="text-success">0件</span>`)}
                    </div>
                    <div class="mrc-status">${siteStatusBadge(site.status)}</div>
                    <div class="mrc-actions">
                      <a class="btn btn-secondary" href="#/sites/${site.id}">詳細を見る</a>
                    </div>
                  </div>`;
                  })
                  .join("")
          }
        </div>
      </div>
    </div>
  `;
}

function bindSitesListFilters() {
  const q = qs("#siteFilterQ");
  const c = qs("#siteFilterClient");
  const s = qs("#siteFilterStatus");
  if (!q) return;
  q.addEventListener("input", () => {
    sitesFilter.q = q.value;
    const cursor = q.selectionStart;
    renderApp();
    const newQ = qs("#siteFilterQ");
    if (newQ) {
      newQ.focus();
      newQ.setSelectionRange(cursor, cursor);
    }
  });
  c.addEventListener("change", () => {
    sitesFilter.clientId = c.value;
    renderApp();
  });
  s.addEventListener("change", () => {
    sitesFilter.status = s.value;
    renderApp();
  });
}

/* ============================================================
   画面3: 現場詳細・提出準備
   ============================================================ */
function renderSiteDetail(siteId) {
  const site = Store.getSite(siteId);
  if (!site) return renderNotFound("現場が見つかりません", "#/sites", "現場管理に戻る");
  const stats = computeSiteStats(site);
  const plannedWorkers = site.plannedWorkerIds.map((id) => Store.getWorker(id)).filter(Boolean);
  const client = Store.getClient(site.clientId);
  const template = client ? Store.getTemplate(client.templateId) : null;
  const methodBadges = ((client && client.submissionMethods) || [])
    .map((m) => `<span class="badge badge-neutral method-badge">${escapeHtml(m)}</span>`)
    .join(" ");

  // ■ 対応が必要：会社書類・作業員の不足項目をまとめて1つの表にする
  const needsAttentionRows = [
    ...stats.missingCompanyItems.map((item) => ({
      type: "company",
      target: "-",
      name: item.name,
      statusLabel: "未アップロード",
      actionHtml: `<a class="btn btn-secondary" href="#/company">確認</a>`,
    })),
    ...stats.missingWorkerItems.map((item) => {
      const requested = item.requested;
      const statusLabel = item.status === "overdue" ? "期限切れ" : "未登録";
      const actionHtml = requested
        ? `<span class="badge badge-neutral">依頼済み</span>`
        : `<button class="btn btn-secondary" data-action="open-request-modal" data-site="${site.id}" data-worker="${item.workerId}" data-cert="${item.certTypeId}">依頼</button>`;
      return { type: "作業員", target: item.workerName, name: item.certName, statusLabel, actionHtml };
    }),
  ];

  // ■ 作業員別提出状況：作業員1人につき1行で必要資格数・準備済・不足を集計する
  const workerSummaries = plannedWorkers.map((worker) => {
    const reqs = site.workerRequirements.filter((r) => r.workerId === worker.id);
    let fulfilledCount = 0;
    let missingCount = 0;
    reqs.forEach((r) => {
      const { status } = getRequirementStatus(worker, r.certTypeId);
      if (status === "missing" || status === "overdue") missingCount++;
      else fulfilledCount++;
    });
    const stateKind = missingCount > 0 ? "danger" : fulfilledCount === reqs.length ? "success" : "warning";
    return { worker, reqCount: reqs.length, fulfilledCount, missingCount, stateKind };
  });

  const STATE_BADGE = {
    danger: `<span class="badge badge-danger">要対応</span>`,
    success: `<span class="badge badge-success">完了</span>`,
    warning: `<span class="badge badge-warning">確認</span>`,
  };
  const STATE_MARK = {
    danger: `<span class="cross-icon">！</span> 要対応`,
    success: `<span class="check-icon">✓</span> 完了`,
    warning: `<span class="warn-icon">△</span> 確認`,
  };

  const workerSummaryRows = workerSummaries
    .map(
      ({ worker, reqCount, fulfilledCount, missingCount, stateKind }) => `
      <tr class="row-clickable" data-action="navigate" data-href="#/workers/${worker.id}">
        <td class="cell-name">${escapeHtml(worker.name)}</td>
        <td>${escapeHtml(worker.jobType)}</td>
        <td>${reqCount}</td>
        <td>${fulfilledCount}</td>
        <td>${missingCount > 0 ? `<span class="text-danger" style="font-weight:700;">${missingCount}</span>` : "0"}</td>
        <td>${STATE_BADGE[stateKind]}</td>
      </tr>`
    )
    .join("");

  const workerSummaryCards = workerSummaries
    .map(
      ({ worker, reqCount, fulfilledCount, missingCount, stateKind }) => `
      <div class="mobile-row-card">
        <div class="mrc-title">${escapeHtml(worker.name)}</div>
        <div class="mrc-subtitle">${escapeHtml(worker.jobType)}</div>
        ${mrcStats([
          [reqCount, "必要資格"],
          [fulfilledCount, "準備済み"],
          [missingCount, "不足"],
        ])}
        <div class="mrc-status">${STATE_MARK[stateKind]}</div>
        <div class="mrc-actions">
          <a class="btn btn-secondary" href="#/workers/${worker.id}">詳細を見る</a>
        </div>
      </div>`
    )
    .join("");

  return `
    <div class="breadcrumb"><a href="#/sites">現場管理</a> <span>›</span> <span>${escapeHtml(site.name)}</span></div>
    <div class="page-header">
      <div>
        <div class="page-title">${escapeHtml(site.name)}</div>
      </div>
      <div>${siteStatusBadge(site.status)}</div>
    </div>

    <div class="card" style="margin-bottom:14px;">
      <div class="section-band">現場基本情報</div>
      <table class="info-table">
        <tr><th>現場名</th><td>${escapeHtml(site.name)}</td></tr>
        <tr><th>元請会社</th><td>${escapeHtml(Store.getClientName(site.clientId))}</td></tr>
        <tr><th>提出期限</th><td>${formatDateJP(site.deadline)}</td></tr>
        <tr><th>工期</th><td>${formatDateJP(site.periodStart)} ～ ${formatDateJP(site.periodEnd)}</td></tr>
        <tr><th>配置予定</th><td>${plannedWorkers.length}名</td></tr>
        <tr><th>提出方式</th><td>${methodBadges || "-"}</td></tr>
        <tr><th>テンプレート</th><td>${template ? escapeHtml(template.name) : "未設定"}</td></tr>
      </table>
      <div class="form-hint" style="padding:0 16px 12px;">※GreenSite/Buildee等へは接続していません。あくまで提出先の形式に合わせたデータ準備の表示です。</div>
    </div>

    <div class="card" style="margin-bottom:14px;">
      <div class="section-band">提出準備状況</div>
      <div class="card-pad">
        <div class="info-grid" style="margin-bottom:12px;">
          <div><div class="info-item-label">必要項目</div><div class="info-item-value">${stats.totalItems}件</div></div>
          <div><div class="info-item-label">準備済み</div><div class="info-item-value">${stats.fulfilledCount}件</div></div>
          <div><div class="info-item-label">不足</div><div class="info-item-value" style="color:${stats.missingCount > 0 ? "var(--color-danger)" : "var(--color-success)"};">${stats.missingCount}件</div></div>
          <div><div class="info-item-label">準備率</div><div class="info-item-value">${stats.percent}%</div></div>
        </div>
        <div class="progress-track" style="height:8px;margin-bottom:14px;"><div class="progress-fill ${stats.isComplete ? "complete" : ""}" style="width:${stats.percent}%"></div></div>
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <button class="btn btn-secondary" data-action="open-request-modal" data-site="${site.id}" ${stats.missingWorkerItems.length === 0 ? "disabled" : ""}>${icon("send")}不足資料をまとめて依頼</button>
          <a class="btn btn-primary" href="#/sites/${site.id}/generate">${icon("archive")}提出資料を準備する</a>
        </div>
      </div>
    </div>

    ${
      needsAttentionRows.length > 0
        ? `<div class="card" style="margin-bottom:14px;">
      <div class="section-band">対応が必要</div>
      <div class="responsive-table">
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>種別</th><th>対象</th><th>必要資料</th><th>状態</th><th>操作</th></tr></thead>
            <tbody>
              ${needsAttentionRows
                .map(
                  (r) => `
              <tr>
                <td>${escapeHtml(r.type === "company" ? "会社" : r.type)}</td>
                <td>${escapeHtml(r.target)}</td>
                <td>${escapeHtml(r.name)}</td>
                <td><span class="cross-icon">！</span> ${escapeHtml(r.statusLabel)}</td>
                <td>${r.actionHtml}</td>
              </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
        <div class="mobile-list">
          ${needsAttentionRows
            .map(
              (r) => `
          <div class="mobile-row-card">
            <div class="mrc-body">
              ${mrcRow(r.type === "company" ? "対象" : "作業員", escapeHtml(r.type === "company" ? "会社" : r.target))}
              ${mrcRow("必要資料", escapeHtml(r.name))}
            </div>
            <div class="mrc-status"><span class="cross-icon">！</span> ${escapeHtml(r.statusLabel)}</div>
            <div class="mrc-actions">${r.actionHtml}</div>
          </div>`
            )
            .join("")}
        </div>
      </div>
    </div>`
        : ""
    }

    <div class="card">
      <div class="section-band">作業員別提出状況</div>
      <div class="responsive-table">
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>氏名</th><th>職種</th><th>必要資格数</th><th>準備済</th><th>不足</th><th>状態</th></tr></thead>
            <tbody>
              ${workerSummaryRows || `<tr><td colspan="6"><div class="empty-state">配置予定の作業員がいません</div></td></tr>`}
            </tbody>
          </table>
        </div>
        <div class="mobile-list">
          ${workerSummaryCards || mobileEmptyState("配置予定の作業員がいません")}
        </div>
      </div>
    </div>
  `;
}

function renderNotFound(msg, href, label) {
  return `<div class="card card-pad"><div class="empty-state">${escapeHtml(msg)}<div style="margin-top:14px;"><a class="btn btn-secondary" href="${href}">${escapeHtml(label)}</a></div></div></div>`;
}

/* ============================================================
   画面7: 提出資料生成
   ============================================================ */
let generatingSiteId = null;

function renderSiteGenerate(siteId) {
  const site = Store.getSite(siteId);
  if (!site) return renderNotFound("現場が見つかりません", "#/sites", "現場管理に戻る");
  const stats = computeSiteStats(site);
  const client = Store.getClient(site.clientId);
  const clientName = client ? client.name : "提出先";
  const methodText = client ? (client.submissionMethods || []).join("＋") : "-";

  let body = "";

  if (generatingSiteId === siteId) {
    body = `
      <div class="ai-loading">
        <div class="ai-spinner"></div>
        <div class="ai-loading-text">提出資料を準備しています…</div>
        <div class="ai-loading-sub">書類を1つのフォルダにまとめています</div>
      </div>`;
  } else if (site.submissionGenerated) {
    const files = site.submissionFiles || generateSubmissionFiles(site);
    body = `
      <div class="success-panel">
        <div class="success-icon-circle">✓</div>
        <div class="success-title">提出資料を作成しました</div>
        <div class="success-sub">${escapeHtml(site.name)}_提出資料.zip（生成日時：${formatDateTimeJP(site.submissionGeneratedAt)}）</div>
        <div class="file-list">
          ${files.map((f) => `<div class="file-list-item">${icon("file")}${escapeHtml(f)}</div>`).join("")}
        </div>
        <div class="form-hint" style="margin-bottom:20px;">※モック環境のため実際のファイルはダウンロードされません。実際のサービスでは、ここで準備したデータをもとに${escapeHtml(methodText)}への提出作業（入力・アップロード）を効率化します。自動送信は行いません。</div>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <a class="btn btn-secondary" href="#/sites/${site.id}">現場詳細に戻る</a>
          <a class="btn btn-primary" href="#/submissions">提出資料一覧を見る</a>
        </div>
      </div>`;
  } else if (stats.missingCount > 0) {
    const missingList = [...stats.missingCompanyItems, ...stats.missingWorkerItems];
    body = `
      <div class="ai-notice" style="background:var(--color-danger-light);border-color:var(--color-danger-border);color:var(--color-danger);">
        ${icon("warnTriangle")}
        <div><b>提出資料が${stats.missingCount}件不足しています。</b><br>すべての書類が揃うと提出資料を準備できます。</div>
      </div>
      <div class="table-wrap" style="margin-bottom:14px;">
        <table class="data-table">
          <thead><tr><th>不足している書類</th></tr></thead>
          <tbody>
            ${missingList
              .map((item) => {
                const name = item.type === "company" ? item.name : `${item.workerName} / ${item.certName}`;
                return `<tr><td><span class="cross-icon">！</span> ${escapeHtml(name)}</td></tr>`;
              })
              .join("")}
          </tbody>
        </table>
      </div>
      <button class="btn btn-primary btn-block" data-action="open-request-modal" data-site="${site.id}" ${stats.missingWorkerItems.length === 0 ? "disabled" : ""}>${icon("send")}不足資料をまとめて依頼</button>
    `;
  } else {
    const files = generateSubmissionFiles(site);
    body = `
      <div class="ai-notice" style="background:var(--color-success-light);border-color:var(--color-success-border);color:var(--color-success);">
        <span style="font-size:16px;">✓</span>
        <div><b>提出資料を準備できます。</b><br>必要な書類がすべて揃っています。</div>
      </div>
      <div class="section-title">準備される内容（プレビュー）</div>
      <div class="file-list" style="max-width:100%;">
        ${files.map((f) => `<div class="file-list-item">${icon("file")}${escapeHtml(f)}</div>`).join("")}
      </div>
      <button class="btn btn-primary btn-block" data-action="do-generate" data-site="${site.id}">${icon("archive")}提出資料を準備する</button>
    `;
  }

  return `
    <div class="breadcrumb"><a href="#/sites">現場管理</a> <span>›</span> <a href="#/sites/${site.id}">${escapeHtml(site.name)}</a> <span>›</span> <span>提出資料生成</span></div>
    <div class="page-header">
      <div>
        <div class="page-title">${escapeHtml(clientName)}向け提出資料</div>
        <div class="page-subtitle">${escapeHtml(site.name)}　提出方式：${escapeHtml(methodText)}　提出準備状況：${stats.fulfilledCount} / ${stats.totalItems}件</div>
      </div>
    </div>
    <div class="card card-pad" style="max-width:680px;">
      ${body}
    </div>
  `;
}

function handleGenerateClick(siteId) {
  generatingSiteId = siteId;
  renderApp();
  setTimeout(() => {
    generateSubmission(siteId);
    generatingSiteId = null;
    renderApp();
    showToast("提出資料を作成しました", "success");
  }, 1300);
}

/* ============================================================
   画面4: 作業員管理
   ============================================================ */
let workersFilter = { q: "" };

function workerLastUpdated(worker) {
  const dates = worker.certs.map((c) => c.obtainedDate).filter(Boolean).sort();
  return dates.length ? dates[dates.length - 1] : null;
}

function renderWorkersList() {
  const filtered = Store.state.workers.filter((w) => {
    if (workersFilter.q && !w.name.includes(workersFilter.q) && !w.kana.includes(workersFilter.q)) return false;
    return true;
  });

  const workerSummaries = filtered.map((w) => {
    let urgent = 0,
      soon = 0;
    w.certs.forEach((c) => {
      const certType = Store.getCertType(c.certTypeId);
      const bucket = getAttentionBucket(c, certType);
      if (bucket === "urgent") urgent++;
      else if (bucket === "soon") soon++;
    });
    return { w, urgent, soon };
  });

  const rows = workerSummaries
    .map(
      ({ w, urgent, soon }) => `
      <tr class="row-clickable" data-action="navigate" data-href="#/workers/${w.id}">
        <td>
          <div style="display:flex;align-items:center;gap:12px;">
            <div class="avatar-circle" style="background:${w.avatarColor}">${initialOf(w.name)}</div>
            <div>
              <div class="cell-name">${escapeHtml(w.name)}</div>
              <div class="cell-sub">${escapeHtml(w.kana)}</div>
            </div>
          </div>
        </td>
        <td>${escapeHtml(w.affiliation)}</td>
        <td>${escapeHtml(w.jobType)}</td>
        <td>${w.certs.length}件</td>
        <td>${urgent > 0 ? `<span class="badge badge-danger">要対応 ${urgent}件</span>` : `<span class="text-sub">-</span>`}</td>
        <td>${soon > 0 ? `<span class="badge badge-warning">要確認 ${soon}件</span>` : `<span class="text-sub">-</span>`}</td>
        <td>${formatDateJP(workerLastUpdated(w))}</td>
        <td>
          <div style="display:flex;gap:6px;">
            <a class="btn btn-secondary btn-sm" href="#/workers/${w.id}">詳細</a>
            <button class="btn btn-secondary btn-sm" data-action="open-add-cert" data-worker="${w.id}">資格証を登録</button>
          </div>
        </td>
      </tr>`
    )
    .join("");

  const workerCards = workerSummaries
    .map(
      ({ w, urgent, soon }) => `
      <div class="mobile-row-card">
        <div class="mrc-title">${escapeHtml(w.name)}</div>
        <div class="mrc-subtitle">${escapeHtml(w.jobType)}</div>
        <div class="mrc-body">
          ${mrcRow("所属", escapeHtml(w.affiliation))}
        </div>
        ${mrcStats([
          [`${w.certs.length}件`, "保有資格"],
          [urgent > 0 ? `<span class="text-danger">${urgent}件</span>` : "-", "要対応"],
          [soon > 0 ? `<span class="text-warning">${soon}件</span>` : "-", "要確認"],
        ])}
        <div class="mrc-actions">
          <a class="btn btn-secondary" href="#/workers/${w.id}">詳細を見る</a>
          <button class="btn btn-secondary" data-action="open-add-cert" data-worker="${w.id}">資格証を登録</button>
        </div>
      </div>`
    )
    .join("");

  return `
    <div class="page-header">
      <div>
        <div class="page-title">作業員管理</div>
        <div class="page-subtitle">全${Store.state.workers.length}名の作業員・保有資格を管理しています</div>
      </div>
      <button class="btn btn-secondary" data-action="not-implemented" data-msg="モック版では新規作業員の登録はできません">新規作業員登録</button>
    </div>

    <div class="filter-bar">
      <input type="text" class="input input-search" id="workerFilterQ" placeholder="氏名で検索" value="${escapeHtml(workersFilter.q)}">
    </div>

    <div class="card">
      <div class="responsive-table">
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr><th>氏名</th><th>所属</th><th>職種</th><th>保有資格数</th><th>要対応</th><th>要確認</th><th>最終更新日</th><th>操作</th></tr>
            </thead>
            <tbody>${rows || `<tr><td colspan="8"><div class="empty-state">条件に一致する作業員がいません</div></td></tr>`}</tbody>
          </table>
        </div>
        <div class="mobile-list">
          ${workerCards || mobileEmptyState("条件に一致する作業員がいません")}
        </div>
      </div>
    </div>
  `;
}

function bindWorkersListFilters() {
  const q = qs("#workerFilterQ");
  if (!q) return;
  q.addEventListener("input", () => {
    workersFilter.q = q.value;
    const cursor = q.selectionStart;
    renderApp();
    const newQ = qs("#workerFilterQ");
    if (newQ) {
      newQ.focus();
      newQ.setSelectionRange(cursor, cursor);
    }
  });
}

/* ============================================================
   画面5: 作業員詳細・資格管理
   ============================================================ */
function renderWorkerDetail(workerId) {
  const worker = Store.getWorker(workerId);
  if (!worker) return renderNotFound("作業員が見つかりません", "#/workers", "作業員管理に戻る");

  const involvedSites = Store.state.sites.filter((s) => s.plannedWorkerIds.includes(workerId));

  const certRows = worker.certs
    .map((cert) => {
      const certType = Store.getCertType(cert.certTypeId);
      const info = getCertDeadlineInfo(cert, certType);
      const deadlineLabel = DEADLINE_TYPE_FIELD_LABEL[certType.deadlineType];
      const deadlineValue = cert.deadlineDate ? formatDateJP(cert.deadlineDate) : "なし";
      return `
      <tr>
        <td class="cell-name">${escapeHtml(Store.getCertTypeName(cert.certTypeId))}</td>
        <td>${formatDateJP(cert.obtainedDate)}</td>
        <td>${deadlineLabel}</td>
        <td>${deadlineValue}</td>
        <td>${certDeadlineBadge(certType, info)}</td>
        <td><button class="btn btn-secondary btn-sm" data-action="not-implemented" data-msg="モック版では資格証の編集はできません">編集</button></td>
      </tr>`;
    })
    .join("");

  const certCards = worker.certs
    .map((cert) => {
      const certType = Store.getCertType(cert.certTypeId);
      const info = getCertDeadlineInfo(cert, certType);
      const deadlineLabel = DEADLINE_TYPE_FIELD_LABEL[certType.deadlineType];
      const deadlineValue = cert.deadlineDate ? formatDateJP(cert.deadlineDate) : "なし";
      return `
      <div class="mobile-row-card">
        <div class="mrc-title">${escapeHtml(Store.getCertTypeName(cert.certTypeId))}</div>
        <div class="mrc-body">
          ${mrcRow("取得日", formatDateJP(cert.obtainedDate))}
          ${mrcRow(deadlineLabel, deadlineValue)}
        </div>
        <div class="mrc-status">${certDeadlineBadge(certType, info)}</div>
        <div class="mrc-actions">
          <button class="btn btn-secondary" data-action="not-implemented" data-msg="モック版では資格証の編集はできません">編集</button>
        </div>
      </div>`;
    })
    .join("");

  const siteRows = involvedSites
    .map(
      (s) => `
    <tr class="row-clickable" data-action="navigate" data-href="#/sites/${s.id}">
      <td class="cell-name">${escapeHtml(s.name)}</td>
      <td>${escapeHtml(Store.getClientName(s.clientId))}</td>
      <td>${formatDateJP(s.deadline)}</td>
      <td>${siteStatusBadge(s.status)}</td>
    </tr>`
    )
    .join("");

  const siteCards = involvedSites
    .map(
      (s) => `
    <div class="mobile-row-card" data-action="navigate" data-href="#/sites/${s.id}">
      <div class="mrc-title">${escapeHtml(s.name)}</div>
      <div class="mrc-subtitle">${escapeHtml(Store.getClientName(s.clientId))}</div>
      <div class="mrc-body">
        ${mrcRow("提出期限", formatDateJP(s.deadline))}
      </div>
      <div class="mrc-status">${siteStatusBadge(s.status)}</div>
    </div>`
    )
    .join("");

  return `
    <div class="breadcrumb"><a href="#/workers">作業員管理</a> <span>›</span> <span>${escapeHtml(worker.name)}</span></div>
    <div class="page-header">
      <div class="page-title">${escapeHtml(worker.name)}</div>
    </div>

    <div class="card" style="margin-bottom:14px;">
      <div class="section-band">作業員情報</div>
      <table class="info-table">
        <tr><th>氏名</th><td>${escapeHtml(worker.name)}（${escapeHtml(worker.kana)}）</td></tr>
        <tr><th>職種</th><td>${escapeHtml(worker.jobType)}</td></tr>
        <tr><th>所属</th><td>${escapeHtml(worker.affiliation)}</td></tr>
        <tr><th>生年月日</th><td>${formatDateJP(worker.birthdate)}</td></tr>
        <tr><th>電話番号</th><td>${escapeHtml(worker.phone)}</td></tr>
        <tr><th>メール</th><td>${escapeHtml(worker.email)}</td></tr>
      </table>
    </div>

    <div class="card" style="margin-bottom:14px;">
      <div class="section-band">
        <span>資格一覧（${worker.certs.length}件）</span>
        <button class="btn btn-primary btn-sm" data-action="open-add-cert" data-worker="${worker.id}">資格証を登録</button>
      </div>
      <div class="responsive-table">
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>資格名</th><th>取得日</th><th>期限区分</th><th>期限/確認日</th><th>ステータス</th><th>操作</th></tr></thead>
            <tbody>${certRows || `<tr><td colspan="6"><div class="empty-state">登録済みの資格がありません</div></td></tr>`}</tbody>
          </table>
        </div>
        <div class="mobile-list">
          ${certCards || mobileEmptyState("登録済みの資格がありません")}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="section-band">配置予定の現場</div>
      <div class="responsive-table">
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>現場名</th><th>元請</th><th>提出期限</th><th>ステータス</th></tr></thead>
            <tbody>${siteRows || `<tr><td colspan="4"><div class="empty-state">配置予定の現場はありません</div></td></tr>`}</tbody>
          </table>
        </div>
        <div class="mobile-list">
          ${siteCards || mobileEmptyState("配置予定の現場はありません")}
        </div>
      </div>
    </div>
  `;
}

/* ============================================================
   画面6: 資格証AI登録（モーダル）
   ============================================================ */
const ISSUER_BY_CERT = {
  ct1: "東京技能講習センター",
  ct2: "全国高所作業車協会",
  ct3: "関東安全衛生教育協会",
  ct4: "建設労務安全研究会",
  ct5: "関東足場技能協会",
  ct6: "日本溶接技術振興会",
};
const PREFIX_BY_CERT = { ct1: "TAMA", ct2: "KOSHO", ct3: "FH", ct4: "SH", ct5: "ASHIBA", ct6: "ARC" };

function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// deadlineTypeに応じて、それらしい「次回期限」を1つ生成する（'none'なら空欄のまま）
function generateDeadlineDateFor(deadlineType, obtained) {
  if (deadlineType === "recommendedTraining") {
    const d = new Date(obtained);
    d.setFullYear(d.getFullYear() + 5);
    return toISODate(d);
  }
  if (deadlineType === "legal") {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 3);
    return toISODate(d);
  }
  if (deadlineType === "clientRule" || deadlineType === "companyRule") {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return toISODate(d);
  }
  return ""; // none
}

function generateExtractedCertData(certType) {
  const today = new Date();
  const obtained = new Date(today);
  obtained.setFullYear(obtained.getFullYear() - 2);
  obtained.setMonth(obtained.getMonth() - 3);
  const rand = Math.floor(10000 + Math.random() * 89999);
  return {
    certTypeId: certType.id,
    issuer: ISSUER_BY_CERT[certType.id] || "○○技能講習センター",
    certNumber: `${PREFIX_BY_CERT[certType.id] || "CERT"}-${rand}`,
    obtainedDate: toISODate(obtained),
    deadlineDate: generateDeadlineDateFor(certType.deadlineType, obtained),
  };
}

function openAICertModal(workerId) {
  const worker = Store.getWorker(workerId);
  if (!worker) return;
  renderAIModalUpload(worker);
}

// 作業員からスマホで提出された資格証を、事務員が確認・登録する導線
// （既存のAI資格証登録の確認モーダルを流用し、アップロード/読み取り待機ステップのみ省略する）
function openSubmissionReviewModal(pendingId) {
  const pending = Store.getPendingSubmissions().find((p) => p.id === pendingId);
  if (!pending) {
    showToast("この提出は既に処理済みです");
    renderApp();
    return;
  }
  const worker = Store.getWorker(pending.workerId);
  const certType = Store.getCertType(pending.certTypeId);
  if (!worker || !certType) return;
  const extracted = generateExtractedCertData(certType);
  renderAIModalReview(worker, extracted, pending.fileDataUrl || "sample", {
    fromSubmission: true,
    pendingId: pending.id,
    submittedAt: pending.submittedAt,
  });
}

function renderAIModalUpload(worker) {
  const html = modalShell(
    "資格証を登録",
    `
    <div class="ai-extract-badge">${icon("certs")} ${escapeHtml(worker.name)} さんの資格証を登録</div>
    <div class="upload-drop" data-action="ai-pick-file" id="aiUploadDrop">
      ${icon("upload")}
      <div class="upload-drop-text">資格証の画像をアップロード</div>
      <div class="upload-drop-hint">クリックしてファイルを選択（JPG / PNG / PDF）</div>
    </div>
    <input type="file" id="aiFileInput" accept="image/*,.pdf" style="display:none;">
    <div style="text-align:center;margin-top:16px;">
      <button class="link-btn" id="aiUseSampleBtn">サンプル資格証で体験する →</button>
    </div>
    `,
    `<button class="btn btn-secondary" data-action="close-modal">キャンセル</button>`
  );
  openModal(html);
  qs("#aiUploadDrop").addEventListener("click", () => qs("#aiFileInput").click());
  qs("#aiFileInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => startAILoading(worker, ev.target.result);
      reader.readAsDataURL(file);
    } else {
      startAILoading(worker, null);
    }
  });
  qs("#aiUseSampleBtn").addEventListener("click", () => startAILoading(worker, "sample"));
}

function startAILoading(worker, previewSrc) {
  const html = modalShell(
    "資格証を登録",
    `<div class="ai-loading">
      <div class="ai-spinner"></div>
      <div class="ai-loading-text">資格証から情報を読み取っています…</div>
      <div class="ai-loading-sub">氏名・資格名・期限などを自動で抽出しています</div>
    </div>`,
    ""
  );
  openModal(html);
  setTimeout(() => {
    const certType = pickNextCertTypeForWorker(worker);
    const extracted = generateExtractedCertData(certType);
    renderAIModalReview(worker, extracted, previewSrc);
  }, 1500);
}

function renderAIModalReview(worker, extracted, previewSrc, context) {
  const ctx = context || null;
  const initialCertType = Store.getCertType(extracted.certTypeId) || Store.state.certTypes[0];
  const certOptions = Store.state.certTypes
    .map((ct) => `<option value="${ct.id}" ${ct.id === extracted.certTypeId ? "selected" : ""}>${escapeHtml(ct.name)}</option>`)
    .join("");

  const thumb =
    previewSrc && previewSrc !== "sample"
      ? `<img src="${previewSrc}" alt="提出された資格証画像のプレビュー">`
      : icon("certs");

  const noticeText = ctx && ctx.fromSubmission
    ? `${escapeHtml(worker.name)}さんから提出された資格証です。内容を確認して登録してください。`
    : "画像から自動で読み取った内容です。内容を確認して登録してください。";
  const thumbCaption = ctx && ctx.fromSubmission
    ? `提出日時：${formatDateTimeJP(ctx.submittedAt)}`
    : previewSrc === "sample"
    ? "サンプル資格証を使用しています"
    : "アップロードされた画像";

  const isNone = initialCertType.deadlineType === "none";

  const html = modalShell(
    "資格証を登録",
    `
    <div class="ai-notice">
      ${icon("warnTriangle")}
      <div>${noticeText}</div>
    </div>
    <div class="upload-preview" style="margin-bottom:18px;">
      <div class="upload-preview-thumb">${thumb}</div>
      <div style="font-size:13px;color:var(--color-text-sub);">${thumbCaption}</div>
    </div>

    <div class="form-group">
      <label class="form-label">氏名</label>
      <input type="text" value="${escapeHtml(worker.name)}" disabled>
      <div class="form-hint">この作業員の資格として登録されます</div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">資格名<span class="required">*</span></label>
        <select class="select" id="aiCertType" style="width:100%;">${certOptions}</select>
      </div>
      <div class="form-group">
        <label class="form-label">発行機関</label>
        <input type="text" id="aiIssuer" value="${escapeHtml(extracted.issuer)}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">修了証番号</label>
        <input type="text" id="aiCertNumber" value="${escapeHtml(extracted.certNumber)}">
      </div>
      <div class="form-group">
        <label class="form-label">取得日</label>
        <input type="date" id="aiObtainedDate" value="${extracted.obtainedDate}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label" id="aiDeadlineLabel">${DEADLINE_TYPE_FIELD_LABEL[initialCertType.deadlineType]}</label>
      <input type="date" id="aiDeadlineDate" value="${extracted.deadlineDate}" ${isNone ? "disabled" : ""}>
      <div class="form-hint" id="aiDeadlineHint">${isNone ? "この資格には期限の概念がありません" : ""}</div>
    </div>
    `,
    `<button class="btn btn-secondary" data-action="close-modal">キャンセル</button>
     <button class="btn btn-primary" id="aiConfirmBtn">登録</button>`
  );
  openModal(html);

  qs("#aiCertType").addEventListener("change", () => {
    const ct = Store.getCertType(qs("#aiCertType").value);
    qs("#aiDeadlineLabel").textContent = DEADLINE_TYPE_FIELD_LABEL[ct.deadlineType];
    const input = qs("#aiDeadlineDate");
    const hint = qs("#aiDeadlineHint");
    if (ct.deadlineType === "none") {
      input.value = "";
      input.disabled = true;
      hint.textContent = "この資格には期限の概念がありません";
    } else {
      input.disabled = false;
      if (!input.value) input.value = generateDeadlineDateFor(ct.deadlineType, qs("#aiObtainedDate").value || toISODate(new Date()));
      hint.textContent = "";
    }
  });

  qs("#aiConfirmBtn").addEventListener("click", () => {
    const certTypeId = qs("#aiCertType").value;
    const issuer = qs("#aiIssuer").value.trim() || "-";
    const certNumber = qs("#aiCertNumber").value.trim() || "-";
    const obtainedDate = qs("#aiObtainedDate").value || toISODate(new Date());
    const deadlineDate = qs("#aiDeadlineDate").value || null;
    addWorkerCert(worker.id, { certTypeId, issuer, certNumber, obtainedDate, deadlineDate });
    if (ctx && ctx.fromSubmission) {
      Store.resolvePendingSubmission(ctx.pendingId);
    }
    closeModal();
    showToast(
      ctx && ctx.fromSubmission ? "資格証を登録しました。現場の不足状況が更新されました。" : "資格証を登録しました",
      "success"
    );
    renderApp();
  });
}

/* ============================================================
   画面8: 不足資料依頼（モーダル）
   ============================================================ */
function buildDefaultRequestMessage(site, items) {
  if (items.length === 1) {
    return `${site.name}への入場準備のため、${items[0].certName}の資格証をご提出ください。提出期限：${formatDateJP(site.deadline)}`;
  }
  const certNames = [...new Set(items.map((i) => i.certName))].join("、");
  return `${site.name}への入場準備のため、${certNames}の資格証をご提出ください。提出期限：${formatDateJP(site.deadline)}`;
}

function openRequestModal(siteId, workerId, certTypeId) {
  const site = Store.getSite(siteId);
  if (!site) return;
  const stats = computeSiteStats(site);
  let targets = stats.missingWorkerItems;
  if (workerId && certTypeId) {
    targets = targets.filter((i) => i.workerId === workerId && i.certTypeId === certTypeId);
  }
  const selectable = targets.filter((i) => !i.requested);
  const alreadyRequested = targets.filter((i) => i.requested);

  if (selectable.length === 0 && alreadyRequested.length > 0) {
    const html = modalShell(
      "不足資料を依頼",
      `<div class="empty-state">${icon("send")}<div style="margin-top:10px;">対象の資料はすべて依頼済みです。</div></div>`,
      `<button class="btn btn-secondary" data-action="close-modal">閉じる</button>`
    );
    openModal(html);
    return;
  }
  if (selectable.length === 0) {
    const html = modalShell(
      "不足資料を依頼",
      `<div class="empty-state">依頼が必要な作業員資料はありません。</div>`,
      `<button class="btn btn-secondary" data-action="close-modal">閉じる</button>`
    );
    openModal(html);
    return;
  }

  const defaultMsg = buildDefaultRequestMessage(site, selectable);
  const rows = selectable
    .map(
      (item, idx) => `
    <label class="checkbox-row" style="align-items:flex-start;">
      <input type="checkbox" class="req-item-cb" data-idx="${idx}" checked>
      <div>
        <div style="font-weight:700;font-size:14px;">${escapeHtml(item.workerName)}</div>
        <div class="text-sub" style="font-size:13px;">${escapeHtml(item.certName)}</div>
      </div>
    </label>`
    )
    .join("");

  const html = modalShell(
    "不足資料を依頼",
    `
    <div class="info-grid" style="margin-bottom:16px;">
      <div><div class="info-item-label">使用予定現場</div><div class="info-item-value">${escapeHtml(site.name)}</div></div>
      <div><div class="info-item-label">提出期限</div><div class="info-item-value">${formatDateJP(site.deadline)}</div></div>
    </div>
    <div class="form-group">
      <label class="form-label">依頼対象（${selectable.length}件）</label>
      <div style="border:1px solid var(--color-border);border-radius:var(--radius-md);padding:6px 14px;max-height:220px;overflow-y:auto;">
        ${rows}
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">依頼メッセージ</label>
      <textarea id="reqMessage">${escapeHtml(defaultMsg)}</textarea>
      <div class="form-hint">作業員には提出用リンクとともに送信されます（モックのため実際の送信は行われません）</div>
    </div>
    `,
    `<button class="btn btn-secondary" data-action="close-modal">キャンセル</button>
     <button class="btn btn-primary" id="reqSendBtn">${icon("send")}依頼を送信</button>`
  );
  openModal(html, { wide: false });

  qs("#reqSendBtn").addEventListener("click", () => {
    const checked = qsa(".req-item-cb").filter((cb) => cb.checked).map((cb) => selectable[Number(cb.dataset.idx)]);
    if (checked.length === 0) {
      showToast("依頼対象を1件以上選択してください");
      return;
    }
    const message = qs("#reqMessage").value.trim() || defaultMsg;
    sendMissingRequests(siteId, checked, message);
    renderApp();
    renderRequestSuccess(site, checked);
  });
}

function renderRequestSuccess(site, items) {
  const first = items[0];
  const previewUrl =
    `mobile-submit.html?worker=${encodeURIComponent(first.workerName)}&cert=${encodeURIComponent(first.certName)}` +
    `&site=${encodeURIComponent(site.name)}&deadline=${encodeURIComponent(site.deadline)}` +
    `&company=${encodeURIComponent(Store.state.company.name)}` +
    `&workerId=${encodeURIComponent(first.workerId)}&certTypeId=${encodeURIComponent(first.certTypeId)}&siteId=${encodeURIComponent(site.id)}`;
  const html = modalShell(
    "不足資料を依頼",
    `
    <div class="success-panel" style="padding:20px 10px;">
      <div class="success-icon-circle">✓</div>
      <div class="success-title">依頼を送信しました</div>
      <div class="success-sub">${items.length}件の依頼を送信しました（メール・SMSはモックのため実際には送信されません）</div>
      <div class="file-list">
        ${items.map((i) => `<div class="file-list-item">${icon("send")}${escapeHtml(i.workerName)} - ${escapeHtml(i.certName)}</div>`).join("")}
      </div>
      <a class="btn btn-secondary btn-sm" href="${previewUrl}" target="_blank" rel="noopener">${icon("externalLink")}作業員側の受け取り画面をプレビュー</a>
    </div>
    `,
    `<button class="btn btn-primary" data-action="close-modal">閉じる</button>`
  );
  openModal(html);
}

/* ============================================================
   資格・証明書（全社横断）
   ============================================================ */
let certsFilter = { q: "", status: "" };

function renderCertifications() {
  const rows = [];
  Store.state.workers.forEach((w) => {
    w.certs.forEach((c) => {
      const certType = Store.getCertType(c.certTypeId);
      rows.push({ worker: w, cert: c, certType, bucket: getAttentionBucket(c, certType) });
    });
  });

  const filtered = rows.filter(({ worker, bucket }) => {
    if (certsFilter.q && !worker.name.includes(certsFilter.q)) return false;
    if (certsFilter.status && bucket !== certsFilter.status) return false;
    return true;
  });

  filtered.sort((a, b) => {
    const da = a.cert.deadlineDate ? new Date(a.cert.deadlineDate).getTime() : Infinity;
    const db = b.cert.deadlineDate ? new Date(b.cert.deadlineDate).getTime() : Infinity;
    return da - db;
  });

  const tableRows = filtered
    .map(({ worker, cert, certType }) => {
      const info = getCertDeadlineInfo(cert, certType);
      return `
    <tr class="row-clickable" data-action="navigate" data-href="#/workers/${worker.id}">
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="avatar-circle sm" style="background:${worker.avatarColor}">${initialOf(worker.name)}</div>
          <span class="cell-name">${escapeHtml(worker.name)}</span>
        </div>
      </td>
      <td>${escapeHtml(Store.getCertTypeName(cert.certTypeId))}</td>
      <td>${formatDateJP(cert.obtainedDate)}</td>
      <td>${DEADLINE_TYPE_FIELD_LABEL[certType.deadlineType]}</td>
      <td>${cert.deadlineDate ? formatDateJP(cert.deadlineDate) : "-"}</td>
      <td>${certDeadlineBadge(certType, info)}</td>
    </tr>`;
    })
    .join("");

  const certListCards = filtered
    .map(({ worker, cert, certType }) => {
      const info = getCertDeadlineInfo(cert, certType);
      return `
    <div class="mobile-row-card">
      <div class="mrc-title">${escapeHtml(worker.name)}</div>
      <div class="mrc-subtitle">${escapeHtml(Store.getCertTypeName(cert.certTypeId))}</div>
      <div class="mrc-body">
        ${mrcRow("取得日", formatDateJP(cert.obtainedDate))}
        ${mrcRow("期限区分", DEADLINE_TYPE_FIELD_LABEL[certType.deadlineType])}
      </div>
      <div class="mrc-status">${certDeadlineBadge(certType, info)}</div>
      <div class="mrc-actions">
        <a class="btn btn-secondary" href="#/workers/${worker.id}">作業員詳細を見る</a>
      </div>
    </div>`;
    })
    .join("");

  return `
    <div class="page-header">
      <div>
        <div class="page-title">資格・証明書</div>
        <div class="page-subtitle">全作業員の資格・期限管理区分を横断で確認できます（全${rows.length}件）</div>
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" class="input input-search" id="certFilterQ" placeholder="作業員名で検索" value="${escapeHtml(certsFilter.q)}">
      <select class="select" id="certFilterStatus">
        <option value="">すべてのステータス</option>
        <option value="urgent" ${certsFilter.status === "urgent" ? "selected" : ""}>要対応</option>
        <option value="soon" ${certsFilter.status === "soon" ? "selected" : ""}>30日以内の確認</option>
        <option value="none" ${certsFilter.status === "none" ? "selected" : ""}>期限なし</option>
      </select>
    </div>

    <div class="card">
      <div class="responsive-table">
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>氏名</th><th>資格</th><th>取得日</th><th>期限区分</th><th>期限</th><th>状態</th></tr></thead>
            <tbody>${tableRows || `<tr><td colspan="6"><div class="empty-state">条件に一致する資格がありません</div></td></tr>`}</tbody>
          </table>
        </div>
        <div class="mobile-list">
          ${certListCards || mobileEmptyState("条件に一致する資格がありません")}
        </div>
      </div>
    </div>
  `;
}

function bindCertificationsFilters() {
  const q = qs("#certFilterQ");
  const s = qs("#certFilterStatus");
  if (!q) return;
  q.addEventListener("input", () => {
    certsFilter.q = q.value;
    const cursor = q.selectionStart;
    renderApp();
    const newQ = qs("#certFilterQ");
    if (newQ) {
      newQ.focus();
      newQ.setSelectionRange(cursor, cursor);
    }
  });
  s.addEventListener("change", () => {
    certsFilter.status = s.value;
    renderApp();
  });
}

/* ============================================================
   提出資料一覧
   ============================================================ */
function renderSubmissions() {
  const submissionSummaries = Store.state.sites.map((site) => {
    const stats = computeSiteStats(site);
    const client = Store.getClient(site.clientId);
    const methodText = client ? (client.submissionMethods || []).join("／") : "-";
    return { site, stats, methodText };
  });

  const rows = submissionSummaries
    .map(
      ({ site, stats, methodText }) => `
      <tr>
        <td class="cell-name">${escapeHtml(site.name)}</td>
        <td>${escapeHtml(Store.getClientName(site.clientId))}</td>
        <td>${escapeHtml(methodText)}</td>
        <td>${stats.percent}%（${stats.fulfilledCount}/${stats.totalItems}）</td>
        <td>${site.submissionGenerated ? `<span class="badge badge-success">生成済み</span>` : `<span class="badge badge-neutral">未生成</span>`}</td>
        <td>${site.submissionGenerated ? formatDateTimeJP(site.submissionGeneratedAt) : "-"}</td>
        <td><a class="btn btn-secondary btn-sm" href="#/sites/${site.id}/generate">開く</a></td>
      </tr>`
    )
    .join("");

  const submissionCards = submissionSummaries
    .map(
      ({ site, stats, methodText }) => `
      <div class="mobile-row-card">
        <div class="mrc-title">${escapeHtml(site.name)}</div>
        <div class="mrc-subtitle">${escapeHtml(Store.getClientName(site.clientId))}</div>
        <div class="mrc-body">
          ${mrcRow("提出方式", escapeHtml(methodText))}
          ${mrcRow("準備率", `${stats.percent}%（${stats.fulfilledCount}/${stats.totalItems}）`)}
          ${mrcRow("生成日", site.submissionGenerated ? formatDateTimeJP(site.submissionGeneratedAt) : "-")}
        </div>
        <div class="mrc-status">${site.submissionGenerated ? `<span class="badge badge-success">生成済み</span>` : `<span class="badge badge-neutral">未生成</span>`}</div>
        <div class="mrc-actions">
          <a class="btn btn-secondary" href="#/sites/${site.id}/generate">提出資料を確認</a>
        </div>
      </div>`
    )
    .join("");

  return `
    <div class="page-header">
      <div>
        <div class="page-title">提出資料管理</div>
        <div class="page-subtitle">現場ごとの提出資料の準備・生成状況を確認できます</div>
      </div>
    </div>
    <div class="card">
      <div class="responsive-table">
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>現場名</th><th>元請</th><th>提出方式</th><th>準備率</th><th>生成状態</th><th>生成日</th><th>操作</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="mobile-list">
          ${submissionCards || mobileEmptyState("現場がありません")}
        </div>
      </div>
    </div>
  `;
}

/* ============================================================
   会社情報
   ============================================================ */
function renderCompany() {
  const c = Store.state.company;
  const licLifecycleDays = daysUntil(c.licenseExpiry);
  const docSummaries = c.documents.map((doc) => ({
    doc,
    usageCount: Store.state.sites.filter((s) => s.requiredCompanyDocIds.includes(doc.id)).length,
  }));

  const docRows = docSummaries
    .map(
      ({ doc, usageCount }) => `
      <tr>
        <td class="cell-name">${escapeHtml(doc.name)}</td>
        <td>${doc.fulfilled ? `<span class="check-icon">✓</span> 準備済み` : `<span class="cross-icon">！</span> 未アップロード`}</td>
        <td>${doc.fulfilled ? formatDateJP(doc.updatedAt) : "-"}</td>
        <td>${usageCount}現場</td>
        <td>
          ${
            doc.fulfilled
              ? `<button class="btn btn-secondary btn-sm" data-action="upload-company-doc" data-doc="${doc.id}">再登録</button>`
              : `<button class="btn btn-primary btn-sm" data-action="upload-company-doc" data-doc="${doc.id}">アップロード</button>`
          }
        </td>
      </tr>`
    )
    .join("");

  const docCards = docSummaries
    .map(
      ({ doc, usageCount }) => `
      <div class="mobile-row-card">
        <div class="mrc-title">${escapeHtml(doc.name)}</div>
        <div class="mrc-body">
          ${mrcRow("最終更新日", doc.fulfilled ? formatDateJP(doc.updatedAt) : "-")}
          ${mrcRow("利用現場数", `${usageCount}現場`)}
        </div>
        <div class="mrc-status">${doc.fulfilled ? `<span class="check-icon">✓</span> 準備済み` : `<span class="cross-icon">！</span> 未アップロード`}</div>
        <div class="mrc-actions">
          ${
            doc.fulfilled
              ? `<button class="btn btn-secondary" data-action="upload-company-doc" data-doc="${doc.id}">再登録</button>`
              : `<button class="btn btn-primary" data-action="upload-company-doc" data-doc="${doc.id}">アップロード</button>`
          }
        </div>
      </div>`
    )
    .join("");

  return `
    <div class="page-header">
      <div>
        <div class="page-title">会社情報</div>
        <div class="page-subtitle">現場提出でくり返し使う会社の基本情報を一度だけ登録しておきます</div>
      </div>
      <button class="btn btn-secondary" data-action="not-implemented" data-msg="モック版では会社情報の編集はできません">編集</button>
    </div>

    <div class="card" style="margin-bottom:14px;">
      <div class="section-band">基本情報</div>
      <table class="info-table">
        <tr><th>会社名</th><td>${escapeHtml(c.name)}</td></tr>
        <tr><th>代表者</th><td>${escapeHtml(c.representative)}</td></tr>
        <tr><th>所在地</th><td>〒${escapeHtml(c.postal)} ${escapeHtml(c.address)}</td></tr>
        <tr><th>電話番号</th><td>${escapeHtml(c.phone)}</td></tr>
      </table>
    </div>

    <div class="card" style="margin-bottom:14px;">
      <div class="section-band">建設業許可</div>
      <table class="info-table">
        <tr><th>許可番号</th><td>${escapeHtml(c.licenseNumber)}</td></tr>
        <tr><th>許可業種</th><td>${c.licenseTypes.map(escapeHtml).join("、")}</td></tr>
        <tr><th>許可期限</th><td>${formatDateJP(c.licenseExpiry)}
          ${licLifecycleDays !== null && licLifecycleDays <= 45 ? `<span class="badge ${licLifecycleDays < 0 ? "badge-danger" : "badge-warning"}" style="margin-left:8px;">${licLifecycleDays < 0 ? "期限超過" : `残り${licLifecycleDays}日`}</span>` : ""}
        </td></tr>
      </table>
    </div>

    <div class="card" style="margin-bottom:14px;">
      <div class="section-band">社会保険・労働保険</div>
      <table class="info-table">
        <tr><th>労災保険</th><td>${escapeHtml(c.insurance.rousai)}</td></tr>
        <tr><th>健康保険</th><td>${escapeHtml(c.insurance.kenkohoken)}</td></tr>
        <tr><th>厚生年金</th><td>${escapeHtml(c.insurance.kosei)}</td></tr>
        <tr><th>雇用保険</th><td>${escapeHtml(c.insurance.koyo)}</td></tr>
      </table>
    </div>

    <div class="card">
      <div class="section-band">共通提出書類<span class="section-band-hint">一度登録すると対象のすべての現場に自動で反映されます</span></div>
      <div class="responsive-table">
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>書類名</th><th>状態</th><th>最終更新日</th><th>利用現場数</th><th>操作</th></tr></thead>
            <tbody>${docRows}</tbody>
          </table>
        </div>
        <div class="mobile-list">
          ${docCards || mobileEmptyState("登録済みの書類がありません")}
        </div>
      </div>
    </div>
  `;
}

function triggerCompanyDocUpload(docId) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*,.pdf";
  input.addEventListener("change", (e) => {
    if (!e.target.files[0]) return;
    markCompanyDocFulfilled(docId);
    showToast("アップロードしました", "success");
    renderApp();
  });
  input.click();
}

/* ============================================================
   設定
   ============================================================ */
function renderSettings() {
  const m = Store.state.meta;
  return `
    <div class="page-header">
      <div>
        <div class="page-title">設定</div>
        <div class="page-subtitle">通知・アカウント・ご利用プランを確認できます</div>
      </div>
    </div>

    <div class="two-col">
      <div class="stack">
        <div class="card card-pad">
          <div class="section-title">通知設定</div>
          <div class="settings-row">
            <div><div class="settings-row-title">メール通知</div><div class="settings-row-desc">期限切れ・不足書類の通知をメールで受け取る</div></div>
            <button class="toggle-switch on" data-action="toggle-switch"></button>
          </div>
          <div class="settings-row">
            <div><div class="settings-row-title">期限・再教育の30日前に通知</div><div class="settings-row-desc">資格・教育の確認時期が近づいたら知らせる</div></div>
            <button class="toggle-switch on" data-action="toggle-switch"></button>
          </div>
          <div class="settings-row">
            <div><div class="settings-row-title">作業員からの提出通知</div><div class="settings-row-desc">作業員が資料を提出したら知らせる</div></div>
            <button class="toggle-switch" data-action="toggle-switch"></button>
          </div>
        </div>

        <div class="card card-pad">
          <div class="section-title">アカウント情報</div>
          <div class="info-grid">
            <div><div class="info-item-label">氏名</div><div class="info-item-value">${escapeHtml(m.userName)}</div></div>
            <div><div class="info-item-label">会社名</div><div class="info-item-value">${escapeHtml(Store.state.company.name)}</div></div>
            <div><div class="info-item-label">メールアドレス</div><div class="info-item-value">tanaka@sanwa-setsubi.example.com</div></div>
            <div><div class="info-item-label">権限</div><div class="info-item-value">管理者</div></div>
          </div>
        </div>

        <div class="card card-pad">
          <div class="section-title">デモ操作</div>
          <div class="form-hint" style="margin-bottom:14px;">このモックのデータをすべて初期状態に戻します。別の担当者にデモを見せる前などにご利用ください。</div>
          <button class="btn btn-danger-outline" data-action="reset-demo">デモデータをリセット</button>
        </div>
      </div>

      <div class="stack">
        <div class="plan-box">
          <div class="section-band">現在のプラン</div>
          <table class="info-table">
            <tr><th>プラン</th><td>${escapeHtml(m.planName)}</td></tr>
            <tr><th>月額</th><td>${m.planPrice.toLocaleString()}円（税別）</td></tr>
            <tr><th>作業員数</th><td>50名まで</td></tr>
            <tr><th>現場数</th><td>無制限</td></tr>
            <tr><th>次回更新日</th><td>2026/09/19</td></tr>
          </table>
          <div class="form-hint" style="padding:0 16px 14px;">※モック上の価格仮説です。本番の課金ロジックは実装していません。</div>
          <div style="padding:0 16px 16px;">
            <button class="btn btn-secondary" data-action="not-implemented" data-msg="モック版ではプラン変更はできません">プラン変更</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================
   元請・提出設定（一覧表示のみ。編集機能はモック対象外）
   ============================================================ */
function renderClients() {
  const clientSummaries = (Store.state.clients || []).map((client) => ({
    client,
    template: Store.getTemplate(client.templateId),
    siteCount: Store.state.sites.filter((s) => s.clientId === client.id).length,
    methodBadges: (client.submissionMethods || [])
      .map((m) => `<span class="badge badge-neutral method-badge">${escapeHtml(m)}</span>`)
      .join(" "),
  }));

  const rows = clientSummaries
    .map(
      ({ client, template, siteCount, methodBadges }) => `
      <tr>
        <td class="cell-name">${escapeHtml(client.name)}</td>
        <td>${methodBadges}</td>
        <td>${template ? escapeHtml(template.name) : "-"}</td>
        <td>${siteCount}現場</td>
        <td><button class="btn btn-secondary btn-sm" data-action="not-implemented" data-msg="モック版では元請情報の編集はできません">編集</button></td>
      </tr>`
    )
    .join("");

  const clientCards = clientSummaries
    .map(
      ({ client, template, siteCount, methodBadges }) => `
      <div class="mobile-row-card">
        <div class="mrc-title">${escapeHtml(client.name)}</div>
        <div class="mrc-body">
          ${mrcRow("提出方式", methodBadges || "-")}
          ${mrcRow("適用テンプレート", template ? escapeHtml(template.name) : "-")}
          ${mrcRow("対象現場数", `${siteCount}現場`)}
        </div>
        <div class="mrc-actions">
          <button class="btn btn-secondary" data-action="not-implemented" data-msg="モック版では元請情報の編集はできません">編集</button>
        </div>
      </div>`
    )
    .join("");

  return `
    <div class="page-header">
      <div>
        <div class="page-title">元請・提出設定</div>
        <div class="page-subtitle">元請ごとの提出方式・適用テンプレートを確認できます</div>
      </div>
      <button class="btn btn-secondary" data-action="not-implemented" data-msg="モック版では新規元請の登録はできません">新規元請登録</button>
    </div>
    <div class="card">
      <div class="responsive-table">
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>元請会社</th><th>提出方式</th><th>適用テンプレート</th><th>対象現場数</th><th>操作</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="mobile-list">
          ${clientCards || mobileEmptyState("登録済みの元請がありません")}
        </div>
      </div>
    </div>
    <div class="form-hint" style="margin-top:10px;">※GreenSite/Buildee等へは接続していません。提出方式・テンプレートの表示と、提出資料生成時の出し分けに利用します。</div>
  `;
}

/* ============================================================
   グローバルイベント委譲
   ============================================================ */
function handleAction(action, el) {
  switch (action) {
    case "close-modal":
      closeModal();
      break;
    case "navigate":
      navigate(el.dataset.href);
      break;
    case "open-add-cert":
      openAICertModal(el.dataset.worker);
      break;
    case "review-submission":
      openSubmissionReviewModal(el.dataset.id);
      break;
    case "open-request-modal":
      if (el.disabled) return;
      openRequestModal(el.dataset.site, el.dataset.worker, el.dataset.cert);
      break;
    case "do-generate":
      handleGenerateClick(el.dataset.site);
      break;
    case "upload-company-doc":
      triggerCompanyDocUpload(el.dataset.doc);
      break;
    case "toggle-switch":
      el.classList.toggle("on");
      break;
    case "reset-demo":
      if (confirm("デモデータを初期状態にリセットします。よろしいですか？")) {
        Store.reset();
        renderApp();
        showToast("デモデータをリセットしました", "success");
      }
      break;
    case "not-implemented":
      showToast(el.dataset.msg || "モック版ではこの操作はできません");
      break;
    default:
      break;
  }
}

document.addEventListener("click", (e) => {
  const actionEl = e.target.closest("[data-action]");
  if (actionEl) {
    handleAction(actionEl.dataset.action, actionEl);
  }
  if (!e.target.closest("#notifDropdown") && !e.target.closest("#bellBtn")) {
    closeNotifDropdown();
  }
});

document.addEventListener("click", (e) => {
  if (e.target.id === "bellBtn" || e.target.closest("#bellBtn")) {
    toggleNotifDropdown();
  }
  if (e.target.id === "menuToggle" || e.target.closest("#menuToggle")) {
    toggleSidebarMobile();
  }
  if (e.target.id === "sidebarBackdrop") {
    closeSidebarMobile();
  }
  if (e.target === qs("#modalOverlay")) {
    closeModal();
  }
});

// ハッシュ内リンクのSPA遷移（<a href="#/...">はブラウザ標準のhashchangeで処理される）
window.addEventListener("hashchange", renderApp);

// 作業員側スマホ画面（別タブ/別ページ）からの提出を疑似連動させる。
// storageイベントは「変更を行った側」以外のタブでのみ発火するため、
// 管理画面を開いたまま別タブで提出すると、通知が自動で反映される。
window.addEventListener("storage", (e) => {
  if (e.key === "teishutsu_mock_pending_submissions_v1") {
    renderApp();
  }
});

/* ============================================================
   初期化
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  Store.init();
  if (!location.hash) location.hash = "#/dashboard";
  renderApp();
});
