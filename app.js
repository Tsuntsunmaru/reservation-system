const API = "https://reservation-system-nle7.onrender.com";

let calendar;
let selectedInfo = null;
let selectedEvent = null;

function openEditModal(event) {
  selectedEvent = event;

  document.getElementById("startInput").value =
    event.startStr.slice(0,16);

  document.getElementById("endInput").value =
    event.endStr.slice(0,16);

  document.getElementById("titleInput").value =
    event.title;

  document.getElementById("noteInput").value =
    event.extendedProps.note || "";

  document.getElementById("overlay").style.display = "block";
  document.getElementById("modal").style.display = "block";
}

function closeDetailModal() {
      const modal = document.getElementById("detailModal");
      modal.style.setProperty("display", "none", "important");
      document.getElementById("overlay").style.display = "none";
    }
async function deleteFromDetail() {
      if (!selectedEvent) return;
      const token = localStorage.getItem("token");
      const res = await fetch(API + "/bookings/" + selectedEvent.id, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + token
        }
      });
    
      if (res.ok) {
       alert("削除しました");
       selectedEvent.remove();
       closeDetailModal();
     } else {
       alert("削除失敗");
     }
   }

function editFromDetail() {
     closeDetailModal();
     openEditModal(selectedEvent);
   }

async function submitForm() {

  const token = localStorage.getItem("token");
  const selectedResource = document.getElementById("resourceSelect").value;
  const start = document.getElementById("startInput").value;
  const end = document.getElementById("endInput").value;
  const title = document.getElementById("titleInput").value;
  const note = document.getElementById("noteInput").value;
  const isAllDay = document.getElementById("allDayCheckbox")?.checked;

  let start_at;
  let end_at;

  if (isAllDay) {
    const date = selectedInfo.startStr.slice(0, 10);
    start_at = date + "T00:00:00";
    end_at   = date + "T23:59:59";
  } else {
    if (!start || !end) {
      alert("時間を入力してください");
      return;
    }
    
    start_at = start + ":00";
    end_at   = end + ":00";
  }

  try {

    if(selectedEvent){
      const res = await fetch(API + "/bookings/" + selectedEvent.id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          resource_id: Number(selectedResource),
          start_at: start_at,
          end_at: end_at,
          title: title,
          note: note,
          all_day:isAllDay
        })
      });
      if (res.ok) {
        alert("更新しました");
        closeModal();
        calendar.refetchEvents();
      } else {
        alert("更新失敗");
      }

      return;

    } else {

      const res = await fetch(API + "/bookings/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          resource_id: Number(selectedResource),
          start_at: start_at,
          end_at: end_at,
          title: title,
          note: note,
          all_day: isAllDay
        })
      });

      if (res.ok) {
        alert("予約しました");
        closeModal();
        calendar.refetchEvents();
      } else {
        alert("予約失敗");
      }
    }

    selectedEvent = null;  

  } catch (e) {
    console.error(e);
    alert("エラー");
  }
}

function getColor(id) {
  const hue = (id * 137) % 360;
  return `hsl(${hue}, 60%, 40%)`;
}

window.onload = () => {
  const checkbox = document.getElementById("allDayCheckbox");
  const startInput = document.getElementById("startInput");
  const endInput = document.getElementById("endInput");

  if (checkbox) {
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        startInput.value = "";
        endInput.value = "";
        startInput.disabled = true;
        endInput.disabled = true;
      } else {
        startInput.disabled = false;
        endInput.disabled = false;
      }
    });
  }
        
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
        title: b.title || "予約",
        start: b.start_at,
        end: b.end_at,
        user_name: b.user_name,
        note: b.note,
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

    const legend = document.getElementById("legend");
    if (legend) {
      legend.innerHTML = "";
      resources.forEach(r => {
        const span = document.createElement("span");
        const color = getColor(r.id);
        span.innerHTML =
          `<span style="color:${color}; font-weight:bold;">■</span>${r.name} `;
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
    const events = eventsRaw.map(e => ({
      ...e,
      color: getColor(e.resource_id),
      allDay: e.all_day === true
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

      eventTimeFormat: {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      },
      eventContent: function(arg) {
        return {
          html: `
          <div>
          <div style="font-weight:bold;">${arg.event.title}</div>
          <div style="font-size:11px;">
            ${arg.event.extendedProps.user_name || ""}
          </div>
        </div>
      `
    };
  },
      
      //businessHours: {  
        //daysOfWeek: [1, 2, 3, 4, 5],
        //startTime: "09:30",
        //endTime: "18:00"
      //},
      
    
    
      eventClick: function(info) {
        closeAllModals();
        const event = info.event;
        selectedEvent = event;
    
        document.getElementById("detailTitle").textContent =
          "タイトル: " + event.title;
        document.getElementById("detailTime").textContent =
          `時間: ${formatDateTime(event.startStr)} ～ ${formatDateTime(event.endStr)}`;
        document.getElementById("detailNote").textContent =
          "備考: " + (event.extendedProps.note || "");
        document.getElementById("overlay").style.display = "block";
        document.getElementById("detailModal").style.display = "block";
      },
      
      selectable: true,
      events: async function(fetchInfo, successCallback, failureCallback) {
        try {
          const eventsRaw = await loadBookings();
          const events = eventsRaw.map(e => ({
            ...e,
            color: getColor(e.resource_id)
          }));
          
          successCallback(events);
        } catch (e) {
          failureCallback(e);
        }
      },

      select: function (info) {
        closeAllModals();
        const selectedResource =　info.resource?.id;
        const events = calendar.getEvents();
        const selectedDate = info.startStr.slice(0, 10);

        const hasAllDay = events.some(e => {
          return (
            e.extendedProps.resource_id == selectedResource &&
            e.allDay &&
            e.startStr.slice(0, 10) === selectedDate
          );
        });

        const hasNormal = events.some(e => {
          return (
            e.extendedProps.resource_id == selectedResource &&
            !e.allDay &&
            e.startStr.slice(0, 10) === selectedDate
          );
        });

        const isAllDaySelect = info.allDay;
        
        if (hasAllDay && !isAllDaySelect) {
          alert("この日は終日予約があるため予約できません");
          calendar.unselect();
          return;
        }

        if (hasNormal && isAllDaySelect) {
          alert("この日は時間予約があるため終日予約できません");
          calendar.unselect();
          return;
        }
            
        
        selectedInfo = info;

        calendar.setOption("selectable", false);

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
  selectedEvent = null;
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

function closeAllModals() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("modal").style.display = "none";
  document.getElementById("detailModal").style.display = "none";
  document.getElementById("settingsModal").style.display = "none";

}
