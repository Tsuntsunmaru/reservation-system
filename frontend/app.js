const API = "https://reservation-system-nle7.onrender.com";

window.onload = () => {

  const calendarEl = document.getElementById("calendar");

  let calendar;

   async function loadBookings() {
    const res = await fetch(API + "/bookings");
    const bookings = await res.json();

    return bookings.map(b => ({
      title: `${b.user_name}`,                 
      start: b.start_at,
      end: b.end_at,
      color: b.resource_id === 1
        ? "#e84118"    // 車
        : "#0984e3"    // 会議室
    }));
  }catch (e) {
    console.log("API取得失敗", e);
    return [];


    async function initCalendar() {

    const events = await loadBookings();

    if (calendar) calendar.destroy();

    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "timeGridWeek",
      selectable: true,
      events: events,

      select: async function(info) {

        const ok = confirm("予約しますか？");
        if (!ok) return;

        const res = await fetch(API + "/bookings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            resource_id: 1,   // ←あとでselect連動させる
            start_at: info.startStr,
            end_at: info.endStr
          })
        });

        if (res.ok) {
          alert("予約成功");
          initCalendar();
        } else {
          alert("予約失敗");
        }
      }
    });

    calendar.render();
  }

  initCalendar();
};
