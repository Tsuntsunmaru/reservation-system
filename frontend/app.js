console.log("app.js読み込まれた");
<script>
window.onload = () => {

  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "timeGridWeek",
    selectable: true,

    select: function(info) {

      // ✅ 日付整形
      const start = new Date(info.startStr).toLocaleString("ja-JP");
      const end = new Date(info.endStr).toLocaleString("ja-JP");

      // ✅ 見やすい確認メッセージ
      const message =
`========================
      予約確認
========================

開始：${start}
終了：${end}

この内容で予約しますか？`;

      // ✅ confirm
      const ok = confirm(message);
      if (!ok) return;

      alert("✅ 予約成功");

      // ✅ カレンダーに表示
      calendar.addEvent({
        title: "予約",
        start: info.start,
        end: info.end,
        color: "#e84118"
      });
    }
  });

  calendar.render();
};
</script>
