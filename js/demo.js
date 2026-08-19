/*
 * セルフガイドデモ（3分デモ）
 * 初めて訪れたユーザーが、説明員・マニュアルなしで
 * 「不足確認→依頼→提出→登録→解消→提出準備」を実際の画面操作で体験できるようにする。
 * app.js の描画結果に上乗せする形で動作し、既存の通常モード・業務ロジックは一切変更しない。
 */

const DEMO_SEEN_KEY = "teishutsu_demo_seen_v1";
const DEMO_EVENTS_KEY = "teishutsu_demo_events_v1";
const DEMO_FEEDBACK_KEY = "teishutsu_demo_feedback_v1";

const DEMO_SITE_ID = "s1";
const DEMO_WORKER_ID = "w1";
const DEMO_CERT_TYPE_ID = "ct2";
const DEMO_COMPANY_DOC_ID = "cd3"; // 労災保険資料

const DEMO_STEP_CAPTION = {
  1: "現場の不足を確認",
  2: "不足資料を作業員へ依頼",
  3: "作業員側の提出を体験",
  4: "届いた資格証を確認・登録",
  5: "不足解消を確認",
  6: "提出資料を準備",
};

function recordDemoEvent(event, meta) {
  let log = [];
  try {
    log = JSON.parse(localStorage.getItem(DEMO_EVENTS_KEY) || "[]");
  } catch (e) {
    log = [];
  }
  log.push(Object.assign({ event, timestamp: new Date().toISOString() }, meta || {}));
  try {
    localStorage.setItem(DEMO_EVENTS_KEY, JSON.stringify(log));
  } catch (e) {
    // ログ保存に失敗してもデモ体験自体は止めない
  }
}

function saveDemoFeedback(feedback) {
  try {
    localStorage.setItem(DEMO_FEEDBACK_KEY, JSON.stringify(feedback));
  } catch (e) {
    // 保存に失敗しても完了画面の表示は継続する
  }
}

const Demo = {
  active: false,
  completed: false,
  currentStep: 0, // 1-6、0=未開始
  reachedSiteDetail: false, // Step1のサブ状態：ダッシュボード→現場詳細
  workerFrameOpen: false,
  startedAt: null,
  useIntent: null,
  priceIntent: null,
  _lastRequestSite: null,
  _lastRequestItems: null,
  _repositionBound: false,
  _repositionTimer: null,

  /* ============================================================
     入口判定（初回訪問 / ?demo=1）
     ============================================================ */
  checkEntry() {
    const params = new URLSearchParams(location.search);
    const forced = params.get("demo") === "1";
    let seen = null;
    try {
      seen = localStorage.getItem(DEMO_SEEN_KEY);
    } catch (e) {
      seen = "1"; // localStorageが使えない環境では毎回は出さない
    }
    if (forced || !seen) {
      this.showWelcome();
    }
  },

  markSeen() {
    try {
      localStorage.setItem(DEMO_SEEN_KEY, "1");
    } catch (e) {
      // no-op
    }
  },

  showWelcome() {
    this.markSeen();
    const html = modalShell(
      "",
      `
      <div style="text-align:center;padding:8px 6px 4px;">
        <div style="font-size:17px;font-weight:700;margin-bottom:10px;">提出書類管理を3分で体験</div>
        <div style="font-size:13px;color:var(--color-text-sub);line-height:1.8;margin-bottom:24px;">
          元請ごとに異なる提出書類の準備・回収を効率化する流れを、<br>
          実際の画面を操作しながら体験できます。
        </div>
        <button class="btn btn-primary btn-lg btn-block" id="demoStartBtn" style="margin-bottom:10px;">3分デモを開始</button>
        <button class="btn btn-secondary btn-block" id="demoFreeBtn">自由に画面を見る</button>
      </div>
      `,
      ""
    );
    openModal(html);
    qs("#demoStartBtn").addEventListener("click", () => {
      closeModal();
      this.start();
    });
    qs("#demoFreeBtn").addEventListener("click", () => {
      closeModal();
    });
  },

  /* ============================================================
     開始・状態初期化
     ============================================================ */
  start() {
    Store.reset();

    // デモを2分30秒〜4分程度に収めるため、開始時だけ会社の労災保険資料を準備済み扱いにする。
    // 通常モードのSEED_DATAは変更せず、デモ開始（Store.reset相当）直後にだけ適用する一時的な調整。
    const doc = Store.getCompanyDoc(DEMO_COMPANY_DOC_ID);
    if (doc && !doc.fulfilled) {
      doc.fulfilled = true;
      doc.updatedAt = new Date().toISOString().split("T")[0];
      Store.save();
    }

    this.active = true;
    this.completed = false;
    this.currentStep = 1;
    this.reachedSiteDetail = false;
    this.workerFrameOpen = false;
    this.startedAt = Date.now();
    this.useIntent = null;
    this.priceIntent = null;

    recordDemoEvent("demo_started");
    document.body.classList.add("demo-active");
    this.bindGlobalReposition();

    if (currentRoute().join("/") === "dashboard" || !location.hash || location.hash === "#/dashboard") {
      renderApp();
      this.onRender();
    } else {
      navigate("#/dashboard");
    }
  },

  /* ============================================================
     renderApp() 完了ごとに呼ばれるフック（宣言的なステップ進行）
     ============================================================ */
  onRender() {
    if (!this.active) return;
    this.renderChrome();
    if (this.workerFrameOpen) return; // 作業員体験フレーム表示中はスポットライトを出さない

    const route = currentRoute();

    // Step1のサブ状態：現場詳細に到着したか
    if (this.currentStep === 1 && route[0] === "sites" && route[1] === DEMO_SITE_ID && route.length === 2) {
      if (!this.reachedSiteDetail) {
        this.reachedSiteDetail = true;
      }
    }

    // Step5：登録後に現場詳細へ戻ってきたら、生成画面へ進んだ時点でStep6にする
    if (this.currentStep === 5 && route[0] === "sites" && route[1] === DEMO_SITE_ID && route[2] === "generate") {
      recordDemoEvent("step_5_completed");
      this.currentStep = 6;
      this.renderChrome();
    }

    // Step6：提出資料の生成が完了したらデモ完了
    if (this.currentStep === 6 && route[0] === "sites" && route[1] === DEMO_SITE_ID && route[2] === "generate") {
      const site = Store.getSite(DEMO_SITE_ID);
      if (site && site.submissionGenerated && !this.completed) {
        recordDemoEvent("submission_generated");
        this.complete();
        return;
      }
    }

    this.updateSpotlight();
  },

  /* ============================================================
     data-action 経由のクリックを監視するフック（app.js handleAction末尾から呼ばれる）
     ============================================================ */
  onAction(action, el) {
    if (!this.active) return;
    if (
      action === "open-request-modal" &&
      this.currentStep === 1 &&
      el.dataset.worker === DEMO_WORKER_ID &&
      el.dataset.cert === DEMO_CERT_TYPE_ID
    ) {
      recordDemoEvent("step_1_completed");
      this.currentStep = 2;
      this.renderChrome();
      setTimeout(() => this.updateSpotlight(), 60);
    }
    if (action === "review-submission" && this.currentStep === 4) {
      setTimeout(() => this.updateSpotlight(), 60);
    }
  },

  // 不足資料の依頼を送信した直後（app.js #reqSendBtn ハンドラーから呼ばれる）
  onRequestSent(site, items) {
    if (!this.active) return;
    this._lastRequestSite = site;
    this._lastRequestItems = items;
    this.currentStep = 3;
    recordDemoEvent("step_2_completed");
    this.renderChrome();
    // このあとrenderRequestSuccess()がモーダル内容を#demoOpenWorkerBtnへ差し替えるため、
    // それが描画された後にスポットライトを更新し、Step2の古い吹き出しが残らないようにする
    setTimeout(() => this.updateSpotlight(), 60);
  },

  // 資格証の登録が完了した直後（app.js #aiConfirmBtn ハンドラーから呼ばれる）
  onCertRegistered() {
    if (!this.active) return;
    recordDemoEvent("cert_registered");
    this.currentStep = 5;
    if (location.hash === `#/sites/${DEMO_SITE_ID}`) {
      // 通知を現場詳細ページ上で確認した場合など、遷移先が現在地と同じだと
      // hashchangeが発火せず再描画されないため、その場合だけ明示的に再描画する
      renderApp();
    } else {
      navigate(`#/sites/${DEMO_SITE_ID}`);
    }
  },

  /* ============================================================
     作業員側の提出体験（インライン埋め込み）
     ============================================================ */
  openWorkerFrame(url) {
    this.workerFrameOpen = true;
    this.hideSpotlight();
    const isMobile = window.innerWidth <= 600;
    const html = `
      <div class="demo-worker-overlay" id="demoWorkerOverlay">
        ${isMobile ? "" : `<div class="demo-worker-caption">作業員にはこのように表示されます</div>`}
        <div class="demo-worker-frame${isMobile ? " full" : ""}">
          <button class="demo-worker-close" id="demoWorkerCloseBtn" aria-label="閉じる">${icon("close")}</button>
          <iframe src="${url}" title="作業員側の提出画面プレビュー"></iframe>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", html);
    qs("#demoWorkerCloseBtn").addEventListener("click", () => this.closeWorkerFrame());
    window.closeDemoWorkerFrame = () => this.closeWorkerFrame();
  },

  closeWorkerFrame() {
    const el = qs("#demoWorkerOverlay");
    if (el) el.remove();
    this.workerFrameOpen = false;
    window.closeDemoWorkerFrame = null;

    if (this.currentStep === 3) {
      const submitted = Store.getPendingSubmissions().some(
        (p) => p.workerId === DEMO_WORKER_ID && p.certTypeId === DEMO_CERT_TYPE_ID
      );
      if (submitted) {
        recordDemoEvent("worker_submission_completed");
        recordDemoEvent("step_3_completed");
        this.currentStep = 4;
      } else if (this._lastRequestSite && this._lastRequestItems) {
        // 提出せずに閉じた場合は、もう一度「作業員側の提出を体験」ボタンを出す
        renderRequestSuccess(this._lastRequestSite, this._lastRequestItems);
        return;
      }
    }
    renderApp();
  },

  /* ============================================================
     現在のステップに応じたターゲット・説明文
     ============================================================ */
  getStepConfig() {
    const modalOpen = !!qs("#modalOverlay") && qs("#modalOverlay").classList.contains("open");
    switch (this.currentStep) {
      case 1:
        if (!this.reachedSiteDetail) {
          return {
            selector: `[data-demo="dashboard-site-${DEMO_SITE_ID}"]`,
            text: "現場ごとに必要な書類と不足状況を確認できます。「○○ビル新築工事」を開いてください。",
          };
        }
        return {
          selector: `[data-action="open-request-modal"][data-worker="${DEMO_WORKER_ID}"][data-cert="${DEMO_CERT_TYPE_ID}"]`,
          text: "山田太郎さんの高所作業車運転技能講習が不足しています。「依頼」を押して、本人へ資格証の提出をお願いしてみましょう。",
        };
      case 2:
        if (modalOpen) {
          return {
            selector: "#reqSendBtn",
            text: "内容を確認して送信します。実運用ではメール・SMS等で本人へ提出URLを送る想定です。「依頼を送信」を押してください。",
          };
        }
        return {
          selector: `[data-action="open-request-modal"][data-worker="${DEMO_WORKER_ID}"][data-cert="${DEMO_CERT_TYPE_ID}"]`,
          text: "不足している資格証を作業員本人へ依頼できます。「依頼」を押してください。",
        };
      case 3:
        if (modalOpen) {
          return {
            selector: "#demoOpenWorkerBtn",
            text: "「作業員側の提出を体験」を押すと、作業員が受け取る画面をこのまま体験できます。",
          };
        }
        return { selector: null, text: "作業員側の画面で資格証を提出してみましょう。" };
      case 4: {
        if (modalOpen) {
          return {
            selector: "#aiConfirmBtn",
            text: "資格証から必要情報を自動で読み取りました。内容を確認して「登録」を押してください。",
          };
        }
        const dropdownOpen = !!qs("#notifDropdown") && qs("#notifDropdown").classList.contains("open");
        if (dropdownOpen) {
          return {
            selector: '[data-action="review-submission"]',
            text: "作業員から提出された資料が届きました。この通知をクリックして内容を確認しましょう。",
          };
        }
        return {
          selector: "#bellBtn",
          text: "作業員から提出された資料が届きました。通知ベルを押して確認しましょう。",
        };
      }
      case 5:
        return {
          selector: '[data-demo="prep-generate-btn"]',
          text: "資格証が登録され、現場の不足が解消されました。準備率が100%になったら「提出資料を準備する」を押してください。",
        };
      case 6: {
        if (qs(".ai-loading")) {
          // 疑似生成中はボタン自体が一時的にDOMから消えるため、対象なし＝案内なしとして扱う
          return { selector: null, text: "" };
        }
        return {
          selector: '[data-action="do-generate"]',
          text: "必要な資料が揃いました。元請の提出方式に合わせた提出資料を準備してみましょう。",
        };
      }
      default:
        return { selector: null, text: "" };
    }
  },

  /* ============================================================
     スポットライト／吹き出し
     ============================================================ */
  findVisible(selector) {
    return qsa(selector).find((el) => el.offsetParent !== null) || null;
  },

  updateSpotlight() {
    this.renderChrome(); // 直前にshowRecovery()で上書きされていても、有効な状態に戻れば通常表示に戻す
    // レンダリングの一瞬の隙間やスクロール起因の再計算で対象が一時的に見つからないだけのことがあるため、
    // 「見つからない」が実際に続いた場合だけ復帰バナーを出す（デバウンス）。
    clearTimeout(this._recoveryTimer);
    const cfg = this.getStepConfig();
    if (!cfg.selector) {
      this.hideSpotlight();
      return;
    }
    const el = this.findVisible(cfg.selector);
    if (!el) {
      this._recoveryTimer = setTimeout(() => this.showRecovery(), 500);
      return;
    }
    // ステップと無関係なモーダル（デモ終了確認など）が開いている間は、
    // その裏にあるターゲットへスポットライトを出さない（スクロール等の再計算で誤って復活するのを防ぐ）。
    const modalOverlay = qs("#modalOverlay");
    const modalBox = qs("#modalBox");
    const modalOpen = modalOverlay && modalOverlay.classList.contains("open");
    if (modalOpen && modalBox && !modalBox.contains(el)) {
      this.hideSpotlight();
      return;
    }
    this.showSpotlightOn(el, cfg.text);
  },

  showSpotlightOn(el, text) {
    const rect = el.getBoundingClientRect();
    const fullyVisible = rect.top > 70 && rect.bottom < window.innerHeight - 100;
    if (!fullyVisible) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    const overlay = qs("#demoSpotlightOverlay");
    const tooltip = qs("#demoTooltip");
    qs("#demoTooltipText").textContent = text;
    overlay.style.display = "block";
    tooltip.style.display = "block";

    const reposition = () => {
      this.positionSpotlight(el);
      this.positionTooltip(el);
    };
    reposition();
    clearTimeout(this._repositionTimer);
    this._repositionTimer = setTimeout(reposition, 380);
  },

  positionSpotlight(el) {
    const rect = el.getBoundingClientRect();
    const pad = 6;
    const box = qs("#demoSpotlightBox");
    box.style.top = `${Math.max(rect.top - pad, 0)}px`;
    box.style.left = `${Math.max(rect.left - pad, 0)}px`;
    box.style.width = `${rect.width + pad * 2}px`;
    box.style.height = `${rect.height + pad * 2}px`;
  },

  positionTooltip(el) {
    const rect = el.getBoundingClientRect();
    const tooltip = qs("#demoTooltip");
    const margin = 12;
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    let top = spaceBelow >= th + margin || spaceBelow >= spaceAbove ? rect.bottom + margin : rect.top - th - margin;
    top = Math.max(8, Math.min(top, window.innerHeight - th - 8));
    let left = rect.left + rect.width / 2 - tw / 2;
    left = Math.max(10, Math.min(left, window.innerWidth - tw - 10));
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  },

  hideSpotlight() {
    clearTimeout(this._recoveryTimer);
    const overlay = qs("#demoSpotlightOverlay");
    const tooltip = qs("#demoTooltip");
    if (overlay) overlay.style.display = "none";
    if (tooltip) tooltip.style.display = "none";
  },

  bindGlobalReposition() {
    if (this._repositionBound) return;
    this._repositionBound = true;
    let raf = null;
    const handler = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        if (this.active && !this.workerFrameOpen) this.updateSpotlight();
      });
    };
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
  },

  /* ============================================================
     状態不整合からの復帰（ブラウザ「戻る」対策）
     ============================================================ */
  showRecovery() {
    this.hideSpotlight();
    const caption = qs("#demoProgressCaption");
    if (!caption) return;
    caption.innerHTML =
      '画面の状態が変わりました。<button class="link-btn" id="demoRecoveryBtn" style="margin-left:6px;">デモを最初から再開</button>';
    const btn = qs("#demoRecoveryBtn");
    if (btn) btn.addEventListener("click", () => this.start());
  },

  /* ============================================================
     進捗バー（デモ中は常時表示）
     ============================================================ */
  ensureChromeDom() {
    if (qs("#demoProgressBar")) return;
    const html = `
      <div class="demo-progress-bar" id="demoProgressBar">
        <div class="demo-progress-left">
          <div class="demo-progress-kicker">3分デモ</div>
          <div class="demo-progress-dots" id="demoProgressDots"></div>
        </div>
        <div class="demo-progress-mid">
          <div class="demo-progress-step" id="demoProgressLabel"></div>
          <div class="demo-progress-caption" id="demoProgressCaption"></div>
        </div>
        <button class="btn btn-secondary btn-sm" id="demoExitBtn">デモを終了</button>
      </div>
      <div class="demo-spotlight-overlay" id="demoSpotlightOverlay" style="display:none;">
        <div class="demo-spotlight-box" id="demoSpotlightBox"></div>
      </div>
      <div class="demo-tooltip" id="demoTooltip" style="display:none;">
        <div class="demo-tooltip-badge">ここをクリック</div>
        <div class="demo-tooltip-text" id="demoTooltipText"></div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", html);
    qs("#demoExitBtn").addEventListener("click", () => this.confirmExit());
  },

  renderChrome() {
    this.ensureChromeDom();
    if (!this.active) return;
    qs("#demoProgressBar").style.display = "flex";
    const step = Math.min(this.currentStep, 6);
    const dots = [1, 2, 3, 4, 5, 6]
      .map((n) => `<span class="demo-dot${n < step ? " done" : n === step ? " current" : ""}"></span>`)
      .join("");
    qs("#demoProgressDots").innerHTML = dots;
    qs("#demoProgressLabel").textContent = `STEP ${step} / 6`;
    qs("#demoProgressCaption").textContent = DEMO_STEP_CAPTION[step] || "";
  },

  /* ============================================================
     終了・離脱
     ============================================================ */
  confirmExit() {
    this.hideSpotlight(); // モーダルの上にスポットライトの吹き出しが重なりクリックを塞ぐのを防ぐ
    const html = modalShell(
      "デモを終了しますか？",
      `<div style="font-size:13px;color:var(--color-text-sub);line-height:1.7;">ここまでの操作内容は保存されません。通常モードに戻り、自由に画面を操作できます。</div>`,
      `<button class="btn btn-secondary" id="demoExitCancelBtn">続ける</button>
       <button class="btn btn-danger" id="demoExitConfirmBtn">終了する</button>`
    );
    openModal(html);
    qs("#demoExitCancelBtn").addEventListener("click", () => {
      closeModal();
      this.updateSpotlight();
    });
    qs("#demoExitConfirmBtn").addEventListener("click", () => {
      closeModal();
      recordDemoEvent("demo_exited", { atStep: this.currentStep });
      this.teardown();
    });
  },

  // ガイドUI（スポットライト・進捗バー・サイドバー無効化・作業員フレーム）だけを終了する。
  // completed / startedAt / useIntent / priceIntent 等、完了アンケートに必要な状態はここでは触らない。
  endGuide() {
    this.active = false;
    this.workerFrameOpen = false;
    document.body.classList.remove("demo-active");
    this.hideSpotlight();
    const bar = qs("#demoProgressBar");
    if (bar) bar.style.display = "none";
    const frame = qs("#demoWorkerOverlay");
    if (frame) frame.remove();
    window.closeDemoWorkerFrame = null;
  },

  // デモセッション自体を完全に終える（デモ終了ボタン、または完了画面から離脱する場合）
  teardown() {
    this.endGuide();
    this.currentStep = 0;
    this.completed = false;
    this.startedAt = null;
    this.useIntent = null;
    this.priceIntent = null;
  },

  /* ============================================================
     完了・価格検証UI
     ============================================================ */
  complete() {
    this.completed = true;
    const durationSeconds = this.startedAt ? Math.round((Date.now() - this.startedAt) / 1000) : null;
    this._durationSeconds = durationSeconds;
    recordDemoEvent("demo_completed", { demoDurationSeconds: durationSeconds });
    // ガイドとしては完了：スポットライト・進捗バーを消し、サイドバーの無効化も解除する。
    // completed/durationSeconds等の完了アンケート用の状態はendGuide()では変更されない。
    this.endGuide();
    this.showCompletionModal();
  },

  showCompletionModal() {
    const html = modalShell(
      "3分デモ完了",
      `
      <div style="text-align:center;">
        <div class="success-icon-circle" style="margin:0 auto 14px;">✓</div>
        <div style="font-size:13.5px;color:var(--color-text-sub);margin-bottom:16px;">このシステムでは、次を一つの流れで管理できます。</div>
      </div>
      <div class="demo-recap-list">
        <div class="demo-recap-item"><span class="check-icon">✓</span>現場ごとの不足確認</div>
        <div class="demo-recap-item"><span class="check-icon">✓</span>作業員への資料依頼</div>
        <div class="demo-recap-item"><span class="check-icon">✓</span>スマホからの資格証回収</div>
        <div class="demo-recap-item"><span class="check-icon">✓</span>資格証情報の登録</div>
        <div class="demo-recap-item"><span class="check-icon">✓</span>元請別の提出準備</div>
      </div>
      <div class="divider"></div>
      <div style="display:flex;flex-direction:column;gap:8px;">
        <button class="btn btn-primary btn-block" id="demoRestartBtn">もう一度体験する</button>
        <button class="btn btn-secondary btn-block" id="demoFreeAfterBtn">自由に画面を見る</button>
      </div>
      <div class="divider"></div>
      <div id="demoFeedbackArea"></div>
      `,
      ""
    );
    openModal(html, { wide: true });
    // アンケートは任意。回答しなくても最初からこの2つでいつでも抜けられる。
    qs("#demoRestartBtn").addEventListener("click", () => {
      closeModal();
      this.start();
    });
    qs("#demoFreeAfterBtn").addEventListener("click", () => {
      closeModal();
      this.teardown();
    });
    this.renderUseIntentQuestion();
  },

  choiceButton(group, value, label) {
    return `<button class="demo-choice" data-group="${group}" data-value="${value}">${escapeHtml(label)}</button>`;
  },

  renderUseIntentQuestion() {
    const area = qs("#demoFeedbackArea");
    area.innerHTML = `
      <div class="demo-question-title">このシステムを実際の業務で使ってみたいと思いましたか？</div>
      <div class="demo-choice-list" id="demoUseIntentChoices">
        ${this.choiceButton("useIntent", "yes", "ぜひ使いたい")}
        ${this.choiceButton("useIntent", "maybe", "料金次第で使いたい")}
        ${this.choiceButton("useIntent", "no", "今は必要ない")}
      </div>
      <div id="demoPriceArea"></div>
    `;
    qsa("#demoUseIntentChoices .demo-choice").forEach((btn) => {
      btn.addEventListener("click", () => {
        qsa("#demoUseIntentChoices .demo-choice").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        this.useIntent = btn.dataset.value;
        recordDemoEvent("use_intent_answered", { value: this.useIntent });
        this.renderPriceSection();
      });
    });
  },

  renderPriceSection() {
    if (qs("#demoPriceSection")) return;
    const html = `
      <div class="divider"></div>
      <div class="plan-box" id="demoPriceSection" style="margin-bottom:16px;">
        <div class="section-band">Standard</div>
        <div class="card-pad">
          <div style="font-size:20px;font-weight:700;margin-bottom:10px;">月額 4,980円（税別）</div>
          <ul class="demo-plan-list">
            <li>作業員50名まで</li>
            <li>現場数無制限</li>
            <li>資格証の自動読み取り</li>
            <li>不足資料の依頼</li>
            <li>提出準備チェック</li>
            <li>提出資料生成</li>
          </ul>
        </div>
      </div>
      <div class="demo-question-title">月額4,980円なら利用したいと思いますか？</div>
      <div class="demo-choice-list" id="demoPriceIntentChoices">
        ${this.choiceButton("priceIntent", "yes", "この価格なら利用したい")}
        ${this.choiceButton("priceIntent", "trial", "無料トライアルなら試したい")}
        ${this.choiceButton("priceIntent", "high", "少し高い")}
        ${this.choiceButton("priceIntent", "no", "必要ない")}
      </div>
      <div class="form-hint" id="demoFeedbackThanks" style="text-align:center;margin-top:10px;"></div>
    `;
    qs("#demoPriceArea").innerHTML = html;
    qsa("#demoPriceIntentChoices .demo-choice").forEach((btn) => {
      btn.addEventListener("click", () => {
        qsa("#demoPriceIntentChoices .demo-choice").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        this.priceIntent = btn.dataset.value;
        recordDemoEvent("price_intent_answered", { value: this.priceIntent });
        saveDemoFeedback({
          completedAt: new Date().toISOString(),
          useIntent: this.useIntent,
          priceIntent: this.priceIntent,
          demoDurationSeconds: this._durationSeconds,
        });
        const thanks = qs("#demoFeedbackThanks");
        if (thanks) thanks.textContent = "ご回答ありがとうございました。";
      });
    });
  },
};
