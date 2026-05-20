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
      initialView: "timeGridWeek",
      selectable: true,
      events: events,

      // ✅ ここは「表示だけ」
      select: function (info) {
        selectedInfo = info;

        document.getElementById("selectedTime").textContent =
          `予約: ${info.startStr} ～ ${info.endStr}`;

        openModal(); // ←ここがポイント
      }
    });

    calendar.render();
  }

  initCalendar();
};

// ✅ モーダル開く
function openModal() {
  document.getElementById("overlay").style.display = "block";
}

// ✅ モーダル閉じる
function closeModal() {
  document.getElementById("overlay").style.display = "none";
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

// ✅ ✅ ここで初めて予約送信
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
      location.reload(); // ←再読み込み
    } else {
      alert("予約失敗");
    }

  } catch (e) {
    console.log("予約失敗", e);
    alert("通信エラー");
  }
}
