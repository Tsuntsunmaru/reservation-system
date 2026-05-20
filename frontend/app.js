const API = "https://reservation-system-nle7.onrender.com";

window.onload = () => {

  const calendarEl = document.getElementById("calendar");
  let calendar;

  // ✅ 予約取得
  async function loadBookings() {
    try {
      const res = await fetch(API + "/bookings");
      const bookings = await res.json();

      return bookings.map(b => ({
        title: `${b.user_name}`,
        start: b.start_at,
        end: b.end_at,
        color: b.resource_id === 1
          ? "#e84118"
          : "#0984e3"
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

      select: async function (info) {

        const ok = confirm("予約しますか？");
        if (!ok) return;

        try {
          const res = await fetch(API + "/bookings", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              resource_id: 1,
              start_at: info.startStr,
              end_at: info.endStr
            })
          });

          if (res.ok) {
            alert("予約成功");
            initCalendar(); // 再読み込み
          } else {
            alert("予約失敗");
          }

        } catch (e) {
          console.log("予約失敗", e);
          alert("通信エラー");
        }
      }
    });

    calendar.render();
  }

  initCalendar();
};
