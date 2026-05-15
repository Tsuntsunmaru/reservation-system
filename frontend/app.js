const API = "https://reservation-system-nle7.onrender.com";
const token = localStorage.getItem("token");

let calendar;

// ----------------
// リソース取得
// ----------------
async function loadResources() {
  const res = await fetch(API + "/resources");
  const data = await res.json();

  const select = document.getElementById("resourceSelect");
  select.innerHTML = "";

  data.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r.id;
    opt.textContent = r.name;
    select.appendChild(opt);
  });
}

// ----------------
// 予約データ
// ----------------
async function loadBookings(resourceId) {
  const res = await fetch(API + "/bookings");
  const data = await res.json();

  return data
    .filter(b => b.resource_id == resourceId)
    .map(b => ({
      id: b.id,
      title: "予約",
      start: new Date(b.start_at),
      end: new Date(b.end_at),
      color: "#e84118"
    }));
}

// ----------------
// NG時間（グレー）
// ----------------
async function loadBlocks(resourceId) {
  const res = await fetch(API + "/admin/blocks", {
    headers: { token }
  });
  const data = await res.json();

  return data.map(b => ({
    start: b.start_at,
    end: b.end_at,
    display: "background",
    color: "#7f8c8d"
  }));
}

// ----------------
// 休日（グレー）
// ----------------
async function loadHolidays() {
  const res = await fetch(API + "/admin/holidays", {
    headers: { token }
  });
  const data = await res.json();

  return data.map(h => ({
    start: h.date,
    end: h.date,
    display: "background",
    color: "#2c3e50"
  }));
}

// ----------------
// 土日グレー
// ----------------
function generateWeekendEvents() {
  return {
    daysOfWeek: [0, 6], // 日曜=0 土曜=6
    display: "background",
    color: "#dcdde1"
  };
}

// ----------------
// カレンダー初期化
// ----------------
async function initCalendar() {

  const resourceId = document.getElementById("resourceSelect").value;

  const bookings = await loadBookings(resourceId);
  //const blocks = await loadBlocks(resourceId);
  const blocks = [];
  //const holidays = await loadHolidays();
  const holidays = [];

  const calendarEl = document.getElementById("calendar");

  if (calendar) calendar.destroy();

  calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "timeGridWeek",
    selectable: true,
  selectAllow: function(selectInfo) {

  const start = new Date(selectInfo.start);
  const end = new Date(selectInfo.end);

  for (let event of calendar.getEvents()) {

    // background（グレー）だけチェック
    if (event.display === "background") {

      let bStart = event.start;
      let bEnd = event.end;

      // 重なってたらNG
      if (!(end <= bStart || start >= bEnd)) {
        return false;
      }
    }
  }

  return true;
},


    // ⭐ イベント統合
    events: [
      ...bookings,
      ...blocks,
      ...holidays,
      generateWeekendEvents()
    ],

    //

    // ----------------
    // 予約操作
    // ----------------    

select: async function(info) {
  console.log("SELECT動いた");
const startText = new Date(info.startStr).toLocaleString("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

const endText = new Date(info.endStr).toLocaleString("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

  // ✅ 表示テキスト
  document.getElementById("confirmText").innerText =
    `${startText} 〜 ${endText} で予約しますか？`;

  // ✅ モーダル表示
  document.getElementById("confirmBox").style.display = "block";
  document.body.classList.add("modal-open");

  // ✅ OK押したら実行する処理をセット
  pendingReservation = async function() {

    const res = await fetch(API + "/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        resource_id: Number(resourceId),
        start_at: new Date(info.startStr).toISOString(),
        end_at: new Date(info.endStr).toISOString()
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("予約を登録しました ✅");
      initCalendar();
    } else {
      alert(data.detail || "予約不可");
    }
  };
}
  });

  calendar.render();
}

// ----------------
// ログアウト
// ----------------
function logout(){
  localStorage.removeItem("token");
  alert("ログアウト");
}

// ----------------
// イベント
// ----------------
document.getElementById("resourceSelect")
  .addEventListener("change", initCalendar);

// ----------------
// 初期化
// ----------------
loadResources().then(initCalendar);

//-----------------
//確認用ボックス
//-----------------
let pendingReservation = null;

function confirmOk() {
  document.getElementById("confirmBox").style.display = "none";
  document.body.classList.remove("modal-open");

  if (pendingReservation) {
    pendingReservation();
    pendingReservation = null;
  }
}

function confirmCancel() {
  document.getElementById("confirmBox").style.display = "none";
  document.body.classList.remove("modal-open");
  pendingReservation = null;
}
