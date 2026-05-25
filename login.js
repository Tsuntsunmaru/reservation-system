const API = "https://reservation-system-nle7.onrender.com";

async function login() {
  if (isLoading) return;
  isLoading = true;

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
      console.log(data);  // 🔥 確認用
      const token = data.access_token || data.token || data.accessToken;
      if (!token) {
        alert("token取得失敗");
        return;
      }
      localStorage.setItem("token", token);
      alert("ログイン成功");
      window.location.href = "index.html";
    }

   
    else {
      alert("ログイン失敗");
    }

  } catch (e) {
    alert("通信エラー");
  }

  isLoading = false;
}
