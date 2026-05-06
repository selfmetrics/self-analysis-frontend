const API_BASE_URL = "http://localhost:3000";

const getHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Googleログインページへ移動
const loginWithGoogle = () => {
  window.location.href = `${API_BASE_URL}/auth/google`;
};

// ログイン中ユーザー取得
const getLoginUser = async () => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: getHeaders(),
  });

  const text = await response.text();

  console.log("ログインユーザーAPIステータス:", response.status);
  console.log("ログインユーザーAPIレスポンス:", text);

  if (!response.ok) {
    throw new Error("ログインしていません");
  }

  return text ? JSON.parse(text) : null;
};

// ログアウト
const logout = () => {
  localStorage.removeItem("token");
};

export {
  loginWithGoogle,
  getLoginUser,
  logout,
};