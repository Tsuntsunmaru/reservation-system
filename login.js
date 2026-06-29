const API = "https://reservation-system-nle7.onrender.com";

let isLoading = false;
async function login() {
  if (isLoading) return;
  isLoading = true;

  const btn = document.getElementById("loginBtn");
  btn.disabled = true;
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
      console.log(data);  
      const token = data.access_token || data.token || data.accessToken;
      if (!token) {
        alert("token取得失敗");
        return;
      }
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "index.html";
    }

   
    else {
      alert("ログイン失敗");
    }

  } catch (e) {
    alert("通信エラー");
  }

  isLoading = false;
  btn.disabled = false;
}
