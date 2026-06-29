const API = "https://reservation-system-nle7.onrender.com";

function getToken() {
  return localStorage.getItem("token");
}

function authHeaders() {
  return {
    "Authorization": "Bearer " + getToken()
  };
}

async function registerUser() {
  const body = {
    email: document.getElementById("regEmail").value,
    password: document.getElementById("regPassword").value,
    username: document.getElementById("regUsername").value,
    center: document.getElementById("regCenter").value,
    role: document.getElementById("regRole").value
  };

  const res = await fetch(API + "/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders()
    },
    body: JSON.stringify(body)
  });

  const text = await res.text();

  if (res.ok) {
    alert("ユーザー登録しました");
  } else {
    alert("登録失敗: " + text);
  }
}

async function changeRole() {
  const email = document.getElementById("changeEmail").value;
  const role = document.getElementById("changeRole").value;
  const center = document.getElementById("changeCenter").value;

  const res = await fetch(
    API + "/admin/change-role?email=" + encodeURIComponent(email)
      + "&role=" + encodeURIComponent(role)
      + "&center=" + encodeURIComponent(center),
    {
      method: "POST",
      headers: authHeaders()
    }
  );

  const text = await res.text();

  if (res.ok) {
    alert("変更しました");
  } else {
    alert("変更失敗: " + text);
  }
}

async function createResource() {
  const name = document.getElementById("resourceName").value;
  const type = document.getElementById("resourceType").value;
  const center = document.getElementById("resourceCenter").value;

  const res = await fetch(
    API + "/admin/resources?name=" + encodeURIComponent(name)
      + "&type=" + encodeURIComponent(type)
      + "&center=" + encodeURIComponent(center),
    {
      method: "POST",
      headers: authHeaders()
    }
  );

  const text = await res.text();

  if (res.ok) {
    alert("設備を登録しました");
  } else {
    alert("設備登録失敗: " + text);
  }
}

async function setHoliday() {
  const date = document.getElementById("holidayDate").value;

  const res = await fetch(API + "/admin/holiday?date=" + encodeURIComponent(date), {
    method: "POST",
    headers: authHeaders()
  });

  const text = await res.text();

  if (res.ok) {
    alert("休日設定しました");
  } else {
    alert("休日設定失敗: " + text);
  }
}
