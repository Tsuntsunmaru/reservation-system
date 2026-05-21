const API = "https://reservation-system-nle7.onrender.com";

async function login() {

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(API + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    const data = await res.json();

    if (res.ok) {
      // ✅ token保存
      localStorage.setItem("token", data.access_token);

      alert("ログイン成功");

      // ✅ カレンダー画面へ移動
      window.location.href = "index.html";

    } else {
      alert("ログイン失敗");
    }

  } catch (e) {
    alert("通信エラー");
  }
}
