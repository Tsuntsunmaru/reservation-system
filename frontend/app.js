document.addEventListener("DOMContentLoaded", () => {

  const calendarEl = document.getElementById("calendar");

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: "timeGridWeek",
    plugins: [ 'interaction' ],
    selectable: true,

    select: function(info) {
      alert("動いた！！！！");
    }
  });

  calendar.render();
});
