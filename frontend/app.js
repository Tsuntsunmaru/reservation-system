const API = "https://reservation-system-nle7.onrender.com";
const token = localStorage.getItem("token");

let calendar;

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

function generateWeekendEvents() {
  return {
    daysOfWeek: [0, 6],
    display: "background",
    color: "#dcdde1"
  };
}

function initCalendar() {

  const resourceId = document.getElementById("resourceSelect").value;

  loadBookings(resourceId).then(bookings => {

    const calendarEl = document.getElementById("calendar");

    if (calendar) calendar.destroy();

    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "timeGridWeek",
      selectable: true,

      events: [
        ...bookings,
        generateWeekendEvents()
      ],

      select: function(info) {
        alert("select動いた！");
      }
    });

    calendar.render();
  });
}

// 初期化
document.getElementById("resourceSelect")
  .addEventListener("change", initCalendar);

initCalendar();
document.addEventListener("DOMContentLoaded", () => {
  loadResources().then(initCalendar);
});

function logout(){
  localStorage.removeItem("token");
  alert("ログアウト");
}
