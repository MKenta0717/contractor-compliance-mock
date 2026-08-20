/*
 * 需要検証用LP（lp.html）
 * 外部Analyticsはまだ接続しない。将来置き換えやすいよう、
 * イベント記録だけをrecordLpEvent()に集約してlocalStorageへ保存する。
 */

const LP_EVENTS_KEY = "teishutsu_lp_events_v1";

function recordLpEvent(event, meta) {
  let log = [];
  try {
    log = JSON.parse(localStorage.getItem(LP_EVENTS_KEY) || "[]");
  } catch (e) {
    log = [];
  }
  log.push(Object.assign({ event, timestamp: new Date().toISOString() }, meta || {}));
  try {
    localStorage.setItem(LP_EVENTS_KEY, JSON.stringify(log));
  } catch (e) {
    // 記録に失敗してもページ・CTA遷移は妨げない
  }
}

document.addEventListener("DOMContentLoaded", () => {
  recordLpEvent("lp_view");

  document.querySelectorAll("[data-lp-event]").forEach((el) => {
    el.addEventListener("click", () => {
      recordLpEvent(el.dataset.lpEvent);
    });
  });
});
