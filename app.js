const API = "https://reservation-system-nle7.onrender.com";

let calendar;
let selectedInfo = null;

window.onload = () => {

  const calendarEl = document.getElementById("calendar");

  // ✅ 予約取得
  async function loadBookings() {
    try {
      const res = await fetch(API + "/bookings");
      const bookings = await res.json();

      return bookings.map(b => ({
        id: b.id,
        title: b.user_name || "予約",
        start: b.start_at,
        end: b.end_at,
        color: b.resource_id === 1 ? "#e84118" : "#0984e3"
      }));

    } catch (e) {
      console.log("API取得失敗", e);
      return [];
    }
  }

  // ✅ カレンダー初期化
  async function initCalendar() {

    const events = await loadBookings();

    if (calendar) calendar.destroy();

    calendar = new FullCalendar.Calendar(calendarEl, {
      eventClick: function(info) {
        const ok = confirm("この予約を削除しますか？");
        if (!ok) return;
        
        fetch(API + "/bookings/" + info.event.id, {
          method: "DELETE"
        }).then(() => {
          alert("削除しました");
          window.initCalendar();
        });
      },
      initialView: "timeGridWeek",
      selectable: true,
      events: events,

      select: function (info) {
        selectedInfo = info;

        // ✅ UIロック
        calendar.setOption("selectable", false);
        calendarEl.style.pointerEvents = "none";

        document.getElementById("selectedTime").textContent =
          `予約: ${info.startStr} ～ ${info.endStr}`;

        openModal();
      }
    });

    calendar.render();
  }

  initCalendar();

  // ✅ 外から使えるようにする（重要）
  window.initCalendar = initCalendar;
};


// ✅ モーダル開く
function openModal() {
  document.getElementById("overlay").style.display = "block";
}


// ✅ ✅ ✅ モーダル閉じる（完全版）
function closeModal() {
  document.getElementById("overlay").style.display = "none";

  const calendarEl = document.getElementById("calendar");
  calendarEl.style.pointerEvents = "auto";

  if (calendar) {
    calendar.setOption("selectable", true);
    calendar.unselect();

    // ✅ 🔥 完全復活処理（これが決定打）
    calendar.render();
  }

  selectedInfo = null;
}


// ✅ モーダルクリック貫通防止
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }
});


// ✅ ✅ ✅ 予約送信（改善版）
async function submitForm() {
  if (!selectedInfo) return;

  try {
    const res = await fetch(API + "/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user_name: "ユーザー",
        resource_id: 1,
        start_at: selectedInfo.startStr,
        end_at: selectedInfo.endStr
      })
    });

    if (res.ok) {
      alert("予約成功");

      closeModal();

      // ✅ 🔥 ページリロードせず更新
      if (window.initCalendar) {
        window.initCalendar();
      }

    } else {
      alert("予約失敗");
    }

  } catch (e) {
    console.error(e);
    alert("通信エラー");
  }
}
