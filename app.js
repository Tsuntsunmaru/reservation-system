const API = "https://reservation-system-nle7.onrender.com";

let calendar;
let selectedInfo = null;
let selectedEvent = null;

function getCenter() {
  const el = document.getElementById("center");
  if (!el || !el.value) {
    console.error("centerが取得できてない");
    return "gyoda_minami";
  }

  return el.value;
}

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
       calendar.removeAllEvents();
        setTimeout(() => {
          calendar.refetchEvents();
        }, 300);
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
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    
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
          center: getCenter()
        })
      });
      if (res.ok) {
        alert("更新しました");
        closeModal();
        calendar.removeAllEvents();
        setTimeout(() => {
          calendar.refetchEvents();
        }, 300);
      } else {
        const text = await res.text();
        console.log("エラー内容:", text);
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
          center: getCenter()
        })
      });

      if (res.ok) {
        alert("予約しました");
        closeModal();
        calendar.removeAllEvents();
        setTimeout(() => {
          calendar.refetchEvents();
        }, 300);
      } else {
        const text = await res.text();
        console.log(text);
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


function renderLegend(resources) {
  const legend = document.getElementById("legend");
  if (!legend) return;

  legend.innerHTML = "";

  resources.forEach(r => {
    const span = document.createElement("span");
    const color = getColor(r.id);

    span.innerHTML =
      `<span style="color:${color}; font-weight:bold;">■</span> ${r.name} `;

    legend.appendChild(span);
  });
}

window.onload = () => {
  const checkbox = document.getElementById("allDayCheckbox");
  const startInput = document.getElementById("startInput");
  const endInput = document.getElementById("endInput");

  document.getElementById("center").addEventListener("change", () => {
    calendar.removeAllEvents();

    const resources = await loadResources();
    renderLegend(resources);
    
    setTimeout(() => {
      calendar.refetchEvents();
    }, 100);
  });


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
      console.log(getCenter());
      const res = await fetch(API + "/bookings?center=" + getCenter());
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
      const res = await fetch(API + "/resources?center=" + getCenter());
      const data = await res.json();
      const select = document.getElementById("resourceSelect");
      select.innerHTML = "";

      data.forEach(r => {
        const opt = document.createElement("option");
        opt.value = r.id;
        opt.textContent = r.name;
        select.appendChild(opt);
      });

      return data;

    } catch (e) {
      console.log("resource取得失敗", e);
      return [];
    }
  }  

  async function initCalendar() {

    const eventsRaw = await loadBookings();
    const resources = await loadResources();
    renderLegend(resources);

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
    const events = buildEvents(eventsRaw);

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

        if (event.allDay) {
          document.getElementById("detailTitle").textContent =
            "タイトル: " + event.title;

          document.getElementById("detailTime").textContent =
            "時間: 終日（9:30〜18:00）";

          document.getElementById("detailNote").textContent =
            "備考: 本日は会議室が埋まっています";
        } else {
          document.getElementById("detailTitle").textContent =
            "タイトル: " + event.title;
          document.getElementById("detailTime").textContent =
            `時間: ${formatDateTime(event.startStr)} ～ ${formatDateTime(event.endStr)}`;
          document.getElementById("detailNote").textContent =
            "備考: " + (event.extendedProps.note || "");
        }
          document.getElementById("overlay").style.display = "block";
          document.getElementById("detailModal").style.display = "block";
        },
      
      selectable: true,
      events: async function(fetchInfo, successCallback, failureCallback) {
        try {
          const eventsRaw = await loadBookings();
          const events = buildEvents(eventsRaw);
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
        const start = new Date(info.start);
        const hour = start.getHours() + start.getMinutes() / 60;
        const isWorkTime = hour >= 9.5 && hour < 18;
        
        if (hasAllDay && !isAllDaySelect && isWorkTime) {
          alert("業務時間内は予約できません");
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

  document.getElementById("titleInput").value = "";
  document.getElementById("noteInput").value = "";
  document.getElementById("allDayCheckbox").checked = false;

  const startInput = document.getElementById("startInput");
  const endInput = document.getElementById("endInput");

  startInput.value = "";
  endInput.value = "";
  startInput.disabled = false;
  endInput.disabled = false;

  
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


function buildEvents(eventsRaw) {
  const normalEvents = [];
  const allDayEvents = [];

  const groups = {};

  eventsRaw.forEach(e => {
    const date = (e.start_at || e.start).slice(0, 10);
    const key = date + "_" + e.resource_id;

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(e);
  });

  Object.values(groups).forEach(list => {

    list.sort((a, b) =>
      new Date(a.start_at || a.start) - new Date(b.start_at || b.start)
             );

    const date = (list[0].start_at || list[0].start).slice(0, 10);

    const workStart = new Date(date + "T09:30:00");
    const breakStart = new Date(date + "T12:00:00");
    const breakEnd = new Date(date + "T13:00:00");
    const workEnd = new Date(date + "T18:00:00");

    let morningCursor = new Date(workStart);
    let afternoonCursor = new Date(breakEnd);
    let coveredMorning = true;
    let coveredAfternoon = true;


    for (const e of list) {
      const s = new Date(e.start_at || e.start);
      const eTime = new Date(e.end_at || e.end);

      if (eTime <= workStart || s >= breakStart) continue;
      if (s > morningCursor) {
        coveredMorning = false;
        break;
      }

      if (eTime > morningCursor) {
        morningCursor = eTime;
      }
    }

    if (morningCursor < breakStart) coveredMorning = false;
    
    for (const e of list) {
      const s = new Date(e.start_at || e.start);
      const eTime = new Date(e.end_at || e.end);

      if (eTime <= breakEnd || s >= workEnd) continue;

      if (s > afternoonCursor) {
        coveredAfternoon = false;
        break;
      }

      if (eTime > afternoonCursor) {
        afternoonCursor = eTime;
      }
    }

    if (afternoonCursor < workEnd) coveredAfternoon = false;

    const covered = coveredMorning && coveredAfternoon;

    const sameUser = list.every(e => e.user_name === list[0].user_name);

    list.forEach(e => {
      normalEvents.push({
        id: e.id,
        title: e.title,
        start: e.start_at || e.start,
        end: e.end_at || e.end,
        color: getColor(e.resource_id),
        extendedProps: {
          user_name: e.user_name,
          note: e.note
        }
      });
    });


    if (covered) {
      allDayEvents.push({
        id: "allday-" + list[0].resource_id + "-" + date,
        title: sameUser  ? `${list[0].user_name}（終日）`: "(終日)",
        start: date,
        end: date,
        allDay: true,
        color: getColor(list[0].resource_id),
        extendedProps: {
          user_name: sameUser ? list[0].user_name : "",
          note: ""
        }
      });
    } 
  });

  return [...normalEvents, ...allDayEvents];
}
