/*
 * 提出書類AIアシスタント（モック）
 * 状態管理・疑似ビジネスロジック
 * 実際のDB/API通信は一切行わず、localStorageのみで状態を保持する。
 */

const STORAGE_KEY = "teishutsu_mock_state_v1";
const EXPIRING_THRESHOLD_DAYS = 30;

const Store = {
  state: null,

  init() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.state = JSON.parse(saved);
        return;
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

// ---- 資格ステータス判定 ----
// 戻り値: 'valid' | 'expiring' | 'expired'
function getCertLifecycleStatus(cert) {
  if (!cert.expiryDate) return "valid";
  const days = daysUntil(cert.expiryDate);
  if (days < 0) return "expired";
  if (days <= EXPIRING_THRESHOLD_DAYS) return "expiring";
  return "valid";
}

// 作業員が特定の資格種別を保有しているか（保有していればcertを返す）
function findWorkerCert(worker, certTypeId) {
  return worker.certs.find((c) => c.certTypeId === certTypeId) || null;
}

// 現場の「作業員×資格」要件1件のステータスを判定
// 戻り値: { status: 'ok'|'expiring'|'expired'|'missing', cert }
function getRequirementStatus(worker, certTypeId) {
  const cert = findWorkerCert(worker, certTypeId);
  if (!cert) return { status: "missing", cert: null };
  const lifecycle = getCertLifecycleStatus(cert);
  if (lifecycle === "expired") return { status: "expired", cert };
  if (lifecycle === "expiring") return { status: "expiring", cert };
  return { status: "ok", cert };
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
    const { status, cert } = getRequirementStatus(worker, req.certTypeId);
    return {
      type: "worker",
      workerId: req.workerId,
      workerName: worker ? worker.name : req.workerId,
      certTypeId: req.certTypeId,
      certName: Store.getCertTypeName(req.certTypeId),
      status, // ok | expiring | expired | missing
      fulfilled: status === "ok" || status === "expiring",
      cert,
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
function getGlobalCertCounts() {
  let expired = 0;
  let expiring = 0;
  Store.state.workers.forEach((w) => {
    w.certs.forEach((c) => {
      const s = getCertLifecycleStatus(c);
      if (s === "expired") expired++;
      else if (s === "expiring") expiring++;
    });
  });
  return { expired, expiring };
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

  // 1. 現場提出期限が近く、まだ不足している作業員資格（提出期限が近い順）
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
      });
    });
  });

  // 2. 資格の期限切れ・期限接近（作業員）
  Store.state.workers.forEach((worker) => {
    worker.certs.forEach((cert) => {
      const lifecycle = getCertLifecycleStatus(cert);
      if (lifecycle === "valid") return;
      const days = daysUntil(cert.expiryDate);
      items.push({
        kind: lifecycle === "expired" ? "cert_expired" : "cert_expiring",
        priority: lifecycle === "expired" ? 0 : 1,
        days,
        title: `${worker.name}`,
        subtitle: Store.getCertTypeName(cert.certTypeId),
        detail:
          lifecycle === "expired"
            ? `期限：${formatDateJP(cert.expiryDate)}（期限切れ）`
            : `期限：${formatDateJP(cert.expiryDate)}`,
        badge: lifecycle === "expired" ? "期限切れ" : `残り${days}日`,
        badgeType: lifecycle === "expired" ? "danger" : "warning",
        actionLabel: "詳細を見る",
        actionHref: `#/workers/${worker.id}`,
      });
    });
  });

  // 3. 会社書類の期限（建設業許可）
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

  // 4. 会社共通書類の未提出（労災保険資料など）
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
function addWorkerCert(workerId, { certTypeId, issuer, certNumber, obtainedDate, expiryDate }) {
  const worker = Store.getWorker(workerId);
  if (!worker) return null;
  // 既存の同一資格種別があれば更新、無ければ追加
  let cert = findWorkerCert(worker, certTypeId);
  if (cert) {
    cert.issuer = issuer;
    cert.certNumber = certNumber;
    cert.obtainedDate = obtainedDate;
    cert.expiryDate = expiryDate || null;
  } else {
    cert = {
      id: `${workerId}-${certTypeId}-${Date.now()}`,
      certTypeId,
      issuer,
      certNumber,
      obtainedDate,
      expiryDate: expiryDate || null,
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

// 提出資料生成（疑似）
function generateSubmissionFiles(site) {
  const stats = computeSiteStats(site);
  const files = [];
  let n = 1;
  const pad = (num) => String(num).padStart(2, "0");
  files.push(`${pad(n++)}_会社情報.pdf`);
  files.push(`${pad(n++)}_作業員名簿.xlsx`);
  stats.workerItems.forEach((item) => {
    const shortName = item.workerName.replace(/\s/g, "");
    files.push(`${pad(n++)}_${shortName}_${item.certName}.pdf`);
  });
  stats.companyItems.forEach((item) => {
    files.push(`${pad(n++)}_${item.name}.pdf`);
  });
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
