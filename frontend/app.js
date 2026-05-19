document.addEventListener("DOMContentLoaded", () => {

  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "timeGridWeek",
    plugins: ['interaction'],
    selectable: true,

    select: function(info) {

      const startText = new Date(info.startStr).toLocaleString("ja-JP");
      const endText = new Date(info.endStr).toLocaleString("ja-JP");

      const ok = confirm(`${startText}\n〜\n${endText}\nで予約しますか？`);
      if (!ok) return;

      alert("予約成功");   // ←ここで確認

    }
  });

  calendar.render();
});
