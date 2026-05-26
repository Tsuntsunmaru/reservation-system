const API = "https://reservation-system-nle7.onrender.com";

let calendar;
let selectedInfo = null;

window.onload = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("ログインしてください");
    window.location.href = "login.html";
    return;
  }

  const calendarEl = document.getElementById("calendar");

  document.getElementById("menuButton").onclick = () => {
  const menu = document.getElementById("menu");
  menu.style.display = (menu.style.display === "none") ? "block" : "none";
};

  async function loadBookings() {
    try {
      const res = await fetch(API + "/bookings");
      const bookings = await res.json();

      return bookings.map(b => ({
        id: b.id,
        title: b.user_name || "予約",
        start: b.start_at,
        end: b.end_at,
        resource_id: b.resource_id
      }));

    } catch (e) {
      console.log("API取得失敗", e);
      return [];
    }
  }

  async function loadResources() {
    try {
      const res = await fetch(API + "/resources");
      return await res.json();
    } catch (e) {
      console.log("resource取得失敗", e);
      return [];
    }
  }

  async function initCalendar() {

    const eventsRaw = await loadBookings();
    const resources = await loadResources();

    // ✅ 凡例作成
    const legend = document.getElementById("legend");
    if (legend) {
      legend.innerHTML = "";

      const colors = {
        1: "#e84118",
        2: "#0984e3",
        3: "#00b894"
      };

      resources.forEach(r => {
        const span = document.createElement("span");
        const legendColor = r.id === 1 ? "#e84118" : "#0984e3";

        span.innerHTML = "<span style='color:" + legendColor + "; font-weight:bold;'>■</span>" +r.name + " ";

        legend.appendChild(span);
      });
    }

    const select = document.getElementById("resourceSelect");
    if (select) {
      select.innerHTML = "";
      resources.forEach(r => {
        const opt = document.createElement("option");
        opt.value = r.id;
        opt.textContent = r.name;
        select.appendChild(opt);
      });
    }

    const colors = {
      1: "#e84118",
      2: "#0984e3",
      3: "#00b894"
    };

    const events = eventsRaw.map(e => ({
      ...e,
      color: colors[e.resource_id] || "#999"
    }));

    if (calendar) calendar.destroy();

    calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: "timeGridWeek",
      
      slotMinTime: "00:00:00",
      slotMaxTime: "24:00:00",
      slotDuration: "00:30:00",

      slotLabelFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      },
      
      //businessHours: {  
        //daysOfWeek: [1, 2, 3, 4, 5],
        //startTime: "09:30",
        //endTime: "18:00"
      //},

      

      eventClick: async function(info) {
        const ok = confirm("この予約を削除しますか？");
        if (!ok) return;

        const token = localStorage.getItem("token");

        const res = await fetch(API + "/bookings/" + info.event.id, {
          method: "DELETE",
          headers: {
            "Authorization": "Bearer " + token
          }
        });

        if (res.ok) {
          alert("削除しました");
          info.event.remove();
        } else {
          const text = await res.text();
          console.error(text);
          alert("削除できません: " + text);
        }
      },

      initialView: "timeGridWeek",
      selectable: true,
      events: events,

      select: function (info) {
        selectedInfo = info;

        calendar.setOption("selectable", false);
        calendarEl.style.pointerEvents = "none";

        document.getElementById("selectedTime").textContent =
          `予約: ${formatDateTime(info.startStr)} ～ ${formatDateTime(info.endStr)}`;

        openModal();
      }
    });

    calendar.render();
  }

  initCalendar();
  window.initCalendar = initCalendar;
};

function openModal() {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("settingsModal").style.display = "none";
  document.getElementById("modal").style.display = "block";
  const startInput = document.getElementById("startInput");
  const endInput = document.getElementById("endInput");

  startInput.value = selectedInfo.startStr.slice(0,16);
  endInput.value = selectedInfo.endStr.slice(0,16);
}

function closeModal() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("modal").style.display = "none";
  document.getElementById("settingsModal").style.display = "none";
  
  const calendarEl = document.getElementById("calendar");
  calendarEl.style.pointerEvents = "auto";

  if (calendar) {
    calendar.setOption("selectable", true);
    calendar.unselect();
    calendar.render();
  }

  selectedInfo = null;
}

function openSettingsModal() {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("modal").style.display = "none";
  document.getElementById("settingsModal").style.display = "block";
}

function closeSettingsModal() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("settingsModal").style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }
});

async function submitForm() {
  if (!selectedInfo) return;

  const token = localStorage.getItem("token");
  const selectedResource = document.getElementById("resourceSelect").value;
  const start = document.getElementById("startInput").value;
  const end = document.getElementById("endInput").value;

  try {
    const res = await fetch(API + "/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        resource_id: Number(selectedResource),
        start_at: start,
        end_at: end
      })
  });

    if (res.ok) {
      alert("予約成功");
      closeModal();
      window.initCalendar();
    } else {
      const text = await res.text();
      console.error(text);
      alert("予約失敗: " + text);
    }

  } catch (e) {
    console.error(e);
    alert("通信エラー");
  }
}

async function updateUsername() {
  const token = localStorage.getItem("token");
  const newName = document.getElementById("newUsername").value;

  if (!newName) {
    alert("名前を入力してください");
    return;
  }

  const res = await fetch(API + "/users/me?username=" + newName, {
    method: "PUT",
    headers: {
      "Authorization": "Bearer " + token
    }
  });

  if (res.ok) {
    alert("名前を変更しました");
    window.initCalendar();
  } else {
    const text = await res.text();
    console.error(text);
    alert("変更できません: " + text);
  }
}

function formatDateTime(dateStr) {
  const d = new Date(dateStr);

  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = d.getHours();
  const min = String(d.getMinutes()).padStart(2, "0");

  return month + "/" + day + " " + hour + ":" + min;
}
