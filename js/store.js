/*
 * 提出書類AIアシスタント（モック）
 * 状態管理・疑似ビジネスロジック
 * 実際のDB/API通信は一切行わず、localStorageのみで状態を保持する。
 */

// データ構造（templates/clients[].submissionMethods/certTypes[].deadlineType 等）を
// 変更するたびに STORAGE_KEY のバージョン番号と CURRENT_SCHEMA_VERSION を両方上げること。
// こうすることで、古いスキーマのlocalStorageが残っている環境でも、
// その古いデータを読み込んで壊れた画面を表示することがない。
const STORAGE_KEY = "teishutsu_mock_state_v2";
const CURRENT_SCHEMA_VERSION = 2;
// 作業員がスマホ画面から「提出」した内容を、事務員側の管理画面と疑似連動させるための共有キー。
// mobile-submit.html（独立ページ）と本体アプリの双方が、同じキー名で直接localStorageを読み書きする。
const PENDING_SUBMISSIONS_KEY = "teishutsu_mock_pending_submissions_v1";
const DEADLINE_WARNING_DAYS = 30;

// 保存データが現在のSEED_DATAスキーマと互換性があるかを最低限チェックする。
// モックなので項目ごとの詳細なマイグレーションは行わず、
// 合致しなければ丸ごと初期データへ差し替える方針にする。
function isValidSavedState(state) {
  if (!state || typeof state !== "object") return false;
  if (!state.meta || state.meta.schemaVersion !== CURRENT_SCHEMA_VERSION) return false;
  return (
    Array.isArray(state.templates) &&
    Array.isArray(state.clients) &&
    Array.isArray(state.certTypes) &&
    Array.isArray(state.workers) &&
    Array.isArray(state.sites)
  );
}

const Store = {
  state: null,

  init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (isValidSavedState(parsed)) {
          this.state = parsed;
          return;
        }
        console.warn("保存データのスキーマが古い、または不正なため初期データで再初期化します");
      } catch (e) {
        console.warn("保存データの読み込みに失敗したため初期データを使用します", e);
      }
    }
    this.state = cloneSeedData();
    this.save();
  },

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
  },

  reset() {
    this.state = cloneSeedData();
    this.save();
    localStorage.removeItem(PENDING_SUBMISSIONS_KEY);
  },

  // ---- 基本参照ヘルパー ----
  getWorker(id) {
    return this.state.workers.find((w) => w.id === id) || null;
  },
  getSite(id) {
    return this.state.sites.find((s) => s.id === id) || null;
  },
  getClient(id) {
    return this.state.clients.find((c) => c.id === id) || null;
  },
  getClientName(id) {
    const c = this.getClient(id);
    return c ? c.name : "-";
  },
  getCertType(id) {
    return this.state.certTypes.find((c) => c.id === id) || null;
  },
  getCertTypeName(id) {
    const ct = this.getCertType(id);
    return ct ? ct.name : id;
  },
  getCompanyDoc(id) {
    return this.state.company.documents.find((d) => d.id === id) || null;
  },
  getTemplate(id) {
    return (this.state.templates || []).find((t) => t.id === id) || null;
  },

  // ---- 作業員からのスマホ提出（localStorage共有） ----
  getPendingSubmissions() {
    try {
      const raw = localStorage.getItem(PENDING_SUBMISSIONS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },
  resolvePendingSubmission(id) {
    const list = this.getPendingSubmissions().filter((p) => p.id !== id);
    localStorage.setItem(PENDING_SUBMISSIONS_KEY, JSON.stringify(list));
  },
};

// ---- 日付ユーティリティ ----
function todayDate() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function parseDate(str) {
  if (!str) return null;
  const d = new Date(str + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function daysUntil(dateStr) {
  const target = parseDate(dateStr);
  if (!target) return null;
  const diffMs = target.getTime() - todayDate().getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function formatDateJP(dateStr) {
  if (!dateStr) return "なし";
  const d = parseDate(dateStr.split("T")[0]);
  if (!d) return dateStr;
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function formatDateTimeJP(dateTimeStr) {
  if (!dateTimeStr) return "-";
  const d = new Date(dateTimeStr);
  if (isNaN(d.getTime())) return dateTimeStr;
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate()
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes()
  ).padStart(2, "0")}`;
}

// ---- 資格・教育の期限管理ロジック ----
// deadlineType ごとに「本当に期限切れ・失効となり得るのか」を区別する。
// none / recommendedTraining は法的に失効しないため、決してブロッキングな状態にしない。
//
// 戻り値の severity:
//   'none'     … 期限の概念がない（deadlineType=noneのとき）
//   'ok'       … 問題なし
//   'advisory' … 再教育推奨（recommendedTrainingのみ。非ブロッキング）
//   'dueSoon'  … 期限が30日以内に迫っている（legal / clientRule / companyRule）
//   'overdue'  … 期限を過ぎている（legal / clientRule / companyRule）
function getCertDeadlineInfo(cert, certType) {
  if (!certType || certType.deadlineType === "none" || !cert.deadlineDate) {
    return { deadlineType: certType ? certType.deadlineType : "none", days: null, severity: "none" };
  }
  const days = daysUntil(cert.deadlineDate);
  const deadlineType = certType.deadlineType;

  if (deadlineType === "recommendedTraining") {
    return { deadlineType, days, severity: days <= DEADLINE_WARNING_DAYS ? "advisory" : "ok" };
  }
  // legal / clientRule / companyRule … 実際に提出をブロックしうる期限
  if (days < 0) return { deadlineType, days, severity: "overdue" };
  if (days <= DEADLINE_WARNING_DAYS) return { deadlineType, days, severity: "dueSoon" };
  return { deadlineType, days, severity: "ok" };
}

// 作業員が特定の資格種別を保有しているか（保有していればcertを返す）
function findWorkerCert(worker, certTypeId) {
  return worker.certs.find((c) => c.certTypeId === certTypeId) || null;
}

// 現場の「作業員×資格」要件1件のステータスを判定
// 戻り値: { status: 'ok'|'advisory'|'dueSoon'|'overdue'|'missing', cert, info }
//   ok / advisory / dueSoon … 提出上は充足（advisory・dueSoonは注意喚起のみで非ブロッキング）
//   overdue / missing       … 提出上は不足として扱う
function getRequirementStatus(worker, certTypeId) {
  const cert = findWorkerCert(worker, certTypeId);
  if (!cert) return { status: "missing", cert: null, info: null };
  const certType = Store.getCertType(certTypeId);
  const info = getCertDeadlineInfo(cert, certType);

  if (certType.deadlineType === "none") return { status: "ok", cert, info };
  if (certType.deadlineType === "recommendedTraining") {
    return { status: info.severity === "advisory" ? "advisory" : "ok", cert, info };
  }
  // legal / clientRule / companyRule
  return { status: info.severity, cert, info }; // 'ok' | 'dueSoon' | 'overdue'
}

function isRequirementFulfilled(status) {
  return status === "ok" || status === "advisory" || status === "dueSoon";
}

// 依頼済みかどうか
function isRequested(siteId, workerId, certTypeId) {
  return Store.state.requests.some(
    (r) =>
      r.siteId === siteId &&
      r.workerId === workerId &&
      r.certTypeId === certTypeId &&
      r.status === "sent"
  );
}

// ---- 現場の準備状況を集計 ----
function computeSiteStats(site) {
  const companyItems = site.requiredCompanyDocIds.map((docId) => {
    const doc = Store.getCompanyDoc(docId);
    return {
      type: "company",
      docId,
      name: doc ? doc.name : docId,
      fulfilled: doc ? doc.fulfilled : false,
    };
  });

  const workerItems = site.workerRequirements.map((req) => {
    const worker = Store.getWorker(req.workerId);
    const { status, cert, info } = getRequirementStatus(worker, req.certTypeId);
    return {
      type: "worker",
      workerId: req.workerId,
      workerName: worker ? worker.name : req.workerId,
      certTypeId: req.certTypeId,
      certName: Store.getCertTypeName(req.certTypeId),
      status, // ok | advisory | dueSoon | overdue | missing
      fulfilled: isRequirementFulfilled(status),
      cert,
      info,
      requested: isRequested(site.id, req.workerId, req.certTypeId),
    };
  });

  const totalItems = companyItems.length + workerItems.length;
  const fulfilledCount =
    companyItems.filter((i) => i.fulfilled).length +
    workerItems.filter((i) => i.fulfilled).length;
  const percent = totalItems === 0 ? 100 : Math.round((fulfilledCount / totalItems) * 100);

  const missingCompanyItems = companyItems.filter((i) => !i.fulfilled);
  const missingWorkerItems = workerItems.filter((i) => !i.fulfilled);

  return {
    companyItems,
    workerItems,
    totalItems,
    fulfilledCount,
    missingCount: missingCompanyItems.length + missingWorkerItems.length,
    missingCompanyItems,
    missingWorkerItems,
    percent,
    isComplete: totalItems > 0 && fulfilledCount === totalItems,
  };
}

// ---- ダッシュボード集計 ----
// 「資格が失効した」という誤認を避けるため、法定期限のない資格(none)は一切カウントしない。
// recommendedTraining は「要対応（過ぎている）」「30日以内の確認（近づいている）」のどちらにも
// 現れうるが、あくまで非ブロッキングな“おすすめ”であり、legal/clientRule/companyRuleのみが
// 本当の意味での期限管理対象となる。
function getQualificationAttentionCounts() {
  let overdue = 0;
  let dueSoon = 0;

  Store.state.workers.forEach((w) => {
    w.certs.forEach((c) => {
      const certType = Store.getCertType(c.certTypeId);
      if (!certType || certType.deadlineType === "none") return;
      const info = getCertDeadlineInfo(c, certType);
      if (certType.deadlineType === "recommendedTraining") {
        if (info.severity !== "advisory") return;
        if (info.days < 0) overdue++;
        else dueSoon++;
      } else {
        if (info.severity === "overdue") overdue++;
        else if (info.severity === "dueSoon") dueSoon++;
      }
    });
  });

  // 建設業許可（会社の法定期限）もあわせて集計する
  const licDays = daysUntil(Store.state.company.licenseExpiry);
  if (licDays !== null) {
    if (licDays < 0) overdue++;
    else if (licDays <= DEADLINE_WARNING_DAYS) dueSoon++;
  }

  return { overdue, dueSoon };
}

function getGlobalMissingCount() {
  let missing = 0;
  Store.state.sites.forEach((site) => {
    const stats = computeSiteStats(site);
    missing += stats.missingCount;
  });
  return missing;
}

function getSitesInProgressCount() {
  return Store.state.sites.filter((s) => s.status === "準備中").length;
}

// ダッシュボードの「対応が必要な項目」リストを動的生成
function getActionItems() {
  const items = [];

  // 1. 作業員からスマホで提出された資格証（未確認のもの）
  Store.getPendingSubmissions()
    .filter((p) => p.status === "pending")
    .forEach((p) => {
      const worker = Store.getWorker(p.workerId);
      const site = Store.getSite(p.siteId);
      items.push({
        kind: "pending_submission",
        priority: 0,
        days: -1,
        title: `${worker ? worker.name : p.workerId}さんから`,
        subtitle: `${Store.getCertTypeName(p.certTypeId)}の資格証が届きました`,
        detail: site ? `提出先現場：${site.name}　提出日時：${formatDateTimeJP(p.submittedAt)}` : formatDateTimeJP(p.submittedAt),
        badge: "提出あり",
        badgeType: "info",
        actionLabel: "内容を確認する",
        special: "review-submission",
        pendingId: p.id,
        eventDate: p.submittedAt,
      });
    });

  // 2. 現場提出期限が近く、まだ不足している作業員資格（提出期限が近い順）
  Store.state.sites.forEach((site) => {
    const stats = computeSiteStats(site);
    stats.missingWorkerItems.forEach((item) => {
      const days = daysUntil(site.deadline);
      items.push({
        kind: "missing_for_deadline",
        priority: 0,
        days,
        title: `${item.workerName}`,
        subtitle: item.certName,
        detail: `提出先現場：${site.name}　提出期限：${formatDateJP(site.deadline)}`,
        badge: days !== null && days < 0 ? "期限超過" : `残り${days}日`,
        badgeType: days !== null && days <= 7 ? "danger" : "warning",
        actionLabel: "詳細を見る",
        actionHref: `#/sites/${site.id}`,
        siteName: site.name,
      });
    });
  });

  // 3. 資格・教育の期限管理（legal / clientRule / companyRule の期限切れ・期限接近、recommendedTrainingの再教育推奨）
  const DEADLINE_LABEL = { legal: "有効期限", clientRule: "元請確認期限", companyRule: "自社確認期限" };
  Store.state.workers.forEach((worker) => {
    worker.certs.forEach((cert) => {
      const certType = Store.getCertType(cert.certTypeId);
      if (!certType || certType.deadlineType === "none") return;
      const info = getCertDeadlineInfo(cert, certType);

      if (certType.deadlineType === "recommendedTraining") {
        if (info.severity !== "advisory") return;
        items.push({
          kind: "recommended_training",
          priority: info.days < 0 ? 0 : 1,
          days: info.days,
          title: `${worker.name}`,
          subtitle: Store.getCertTypeName(cert.certTypeId),
          detail: `次回教育推奨日：${formatDateJP(cert.deadlineDate)}`,
          badge: "再教育推奨",
          badgeType: "warning",
          actionLabel: "詳細を見る",
          actionHref: `#/workers/${worker.id}`,
        });
        return;
      }

      if (info.severity === "ok") return;
      const label = DEADLINE_LABEL[certType.deadlineType] || "確認期限";
      items.push({
        kind: "deadline_" + certType.deadlineType,
        priority: info.severity === "overdue" ? 0 : 1,
        days: info.days,
        title: `${worker.name}`,
        subtitle: Store.getCertTypeName(cert.certTypeId),
        detail: `${label}：${formatDateJP(cert.deadlineDate)}${info.severity === "overdue" ? "（超過）" : ""}`,
        badge: info.severity === "overdue" ? "超過" : `残り${info.days}日`,
        badgeType: info.severity === "overdue" ? "danger" : "warning",
        actionLabel: "詳細を見る",
        actionHref: `#/workers/${worker.id}`,
      });
    });
  });

  // 4. 会社書類の期限（建設業許可）
  const licDays = daysUntil(Store.state.company.licenseExpiry);
  if (licDays !== null && licDays <= 45) {
    items.push({
      kind: "company_license",
      priority: 1,
      days: licDays,
      title: Store.state.company.name,
      subtitle: "建設業許可",
      detail: `期限：${formatDateJP(Store.state.company.licenseExpiry)}`,
      badge: licDays < 0 ? "期限超過" : `残り${licDays}日`,
      badgeType: licDays <= 14 ? "danger" : "warning",
      actionLabel: "更新資料を確認",
      actionHref: "#/company",
    });
  }

  // 5. 会社共通書類の未提出（労災保険資料など）
  Store.state.company.documents
    .filter((d) => !d.fulfilled)
    .forEach((doc) => {
      items.push({
        kind: "company_doc_missing",
        priority: 0,
        days: null,
        title: Store.state.company.name,
        subtitle: doc.name,
        detail: "未アップロードのため、対象の現場で提出不可になっています。",
        badge: "未提出",
        badgeType: "danger",
        actionLabel: "会社情報を確認",
        actionHref: "#/company",
      });
    });

  items.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    const da = a.days === null ? 9999 : a.days;
    const db = b.days === null ? 9999 : b.days;
    return da - db;
  });

  return items;
}

// ---- 更新系操作 ----

// AI読み取り後の資格証登録
function addWorkerCert(workerId, { certTypeId, issuer, certNumber, obtainedDate, deadlineDate }) {
  const worker = Store.getWorker(workerId);
  if (!worker) return null;
  // 既存の同一資格種別があれば更新、無ければ追加
  let cert = findWorkerCert(worker, certTypeId);
  if (cert) {
    cert.issuer = issuer;
    cert.certNumber = certNumber;
    cert.obtainedDate = obtainedDate;
    cert.deadlineDate = deadlineDate || null;
  } else {
    cert = {
      id: `${workerId}-${certTypeId}-${Date.now()}`,
      certTypeId,
      issuer,
      certNumber,
      obtainedDate,
      deadlineDate: deadlineDate || null,
    };
    worker.certs.push(cert);
  }
  Store.save();
  return cert;
}

// 不足資料の依頼を送信（複数件まとめて）
function sendMissingRequests(siteId, items, message) {
  const sentAt = new Date().toISOString();
  items.forEach((item) => {
    Store.state.requests.push({
      id: `req-${Date.now()}-${item.workerId}-${item.certTypeId}`,
      siteId,
      workerId: item.workerId,
      certTypeId: item.certTypeId,
      message,
      status: "sent",
      sentAt,
    });
  });
  Store.save();
}

// 会社共通書類のアップロード（疑似）
function markCompanyDocFulfilled(docId) {
  const doc = Store.getCompanyDoc(docId);
  if (!doc) return;
  doc.fulfilled = true;
  doc.updatedAt = new Date().toISOString().split("T")[0];
  Store.save();
}

// 提出資料生成（疑似）… 元請の提出方式に応じて生成内容を出し分ける
function generateSubmissionFiles(site) {
  const client = Store.getClient(site.clientId);
  const methods = client ? client.submissionMethods : [];
  const files = [];
  let n = 1;
  const pad = (num) => String(num).padStart(2, "0");

  if (methods.includes("GreenSite")) files.push(`${pad(n++)}_GreenSite入力用確認一覧.xlsx`);
  if (methods.includes("Buildee")) files.push(`${pad(n++)}_Buildee提出用データ一覧.xlsx`);
  if (methods.includes("独自Excel")) files.push(`${pad(n++)}_${client.name}_独自提出シート.xlsx`);
  if (methods.includes("Excel") && !methods.includes("独自Excel")) {
    files.push(`${pad(n++)}_${client.name}_提出用Excel.xlsx`);
  }

  files.push(`${pad(n++)}_会社情報.pdf`);
  files.push(`${pad(n++)}_作業員名簿.xlsx`);
  files.push(`${pad(n++)}_資格証一式.pdf`);
  files.push(`${pad(n++)}_会社証明書一式.pdf`);

  if (methods.includes("メール")) files.push(`${pad(n++)}_提出メール本文（下書き）.txt`);
  if (methods.includes("PDF")) files.push(`${pad(n++)}_提出用PDF一式.pdf`);

  files.push(`${pad(n++)}_提出チェックリスト.pdf`);
  return files;
}

function generateSubmission(siteId) {
  const site = Store.getSite(siteId);
  if (!site) return null;
  const files = generateSubmissionFiles(site);
  site.submissionGenerated = true;
  site.submissionGeneratedAt = new Date().toISOString();
  site.submissionFiles = files;
  if (site.status !== "提出済") {
    site.status = "提出可能";
  }
  Store.save();
  return files;
}

// worker が保有していない資格種別のうち、デモ的に「次に追加すべき資格」を1つ返す
function pickNextCertTypeForWorker(worker) {
  const heldIds = new Set(worker.certs.map((c) => c.certTypeId));
  const candidate = Store.state.certTypes.find((ct) => !heldIds.has(ct.id));
  return candidate || Store.state.certTypes[0];
}
